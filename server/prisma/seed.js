const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryAdjustment.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockOut.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.result.deleteMany();
  await prisma.requestAnalysis.deleteMany();
  await prisma.request.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sil-lab.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  const biologistUser = await prisma.user.create({
    data: {
      email: 'biologist@sil-lab.com',
      password: await bcrypt.hash('bio123', 10),
      name: 'Dr. Sarah Johnson',
      role: 'BIOLOGIST'
    }
  });

  const technicianUser = await prisma.user.create({
    data: {
      email: 'tech@sil-lab.com',
      password: await bcrypt.hash('tech123', 10),
      name: 'Mike Chen',
      role: 'TECHNICIAN'
    }
  });

  const secretaryUser = await prisma.user.create({
    data: {
      email: 'secretary@sil-lab.com',
      password: await bcrypt.hash('sec123', 10),
      name: 'Nadia Smith',
      role: 'SECRETARY'
    }
  });

  // Create system configuration
  await prisma.systemConfig.createMany({
    data: [
      { key: 'labName', value: 'SIL Laboratory' },
      { key: 'address', value: '123 Medical Center Blvd, City' },
      { key: 'phone', value: '+212-5-22-123456' },
      { key: 'email', value: 'contact@sil-lab.com' },
      { key: 'currencySymbol', value: 'dh' },
      { key: 'currencyCode', value: 'MAD' },
      { key: 'currencyPosition', value: 'AFTER' },
      { key: 'decimalPlaces', value: '2' },
      { key: 'autoprint', value: 'true' },
      { key: 'smsNotifications', value: 'true' },
      { key: 'emailNotifications', value: 'true' }
    ]
  });

  // Create analyses
  const analyses = await prisma.analysis.createMany({
    data: [
      { code: '4005', name: 'Hémogramme (CBC)', category: 'Hématologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4010', name: 'Glycémie (Blood Sugar)', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4015', name: 'Cholestérol Total', category: 'Lipides', price: 30.00, tva: 20, cost: 10.00 },
      { code: '4020', name: 'HDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20, cost: 12.00 },
      { code: '4025', name: 'LDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20, cost: 12.00 },
      { code: '4030', name: 'Triglycérides', category: 'Lipides', price: 30.00, tva: 20, cost: 10.00 },
      { code: '4035', name: 'Créatininémie', category: 'Biochimie', price: 28.00, tva: 20, cost: 9.00 },
      { code: '4040', name: 'Urée', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4045', name: 'Bilan hépatique', category: 'Biochimie', price: 55.00, tva: 20, cost: 18.00 },
      { code: '4050', name: 'TSH', category: 'Hormonologie', price: 40.00, tva: 20, cost: 13.00 },
      { code: '4055', name: 'T4 Libre', category: 'Hormonologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4060', name: 'T3 Libre', category: 'Hormonologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4070', name: 'Groupe Sanguin', category: 'Immunologie', price: 35.00, tva: 20, cost: 11.00 },
      { code: '4075', name: 'CRP', category: 'Inflammation', price: 32.00, tva: 20, cost: 10.00 },
      { code: '4080', name: 'VS', category: 'Inflammation', price: 20.00, tva: 20, cost: 6.00 }
    ]
  });

  // Create doctors
  const doctors = await prisma.doctor.createMany({
    data: [
      { firstName: 'Hicham', lastName: 'Boulahcen', email: 'hicham.boulahcen@med.com', phone: '+212-6-12-345678', specialty: 'Cardiologie', orderNumber: 'ORD-001', status: 'ACTIVE' },
      { firstName: 'Fatima', lastName: 'El Amrani', email: 'fatima.elamrani@med.com', phone: '+212-6-12-345679', specialty: 'Endocrinologie', orderNumber: 'ORD-002', status: 'ACTIVE' },
      { firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed.benali@med.com', phone: '+212-6-12-345680', specialty: 'Gastro-entérologie', orderNumber: 'ORD-003', status: 'ACTIVE' },
      { firstName: 'Amina', lastName: 'Tazi', email: 'amina.tazi@med.com', phone: '+212-6-12-345681', specialty: 'Dermatologie', orderNumber: 'ORD-004', status: 'ACTIVE' },
      { firstName: 'Karim', lastName: 'Idrissi', email: 'karim.idrissi@med.com', phone: '+212-6-12-345682', specialty: 'Neurologie', orderNumber: 'ORD-005', status: 'ACTIVE' }
    ]
  });

  // Create patients
  const patients = await prisma.patient.createMany({
    data: [
      { firstName: 'Soukaina', lastName: 'El Amrani', dateOfBirth: new Date('1990-05-15'), gender: 'F', phone: '+212-6-12-345683', email: 'soukaina.elamrani@email.com', cnssNumber: 'CNSS-001' },
      { firstName: 'Mohammed', lastName: 'Benjelloun', dateOfBirth: new Date('1985-08-22'), gender: 'M', phone: '+212-6-12-345684', email: 'mohammed.benjelloun@email.com', cnssNumber: 'CNSS-002' },
      { firstName: 'Aicha', lastName: 'Lahlou', dateOfBirth: new Date('1992-12-10'), gender: 'F', phone: '+212-6-12-345685', email: 'aicha.lahlou@email.com', cnssNumber: 'CNSS-003' },
      { firstName: 'Youssef', lastName: 'Mansouri', dateOfBirth: new Date('1988-03-18'), gender: 'M', phone: '+212-6-12-345686', email: 'youssef.mansouri@email.com', cnssNumber: 'CNSS-004' },
      { firstName: 'Leila', lastName: 'Bennani', dateOfBirth: new Date('1995-07-25'), gender: 'F', phone: '+212-6-12-345687', email: 'leila.bennani@email.com', cnssNumber: 'CNSS-005' }
    ]
  });

  // Create suppliers
  const suppliers = await prisma.supplier.createMany({
    data: [
      { name: 'MedSupply Morocco', code: 'MSM-001', email: 'contact@medsupply.ma', phone: '+212-5-22-123457', address: '123 Supply Street, Casablanca', contactPerson: 'Ahmed Supply' },
      { name: 'LabEquipment Plus', code: 'LEP-001', email: 'info@labequipment.ma', phone: '+212-5-22-123458', address: '456 Equipment Ave, Rabat', contactPerson: 'Fatima Equipment' },
      { name: 'Reagent Solutions', code: 'RS-001', email: 'sales@reagents.ma', phone: '+212-5-22-123459', address: '789 Reagent Road, Marrakech', contactPerson: 'Karim Reagent' },
      { name: 'Medical Instruments Co', code: 'MIC-001', email: 'contact@medinstruments.ma', phone: '+212-5-22-123460', address: '321 Instrument Blvd, Fes', contactPerson: 'Amina Instrument' }
    ]
  });

  // Create products
  const products = await prisma.product.createMany({
    data: [
      { name: 'Glucose Test Strips', code: 'GTS-001', category: 'Reagents', description: 'Test strips for glucose monitoring', unit: 'box', minStock: 10, maxStock: 100 },
      { name: 'Blood Collection Tubes', code: 'BCT-001', category: 'Consumables', description: 'Vacutainer tubes for blood collection', unit: 'pack', minStock: 20, maxStock: 200 },
      { name: 'Microscope Slides', code: 'MS-001', category: 'Consumables', description: 'Glass slides for microscopy', unit: 'box', minStock: 5, maxStock: 50 },
      { name: 'Disposable Gloves', code: 'DG-001', category: 'PPE', description: 'Latex-free disposable gloves', unit: 'box', minStock: 15, maxStock: 150 },
      { name: 'Syringes 5ml', code: 'SYR-001', category: 'Consumables', description: '5ml disposable syringes', unit: 'pack', minStock: 25, maxStock: 250 },
      { name: 'Antibody Test Kit', code: 'ATK-001', category: 'Reagents', description: 'COVID-19 antibody test kit', unit: 'kit', minStock: 8, maxStock: 80 },
      { name: 'Centrifuge Tubes', code: 'CT-001', category: 'Consumables', description: '15ml centrifuge tubes', unit: 'pack', minStock: 30, maxStock: 300 },
      { name: 'Lab Coats', code: 'LC-001', category: 'PPE', description: 'White laboratory coats', unit: 'piece', minStock: 5, maxStock: 50 }
    ]
  });

  // Get created records for relationships
  const createdPatients = await prisma.patient.findMany();
  const createdDoctors = await prisma.doctor.findMany();
  const createdAnalyses = await prisma.analysis.findMany();
  const createdSuppliers = await prisma.supplier.findMany();
  const createdProducts = await prisma.product.findMany();

  // Create sample requests
  const request1 = await prisma.request.create({
    data: {
      patientId: createdPatients[0].id,
      doctorId: createdDoctors[0].id,
      status: 'COMPLETED',
      priority: 'NORMAL',
      collectionDate: new Date('2024-01-15'),
      collectionTime: '10:30',
      totalAmount: 100.00,
      discount: 0,
      advancePayment: 50.00,
      amountDue: 50.00,
      createdById: adminUser.id
    }
  });

  // Add analyses to request
  await prisma.requestAnalysis.createMany({
    data: [
      { requestId: request1.id, analysisId: createdAnalyses[0].id, price: 45.00 },
      { requestId: request1.id, analysisId: createdAnalyses[1].id, price: 25.00 },
      { requestId: request1.id, analysisId: createdAnalyses[2].id, price: 30.00 }
    ]
  });

  // Create stock entries
  await prisma.stockEntry.createMany({
    data: [
      { productId: createdProducts[0].id, supplierId: createdSuppliers[0].id, quantity: 50, lotNumber: 'LOT-001', expiryDate: new Date('2025-12-31'), unitCost: 15.00, location: 'Main Storage', receivedBy: 'Admin' },
      { productId: createdProducts[1].id, supplierId: createdSuppliers[1].id, quantity: 100, lotNumber: 'LOT-002', expiryDate: new Date('2025-06-30'), unitCost: 8.00, location: 'Main Storage', receivedBy: 'Admin' },
      { productId: createdProducts[2].id, supplierId: createdSuppliers[2].id, quantity: 25, lotNumber: 'LOT-003', expiryDate: new Date('2026-03-15'), unitCost: 12.00, location: 'Main Storage', receivedBy: 'Admin' },
      { productId: createdProducts[3].id, supplierId: createdSuppliers[3].id, quantity: 75, lotNumber: 'LOT-004', expiryDate: new Date('2025-09-30'), unitCost: 5.00, location: 'Main Storage', receivedBy: 'Admin' }
    ]
  });

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-001',
      supplierId: createdSuppliers[0].id,
      status: 'CONFIRMED',
      orderDate: new Date('2024-01-10'),
      expectedDate: new Date('2024-01-20'),
      totalAmount: 750.00,
      notes: 'Monthly supply order',
      createdBy: adminUser.id
    }
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: createdProducts[0].id, quantity: 20, unitPrice: 15.00, totalPrice: 300.00 },
      { orderId: order1.id, productId: createdProducts[1].id, quantity: 30, unitPrice: 8.00, totalPrice: 240.00 },
      { orderId: order1.id, productId: createdProducts[2].id, quantity: 10, unitPrice: 12.00, totalPrice: 120.00 },
      { orderId: order1.id, productId: createdProducts[3].id, quantity: 15, unitPrice: 6.00, totalPrice: 90.00 }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('👥 Users created:', 4);
  console.log('🔬 Analyses created:', 16);
  console.log('👨‍⚕️ Doctors created:', 5);
  console.log('👤 Patients created:', 5);
  console.log('🏢 Suppliers created:', 4);
  console.log('📦 Products created:', 8);
  console.log('📋 Requests created:', 1);
  console.log('📦 Stock entries created:', 4);
  console.log('🛒 Orders created:', 1);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 