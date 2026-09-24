const prisma = require('../config/prisma');

const getInventory = async (category = null, type = null) => {
  const where = {};
  if (category && category !== 'ALL') {
    where.category = category;
  }
  if (type && type !== 'ALL') {
    where.itemType = type;
  }

  return await prisma.inventoryItem.findMany({
    where,
    orderBy: { id: 'asc' }
  });
};

const getMovements = async (limit = 50) => {
  return await prisma.inventoryMovement.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
};

const createInventoryItem = async (data) => {
  const count = await prisma.inventoryItem.count();
  const id = data.id || `STK-${String(count + 1).padStart(3, '0')}`;

  const item = await prisma.inventoryItem.create({
    data: {
      id,
      itemId: data.itemId,
      itemName: data.itemName,
      itemType: data.itemType,
      category: data.category || data.itemType,
      availableQuantity: parseInt(data.availableQuantity || 0),
      reservedQuantity: parseInt(data.reservedQuantity || 0),
      quarantineQuantity: parseInt(data.quarantineQuantity || 0),
      reworkQuantity: parseInt(data.reworkQuantity || 0),
      rejectedQuantity: parseInt(data.rejectedQuantity || 0),
      location: data.location || 'Warehouse Main Floor',
      unit: data.unit || 'Units',
      status: data.status || 'NORMAL'
    }
  });

  // Record initial movement
  await prisma.inventoryMovement.create({
    data: {
      itemId: item.itemId,
      itemName: item.itemName,
      itemType: item.itemType,
      quantity: item.availableQuantity,
      action: 'RECEIVED',
      referenceType: 'MANUAL_ENTRY',
      referenceId: item.id,
      employeeName: data.employeeName || 'Inventory Supervisor',
      notes: 'Initial inventory item created'
    }
  });

  return item;
};

const updateStockQuantity = async (id, data) => {
  const { action, quantity, employeeName = 'Inventory Manager', notes = '' } = data;
  const qty = parseInt(quantity);

  const existing = await prisma.inventoryItem.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error(`Inventory item ${id} not found`);
  }

  let updateData = { lastUpdated: new Date() };

  switch (action) {
    case 'RECEIVED':
      updateData.availableQuantity = existing.availableQuantity + qty;
      break;
    case 'RESERVED':
      if (existing.availableQuantity < qty) throw new Error('Insufficient stock to reserve');
      updateData.availableQuantity = existing.availableQuantity - qty;
      updateData.reservedQuantity = existing.reservedQuantity + qty;
      break;
    case 'USED':
      if (existing.availableQuantity < qty && existing.reservedQuantity < qty) {
        throw new Error('Insufficient stock to consume');
      }
      if (existing.reservedQuantity >= qty) {
        updateData.reservedQuantity = existing.reservedQuantity - qty;
      } else {
        updateData.availableQuantity = existing.availableQuantity - qty;
      }
      break;
    case 'QUARANTINED':
      if (existing.availableQuantity < qty) throw new Error('Insufficient stock to quarantine');
      updateData.availableQuantity = existing.availableQuantity - qty;
      updateData.quarantineQuantity = existing.quarantineQuantity + qty;
      break;
    case 'REWORKED':
      if (existing.quarantineQuantity < qty && existing.availableQuantity < qty) throw new Error('Insufficient stock to move to rework');
      if (existing.quarantineQuantity >= qty) {
        updateData.quarantineQuantity = existing.quarantineQuantity - qty;
      } else {
        updateData.availableQuantity = existing.availableQuantity - qty;
      }
      updateData.reworkQuantity = existing.reworkQuantity + qty;
      break;
    case 'REJECTED':
      if (existing.quarantineQuantity >= qty) {
        updateData.quarantineQuantity = existing.quarantineQuantity - qty;
      } else if (existing.reworkQuantity >= qty) {
        updateData.reworkQuantity = existing.reworkQuantity - qty;
      } else if (existing.availableQuantity >= qty) {
        updateData.availableQuantity = existing.availableQuantity - qty;
      }
      updateData.rejectedQuantity = existing.rejectedQuantity + qty;
      break;
    case 'RELEASED':
      if (existing.reservedQuantity >= qty) {
        updateData.reservedQuantity = existing.reservedQuantity - qty;
        updateData.availableQuantity = existing.availableQuantity + qty;
      }
      break;
    case 'ADJUSTED':
      updateData.availableQuantity = qty;
      break;
    default:
      throw new Error(`Unsupported action: ${action}`);
  }

  // Set stock health status
  if (updateData.availableQuantity !== undefined) {
    if (updateData.availableQuantity <= 5) updateData.status = 'CRITICAL';
    else if (updateData.availableQuantity <= 15) updateData.status = 'LOW_STOCK';
    else updateData.status = 'NORMAL';
  }

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: updateData
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: existing.itemId,
      itemName: existing.itemName,
      itemType: existing.itemType,
      quantity: qty,
      action: action,
      referenceType: 'MANUAL_ADJUSTMENT',
      referenceId: id,
      employeeName,
      notes: notes || `Stock updated via ${action}`
    }
  });

  return updated;
};

module.exports = {
  getInventory,
  getMovements,
  createInventoryItem,
  updateStockQuantity
};
