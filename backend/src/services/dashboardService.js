const prisma = require('../config/prisma');

class DashboardService {
  async getDashboardMetrics() {
    const [
      productsCount,
      ordersCount,
      employeesCount,
      stockItemsCount,
      manufacturingCount,
      assemblyCount,
      returnsCount,
      pendingInspectionsCount,
      deliveriesCount,
      recentOrders,
      recentMovements,
      recentEvents
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.inventoryItem.count(),
      prisma.manufacturingBatch.count(),
      prisma.assembly.count(),
      prisma.return.count(),
      prisma.inspection.count({ where: { testResult: 'FAIL' } }),
      prisma.delivery.count(),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.inventoryMovement.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.traceabilityEvent.findMany({ take: 6, orderBy: { timestamp: 'desc' } })
    ]);

    return {
      metrics: {
        products: productsCount,
        orders: ordersCount,
        employees: employeesCount,
        stockItems: stockItemsCount,
        manufacturing: manufacturingCount,
        assembly: assemblyCount,
        returns: returnsCount,
        pendingInspections: pendingInspectionsCount,
        deliveries: deliveriesCount
      },
      recentOrders,
      recentMovements,
      recentEvents
    };
  }
}

module.exports = new DashboardService();
