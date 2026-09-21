const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Manufacturing & Traceability Database...');

  // Clear existing records
  await prisma.traceabilityEvent.deleteMany();
  await prisma.validationRecord.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.return.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.assemblyItem.deleteMany();
  await prisma.component.deleteMany();
  await prisma.manufacturingBatch.deleteMany();
  await prisma.assembly.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // 1. Initial Admin User from environment variables
  const initialAdminName = process.env.INITIAL_ADMIN_NAME || 'System Admin';
  const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'change_this_password';
  const passwordHash = await bcrypt.hash(initialAdminPassword, 10);
  
  await prisma.user.create({
    data: {
      name: initialAdminName,
      email: initialAdminEmail,
      password: passwordHash,
      role: 'ADMIN',
      phone: '+1-555-0100',
      status: 'ACTIVE',
      createdBy: 'SYSTEM_SEED',
      lastLoginAt: new Date()
    }
  });

  // 2. Employees across sectors
  const employeesData = [
    { id: 'EMP-001', name: 'Marcus Chen', email: 'marcus.chen@apex-manufacturing.edu', phone: '+1-555-0101', department: 'GPU', role: 'Lead Fabrication Engineer', status: 'ACTIVE' },
    { id: 'EMP-002', name: 'Sarah Connor', email: 'sarah.c@apex-manufacturing.edu', phone: '+1-555-0102', department: 'RAM', role: 'Memory Module Specialist', status: 'ACTIVE' },
    { id: 'EMP-003', name: 'David Kim', email: 'david.k@apex-manufacturing.edu', phone: '+1-555-0103', department: 'ROM', role: 'Storage Unit Technician', status: 'ACTIVE' },
    { id: 'EMP-004', name: 'Vikram Patel', email: 'vikram.p@apex-manufacturing.edu', phone: '+1-555-0104', department: 'Motherboard', role: 'PCB SMT Line Lead', status: 'ACTIVE' },
    { id: 'EMP-005', name: 'Liam Wilson', email: 'liam.w@apex-manufacturing.edu', phone: '+1-555-0105', department: 'Assembly', role: 'Assembly Supervisor', status: 'ACTIVE' },
    { id: 'EMP-006', name: 'Elena Rostova', email: 'elena.r@apex-manufacturing.edu', phone: '+1-555-0106', department: 'Inspection', role: 'Chief QA Inspector', status: 'ACTIVE' },
    { id: 'EMP-007', name: 'James Thornton', email: 'james.t@apex-manufacturing.edu', phone: '+1-555-0107', department: 'Inventory', role: 'Warehouse Manager', status: 'ACTIVE' },
    { id: 'EMP-008', name: 'Sophia Martinez', email: 'sophia.m@apex-manufacturing.edu', phone: '+1-555-0108', department: 'Sales', role: 'Enterprise Account Executive', status: 'ACTIVE' },
    { id: 'EMP-009', name: 'Robert Jackson', email: 'robert.j@apex-manufacturing.edu', phone: '+1-555-0109', department: 'Delivery', role: 'Dispatch Coordinator', status: 'ACTIVE' },
    { id: 'EMP-010', name: 'Dr. Arthur Vance', email: 'arthur.vance@apex-manufacturing.edu', phone: '+1-555-0110', department: 'Administration', role: 'Operations Director', status: 'ACTIVE' },
  ];
  for (const emp of employeesData) {
    await prisma.employee.create({ data: emp });
  }

  // 3. Customers
  const customersData = [
    { id: 'CUST-001', name: 'John Doe', email: 'john.doe@techcorp.com', phone: '+1-800-555-2341', address: '100 Silicon Way, Suite 400, San Jose, CA' },
    { id: 'CUST-002', name: 'Apex Research Labs', email: 'procurement@apexresearch.org', phone: '+1-800-555-7890', address: '88 Innovation Parkway, Cambridge, MA' },
    { id: 'CUST-003', name: 'Alice Walker', email: 'alice.walker@email.com', phone: '+1-800-555-9012', address: '42 Maple Street, Austin, TX' },
  ];
  for (const c of customersData) {
    await prisma.customer.create({ data: c });
  }

  // 4. Inventory Items
  const inventoryData = [
    { id: 'STK-001', itemId: 'RAW-SILICON-01', itemName: 'High-Purity Silicon Wafers (300mm)', itemType: 'RAW_MATERIAL', category: 'Raw Materials', availableQuantity: 450, reservedQuantity: 50, location: 'Warehouse A - Bin 01', unit: 'Wafers', status: 'NORMAL' },
    { id: 'STK-002', itemId: 'RAW-COPPER-01', itemName: 'Electrolytic Copper Foil & Ingot', itemType: 'RAW_MATERIAL', category: 'Raw Materials', availableQuantity: 800, reservedQuantity: 100, location: 'Warehouse A - Bin 02', unit: 'Kg', status: 'NORMAL' },
    { id: 'STK-003', itemId: 'RAW-PCB-BASE-01', itemName: 'FR-4 Multi-Layer Substrate Sheets', itemType: 'RAW_MATERIAL', category: 'Raw Materials', availableQuantity: 320, reservedQuantity: 30, location: 'Warehouse A - Bin 03', unit: 'Sheets', status: 'NORMAL' },
    
    { id: 'STK-004', itemId: 'COMP-RAM-DDR5-16G', itemName: 'DDR5 16GB 5600MHz Module', itemType: 'RAM', category: 'RAM', availableQuantity: 85, reservedQuantity: 15, quarantineQuantity: 4, reworkQuantity: 2, rejectedQuantity: 1, location: 'Cleanroom Storage - Bay 1', unit: 'Units', status: 'NORMAL' },
    { id: 'STK-005', itemId: 'COMP-ROM-NVME-1TB', itemName: 'NVMe Gen4 M.2 SSD 1TB', itemType: 'ROM', category: 'ROM', availableQuantity: 92, reservedQuantity: 8, quarantineQuantity: 2, reworkQuantity: 1, rejectedQuantity: 0, location: 'Cleanroom Storage - Bay 2', unit: 'Units', status: 'NORMAL' },
    { id: 'STK-006', itemId: 'COMP-GPU-RTX4080', itemName: 'APEX RTX-4080 Graphics Processor Unit', itemType: 'GPU', category: 'GPU', availableQuantity: 42, reservedQuantity: 18, quarantineQuantity: 3, reworkQuantity: 2, rejectedQuantity: 2, location: 'Secure Vault - Bay 3', unit: 'Units', status: 'NORMAL' },
    { id: 'STK-007', itemId: 'COMP-MB-Z790-PRO', itemName: 'APEX Z790 Pro ATX Motherboard', itemType: 'MOTHERBOARD', category: 'Motherboard', availableQuantity: 60, reservedQuantity: 10, quarantineQuantity: 1, reworkQuantity: 0, rejectedQuantity: 1, location: 'SMT Staging - Bay 4', unit: 'Units', status: 'NORMAL' },
    
    { id: 'STK-008', itemId: 'PC-2026-000001', itemName: 'Titan-X Professional Workstation PC', itemType: 'FINISHED_PRODUCT', category: 'Finished Products', availableQuantity: 12, reservedQuantity: 3, location: 'Finished Goods - Hall C', unit: 'Systems', status: 'NORMAL' },
    { id: 'STK-009', itemId: 'PC-2026-000002', itemName: 'Vanguard Gaming & AI Workstation', itemType: 'FINISHED_PRODUCT', category: 'Finished Products', availableQuantity: 8, reservedQuantity: 2, location: 'Finished Goods - Hall C', unit: 'Systems', status: 'NORMAL' },
    { id: 'STK-010', itemId: 'PC-2026-000003', itemName: 'Nexus Edge Compute Node', itemType: 'FINISHED_PRODUCT', category: 'Finished Products', availableQuantity: 15, reservedQuantity: 0, location: 'Finished Goods - Hall C', unit: 'Systems', status: 'NORMAL' },
  ];
  for (const item of inventoryData) {
    await prisma.inventoryItem.create({ data: item });
  }

  // 5. Inventory Movements Log
  const movementsData = [
    { itemId: 'RAW-SILICON-01', itemName: 'High-Purity Silicon Wafers (300mm)', itemType: 'RAW_MATERIAL', quantity: 500, action: 'RECEIVED', referenceType: 'MANUFACTURING', referenceId: 'PO-RAW-881', employeeName: 'James Thornton', notes: 'Initial raw shipment received from SilTerra' },
    { itemId: 'COMP-GPU-RTX4080', itemName: 'APEX RTX-4080 GPU', itemType: 'GPU', quantity: 50, action: 'RECEIVED', referenceType: 'MANUFACTURING', referenceId: 'PROD-GPU-001', employeeName: 'Marcus Chen', notes: 'Passed QA validation batch 001' },
    { itemId: 'COMP-GPU-RTX4080', itemName: 'APEX RTX-4080 GPU', itemType: 'GPU', quantity: 5, action: 'RESERVED', referenceType: 'ASSEMBLY', referenceId: 'ASM-2026-000001', employeeName: 'Liam Wilson', notes: 'Reserved for Titan-X assembly batch' },
    { itemId: 'COMP-RAM-DDR5-16G', itemName: 'DDR5 16GB Module', itemType: 'RAM', quantity: 100, action: 'RECEIVED', referenceType: 'MANUFACTURING', referenceId: 'PROD-RAM-001', employeeName: 'Sarah Connor', notes: 'Production run complete' },
  ];
  for (const m of movementsData) {
    await prisma.inventoryMovement.create({ data: m });
  }

  // 6. Manufacturing Batches
  const batch1 = await prisma.manufacturingBatch.create({
    data: {
      id: 'GPU-BATCH-001',
      productionId: 'PROD-001',
      sector: 'GPU',
      rawMaterialUsed: 'Silicon Wafers (300mm), Copper Heatpipe Matrix',
      quantityPlanned: 50,
      quantityProduced: 50,
      quantityPassed: 48,
      quantityFailed: 2,
      quantityReworked: 1,
      startDate: new Date('2026-09-10T08:00:00Z'),
      endDate: new Date('2026-09-11T16:00:00Z'),
      employeeId: 'EMP-001',
      employeeName: 'Marcus Chen',
      status: 'PASSED',
      remarks: 'Standard thermal test passed 96%. 1 reworked & re-validated.'
    }
  });

  const batch2 = await prisma.manufacturingBatch.create({
    data: {
      id: 'RAM-BATCH-001',
      productionId: 'PROD-002',
      sector: 'RAM',
      rawMaterialUsed: 'DRAM IC Dies, Multi-layer gold finger PCB',
      quantityPlanned: 100,
      quantityProduced: 100,
      quantityPassed: 98,
      quantityFailed: 2,
      quantityReworked: 0,
      startDate: new Date('2026-09-12T09:00:00Z'),
      endDate: new Date('2026-09-12T18:00:00Z'),
      employeeId: 'EMP-002',
      employeeName: 'Sarah Connor',
      status: 'PASSED',
      remarks: 'MemTest86 burn-in test passed.'
    }
  });

  const batch3 = await prisma.manufacturingBatch.create({
    data: {
      id: 'ROM-BATCH-001',
      productionId: 'PROD-003',
      sector: 'ROM',
      rawMaterialUsed: '3D TLC NAND Flash Wafer, Controller ASIC',
      quantityPlanned: 80,
      quantityProduced: 80,
      quantityPassed: 78,
      quantityFailed: 2,
      quantityReworked: 1,
      startDate: new Date('2026-09-13T08:30:00Z'),
      endDate: new Date('2026-09-13T17:30:00Z'),
      employeeId: 'EMP-003',
      employeeName: 'David Kim',
      status: 'PASSED',
      remarks: 'Sequential read/write benchmark 7400MB/s passed.'
    }
  });

  const batch4 = await prisma.manufacturingBatch.create({
    data: {
      id: 'MB-BATCH-001',
      productionId: 'PROD-004',
      sector: 'MOTHERBOARD',
      rawMaterialUsed: 'FR-4 Substrate, SMT Capacitors, VRM MOSFETs, LGA1700 Socket',
      quantityPlanned: 60,
      quantityProduced: 60,
      quantityPassed: 59,
      quantityFailed: 1,
      quantityReworked: 0,
      startDate: new Date('2026-09-14T07:45:00Z'),
      endDate: new Date('2026-09-15T15:00:00Z'),
      employeeId: 'EMP-004',
      employeeName: 'Vikram Patel',
      status: 'PASSED',
      remarks: 'Automated Optical Inspection (AOI) passed.'
    }
  });

  // 7. Individual Components with Unique Serial IDs linked to batches
  const componentsList = [
    // GPUs
    { id: 'GPU-000001', batchId: 'GPU-BATCH-001', type: 'GPU', modelName: 'APEX RTX-4080 16GB', specifications: 'AD103 Core, 9728 CUDA, 2505 MHz Boost', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-11T10:00:00Z'), validatedAt: new Date('2026-09-11T14:30:00Z'), notes: 'Passed 3DMark Stress Loop 99.4%' },
    { id: 'GPU-000002', batchId: 'GPU-BATCH-001', type: 'GPU', modelName: 'APEX RTX-4080 16GB', specifications: 'AD103 Core, 9728 CUDA, 2505 MHz Boost', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-11T10:15:00Z'), validatedAt: new Date('2026-09-11T14:40:00Z'), notes: 'Passed 3DMark Stress Loop 99.1%' },
    { id: 'GPU-000003', batchId: 'GPU-BATCH-001', type: 'GPU', modelName: 'APEX RTX-4080 16GB', specifications: 'AD103 Core, 9728 CUDA, 2505 MHz Boost', status: 'AVAILABLE', manufacturedAt: new Date('2026-09-11T10:30:00Z'), validatedAt: new Date('2026-09-11T14:50:00Z'), notes: 'Passed validation' },
    { id: 'GPU-000004', batchId: 'GPU-BATCH-001', type: 'GPU', modelName: 'APEX RTX-4080 16GB', specifications: 'AD103 Core, 9728 CUDA, 2505 MHz Boost', status: 'REWORK', manufacturedAt: new Date('2026-09-11T11:00:00Z'), reworkDate: new Date('2026-09-12T09:00:00Z'), notes: 'Solder joint re-flowed, awaiting re-test' },

    // RAMs
    { id: 'RAM-000001', batchId: 'RAM-BATCH-001', type: 'RAM', modelName: 'DDR5 16GB 5600MHz', specifications: 'CL36-36-36-76 1.25V XMP 3.0', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-12T10:00:00Z'), validatedAt: new Date('2026-09-12T14:00:00Z'), notes: 'Memtest 0 errors' },
    { id: 'RAM-000002', batchId: 'RAM-BATCH-001', type: 'RAM', modelName: 'DDR5 16GB 5600MHz', specifications: 'CL36-36-36-76 1.25V XMP 3.0', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-12T10:10:00Z'), validatedAt: new Date('2026-09-12T14:10:00Z'), notes: 'Memtest 0 errors' },
    { id: 'RAM-000003', batchId: 'RAM-BATCH-001', type: 'RAM', modelName: 'DDR5 16GB 5600MHz', specifications: 'CL36-36-36-76 1.25V XMP 3.0', status: 'AVAILABLE', manufacturedAt: new Date('2026-09-12T10:20:00Z'), validatedAt: new Date('2026-09-12T14:20:00Z'), notes: 'Memtest 0 errors' },

    // ROMs
    { id: 'ROM-000001', batchId: 'ROM-BATCH-001', type: 'ROM', modelName: 'NVMe Gen4 M.2 SSD 1TB', specifications: 'Phison E18, 176-Layer TLC, 7400/6800 MB/s', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-13T09:30:00Z'), validatedAt: new Date('2026-09-13T13:00:00Z'), notes: 'SMART health 100%' },
    { id: 'ROM-000002', batchId: 'ROM-BATCH-001', type: 'ROM', modelName: 'NVMe Gen4 M.2 SSD 1TB', specifications: 'Phison E18, 176-Layer TLC, 7400/6800 MB/s', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-13T09:45:00Z'), validatedAt: new Date('2026-09-13T13:15:00Z'), notes: 'SMART health 100%' },
    { id: 'ROM-000003', batchId: 'ROM-BATCH-001', type: 'ROM', modelName: 'NVMe Gen4 M.2 SSD 1TB', specifications: 'Phison E18, 176-Layer TLC, 7400/6800 MB/s', status: 'AVAILABLE', manufacturedAt: new Date('2026-09-13T10:00:00Z'), validatedAt: new Date('2026-09-13T13:30:00Z'), notes: 'SMART health 100%' },

    // Motherboards
    { id: 'MB-000001', batchId: 'MB-BATCH-001', type: 'MOTHERBOARD', modelName: 'APEX Z790 Pro ATX', specifications: 'LGA1700, 16+1+1 Phase VRM, PCIe 5.0, Wi-Fi 6E', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-15T09:00:00Z'), validatedAt: new Date('2026-09-15T12:00:00Z'), notes: 'Power rail voltage ripple < 15mV' },
    { id: 'MB-000002', batchId: 'MB-BATCH-001', type: 'MOTHERBOARD', modelName: 'APEX Z790 Pro ATX', specifications: 'LGA1700, 16+1+1 Phase VRM, PCIe 5.0, Wi-Fi 6E', status: 'ASSEMBLED', manufacturedAt: new Date('2026-09-15T09:15:00Z'), validatedAt: new Date('2026-09-15T12:15:00Z'), notes: 'Power rail voltage ripple < 14mV' },
    { id: 'MB-000003', batchId: 'MB-BATCH-001', type: 'MOTHERBOARD', modelName: 'APEX Z790 Pro ATX', specifications: 'LGA1700, 16+1+1 Phase VRM, PCIe 5.0, Wi-Fi 6E', status: 'AVAILABLE', manufacturedAt: new Date('2026-09-15T09:30:00Z'), validatedAt: new Date('2026-09-15T12:30:00Z'), notes: 'Passed AOI & power tests' },
  ];
  for (const c of componentsList) {
    await prisma.component.create({ data: c });
  }

  // 8. Assemblies
  const assembly1 = await prisma.assembly.create({
    data: {
      id: 'ASM-2026-000001',
      productName: 'Titan-X Professional Workstation PC',
      plannedQuantity: 2,
      completedQuantity: 2,
      status: 'COMPLETED',
      ramQuantity: 2,
      romQuantity: 2,
      gpuQuantity: 2,
      motherboardQuantity: 2,
      assemblyDate: new Date('2026-09-16T09:00:00Z'),
      completedDate: new Date('2026-09-16T15:00:00Z'),
      employeeId: 'EMP-005',
      employeeName: 'Liam Wilson',
      finalValidationResult: 'PASS',
      notes: 'Clean assembly. All thermal pads and cable management checked.'
    }
  });

  // Link components to Assembly
  await prisma.component.update({ where: { id: 'GPU-000001' }, data: { assemblyId: 'ASM-2026-000001' } });
  await prisma.component.update({ where: { id: 'RAM-000001' }, data: { assemblyId: 'ASM-2026-000001' } });
  await prisma.component.update({ where: { id: 'ROM-000001' }, data: { assemblyId: 'ASM-2026-000001' } });
  await prisma.component.update({ where: { id: 'MB-000001' }, data: { assemblyId: 'ASM-2026-000001' } });

  await prisma.component.update({ where: { id: 'GPU-000002' }, data: { assemblyId: 'ASM-2026-000001' } });
  await prisma.component.update({ where: { id: 'RAM-000002' }, data: { assemblyId: 'ASM-2026-000001' } });
  await prisma.component.update({ where: { id: 'ROM-000002' }, data: { assemblyId: 'ASM-2026-000001' } });
  await prisma.component.update({ where: { id: 'MB-000002' }, data: { assemblyId: 'ASM-2026-000001' } });

  // Assembly Items (Exact Linkage of finished product units to components)
  await prisma.assemblyItem.create({
    data: {
      assemblyId: 'ASM-2026-000001',
      finishedProductId: 'PC-2026-000001',
      ramComponentId: 'RAM-000001',
      romComponentId: 'ROM-000001',
      gpuComponentId: 'GPU-000001',
      motherboardComponentId: 'MB-000001',
      assembledAt: new Date('2026-09-16T11:00:00Z'),
      validatedAt: new Date('2026-09-16T14:00:00Z'),
      status: 'COMPLETED'
    }
  });

  await prisma.assemblyItem.create({
    data: {
      assemblyId: 'ASM-2026-000001',
      finishedProductId: 'PC-2026-000002',
      ramComponentId: 'RAM-000002',
      romComponentId: 'ROM-000002',
      gpuComponentId: 'GPU-000002',
      motherboardComponentId: 'MB-000002',
      assembledAt: new Date('2026-09-16T12:30:00Z'),
      validatedAt: new Date('2026-09-16T14:45:00Z'),
      status: 'COMPLETED'
    }
  });

  // 9. Products Catalog
  const products = [
    {
      id: 'PC-2026-000001',
      name: 'Titan-X Professional Workstation PC',
      description: 'High-performance computing station engineered for AI development, 3D rendering, and hardware synthesis.',
      specifications: 'GPU: APEX RTX-4080 16GB | RAM: DDR5 16GB 5600MHz | ROM: NVMe Gen4 1TB SSD | MB: APEX Z790 Pro | PSU: 850W Gold',
      price: 2499.00,
      availableQuantity: 12,
      reservedQuantity: 3,
      warrantyMonths: 24,
      status: 'AVAILABLE',
      assemblyId: 'ASM-2026-000001'
    },
    {
      id: 'PC-2026-000002',
      name: 'Vanguard Gaming & AI Workstation',
      description: 'Extreme gaming and creator rig featuring ultra-low latency memory channels and liquid-cooled thermals.',
      specifications: 'GPU: APEX RTX-4080 16GB | RAM: DDR5 32GB Dual Channel | ROM: NVMe Gen4 2TB SSD | MB: APEX Z790 Pro | PSU: 1000W Platinum',
      price: 2899.00,
      availableQuantity: 8,
      reservedQuantity: 2,
      warrantyMonths: 24,
      status: 'AVAILABLE',
      assemblyId: 'ASM-2026-000001'
    },
    {
      id: 'PC-2026-000003',
      name: 'Nexus Edge Compute Node',
      description: 'Compact industrial rackmount server built for high-reliability factory automation and edge analytics.',
      specifications: 'GPU: Dual APEX RTX-4080 | RAM: DDR5 64GB ECC | ROM: Dual NVMe Gen4 2TB RAID1 | MB: APEX Industrial Server Board',
      price: 4199.00,
      availableQuantity: 15,
      reservedQuantity: 0,
      warrantyMonths: 36,
      status: 'AVAILABLE',
      assemblyId: null
    }
  ];
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // 10. Orders and Items
  const order1 = await prisma.order.create({
    data: {
      id: 'ORD-2026-000001',
      customerId: 'CUST-001',
      customerName: 'John Doe',
      customerContact: '+1-800-555-2341 (john.doe@techcorp.com)',
      shippingAddress: '100 Silicon Way, Suite 400, San Jose, CA',
      totalAmount: 2499.00,
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      orderDate: new Date('2026-09-17T10:30:00Z'),
      items: {
        create: [
          {
            productId: 'PC-2026-000001',
            quantity: 1,
            unitPrice: 2499.00,
            totalPrice: 2499.00,
            productSerialId: 'PC-2026-000001'
          }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      id: 'ORD-2026-000002',
      customerId: 'CUST-002',
      customerName: 'Apex Research Labs',
      customerContact: '+1-800-555-7890 (procurement@apexresearch.org)',
      shippingAddress: '88 Innovation Parkway, Cambridge, MA',
      totalAmount: 5798.00,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      orderDate: new Date('2026-09-19T14:15:00Z'),
      items: {
        create: [
          {
            productId: 'PC-2026-000002',
            quantity: 2,
            unitPrice: 2899.00,
            totalPrice: 5798.00,
            productSerialId: 'PC-2026-000002'
          }
        ]
      }
    }
  });

  // 11. Delivery
  await prisma.delivery.create({
    data: {
      id: 'DEL-2026-000001',
      orderId: 'ORD-2026-000001',
      customerName: 'John Doe',
      address: '100 Silicon Way, Suite 400, San Jose, CA',
      courier: 'FedEx Express Freight',
      trackingNumber: 'TRK-992817482-US',
      dispatchDate: new Date('2026-09-17T16:00:00Z'),
      expectedDeliveryDate: new Date('2026-09-19T17:00:00Z'),
      actualDeliveryDate: new Date('2026-09-19T14:35:00Z'),
      deliveryStatus: 'DELIVERED',
      notes: 'Delivered at loading dock B. Signed by J. Doe.'
    }
  });

  // 12. Return Request & Inspection
  const return1 = await prisma.return.create({
    data: {
      id: 'RET-2026-000001',
      orderId: 'ORD-2026-000001',
      customerId: 'CUST-001',
      customerName: 'John Doe',
      productId: 'PC-2026-000001',
      productSerialId: 'PC-2026-000001',
      returnReason: 'Intermittent display output failure during high GPU load simulation',
      requestDate: new Date('2026-09-20T09:00:00Z'),
      returnStatus: 'UNDER_INSPECTION',
      replacementStatus: 'IN_PROGRESS',
      refundStatus: 'NONE'
    }
  });

  await prisma.inspection.create({
    data: {
      id: 'INSP-2026-000001',
      returnId: 'RET-2026-000001',
      productId: 'PC-2026-000001',
      productSerialId: 'PC-2026-000001',
      inspectorId: 'EMP-006',
      inspectorName: 'Elena Rostova',
      inspectionDate: new Date('2026-09-20T11:30:00Z'),
      inspectionTime: '11:30 AM',
      defectType: 'COMPONENT_FAILURE',
      defectDescription: 'Thermal throttling on GPU-000001 VRAM VRM module leading to display driver reset.',
      testResult: 'FAIL',
      remarks: 'Isolated to GPU-000001 component from batch GPU-BATCH-001. Other components intact.',
      finalDecision: 'REPLACEMENT'
    }
  });

  // 13. Validation Records
  const validationRecords = [
    { referenceType: 'MANUFACTURING_BATCH', referenceId: 'GPU-BATCH-001', validationType: 'Thermal Stress Test', result: 'PASS', testedBy: 'Elena Rostova', testParameters: 'Furmark 4K Loop, Ambient 25C, Max Temp 68C', remarks: 'Batch passed quality tolerance.' },
    { referenceType: 'MANUFACTURING_BATCH', referenceId: 'RAM-BATCH-001', validationType: 'MemTest86 Full Suite', result: 'PASS', testedBy: 'Sarah Connor', testParameters: '8 Iterations, 0 errors, 5600MT/s', remarks: 'Timing stability verified.' },
    { referenceType: 'ASSEMBLY', referenceId: 'ASM-2026-000001', validationType: 'System Integration Test', result: 'PASS', testedBy: 'Liam Wilson', testParameters: 'Power-On Self-Test (POST), OS Burn-in 4 Hours', remarks: 'Unit passed all system checks.' },
    { referenceType: 'FINISHED_PRODUCT', referenceId: 'PC-2026-000001', validationType: 'Final Factory QA', result: 'PASS', testedBy: 'Elena Rostova', testParameters: 'Firmware lock, port test, seal applied', remarks: 'Certified for dispatch.' },
  ];
  for (const v of validationRecords) {
    await prisma.validationRecord.create({ data: v });
  }

  // 14. Complete End-to-End Traceability Events Timeline for PC-2026-000001
  const events = [
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      componentId: 'GPU-000001',
      batchId: 'GPU-BATCH-001',
      eventType: 'MANUFACTURED',
      sector: 'GPU',
      actorName: 'Marcus Chen',
      description: 'GPU-000001 fabricated in batch GPU-BATCH-001 at Sector GPU Cleanroom 2',
      timestamp: new Date('2026-09-11T10:00:00Z'),
      detailsJson: JSON.stringify({ rawMaterials: 'Silicon Wafers (300mm), Copper Heatpipe Matrix', plannedQty: 50, batchStatus: 'PASSED' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      componentId: 'GPU-000001',
      batchId: 'GPU-BATCH-001',
      eventType: 'VALIDATED',
      sector: 'Inspection',
      actorName: 'Elena Rostova',
      description: 'Component GPU-000001 passed 3DMark Stress Loop & Electrical Impedance test',
      timestamp: new Date('2026-09-11T14:30:00Z'),
      detailsJson: JSON.stringify({ testResult: 'PASS', score: '99.4% stability', tempMax: '68C' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      componentId: 'RAM-000001',
      batchId: 'RAM-BATCH-001',
      eventType: 'MANUFACTURED',
      sector: 'RAM',
      actorName: 'Sarah Connor',
      description: 'RAM-000001 (DDR5 16GB 5600MHz) manufactured in batch RAM-BATCH-001',
      timestamp: new Date('2026-09-12T10:00:00Z'),
      detailsJson: JSON.stringify({ latency: 'CL36', voltage: '1.25V' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      componentId: 'ROM-000001',
      batchId: 'ROM-BATCH-001',
      eventType: 'MANUFACTURED',
      sector: 'ROM',
      actorName: 'David Kim',
      description: 'ROM-000001 (NVMe Gen4 1TB SSD) manufactured in batch ROM-BATCH-001',
      timestamp: new Date('2026-09-13T09:30:00Z'),
      detailsJson: JSON.stringify({ r_speed: '7400 MB/s', w_speed: '6800 MB/s' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      componentId: 'MB-000001',
      batchId: 'MB-BATCH-001',
      eventType: 'MANUFACTURED',
      sector: 'Motherboard',
      actorName: 'Vikram Patel',
      description: 'MB-000001 (APEX Z790 Pro ATX) manufactured in batch MB-BATCH-001',
      timestamp: new Date('2026-09-15T09:00:00Z'),
      detailsJson: JSON.stringify({ vrmPhase: '16+1+1', pcbLayers: 8 })
    },
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      eventType: 'ASSEMBLED',
      sector: 'Assembly',
      actorName: 'Liam Wilson',
      description: 'Finished Product PC-2026-000001 assembled using GPU-000001, RAM-000001, ROM-000001, MB-000001',
      timestamp: new Date('2026-09-16T11:00:00Z'),
      detailsJson: JSON.stringify({ assemblyId: 'ASM-2026-000001', checklist: 'Thermal paste applied, cables routed, BIOS updated' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      assemblyId: 'ASM-2026-000001',
      eventType: 'VALIDATED',
      sector: 'Inspection',
      actorName: 'Elena Rostova',
      description: 'Final Factory QA validation passed for unit PC-2026-000001',
      timestamp: new Date('2026-09-16T14:00:00Z'),
      detailsJson: JSON.stringify({ result: 'PASS', postTest: 'OK', stressTest4Hours: 'OK' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      eventType: 'STOCKED',
      sector: 'Inventory',
      actorName: 'James Thornton',
      description: 'Product PC-2026-000001 placed into Finished Goods Warehouse Hall C',
      timestamp: new Date('2026-09-16T16:00:00Z'),
      detailsJson: JSON.stringify({ location: 'Finished Goods - Hall C', status: 'AVAILABLE' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      orderId: 'ORD-2026-000001',
      eventType: 'ORDERED',
      sector: 'Sales',
      actorName: 'Sophia Martinez',
      description: 'Purchased by customer John Doe (TechCorp) under Order ORD-2026-000001',
      timestamp: new Date('2026-09-17T10:30:00Z'),
      detailsJson: JSON.stringify({ orderTotal: '$2,499.00', paymentStatus: 'PAID' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      orderId: 'ORD-2026-000001',
      eventType: 'SHIPPED',
      sector: 'Delivery',
      actorName: 'Robert Jackson',
      description: 'Dispatched via FedEx Express Freight under tracking number TRK-992817482-US',
      timestamp: new Date('2026-09-17T16:00:00Z'),
      detailsJson: JSON.stringify({ courier: 'FedEx Express', deliveryId: 'DEL-2026-000001' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      orderId: 'ORD-2026-000001',
      eventType: 'DELIVERED',
      sector: 'Delivery',
      actorName: 'FedEx Courier',
      description: 'Successfully delivered to customer address in San Jose, CA',
      timestamp: new Date('2026-09-19T14:35:00Z'),
      detailsJson: JSON.stringify({ signedBy: 'J. Doe', status: 'DELIVERED' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      orderId: 'ORD-2026-000001',
      eventType: 'RETURNED',
      sector: 'Sales / QA',
      actorName: 'John Doe',
      description: 'Return request RET-2026-000001 opened due to intermittent display output failure',
      timestamp: new Date('2026-09-20T09:00:00Z'),
      detailsJson: JSON.stringify({ returnId: 'RET-2026-000001', reason: 'Display reset under GPU load' })
    },
    {
      finishedProductId: 'PC-2026-000001',
      eventType: 'INSPECTED',
      sector: 'Inspection',
      actorName: 'Elena Rostova',
      description: 'Defect inspection completed: Thermal throttling confirmed on GPU-000001. Decision: REPLACEMENT.',
      timestamp: new Date('2026-09-20T11:30:00Z'),
      detailsJson: JSON.stringify({ inspectionId: 'INSP-2026-000001', decision: 'REPLACEMENT', defectType: 'COMPONENT_FAILURE' })
    }
  ];

  for (const ev of events) {
    await prisma.traceabilityEvent.create({ data: ev });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
