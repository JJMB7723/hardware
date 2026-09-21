const prisma = require('../config/prisma');

class TraceabilityService {
  async searchTraceability(query) {
    const term = (query || '').trim();
    if (!term) return { results: [] };

    // 1. Try finding Product
    const product = await prisma.product.findUnique({
      where: { id: term }
    });

    // 2. Try finding Assembly
    const assembly = await prisma.assembly.findUnique({
      where: { id: term }
    });

    // 3. Try finding Component
    const component = await prisma.component.findUnique({
      where: { id: term }
    });

    // 4. Try finding Batch
    const batch = await prisma.manufacturingBatch.findUnique({
      where: { id: term }
    });

    return {
      query: term,
      found: {
        product: product ? product.id : null,
        assembly: assembly ? assembly.id : null,
        component: component ? component.id : null,
        batch: batch ? batch.id : null
      }
    };
  }

  async traceProduct(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Find Assembly item binding
    const assemblyItem = await prisma.assemblyItem.findFirst({
      where: { finishedProductId: productId }
    });

    let assembly = null;
    let components = [];

    if (assemblyItem) {
      assembly = await prisma.assembly.findUnique({
        where: { id: assemblyItem.assemblyId }
      });

      // Load specific components used
      const compIds = [
        assemblyItem.ramComponentId,
        assemblyItem.romComponentId,
        assemblyItem.gpuComponentId,
        assemblyItem.motherboardComponentId
      ].filter(Boolean);

      components = await prisma.component.findMany({
        where: { id: { in: compIds } },
        include: {
          batch: true
        }
      });
    } else if (product.assemblyId) {
      assembly = await prisma.assembly.findUnique({
        where: { id: product.assemblyId }
      });
      components = await prisma.component.findMany({
        where: { assemblyId: product.assemblyId },
        include: { batch: true }
      });
    }

    // Orders and deliveries
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      include: {
        order: {
          include: {
            delivery: true,
            returns: {
              include: { inspections: true }
            }
          }
        }
      }
    });

    // Timeline events
    const events = await prisma.traceabilityEvent.findMany({
      where: {
        OR: [
          { finishedProductId: productId },
          ...(assembly ? [{ assemblyId: assembly.id }] : []),
          ...(components.length > 0 ? [{ componentId: { in: components.map(c => c.id) } }] : [])
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    // Validations
    const validationRecords = await prisma.validationRecord.findMany({
      where: {
        OR: [
          { referenceId: productId },
          ...(assembly ? [{ referenceId: assembly.id }] : []),
          ...(components.map(c => ({ referenceId: c.id }))),
          ...(components.map(c => ({ referenceId: c.batchId })))
        ]
      },
      orderBy: { validatedAt: 'asc' }
    });

    return {
      type: 'PRODUCT',
      product,
      assembly,
      assemblyItem,
      components,
      orderHistory: orderItems.map(oi => oi.order),
      validationRecords,
      timelineEvents: events
    };
  }

  async traceComponent(componentId) {
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: {
        batch: true,
        assembly: {
          include: {
            assemblyItems: true
          }
        }
      }
    });

    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }

    const events = await prisma.traceabilityEvent.findMany({
      where: {
        OR: [
          { componentId },
          { batchId: component.batchId },
          ...(component.assemblyId ? [{ assemblyId: component.assemblyId }] : [])
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    const validations = await prisma.validationRecord.findMany({
      where: {
        OR: [
          { referenceId: componentId },
          { referenceId: component.batchId }
        ]
      },
      orderBy: { validatedAt: 'asc' }
    });

    return {
      type: 'COMPONENT',
      component,
      batch: component.batch,
      assembly: component.assembly,
      validations,
      timelineEvents: events
    };
  }

  async traceBatch(batchId) {
    const batch = await prisma.manufacturingBatch.findUnique({
      where: { id: batchId },
      include: {
        components: true
      }
    });

    if (!batch) {
      throw new Error(`Manufacturing batch ${batchId} not found`);
    }

    const events = await prisma.traceabilityEvent.findMany({
      where: { batchId },
      orderBy: { timestamp: 'asc' }
    });

    const validations = await prisma.validationRecord.findMany({
      where: { referenceId: batchId },
      orderBy: { validatedAt: 'asc' }
    });

    return {
      type: 'BATCH',
      batch,
      components: batch.components,
      validations,
      timelineEvents: events
    };
  }

  async traceAssembly(assemblyId) {
    const assembly = await prisma.assembly.findUnique({
      where: { id: assemblyId },
      include: {
        components: {
          include: { batch: true }
        },
        assemblyItems: true
      }
    });

    if (!assembly) {
      throw new Error(`Assembly ${assemblyId} not found`);
    }

    const events = await prisma.traceabilityEvent.findMany({
      where: { assemblyId },
      orderBy: { timestamp: 'asc' }
    });

    const validations = await prisma.validationRecord.findMany({
      where: { referenceId: assemblyId },
      orderBy: { validatedAt: 'asc' }
    });

    return {
      type: 'ASSEMBLY',
      assembly,
      components: assembly.components,
      assemblyItems: assembly.assemblyItems,
      validations,
      timelineEvents: events
    };
  }

  async getAllEvents(limit = 100) {
    return await prisma.traceabilityEvent.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
  }
}

module.exports = new TraceabilityService();
