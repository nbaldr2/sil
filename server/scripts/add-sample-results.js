const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleResults() {
  try {
    console.log('Adding sample results data...');

    // Create sample analyses if they don't exist
    const analyses = await Promise.all([
      prisma.analysis.upsert({
        where: { code: 'CBC' },
        update: {},
        create: {
          code: 'CBC',
          name: 'Complete Blood Count',
          category: 'Hematology',
          price: 150.0,
          description: 'Complete blood count including WBC, RBC, Hemoglobin, Platelets'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'GLU' },
        update: {},
        create: {
          code: 'GLU',
          name: 'Glucose',
          category: 'Biochemistry',
          price: 80.0,
          description: 'Blood glucose level measurement'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'CREA' },
        update: {},
        create: {
          code: 'CREA',
          name: 'Creatinine',
          category: 'Biochemistry',
          price: 90.0,
          description: 'Serum creatinine measurement'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'CHOL' },
        update: {},
        create: {
          code: 'CHOL',
          name: 'Cholesterol Total',
          category: 'Lipid Profile',
          price: 120.0,
          description: 'Total cholesterol measurement'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'HDL' },
        update: {},
        create: {
          code: 'HDL',
          name: 'HDL Cholesterol',
          category: 'Lipid Profile',
          price: 100.0,
          description: 'High-density lipoprotein cholesterol'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'LDL' },
        update: {},
        create: {
          code: 'LDL',
          name: 'LDL Cholesterol',
          category: 'Lipid Profile',
          price: 100.0,
          description: 'Low-density lipoprotein cholesterol'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'TRIG' },
        update: {},
        create: {
          code: 'TRIG',
          name: 'Triglycerides',
          category: 'Lipid Profile',
          price: 95.0,
          description: 'Triglycerides measurement'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'ALT' },
        update: {},
        create: {
          code: 'ALT',
          name: 'Alanine Aminotransferase',
          category: 'Liver Function',
          price: 85.0,
          description: 'ALT enzyme measurement'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'AST' },
        update: {},
        create: {
          code: 'AST',
          name: 'Aspartate Aminotransferase',
          category: 'Liver Function',
          price: 85.0,
          description: 'AST enzyme measurement'
        }
      }),
      prisma.analysis.upsert({
        where: { code: 'TSH' },
        update: {},
        create: {
          code: 'TSH',
          name: 'Thyroid Stimulating Hormone',
          category: 'Hormones',
          price: 180.0,
          description: 'TSH hormone measurement'
        }
      })
    ]);

    // Get existing requests or create new ones
    let requests = await prisma.request.findMany({
      include: {
        patient: true,
        doctor: true,
        requestAnalyses: {
          include: {
            analysis: true
          }
        }
      }
    });

    if (requests.length === 0) {
      // Create sample patients
      const patients = await Promise.all([
        prisma.patient.upsert({
          where: { cnssNumber: 'CNSS-001' },
          update: {},
          create: {
            firstName: 'Soukaina',
            lastName: 'El Amrani',
            dateOfBirth: new Date('1990-05-15'),
            gender: 'F',
            phone: '+212-6-12-345683',
            email: 'soukaina.elamrani@email.com',
            cnssNumber: 'CNSS-001'
          }
        }),
        prisma.patient.upsert({
          where: { cnssNumber: 'CNSS-002' },
          update: {},
          create: {
            firstName: 'Mohammed',
            lastName: 'Benjelloun',
            dateOfBirth: new Date('1985-08-22'),
            gender: 'M',
            phone: '+212-6-12-345684',
            email: 'mohammed.benjelloun@email.com',
            cnssNumber: 'CNSS-002'
          }
        }),
        prisma.patient.upsert({
          where: { cnssNumber: 'CNSS-003' },
          update: {},
          create: {
            firstName: 'Aicha',
            lastName: 'Lahlou',
            dateOfBirth: new Date('1992-12-10'),
            gender: 'F',
            phone: '+212-6-12-345685',
            email: 'aicha.lahlou@email.com',
            cnssNumber: 'CNSS-003'
          }
        })
      ]);

      // Create sample doctors
      const doctors = await Promise.all([
        prisma.doctor.upsert({
          where: { email: 'dr.ahmed@hospital.ma' },
          update: {},
          create: {
            firstName: 'Ahmed',
            lastName: 'Tazi',
            email: 'dr.ahmed@hospital.ma',
            phone: '+212-6-12-345690',
            specialty: 'Cardiology',
            orderNumber: 'DR-001'
          }
        }),
        prisma.doctor.upsert({
          where: { email: 'dr.fatima@clinic.ma' },
          update: {},
          create: {
            firstName: 'Fatima',
            lastName: 'Bennani',
            email: 'dr.fatima@clinic.ma',
            phone: '+212-6-12-345691',
            specialty: 'Endocrinology',
            orderNumber: 'DR-002'
          }
        })
      ]);

      // Create sample requests
      requests = await Promise.all([
        prisma.request.create({
          data: {
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            status: 'COMPLETED',
            priority: 'NORMAL',
            sampleType: 'BLOOD',
            tubeType: 'SERUM',
            collectionDate: new Date('2025-08-05T09:00:00Z'),
            collectionTime: '09:00',
            notes: 'Patient fasting for 12 hours',
            totalAmount: 330.0,
            createdById: 'system-user',
            requestAnalyses: {
              create: [
                { analysisId: analyses[0].id, price: 150.0 }, // CBC
                { analysisId: analyses[1].id, price: 80.0 },  // Glucose
                { analysisId: analyses[2].id, price: 90.0 }   // Creatinine
              ]
            }
          }
        }),
        prisma.request.create({
          data: {
            patientId: patients[1].id,
            doctorId: doctors[1].id,
            status: 'COMPLETED',
            priority: 'NORMAL',
            sampleType: 'BLOOD',
            tubeType: 'SERUM',
            collectionDate: new Date('2025-08-06T10:30:00Z'),
            collectionTime: '10:30',
            notes: 'Lipid profile requested',
            totalAmount: 415.0,
            createdById: 'system-user',
            requestAnalyses: {
              create: [
                { analysisId: analyses[3].id, price: 120.0 }, // Cholesterol
                { analysisId: analyses[4].id, price: 100.0 }, // HDL
                { analysisId: analyses[5].id, price: 100.0 }, // LDL
                { analysisId: analyses[6].id, price: 95.0 }   // Triglycerides
              ]
            }
          }
        }),
        prisma.request.create({
          data: {
            patientId: patients[2].id,
            doctorId: doctors[0].id,
            status: 'COMPLETED',
            priority: 'NORMAL',
            sampleType: 'BLOOD',
            tubeType: 'SERUM',
            collectionDate: new Date('2025-08-07T08:15:00Z'),
            collectionTime: '08:15',
            notes: 'Liver function tests',
            totalAmount: 350.0,
            createdById: 'system-user',
            requestAnalyses: {
              create: [
                { analysisId: analyses[7].id, price: 85.0 },  // ALT
                { analysisId: analyses[8].id, price: 85.0 },  // AST
                { analysisId: analyses[9].id, price: 180.0 }  // TSH
              ]
            }
          }
        })
      ]);
    }

    // Sample results data with realistic values
    const sampleResults = [
      // Request 1 - CBC, Glucose, Creatinine
      {
        requestId: requests[0].id,
        analysisId: requests[0].requestAnalyses[0].analysisId, // CBC
        value: '4.2',
        unit: '10^12/L',
        reference: '4.0-5.5',
        status: 'VALIDATED',
        notes: 'Normal red blood cell count'
      },
      {
        requestId: requests[0].id,
        analysisId: requests[0].requestAnalyses[1].analysisId, // Glucose
        value: '95',
        unit: 'mg/dL',
        reference: '70-100',
        status: 'VALIDATED',
        notes: 'Normal fasting glucose'
      },
      {
        requestId: requests[0].id,
        analysisId: requests[0].requestAnalyses[2].analysisId, // Creatinine
        value: '0.9',
        unit: 'mg/dL',
        reference: '0.6-1.2',
        status: 'VALIDATED',
        notes: 'Normal kidney function'
      },

      // Request 2 - Lipid Profile
      {
        requestId: requests[1].id,
        analysisId: requests[1].requestAnalyses[0].analysisId, // Cholesterol
        value: '180',
        unit: 'mg/dL',
        reference: '<200',
        status: 'VALIDATED',
        notes: 'Normal total cholesterol'
      },
      {
        requestId: requests[1].id,
        analysisId: requests[1].requestAnalyses[1].analysisId, // HDL
        value: '55',
        unit: 'mg/dL',
        reference: '>40',
        status: 'VALIDATED',
        notes: 'Good HDL level'
      },
      {
        requestId: requests[1].id,
        analysisId: requests[1].requestAnalyses[2].analysisId, // LDL
        value: '110',
        unit: 'mg/dL',
        reference: '<130',
        status: 'VALIDATED',
        notes: 'Normal LDL level'
      },
      {
        requestId: requests[1].id,
        analysisId: requests[1].requestAnalyses[3].analysisId, // Triglycerides
        value: '120',
        unit: 'mg/dL',
        reference: '<150',
        status: 'VALIDATED',
        notes: 'Normal triglyceride level'
      },

      // Request 3 - Liver Function + TSH
      {
        requestId: requests[2].id,
        analysisId: requests[2].requestAnalyses[0].analysisId, // ALT
        value: '25',
        unit: 'U/L',
        reference: '7-55',
        status: 'VALIDATED',
        notes: 'Normal ALT level'
      },
      {
        requestId: requests[2].id,
        analysisId: requests[2].requestAnalyses[1].analysisId, // AST
        value: '28',
        unit: 'U/L',
        reference: '8-48',
        status: 'VALIDATED',
        notes: 'Normal AST level'
      },
      {
        requestId: requests[2].id,
        analysisId: requests[2].requestAnalyses[2].analysisId, // TSH
        value: '2.1',
        unit: 'mIU/L',
        reference: '0.4-4.0',
        status: 'VALIDATED',
        notes: 'Normal thyroid function'
      }
    ];

    // Add results to database
    for (const result of sampleResults) {
      await prisma.result.upsert({
        where: {
          requestId_analysisId: {
            requestId: result.requestId,
            analysisId: result.analysisId
          }
        },
        update: {
          value: result.value,
          unit: result.unit,
          reference: result.reference,
          status: result.status,
          notes: result.notes
        },
        create: result
      });
    }

    console.log('Sample results added successfully!');
    console.log(`Added ${sampleResults.length} results for ${requests.length} requests`);

  } catch (error) {
    console.error('Error adding sample results:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSampleResults(); 