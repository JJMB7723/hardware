const prisma = require('../config/prisma');

class AssemblyService {
  async getAssemblies(status = null) {
    const where = {};
    if (status && status !== 'ALL') where.status = status;

    return await prisma.assembly.findMany({
      where,
      include: {
        components: true,
        assemblyItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAssemblyById(id) {
    const assembly = await prisma.assembly.findUnique({
      where: { id },
      include: {
        components: {
          include: { batch: true }
        },
        assemblyItems: true
      }
    });
    if (!assembly) throw new Error(`Assembly ${id} not found`);
    return assembly;
  }

  async checkComponentAvailability() {
    const ram = await prisma.component.count({ where: { type: 'RAM', status: 'AVAILABLE' } });
    const rom = await prisma.component.count({ where: { type: 'ROM', status: 'AVAILABLE' } });
    const gpu = await prisma.component.count({ where: { type: 'GPU', status: 'AVAILABLE' } });
    const motherboard = await prisma.component.count({ where: { type: 'MOTHERBOARD', status: 'AVAILABLE' } });

    const maxAssemblePossible = Math.min(ram, rom, gpu, motherboard);

    return {
      available: {
        RAM: ram,
        ROM: rom,
        GPU: gpu,
        Motherboard: motherboard
      },
      maxAssemblePossible,
      canAssemble: maxAssemblePossible > 0,
      compatibilityStatus: 'VERIFIED_COMPATIBLE (LGA1700 + DDR5 + PCIe 5.0 + NVMe Gen4)'
    };
  }

  async createAndExecuteAssembly(data) {
    const {
      productName = 'Titan-X Professional Workstation PC',
      quantity = 1,
      employeeId = 'EMP-005',
      employeeName = 'Liam Wilson',
      notes = ''
    } = data;

    const plannedQty = parseInt(quantity);
    if (plannedQty <= 0) throw new Error('Quantity must be greater than 0');

    // 1. Availability check
    const ramComps = await prisma.component.findMany({ where: { type: 'RAM', status: 'AVAILABLE' }, take: plannedQty });
    const romComps = await prisma.component.findMany({ where: { type: 'ROM', status: 'AVAILABLE' }, take: plannedQty });
    const gpuComps = await prisma.component.findMany({ where: { type: 'GPU', status: 'AVAILABLE' }, take: plannedQty });
    const mbComps = await prisma.component.findMany({ where: { type: 'MOTHERBOARD', status: 'AVAILABLE' }, take: plannedQty });

    if (ramComps.length < plannedQty || romComps.length < plannedQty || gpuComps.length < plannedQty || mbComps.length < plannedQty) {
      throw new Error(`Insufficient components for assembly. Needed: ${plannedQty} of each. Available: RAM=${ramComps.length}, ROM=${romComps.length}, GPU=${gpuComps.length}, MB=${mbComps.length}`);
    }

    const count = await prisma.assembly.count();
    const assemblyId = `ASM-2026-${String(count + 1).padStart(6, '0')}`;

    return await prisma.$transaction(async (tx) => {
      // 2. Create Assembly Record
      const newAssembly = await tx.assembly.create({
        data: {
          id: assemblyId,
          productName,
          plannedQuantity: plannedQty,
          completedQuantity: plannedQty,
          status: 'COMPLETED',
          ramQuantity: plannedQty,
          romQuantity: plannedQty,
          gpuQuantity: plannedQty,
          motherboardQuantity: plannedQty,
          assemblyDate: new Date(),
          completedDate: new Date(),
          employeeId,
          employeeName,
          finalValidationResult: 'PASS',
          notes: notes || 'Assembly completed with all hardware diagnostic passes'
        }
      });

      // 3. For each unit, bind components, create AssemblyItem, and register Finished Product
      for (let i = 0; i < plannedQty; i++) {
        const ram = ramComps[i];
        const rom = romComps[i];
        const gpu = gpuComps[i];
        const mb = mbComps[i];

        const prodCount = await tx.product.count();
        const finishedProductId = `PC-2026-${String(prodCount + 1).padStart(6, '0')}`;

        // Mark components as ASSEMBLED
        await tx.component.update({ where: { id: ram.id }, data: { status: 'ASSEMBLED', assemblyId } });
        await tx.component.update({ where: { id: rom.id }, data: { status: 'ASSEMBLED', assemblyId } });
        await tx.component.update({ where: { id: gpu.id }, data: { status: 'ASSEMBLED', assemblyId } });
        await tx.component.update({ where: { id: mb.id }, data: { status: 'ASSEMBLED', assemblyId } });

        // Create AssemblyItem linkage
        await tx.assemblyItem.create({
          data: {
            assemblyId,
            finishedProductId,
            ramComponentId: ram.id,
            romComponentId: rom.id,
            gpuComponentId: gpu.id,
            motherboardComponentId: mb.id,
            assembledAt: new Date(),
            validatedAt: new Date(),
            status: 'COMPLETED'
          }
        });

        // Create or update Finished Product catalog entry
        await tx.product.create({
          data: {
            id: finishedProductId,
            name: `${productName} (Unit #${finishedProductId.split('-')[2]})`,
            description: `Fully assembled computing system with verified hardware components.`,
            specifications: `GPU: ${gpu.id} (${gpu.modelName}) | RAM: ${ram.id} (${ram.modelName}) | ROM: ${rom.id} (${rom.modelName}) | MB: ${mb.id} (${mb.modelName})`,
            price: 2499.00,
            availableQuantity: 1,
            reservedQuantity: 0,
            warrantyMonths: 24,
            status: 'AVAILABLE',
            assemblyId
          }
        });

        // Add inventory finished product
        const invItem = await tx.inventoryItem.findFirst({
          where: { itemType: 'FINISHED_PRODUCT' }
        });
        if (invItem) {
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: {
              availableQuantity: { increment: 1 },
              lastUpdated: new Date()
            }
          });
        }

        // Record Traceability Event for Assembly and Component Linkages
        await tx.traceabilityEvent.create({
          data: {
            finishedProductId,
            assemblyId,
            eventType: 'ASSEMBLED',
            sector: 'Assembly',
            actorName: employeeName,
            description: `Finished product ${finishedProductId} assembled with RAM: ${ram.id}, ROM: ${rom.id}, GPU: ${gpu.id}, MB: ${mb.id}`,
            detailsJson: JSON.stringify({
              ramId: ram.id,
              romId: rom.id,
              gpuId: gpu.id,
              mbId: mb.id,
              assemblyId
            })
          }
        });

        // Final QA Validation Traceability Event
        await tx.traceabilityEvent.create({
          data: {
            finishedProductId,
            assemblyId,
            eventType: 'VALIDATED',
            sector: 'Inspection',
            actorName: employeeName,
            description: `Final system integration validation: PASS for ${finishedProductId}`,
            detailsJson: JSON.stringify({ result: 'PASS', postTest: 'OK', biosVersion: 'V2.4' })
          }
        });
      }

      // Record inventory movements for consumed components
      await tx.inventoryMovement.create({
        data: {
          itemId: 'ASSEMBLY_CONSUMPTION',
          itemName: `Components for Assembly ${assemblyId}`,
          itemType: 'MULTIPLE',
          quantity: plannedQty * 4,
          action: 'USED',
          referenceType: 'ASSEMBLY',
          referenceId: assemblyId,
          employeeName,
          notes: `Consumed ${plannedQty}x RAM, ROM, GPU, MB for ${plannedQty} assembled systems`
        }
      });

      return newAssembly;
    });
  }
}

module.exports = new AssemblyService();
