const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAutomates() {
  try {
    console.log('🌱 Seeding automates...');

    // Create sample automates
    const automates = [
      {
        name: 'Cobas e411',
        type: 'Immunoassay',
        manufacturer: 'Roche',
        protocol: 'HL7',
        connection: 'tcp',
        config: {
          ipAddress: '192.168.1.100',
          port: 8080,
          autoSendWorklist: true,
          autoReceiveResults: true,
          enableQCMonitoring: true
        },
        enabled: true,
        status: 'online',
        lastSync: new Date()
      },
      {
        name: 'Architect i2000SR',
        type: 'Immunoassay',
        manufacturer: 'Abbott',
        protocol: 'ASTM',
        connection: 'tcp',
        config: {
          ipAddress: '192.168.1.101',
          port: 8081,
          autoSendWorklist: true,
          autoReceiveResults: true,
          enableQCMonitoring: true
        },
        enabled: true,
        status: 'online',
        lastSync: new Date()
      },
      {
        name: 'VITROS 5600',
        type: 'Clinical Chemistry',
        manufacturer: 'Ortho Clinical Diagnostics',
        protocol: 'LIS2-A2',
        connection: 'serial',
        config: {
          comPort: 'COM3',
          baudRate: 9600,
          autoSendWorklist: false,
          autoReceiveResults: true,
          enableQCMonitoring: false
        },
        enabled: true,
        status: 'offline'
      },
      {
        name: 'Sysmex XN-1000',
        type: 'Hematology',
        manufacturer: 'Sysmex',
        protocol: 'HL7',
        connection: 'tcp',
        config: {
          ipAddress: '192.168.1.102',
          port: 8082,
          autoSendWorklist: true,
          autoReceiveResults: true,
          enableQCMonitoring: true
        },
        enabled: true,
        status: 'error',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    for (const automateData of automates) {
      const automate = await prisma.automate.create({
        data: automateData
      });

      console.log(`✅ Created automate: ${automate.name}`);

      // Add sample code mappings for each automate
      const codeMappings = getCodeMappingsForAutomate(automate.type);
      
      for (const mapping of codeMappings) {
        await prisma.automateCodeMapping.create({
          data: {
            automateId: automate.id,
            ...mapping
          }
        });
      }

      console.log(`✅ Added ${codeMappings.length} code mappings for ${automate.name}`);

      // Add sample transfer logs
      const transferLogs = getSampleTransferLogs();
      
      for (const log of transferLogs) {
        await prisma.automateTransferLog.create({
          data: {
            automateId: automate.id,
            ...log
          }
        });
      }

      console.log(`✅ Added ${transferLogs.length} transfer logs for ${automate.name}`);
    }

    console.log('🎉 Automates seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding automates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCodeMappingsForAutomate(type) {
  const mappings = {
    'Immunoassay': [
      {
        codeAutomate: 'TSH',
        silTestName: 'TSH Ultra Sensitive',
        sampleType: 'Serum',
        unit: 'mIU/L',
        refRangeLow: 0.27,
        refRangeHigh: 4.2
      },
      {
        codeAutomate: 'FT4',
        silTestName: 'T4 Libre',
        sampleType: 'Serum',
        unit: 'pmol/L',
        refRangeLow: 12,
        refRangeHigh: 22
      },
      {
        codeAutomate: 'FT3',
        silTestName: 'T3 Libre',
        sampleType: 'Serum',
        unit: 'pmol/L',
        refRangeLow: 3.1,
        refRangeHigh: 6.8
      },
      {
        codeAutomate: 'PSA',
        silTestName: 'PSA Total',
        sampleType: 'Serum',
        unit: 'ng/mL',
        refRangeLow: 0,
        refRangeHigh: 4.0
      },
      {
        codeAutomate: 'CEA',
        silTestName: 'CEA',
        sampleType: 'Serum',
        unit: 'ng/mL',
        refRangeLow: 0,
        refRangeHigh: 3.0
      }
    ],
    'Clinical Chemistry': [
      {
        codeAutomate: 'GLU',
        silTestName: 'Glycémie',
        sampleType: 'Serum',
        unit: 'mmol/L',
        refRangeLow: 3.9,
        refRangeHigh: 6.1
      },
      {
        codeAutomate: 'CREA',
        silTestName: 'Créatinine',
        sampleType: 'Serum',
        unit: 'µmol/L',
        refRangeLow: 53,
        refRangeHigh: 106
      },
      {
        codeAutomate: 'UREA',
        silTestName: 'Urée',
        sampleType: 'Serum',
        unit: 'mmol/L',
        refRangeLow: 2.5,
        refRangeHigh: 7.8
      },
      {
        codeAutomate: 'ALT',
        silTestName: 'ALAT',
        sampleType: 'Serum',
        unit: 'U/L',
        refRangeLow: 7,
        refRangeHigh: 55
      },
      {
        codeAutomate: 'AST',
        silTestName: 'ASAT',
        sampleType: 'Serum',
        unit: 'U/L',
        refRangeLow: 8,
        refRangeHigh: 48
      }
    ],
    'Hematology': [
      {
        codeAutomate: 'WBC',
        silTestName: 'Leucocytes',
        sampleType: 'Sang',
        unit: '10^9/L',
        refRangeLow: 4.0,
        refRangeHigh: 11.0
      },
      {
        codeAutomate: 'RBC',
        silTestName: 'Érythrocytes',
        sampleType: 'Sang',
        unit: '10^12/L',
        refRangeLow: 4.5,
        refRangeHigh: 5.5
      },
      {
        codeAutomate: 'HGB',
        silTestName: 'Hémoglobine',
        sampleType: 'Sang',
        unit: 'g/L',
        refRangeLow: 130,
        refRangeHigh: 175
      },
      {
        codeAutomate: 'HCT',
        silTestName: 'Hématocrite',
        sampleType: 'Sang',
        unit: '%',
        refRangeLow: 40,
        refRangeHigh: 50
      },
      {
        codeAutomate: 'PLT',
        silTestName: 'Plaquettes',
        sampleType: 'Sang',
        unit: '10^9/L',
        refRangeLow: 150,
        refRangeHigh: 450
      }
    ]
  };

  return mappings[type] || [];
}

function getSampleTransferLogs() {
  const now = new Date();
  const logs = [];

  // Generate logs for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Worklist transfers
    for (let j = 0; j < 3; j++) {
      logs.push({
        type: 'worklist',
        status: Math.random() > 0.1 ? 'success' : 'failed',
        duration: Math.floor(Math.random() * 500) + 100,
        errorMsg: Math.random() > 0.1 ? null : 'Connection timeout',
        timestamp: new Date(date.getTime() + j * 4 * 60 * 60 * 1000)
      });
    }

    // Result transfers
    for (let j = 0; j < 5; j++) {
      logs.push({
        type: 'result',
        status: Math.random() > 0.05 ? 'success' : 'failed',
        duration: Math.floor(Math.random() * 300) + 50,
        errorMsg: Math.random() > 0.05 ? null : 'Invalid data format',
        timestamp: new Date(date.getTime() + j * 2 * 60 * 60 * 1000 + 30 * 60 * 1000)
      });
    }
  }

  return logs;
}

// Run the seeding
seedAutomates(); 