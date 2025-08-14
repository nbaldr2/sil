const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addStockData() {
  console.log('🌱 Adding stock data...');

  try {
    // Create suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { id: 'supplier-1' },
        update: {},
        create: {
          id: 'supplier-1',
          name: 'Medical Supplies Co.',
          email: 'info@medsupplies.com',
          phone: '+1234567890',
          address: '123 Medical Ave, City',
          contactPerson: 'John Supplier'
        }
      }),
      prisma.supplier.upsert({
        where: { id: 'supplier-2' },
        update: {},
        create: {
          id: 'supplier-2',
          name: 'Lab Equipment Ltd.',
          email: 'sales@labequipment.com',
          phone: '+1234567891',
          address: '456 Lab Street, Town',
          contactPerson: 'Sarah Equipment'
        }
      })
    ]);

    console.log('✅ Suppliers created');

    // Create products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { code: 'REAG-001' },
        update: {},
        create: {
          code: 'REAG-001',
          name: 'Glucose Reagent',
          category: 'Reagents',
          description: 'High-quality glucose testing reagent',
          unit: 'ml',
          minQuantity: 100,
          maxQuantity: 1000,
          cost: 2.50,
          supplierId: suppliers[0].id
        }
      }),
      prisma.product.upsert({
        where: { code: 'REAG-002' },
        update: {},
        create: {
          code: 'REAG-002',
          name: 'Cholesterol Reagent',
          category: 'Reagents',
          description: 'Cholesterol testing reagent kit',
          unit: 'ml',
          minQuantity: 50,
          maxQuantity: 500,
          cost: 5.00,
          supplierId: suppliers[0].id
        }
      }),
      prisma.product.upsert({
        where: { code: 'PPE-001' },
        update: {},
        create: {
          code: 'PPE-001',
          name: 'Disposable Gloves',
          category: 'PPE',
          description: 'Latex-free disposable gloves',
          unit: 'pairs',
          minQuantity: 200,
          maxQuantity: 2000,
          cost: 0.25,
          supplierId: suppliers[1].id
        }
      }),
      prisma.product.upsert({
        where: { code: 'INST-001' },
        update: {},
        create: {
          code: 'INST-001',
          name: 'Pipette Set',
          category: 'Instruments',
          description: 'Precision pipette set (10-1000μl)',
          unit: 'sets',
          minQuantity: 5,
          maxQuantity: 20,
          cost: 150.00,
          supplierId: suppliers[1].id
        }
      })
    ]);

    console.log('✅ Products created');

    // Create stock entries
    await Promise.all([
      prisma.stockEntry.create({
        data: {
          productId: products[0].id,
          quantity: 500,
          lotNumber: 'LOT-2024-001',
          expiryDate: new Date('2025-12-31'),
          location: 'Fridge A',
          unitCost: 2.50,
          totalCost: 1250.00,
          notes: 'Initial stock entry',
          receivedBy: 'Admin User'
        }
      }),
      prisma.stockEntry.create({
        data: {
          productId: products[1].id,
          quantity: 200,
          lotNumber: 'LOT-2024-002',
          expiryDate: new Date('2025-06-30'),
          location: 'Fridge B',
          unitCost: 5.00,
          totalCost: 1000.00,
          notes: 'Cholesterol reagent stock',
          receivedBy: 'Admin User'
        }
      }),
      prisma.stockEntry.create({
        data: {
          productId: products[2].id,
          quantity: 1000,
          lotNumber: 'LOT-2024-003',
          expiryDate: new Date('2026-01-31'),
          location: 'Cabinet 1',
          unitCost: 0.25,
          totalCost: 250.00,
          notes: 'PPE supplies',
          receivedBy: 'Admin User'
        }
      }),
      prisma.stockEntry.create({
        data: {
          productId: products[3].id,
          quantity: 8,
          lotNumber: 'LOT-2024-004',
          expiryDate: new Date('2027-12-31'),
          location: 'Cabinet 2',
          unitCost: 150.00,
          totalCost: 1200.00,
          notes: 'Laboratory instruments',
          receivedBy: 'Admin User'
        }
      })
    ]);

    console.log('✅ Stock entries created');

    // Create some stock usage
    await Promise.all([
      prisma.stockOut.create({
        data: {
          productId: products[0].id,
          quantity: 50,
          usedBy: 'Technician User',
          department: 'lab',
          purpose: 'testing',
          notes: 'Daily glucose testing'
        }
      }),
      prisma.stockOut.create({
        data: {
          productId: products[2].id,
          quantity: 20,
          usedBy: 'Biologist User',
          department: 'lab',
          purpose: 'testing',
          notes: 'Sample collection'
        }
      })
    ]);

    console.log('✅ Stock usage recorded');

    console.log('🎉 Stock data added successfully!');
  } catch (error) {
    console.error('❌ Error adding stock data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStockData(); 