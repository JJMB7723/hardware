const prisma = require('../config/prisma');

class OrderService {
  async getAllOrders() {
    return await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        delivery: true,
        returns: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrderById(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        delivery: true,
        returns: {
          include: {
            inspections: true
          }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    return order;
  }

  async createOrder(data) {
    const {
      customerId = 'CUST-001',
      customerName,
      customerContact,
      shippingAddress,
      items, // array of { productId, quantity }
      paymentStatus = 'PAID'
    } = data;

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Generate Order ID
    const count = await prisma.order.count();
    const orderId = `ORD-2026-${String(count + 1).padStart(6, '0')}`;
    const deliveryId = `DEL-2026-${String(count + 1).padStart(6, '0')}`;
    const trackingNumber = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}-US`;

    // Validate stocks and calculate prices
    let totalAmount = 0;
    const preparedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.availableQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      preparedItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        productSerialId: product.id
      });
    }

    // Create Order with Items and initial Delivery record in transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          customerId,
          customerName: customerName || 'Walk-in Customer',
          customerContact: customerContact || 'N/A',
          shippingAddress: shippingAddress || 'Default Company Warehouse Address',
          totalAmount,
          paymentStatus,
          orderStatus: 'CONFIRMED',
          items: {
            create: preparedItems
          }
        },
        include: {
          items: true
        }
      });

      // 2. Deduct product available stock & add to reserved
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity }
          }
        });

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            itemId: item.productId,
            itemName: item.productId,
            itemType: 'FINISHED_PRODUCT',
            quantity: item.quantity,
            action: 'RESERVED',
            referenceType: 'ORDER',
            referenceId: orderId,
            employeeName: 'Order Processing System',
            notes: `Stock reserved for order ${orderId}`
          }
        });

        // Record Traceability Event
        await tx.traceabilityEvent.create({
          data: {
            finishedProductId: item.productId,
            orderId: orderId,
            eventType: 'ORDERED',
            sector: 'Sales',
            actorName: customerName || 'Customer',
            description: `Order ${orderId} placed for unit ${item.productId}`,
            detailsJson: JSON.stringify({ orderId, quantity: item.quantity, totalAmount })
          }
        });
      }

      // 3. Create Delivery tracking entry
      await tx.delivery.create({
        data: {
          id: deliveryId,
          orderId: orderId,
          customerName: customerName || 'Customer',
          address: shippingAddress || 'Customer Address',
          courier: 'Apex Logistics Freight',
          trackingNumber,
          dispatchDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          deliveryStatus: 'PACKED',
          notes: 'Order confirmed and packed in ESD-safe packaging.'
        }
      });

      return newOrder;
    });

    return createdOrder;
  }

  async updateOrderStatus(id, status) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, delivery: true }
    });

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED') {
      if (status === 'CANCELLED') {
        throw new Error('Delivered/Completed orders cannot be cancelled directly. Please open a Return request instead.');
      }
    }

    // Update order
    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus: status },
      include: { items: true, delivery: true }
    });

    // If marked delivered, update delivery status
    if (status === 'DELIVERED' && order.delivery) {
      await prisma.delivery.update({
        where: { id: order.delivery.id },
        data: {
          deliveryStatus: 'DELIVERED',
          actualDeliveryDate: new Date()
        }
      });
    }

    return updated;
  }

  async cancelOrder(id, reason = 'Customer requested cancellation') {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, delivery: true }
    });

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED') {
      throw new Error('Cannot cancel an order that has already been delivered or completed.');
    }

    if (order.orderStatus === 'CANCELLED') {
      throw new Error('Order is already cancelled.');
    }

    return await prisma.$transaction(async (tx) => {
      // Revert product quantities
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableQuantity: { increment: item.quantity },
            reservedQuantity: { decrement: item.quantity }
          }
        });

        await tx.inventoryMovement.create({
          data: {
            itemId: item.productId,
            itemName: item.productId,
            itemType: 'FINISHED_PRODUCT',
            quantity: item.quantity,
            action: 'RELEASED',
            referenceType: 'ORDER',
            referenceId: order.id,
            employeeName: 'Order Cancellation System',
            notes: `Stock reservation released due to cancellation. Reason: ${reason}`
          }
        });
      }

      // Update Order
      const cancelledOrder = await tx.order.update({
        where: { id },
        data: {
          orderStatus: 'CANCELLED',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus
        }
      });

      // Update Delivery
      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            deliveryStatus: 'FAILED',
            notes: `Delivery aborted. Order cancelled: ${reason}`
          }
        });
      }

      return cancelledOrder;
    });
  }
}

module.exports = new OrderService();
