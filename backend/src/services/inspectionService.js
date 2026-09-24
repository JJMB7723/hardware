const prisma = require('../config/prisma');

const getAllInspections = async () => {
  return await prisma.inspection.findMany({
    include: {
      returnRef: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getInspectionById = async (id) => {
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      returnRef: true
    }
  });

  if (!inspection) throw new Error(`Inspection ${id} not found`);
  return inspection;
};

const createInspection = async (data) => {
  const {
    returnId,
    productId,
    inspectorId = 'EMP-006',
    inspectorName = 'Elena Rostova',
    defectType,
    defectDescription,
    testResult = 'FAIL',
    remarks,
    finalDecision
  } = data;

  const count = await prisma.inspection.count();
  const inspectionId = `INSP-2026-${String(count + 1).padStart(6, '0')}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return await prisma.$transaction(async (tx) => {
    const newInspection = await tx.inspection.create({
      data: {
        id: inspectionId,
        returnId: returnId || null,
        productId: productId || 'PC-2026-000001',
        productSerialId: productId || 'PC-2026-000001',
        inspectorId,
        inspectorName,
        inspectionDate: now,
        inspectionTime: timeStr,
        defectType: defectType || 'COMPONENT_FAILURE',
        defectDescription: defectDescription || 'Standard functional test failure observed.',
        testResult,
        remarks: remarks || '',
        finalDecision: finalDecision || 'DEFECT CONFIRMED'
      }
    });

    // Synchronize Return record if associated
    if (returnId) {
      let returnStatus = 'UNDER_INSPECTION';
      let replacementStatus = 'NONE';
      let refundStatus = 'NONE';

      if (finalDecision === 'REPLACEMENT') {
        returnStatus = 'APPROVED_FOR_REPLACEMENT';
        replacementStatus = 'IN_PROGRESS';
      } else if (finalDecision === 'REFUND') {
        returnStatus = 'APPROVED_FOR_REFUND';
        refundStatus = 'PENDING';
      } else if (finalDecision === 'REPAIR') {
        returnStatus = 'UNDER_INSPECTION';
      } else if (finalDecision === 'REJECT') {
        returnStatus = 'REJECTED';
      } else if (finalDecision === 'DEFECT NOT CONFIRMED') {
        returnStatus = 'REJECTED';
      }

      await tx.return.update({
        where: { id: returnId },
        data: {
          returnStatus,
          replacementStatus,
          refundStatus
        }
      });
    }

    // Add Traceability Event
    await tx.traceabilityEvent.create({
      data: {
        finishedProductId: productId,
        eventType: 'INSPECTED',
        sector: 'Inspection',
        actorName: inspectorName,
        description: `Defect inspection completed: ${finalDecision}. Defect: ${defectType} - ${defectDescription}`,
        detailsJson: JSON.stringify({
          inspectionId,
          testResult,
          finalDecision,
          defectType,
          remarks
        })
      }
    });

    return newInspection;
  });
};

module.exports = {
  getAllInspections,
  getInspectionById,
  createInspection
};
