const prisma = require('../config/prisma');

class DeliveryService {
  async getAllDeliveries(status = null) {
    const where = {};
    if (status && status !== 'ALL') where.deliveryStatus = status;

    return await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDeliveryById(id) {
    const delivery = await prisma.delivery.findFirst({
      where: {
        OR: [
          { id },
          { orderId: id },
          { trackingNumber: id }
        ]
      },
      include: {
        order: {
          include: {
            items: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!delivery) throw new Error(`Delivery record not found`);
    return delivery;
  }

  async trackDelivery(idOrTracking) {
    const delivery = await this.getDeliveryById(idOrTracking);
    
    // Build tracking steps
    const stepOrder = ['PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = stepOrder.indexOf(delivery.deliveryStatus);

    const steps = stepOrder.map((step, idx) => ({
      step,
      label: step.replace(/_/g, ' '),
      completed: currentIndex >= idx,
      current: currentIndex === idx,
      isFailed: delivery.deliveryStatus === 'FAILED'
    }));

    return {
      delivery,
      steps,
      isDelivered: delivery.deliveryStatus === 'DELIVERED',
      isFailed: delivery.deliveryStatus === 'FAILED'
    };
  }

  async updateDeliveryStatus(id, data) {
    const { deliveryStatus, notes, courier, actualDeliveryDate } = data;
    const existing = await prisma.delivery.findUnique({
      where: { id },
      include: { order: { include: { items: true } } }
    });

    if (!existing) throw new Error(`Delivery ${id} not found`);

    const updatePayload = {
      deliveryStatus,
      notes: notes !== undefined ? notes : existing.notes,
      courier: courier || existing.courier
    };

    if (deliveryStatus === 'DELIVERED') {
      updatePayload.actualDeliveryDate = actualDeliveryDate ? new Date(actualDeliveryDate) : new Date();
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.delivery.update({
        where: { id },
        data: updatePayload,
        include: { order: true }
      });

      // Synchronize Order status
      if (deliveryStatus === 'SHIPPED') {
        await tx.order.update({
          where: { id: existing.orderId },
          data: { orderStatus: 'SHIPPED' }
        });
      } else if (deliveryStatus === 'DELIVERED') {
        await tx.order.update({
          where: { id: existing.orderId },
          data: { orderStatus: 'DELIVERED' }
        });

        // Record Delivered Traceability event for order items
        for (const item of existing.order.items) {
          await tx.traceabilityEvent.create({
            data: {
              finishedProductId: item.productId,
              orderId: existing.orderId,
              eventType: 'DELIVERED',
              sector: 'Delivery',
              actorName: updated.courier,
              description: `Product ${item.productId} delivered to customer ${existing.customerName}`,
              detailsJson: JSON.stringify({ trackingNumber: existing.trackingNumber, deliveryDate: updatePayload.actualDeliveryDate })
            }
          });
        }
      }

      return updated;
    });
  }
}

module.exports = new DeliveryService();
