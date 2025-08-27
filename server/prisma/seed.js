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
  await prisma.systemConfig.create({
    data: {
      labName: 'SIL Laboratory',
      address: '123 Medical Center Blvd, Casablanca, Morocco',
      phone: '+212-5-22-123456',
      email: 'contact@sil-lab.com',
      currencySymbol: 'dh',
      currencyCode: 'MAD',
      currencyPosition: 'AFTER',
      decimalPlaces: 2,
      autoprint: true,
      smsNotifications: true,
      emailNotifications: true,
      language: 'fr',
      timezone: 'Africa/Casablanca'
    }
  });

  // Create analyses
  const analyses = await prisma.analysis.createMany({
    data: [
      // Hématologie
      { code: '4005', name: 'Hémogramme (CBC)', category: 'Hématologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4006', name: 'Numération Plaquettaire', category: 'Hématologie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4007', name: 'Réticulocytes', category: 'Hématologie', price: 35.00, tva: 20, cost: 12.00 },
      { code: '4008', name: 'Frottis Sanguin', category: 'Hématologie', price: 40.00, tva: 20, cost: 13.00 },
      
      // Biochimie
      { code: '4010', name: 'Glycémie (Blood Sugar)', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4011', name: 'HbA1c', category: 'Biochimie', price: 55.00, tva: 20, cost: 18.00 },
      { code: '4035', name: 'Créatininémie', category: 'Biochimie', price: 28.00, tva: 20, cost: 9.00 },
      { code: '4040', name: 'Urée', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4041', name: 'Acide Urique', category: 'Biochimie', price: 30.00, tva: 20, cost: 10.00 },
      { code: '4045', name: 'Bilan hépatique', category: 'Biochimie', price: 55.00, tva: 20, cost: 18.00 },
      { code: '4046', name: 'ALAT (ALT)', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4047', name: 'ASAT (AST)', category: 'Biochimie', price: 25.00, tva: 20, cost: 8.00 },
      { code: '4048', name: 'Bilirubine Totale', category: 'Biochimie', price: 30.00, tva: 20, cost: 10.00 },
      
      // Lipides
      { code: '4015', name: 'Cholestérol Total', category: 'Lipides', price: 30.00, tva: 20, cost: 10.00 },
      { code: '4020', name: 'HDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20, cost: 12.00 },
      { code: '4025', name: 'LDL Cholestérol', category: 'Lipides', price: 35.00, tva: 20, cost: 12.00 },
      { code: '4030', name: 'Triglycérides', category: 'Lipides', price: 30.00, tva: 20, cost: 10.00 },
      
      // Hormonologie
      { code: '4050', name: 'TSH', category: 'Hormonologie', price: 40.00, tva: 20, cost: 13.00 },
      { code: '4055', name: 'T4 Libre', category: 'Hormonologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4060', name: 'T3 Libre', category: 'Hormonologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4061', name: 'Cortisol', category: 'Hormonologie', price: 50.00, tva: 20, cost: 16.00 },
      { code: '4062', name: 'Insuline', category: 'Hormonologie', price: 55.00, tva: 20, cost: 18.00 },
      
      // Immunologie
      { code: '4070', name: 'Groupe Sanguin', category: 'Immunologie', price: 35.00, tva: 20, cost: 11.00 },
      { code: '4071', name: 'Test de Coombs', category: 'Immunologie', price: 40.00, tva: 20, cost: 13.00 },
      { code: '4072', name: 'Anticorps Anti-HCV', category: 'Immunologie', price: 60.00, tva: 20, cost: 20.00 },
      { code: '4073', name: 'Anticorps Anti-HIV', category: 'Immunologie', price: 65.00, tva: 20, cost: 22.00 },
      
      // Inflammation
      { code: '4075', name: 'CRP', category: 'Inflammation', price: 32.00, tva: 20, cost: 10.00 },
      { code: '4080', name: 'VS', category: 'Inflammation', price: 20.00, tva: 20, cost: 6.00 },
      { code: '4081', name: 'Procalcitonine', category: 'Inflammation', price: 75.00, tva: 20, cost: 25.00 },
      
      // Microbiologie
      { code: '4090', name: 'ECBU', category: 'Microbiologie', price: 45.00, tva: 20, cost: 15.00 },
      { code: '4091', name: 'Coproculture', category: 'Microbiologie', price: 50.00, tva: 20, cost: 16.00 },
      { code: '4092', name: 'Hémoculture', category: 'Microbiologie', price: 65.00, tva: 20, cost: 22.00 }
    ]
  });

  // Create doctors
  const doctors = await prisma.doctor.createMany({
    data: [
      { firstName: 'Hicham', lastName: 'Boulahcen', email: 'hicham.boulahcen@med.com', phone: '+212-6-12-345678', specialty: 'Cardiologie', orderNumber: 'ORD-001', status: 'ACTIVE' },
      { firstName: 'Fatima', lastName: 'El Amrani', email: 'fatima.elamrani@med.com', phone: '+212-6-12-345679', specialty: 'Endocrinologie', orderNumber: 'ORD-002', status: 'ACTIVE' },
      { firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed.benali@med.com', phone: '+212-6-12-345680', specialty: 'Gastro-entérologie', orderNumber: 'ORD-003', status: 'ACTIVE' },
      { firstName: 'Amina', lastName: 'Tazi', email: 'amina.tazi@med.com', phone: '+212-6-12-345681', specialty: 'Dermatologie', orderNumber: 'ORD-004', status: 'ACTIVE' },
      { firstName: 'Karim', lastName: 'Idrissi', email: 'karim.idrissi@med.com', phone: '+212-6-12-345682', specialty: 'Neurologie', orderNumber: 'ORD-005', status: 'ACTIVE' },
      { firstName: 'Laila', lastName: 'Bennani', email: 'laila.bennani@med.com', phone: '+212-6-12-345683', specialty: 'Gynécologie', orderNumber: 'ORD-006', status: 'ACTIVE' },
      { firstName: 'Omar', lastName: 'Alaoui', email: 'omar.alaoui@med.com', phone: '+212-6-12-345684', specialty: 'Pédiatrie', orderNumber: 'ORD-007', status: 'ACTIVE' },
      { firstName: 'Nadia', lastName: 'Cherkaoui', email: 'nadia.cherkaoui@med.com', phone: '+212-6-12-345685', specialty: 'Rhumatologie', orderNumber: 'ORD-008', status: 'ACTIVE' },
      { firstName: 'Youssef', lastName: 'Lamrani', email: 'youssef.lamrani@med.com', phone: '+212-6-12-345686', specialty: 'Urologie', orderNumber: 'ORD-009', status: 'ACTIVE' },
      { firstName: 'Samira', lastName: 'Fassi', email: 'samira.fassi@med.com', phone: '+212-6-12-345687', specialty: 'Ophtalmologie', orderNumber: 'ORD-010', status: 'ACTIVE' }
    ]
  });

  // Create patients
  const patients = await prisma.patient.createMany({
    data: [
      { firstName: 'Soukaina', lastName: 'El Amrani', dateOfBirth: new Date('1990-05-15'), gender: 'F', phone: '+212-6-12-345688', email: 'soukaina.elamrani@email.com', cnssNumber: 'CNSS-001' },
      { firstName: 'Mohammed', lastName: 'Benjelloun', dateOfBirth: new Date('1985-08-22'), gender: 'M', phone: '+212-6-12-345689', email: 'mohammed.benjelloun@email.com', cnssNumber: 'CNSS-002' },
      { firstName: 'Aicha', lastName: 'Lahlou', dateOfBirth: new Date('1992-12-10'), gender: 'F', phone: '+212-6-12-345690', email: 'aicha.lahlou@email.com', cnssNumber: 'CNSS-003' },
      { firstName: 'Youssef', lastName: 'Mansouri', dateOfBirth: new Date('1988-03-18'), gender: 'M', phone: '+212-6-12-345691', email: 'youssef.mansouri@email.com', cnssNumber: 'CNSS-004' },
      { firstName: 'Leila', lastName: 'Bennani', dateOfBirth: new Date('1995-07-25'), gender: 'F', phone: '+212-6-12-345692', email: 'leila.bennani@email.com', cnssNumber: 'CNSS-005' },
      { firstName: 'Hassan', lastName: 'Alami', dateOfBirth: new Date('1978-11-30'), gender: 'M', phone: '+212-6-12-345693', email: 'hassan.alami@email.com', cnssNumber: 'CNSS-006' },
      { firstName: 'Khadija', lastName: 'Berrada', dateOfBirth: new Date('1983-04-12'), gender: 'F', phone: '+212-6-12-345694', email: 'khadija.berrada@email.com', cnssNumber: 'CNSS-007' },
      { firstName: 'Rachid', lastName: 'Zouani', dateOfBirth: new Date('1975-09-08'), gender: 'M', phone: '+212-6-12-345695', email: 'rachid.zouani@email.com', cnssNumber: 'CNSS-008' },
      { firstName: 'Zineb', lastName: 'Kettani', dateOfBirth: new Date('1987-01-20'), gender: 'F', phone: '+212-6-12-345696', email: 'zineb.kettani@email.com', cnssNumber: 'CNSS-009' },
      { firstName: 'Abdelkader', lastName: 'Filali', dateOfBirth: new Date('1965-06-14'), gender: 'M', phone: '+212-6-12-345697', email: 'abdelkader.filali@email.com', cnssNumber: 'CNSS-010' },
      { firstName: 'Malika', lastName: 'Ouali', dateOfBirth: new Date('1993-03-25'), gender: 'F', phone: '+212-6-12-345698', email: 'malika.ouali@email.com', cnssNumber: 'CNSS-011' },
      { firstName: 'Said', lastName: 'Benkirane', dateOfBirth: new Date('1980-12-05'), gender: 'M', phone: '+212-6-12-345699', email: 'said.benkirane@email.com', cnssNumber: 'CNSS-012' }
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
      advancePayment: 100.00,
      amountDue: 0.00,
      createdById: adminUser.id
    }
  });

  const request2 = await prisma.request.create({
    data: {
      patientId: createdPatients[1].id,
      doctorId: createdDoctors[1].id,
      status: 'COMPLETED',
      priority: 'URGENT',
      collectionDate: new Date('2024-01-16'),
      collectionTime: '14:15',
      totalAmount: 180.00,
      discount: 10.00,
      advancePayment: 170.00,
      amountDue: 0.00,
      createdById: adminUser.id
    }
  });

  const request3 = await prisma.request.create({
    data: {
      patientId: createdPatients[2].id,
      doctorId: createdDoctors[2].id,
      status: 'IN_PROGRESS',
      priority: 'NORMAL',
      collectionDate: new Date('2024-01-17'),
      collectionTime: '09:00',
      totalAmount: 85.00,
      discount: 0,
      advancePayment: 50.00,
      amountDue: 35.00,
      createdById: adminUser.id
    }
  });

  const request4 = await prisma.request.create({
    data: {
      patientId: createdPatients[3].id,
      doctorId: createdDoctors[3].id,
      status: 'PENDING',
      priority: 'NORMAL',
      collectionDate: new Date('2024-01-18'),
      collectionTime: '11:45',
      totalAmount: 120.00,
      discount: 0,
      advancePayment: 0.00,
      amountDue: 120.00,
      createdById: adminUser.id
    }
  });

  const request5 = await prisma.request.create({
    data: {
      patientId: createdPatients[4].id,
      doctorId: createdDoctors[4].id,
      status: 'VALIDATED',
      priority: 'NORMAL',
      collectionDate: new Date('2024-01-19'),
      collectionTime: '16:20',
      totalAmount: 95.00,
      discount: 5.00,
      advancePayment: 90.00,
      amountDue: 0.00,
      createdById: adminUser.id
    }
  });

  // Add analyses to requests
  await prisma.requestAnalysis.createMany({
    data: [
      // Request 1 - CBC + Glucose + Cholesterol
      { requestId: request1.id, analysisId: createdAnalyses[0].id, price: 45.00 },
      { requestId: request1.id, analysisId: createdAnalyses[4].id, price: 25.00 },
      { requestId: request1.id, analysisId: createdAnalyses[14].id, price: 30.00 },
      
      // Request 2 - Lipid Panel + Liver Function
      { requestId: request2.id, analysisId: createdAnalyses[14].id, price: 30.00 },
      { requestId: request2.id, analysisId: createdAnalyses[15].id, price: 35.00 },
      { requestId: request2.id, analysisId: createdAnalyses[16].id, price: 35.00 },
      { requestId: request2.id, analysisId: createdAnalyses[17].id, price: 30.00 },
      { requestId: request2.id, analysisId: createdAnalyses[9].id, price: 55.00 },
      
      // Request 3 - Thyroid Function
      { requestId: request3.id, analysisId: createdAnalyses[18].id, price: 40.00 },
      { requestId: request3.id, analysisId: createdAnalyses[19].id, price: 45.00 },
      
      // Request 4 - Kidney Function + Inflammation
      { requestId: request4.id, analysisId: createdAnalyses[6].id, price: 28.00 },
      { requestId: request4.id, analysisId: createdAnalyses[7].id, price: 25.00 },
      { requestId: request4.id, analysisId: createdAnalyses[26].id, price: 32.00 },
      { requestId: request4.id, analysisId: createdAnalyses[27].id, price: 20.00 },
      
      // Request 5 - Diabetes Panel
      { requestId: request5.id, analysisId: createdAnalyses[4].id, price: 25.00 },
      { requestId: request5.id, analysisId: createdAnalyses[5].id, price: 55.00 },
      { requestId: request5.id, analysisId: createdAnalyses[22].id, price: 55.00 }
    ]
  });

  // Create test results for completed requests
  await prisma.result.createMany({
    data: [
      // Results for Request 1 (CBC)
      { requestId: request1.id, analysisId: createdAnalyses[0].id, value: '4.8', unit: '10^6/μL', reference: '4.5-5.9', status: 'VALIDATED', notes: 'Normal range', validatedAt: new Date('2024-01-15T15:30:00'), validatedBy: biologistUser.id },
      { requestId: request1.id, analysisId: createdAnalyses[4].id, value: '95', unit: 'mg/dL', reference: '70-100', status: 'VALIDATED', notes: 'Normal range', validatedAt: new Date('2024-01-15T15:30:00'), validatedBy: biologistUser.id },
      { requestId: request1.id, analysisId: createdAnalyses[14].id, value: '185', unit: 'mg/dL', reference: '<200', status: 'VALIDATED', notes: 'Normal range', validatedAt: new Date('2024-01-15T15:30:00'), validatedBy: biologistUser.id },
      
      // Results for Request 2 (Lipid Panel)
      { requestId: request2.id, analysisId: createdAnalyses[14].id, value: '220', unit: 'mg/dL', reference: '<200', status: 'VALIDATED', notes: 'Above normal range', validatedAt: new Date('2024-01-16T16:45:00'), validatedBy: biologistUser.id },
      { requestId: request2.id, analysisId: createdAnalyses[15].id, value: '38', unit: 'mg/dL', reference: '>40', status: 'VALIDATED', notes: 'Below normal range', validatedAt: new Date('2024-01-16T16:45:00'), validatedBy: biologistUser.id },
      { requestId: request2.id, analysisId: createdAnalyses[16].id, value: '145', unit: 'mg/dL', reference: '<100', status: 'VALIDATED', notes: 'Above normal range', validatedAt: new Date('2024-01-16T16:45:00'), validatedBy: biologistUser.id },
      { requestId: request2.id, analysisId: createdAnalyses[17].id, value: '180', unit: 'mg/dL', reference: '<150', status: 'VALIDATED', notes: 'Above normal range', validatedAt: new Date('2024-01-16T16:45:00'), validatedBy: biologistUser.id },
      
      // Results for Request 5 (Diabetes Panel)
      { requestId: request5.id, analysisId: createdAnalyses[4].id, value: '126', unit: 'mg/dL', reference: '70-100', status: 'VALIDATED', notes: 'Above normal range - diabetes indicated', validatedAt: new Date('2024-01-19T17:00:00'), validatedBy: biologistUser.id },
      { requestId: request5.id, analysisId: createdAnalyses[5].id, value: '8.2', unit: '%', reference: '<7.0', status: 'VALIDATED', notes: 'Above normal range - poor glycemic control', validatedAt: new Date('2024-01-19T17:00:00'), validatedBy: biologistUser.id },
      { requestId: request5.id, analysisId: createdAnalyses[22].id, value: '18', unit: 'μU/mL', reference: '2.6-24.9', status: 'VALIDATED', notes: 'Normal range', validatedAt: new Date('2024-01-19T17:00:00'), validatedBy: biologistUser.id }
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

  // Create modules
  const backupModule = await prisma.module.upsert({
    where: { name: 'backup-manager' },
    update: {},
    create: {
      name: 'backup-manager',
      displayName: 'Backup Manager',
      description: 'Complete backup and restore system with automatic reminders and settings management',
      version: '1.0.0',
      author: 'SIL Lab Team',
      category: 'system',
      price: 0, // Free module
      features: [
        'Manual and automatic backup creation',
        'Import/Export backup files',
        'Complete system restoration',
        'Smart dashboard reminders',
        'Backup statistics and monitoring',
        'Retention settings configuration',
        'File validation and compression',
        'Real-time progress tracking'
      ],
      requirements: {
        minVersion: '1.0.0',
        permissions: ['ADMIN'],
        dependencies: []
      },
      isActive: true
    }
  });

  const qualityModule = await prisma.module.upsert({
    where: { name: 'quality-control' },
    update: {},
    create: {
      name: 'quality-control',
      displayName: 'Quality Control',
      description: 'Complete quality control system with control sample management, result validation and compliance reporting',
      version: '1.0.0',
      author: 'SIL Lab Team',
      category: 'laboratory',
      price: 299.99, // Premium module
      features: [
        'Control sample management',
        'Automatic result validation',
        'Statistical control charts',
        'Compliance reporting',
        'Quality drift alerts',
        'Complete traceability',
        'Reference standards',
        'Audit and certification'
      ],
      requirements: {
        minVersion: '1.0.0',
        permissions: ['ADMIN', 'BIOLOGIST', 'TECHNICIAN'],
        dependencies: []
      },
      isActive: true
    }
  });

  const analyticsModule = await prisma.module.upsert({
    where: { name: 'analytics-pro' },
    update: {},
    create: {
      name: 'analytics-pro',
      displayName: 'Analytics Pro',
      description: 'Advanced analytics and business intelligence with custom dashboards, KPI tracking, and predictive insights.',
      version: '1.0.0',
      author: 'SIL Lab Team',
      category: 'analytics',
      price: 499.99, // Premium module
      features: [
        'Custom dashboard builder',
        'Advanced KPI tracking',
        'Predictive analytics',
        'Real-time data visualization',
        'Business intelligence reports',
        'Trend analysis and forecasting',
        'Performance metrics monitoring',
        'Data export and integration',
        'Interactive charts and graphs',
        'Automated report generation',
        'Multi-dimensional data analysis',
        'Comparative analytics'
      ],
      requirements: {
        minVersion: '1.0.0',
        permissions: ['ADMIN', 'MANAGER', 'ANALYST'],
        dependencies: []
      },
      isActive: true
    }
  });

  // Create module licenses
  const backupLicense = await prisma.moduleLicense.upsert({
    where: { licenseKey: 'BACKUP-DEMO-HMZY90EV2' },
    update: {},
    create: {
      moduleId: backupModule.id,
      licenseKey: 'BACKUP-DEMO-HMZY90EV2',
      organizationName: 'SIL Laboratory Demo',
      contactEmail: 'admin@sil-lab.ma',
      status: 'ACTIVE',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      maxUsers: 100,
      features: [
        'Manual and automatic backup creation',
        'Import/Export backup files',
        'Complete system restoration',
        'Smart dashboard reminders',
        'Backup statistics and monitoring',
        'Retention settings configuration',
        'File validation and compression',
        'Real-time progress tracking'
      ]
    }
  });

  const qualityLicense = await prisma.moduleLicense.upsert({
    where: { licenseKey: 'QUALITY-TRIAL-AA8PCDVD8' },
    update: {},
    create: {
      moduleId: qualityModule.id,
      licenseKey: 'QUALITY-TRIAL-AA8PCDVD8',
      organizationName: 'SIL Laboratory Demo',
      contactEmail: 'admin@sil-lab.ma',
      status: 'TRIAL',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      maxUsers: 10,
      features: [
        'Control sample management',
        'Automatic result validation',
        'Statistical control charts',
        'Compliance reporting',
        'Quality drift alerts',
        'Complete traceability'
      ]
    }
  });

  const analyticsLicense = await prisma.moduleLicense.upsert({
    where: { licenseKey: 'ANALYTICS-TRIAL-XYZ123ABC' },
    update: {},
    create: {
      moduleId: analyticsModule.id,
      licenseKey: 'ANALYTICS-TRIAL-XYZ123ABC',
      organizationName: 'SIL Laboratory Demo',
      contactEmail: 'admin@sil-lab.ma',
      status: 'TRIAL',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      maxUsers: 5,
      features: [
        'Custom dashboard builder',
        'Advanced KPI tracking',
        'Real-time data visualization',
        'Business intelligence reports',
        'Trend analysis and forecasting',
        'Performance metrics monitoring'
      ]
    }
  });

  // Create additional modules (available for installation)
  const stockModule = await prisma.module.upsert({
    where: { name: 'stock-manager' },
    update: {},
    create: {
      name: 'stock-manager',
      displayName: 'Stock Manager',
      description: 'Complete inventory management system with stock tracking, supplier management, and automated reordering.',
      version: '1.0.0',
      author: 'SIL Lab Team',
      category: 'inventory',
      price: 199.99, // Premium module
      features: [
        'Real-time stock tracking',
        'Automated reorder alerts',
        'Supplier management',
        'Purchase order generation',
        'Inventory reports',
        'Barcode scanning',
        'Expiration date tracking',
        'Cost analysis',
        'Multi-location support',
        'Stock movement history'
      ],
      requirements: {
        minVersion: '1.0.0',
        permissions: ['ADMIN', 'MANAGER', 'INVENTORY_CLERK'],
        dependencies: []
      },
      isActive: true
    }
  });

  const billingModule = await prisma.module.upsert({
    where: { name: 'billing-manager' },
    update: {},
    create: {
      name: 'billing-manager',
      displayName: 'Billing Manager',
      description: 'Advanced billing and financial management with invoice generation, payment tracking, and financial reporting.',
      version: '1.0.0',
      author: 'SIL Lab Team',
      category: 'financial',
      price: 399.99, // Premium module
      features: [
        'Automated invoice generation',
        'Payment tracking',
        'Financial reporting',
        'Tax management',
        'Insurance claim processing',
        'Payment reminders',
        'Revenue analytics',
        'Multi-currency support',
        'Discount management',
        'Financial dashboard',
        'Audit trail',
        'Integration with accounting systems'
      ],
      requirements: {
        minVersion: '1.0.0',
        permissions: ['ADMIN', 'ACCOUNTANT', 'BILLING_CLERK'],
        dependencies: []
      },
      isActive: true
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('👥 Users created:', 4);
  console.log('🔬 Analyses created:', 31);
  console.log('👨‍⚕️ Doctors created:', 10);
  console.log('👤 Patients created:', 12);
  console.log('🏢 Suppliers created:', 4);
  console.log('📦 Products created:', 8);
  console.log('📋 Requests created:', 5);
  console.log('🧪 Test results created:', 10);
  console.log('📦 Stock entries created:', 4);
  console.log('🛒 Orders created:', 1);
  console.log('🧩 Modules created:', 5);
  console.log('🔑 Module licenses created:', 3);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 