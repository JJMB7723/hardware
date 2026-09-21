const prisma = require('../config/prisma');

class ReturnService {
  async getAllReturns(status = null) {
    const where = {};
    if (status && status !== 'ALL') where.returnStatus = status;

    return await prisma.return.findMany({
      where,
      include: {
        order: true,
        inspections: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getReturnById(id) {
    const returnItem = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
          include: { items: { include: { product: true } } }
        },
        inspections: true
      }
    });

    if (!returnItem) throw new Error(`Return ${id} not found`);
    return returnItem;
  }

  async createReturn(data) {
    const { orderId, productId, returnReason, customerId = 'CUST-001', customerName = 'Customer' } = data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new Error(`Order ${orderId} not found`);

    const count = await prisma.return.count();
    const returnId = `RET-2026-${String(count + 1).padStart(6, '0')}`;

    return await prisma.$transaction(async (tx) => {
      const newReturn = await tx.return.create({
        data: {
          id: returnId,
          orderId,
          customerId,
          customerName,
          productId,
          productSerialId: productId,
          returnReason,
          returnStatus: 'REQUESTED',
          replacementStatus: 'NONE',
          refundStatus: 'NONE'
        }
      });

      // Traceability Event
      await tx.traceabilityEvent.create({
        data: {
          finishedProductId: productId,
          orderId,
          eventType: 'RETURNED',
          sector: 'Customer Returns',
          actorName: customerName,
          description: `Return request ${returnId} initiated: "${returnReason}"`,
          detailsJson: JSON.stringify({ returnId, reason: returnReason })
        }
      });

      return newReturn;
    });
  }

  async updateReturnStatus(id, data) {
    const { returnStatus, replacementStatus, refundStatus } = data;
    const existing = await prisma.return.findUnique({
      where: { id }
    });

    if (!existing) throw new Error(`Return ${id} not found`);

    const updated = await prisma.return.update({
      where: { id },
      data: {
        returnStatus: returnStatus || existing.returnStatus,
        replacementStatus: replacementStatus || existing.replacementStatus,
        refundStatus: refundStatus || existing.refundStatus
      }
    });

    // If marked received, record quarantined inventory move
    if (returnStatus === 'RECEIVED' && existing.returnStatus !== 'RECEIVED') {
      await prisma.inventoryMovement.create({
        data: {
          itemId: existing.productId,
          itemName: `Returned Unit ${existing.productId}`,
          itemType: 'FINISHED_PRODUCT',
          quantity: 1,
          action: 'QUARANTINED',
          referenceType: 'RETURN',
          referenceId: id,
          employeeName: 'RMA Intake Department',
          notes: 'Returned product received and placed into quarantine for inspection'
        }
      });
    }

    return updated;
  }
}

module.exports = new ReturnService();
