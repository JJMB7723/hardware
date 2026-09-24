const prisma = require('../config/prisma');

const getBatches = async (sector = null, status = null) => {
  const where = {};
  if (sector && sector !== 'ALL') where.sector = sector;
  if (status && status !== 'ALL') where.status = status;

  return await prisma.manufacturingBatch.findMany({
    where,
    include: {
      components: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getBatchById = async (id) => {
  const batch = await prisma.manufacturingBatch.findUnique({
    where: { id },
    include: {
      components: true
    }
  });
  if (!batch) {
    throw new Error(`Manufacturing batch ${id} not found`);
  }
  return batch;
};

const getComponents = async (type = null, status = null) => {
  const where = {};
  if (type && type !== 'ALL') where.type = type;
  if (status && status !== 'ALL') where.status = status;

  return await prisma.component.findMany({
    where,
    include: {
      batch: true,
      assembly: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const createBatch = async (data) => {
  const { sector, rawMaterialUsed, quantityPlanned, employeeId, employeeName, remarks } = data;
  const count = await prisma.manufacturingBatch.count();
  const batchId = `${sector.toUpperCase()}-BATCH-${String(count + 1).padStart(3, '0')}`;
  const prodId = `PROD-${String(count + 1).padStart(3, '0')}`;

  const batch = await prisma.manufacturingBatch.create({
    data: {
      id: batchId,
      productionId: prodId,
      sector: sector.toUpperCase(),
      rawMaterialUsed: rawMaterialUsed || 'Standard Substrate & Components',
      quantityPlanned: parseInt(quantityPlanned),
      quantityProduced: 0,
      employeeId: employeeId || 'EMP-001',
      employeeName: employeeName || 'Lead Fabrication Engineer',
      status: 'PLANNED',
      remarks: remarks || 'Batch scheduled for cleanroom fabrication'
    }
  });

  return batch;
};

const produceBatch = async (batchId, data) => {
  const { quantityProduced, quantityPassed, quantityFailed, employeeName = 'Technician' } = data;
  const batch = await prisma.manufacturingBatch.findUnique({
    where: { id: batchId }
  });

  if (!batch) throw new Error('Batch not found');

  const produced = parseInt(quantityProduced || batch.quantityPlanned);
  const passed = parseInt(quantityPassed || produced);
  const failed = parseInt(quantityFailed || 0);

  return await prisma.$transaction(async (tx) => {
    // Update batch
    const updatedBatch = await tx.manufacturingBatch.update({
      where: { id: batchId },
      data: {
        quantityProduced: produced,
        quantityPassed: passed,
        quantityFailed: failed,
        status: failed === 0 ? 'PASSED' : (passed > 0 ? 'VALIDATION' : 'FAILED'),
        endDate: new Date()
      }
    });

    // Generate individual serialized components
    const type = batch.sector.toUpperCase();
    const prefix = type === 'MOTHERBOARD' ? 'MB' : type;
    const compCount = await tx.component.count({ where: { type } });

    for (let i = 1; i <= produced; i++) {
      const compSerial = `${prefix}-${String(compCount + i).padStart(6, '0')}`;
      const isFailed = i > passed;
      const compStatus = isFailed ? 'FAILED' : 'AVAILABLE';

      await tx.component.create({
        data: {
          id: compSerial,
          batchId: batch.id,
          type,
          modelName: `APEX ${type} Standard V1`,
          specifications: `Batch ${batch.id} specs standard`,
          status: compStatus,
          manufacturedAt: new Date(),
          validatedAt: !isFailed ? new Date() : null,
          notes: isFailed ? 'Failed initial stress loop' : 'Passed AOI & functional validation'
        }
      });

      // Add Traceability Event
      await tx.traceabilityEvent.create({
        data: {
          componentId: compSerial,
          batchId: batch.id,
          sector: type,
          actorName: employeeName,
          eventType: 'MANUFACTURED',
          description: `${type} component ${compSerial} manufactured in batch ${batch.id}`,
          detailsJson: JSON.stringify({ batchId: batch.id, status: compStatus })
        }
      });

      if (!isFailed) {
        await tx.traceabilityEvent.create({
          data: {
            componentId: compSerial,
            batchId: batch.id,
            sector: 'Inspection',
            actorName: employeeName,
            eventType: 'VALIDATED',
            description: `Component ${compSerial} passed electrical and timing validation`,
            detailsJson: JSON.stringify({ result: 'PASS' })
          }
        });
      }
    }

    // Update Inventory Item count for this component type
    const invItem = await tx.inventoryItem.findFirst({
      where: { itemType: type }
    });
    if (invItem) {
      await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: {
          availableQuantity: { increment: passed },
          quarantineQuantity: { increment: failed },
          lastUpdated: new Date()
        }
      });

      await tx.inventoryMovement.create({
        data: {
          itemId: invItem.itemId,
          itemName: invItem.itemName,
          itemType: type,
          quantity: passed,
          action: 'RECEIVED',
          referenceType: 'MANUFACTURING',
          referenceId: batch.id,
          employeeName,
          notes: `Batch ${batch.id} completed. ${passed} units passed and stocked.`
        }
      });
    }

    return updatedBatch;
  });
};

const validateBatch = async (batchId, data) => {
  const { testResult, testParameters, testedBy, remarks } = data;
  const batch = await prisma.manufacturingBatch.findUnique({
    where: { id: batchId },
    include: { components: true }
  });

  if (!batch) throw new Error('Batch not found');

  const result = testResult === 'PASS' ? 'PASSED' : 'FAILED';

  await prisma.validationRecord.create({
    data: {
      referenceType: 'MANUFACTURING_BATCH',
      referenceId: batchId,
      validationType: 'Electrical & Thermal Batch Qualification',
      result: testResult,
      testedBy: testedBy || 'QA Inspector',
      testParameters: testParameters || 'Standard QA Matrix',
      remarks: remarks || `Batch validation result: ${testResult}`
    }
  });

  return await prisma.manufacturingBatch.update({
    where: { id: batchId },
    data: {
      status: result,
      remarks: remarks || `Validation recorded: ${result}`
    }
  });
};

const reworkComponent = async (componentId, data) => {
  const { remarks, testedBy = 'Technician' } = data;
  const comp = await prisma.component.findUnique({
    where: { id: componentId }
  });

  if (!comp) throw new Error('Component not found');

  const updated = await prisma.component.update({
    where: { id: componentId },
    data: {
      status: 'AVAILABLE',
      reworkDate: new Date(),
      validatedAt: new Date(),
      notes: `Reworked and re-validated: ${remarks || 'Passed reflow and secondary testing'}`
    }
  });

  await prisma.traceabilityEvent.create({
    data: {
      componentId,
      batchId: comp.batchId,
      sector: comp.type,
      actorName: testedBy,
      eventType: 'VALIDATED',
      description: `Component ${componentId} reworked and re-validated: PASS`,
      detailsJson: JSON.stringify({ action: 'REWORK_PASS', notes: remarks })
    }
  });

  return updated;
};

module.exports = {
  getBatches,
  getBatchById,
  getComponents,
  createBatch,
  produceBatch,
  validateBatch,
  reworkComponent
};
