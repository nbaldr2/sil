const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Find all results with status VALIDATED but no validatedAt or validatedBy
    const inconsistentResults = await prisma.result.findMany({
      where: {
        status: 'VALIDATED',
        OR: [
          { validatedAt: null },
          { validatedBy: null }
        ]
      }
    });
    
    console.log(`Found ${inconsistentResults.length} inconsistent results`);
    
    // Update these results to PENDING status
    if (inconsistentResults.length > 0) {
      const updateResult = await prisma.result.updateMany({
        where: {
          status: 'VALIDATED',
          OR: [
            { validatedAt: null },
            { validatedBy: null }
          ]
        },
        data: {
          status: 'PENDING',
          validatedAt: null,
          validatedBy: null
        }
      });
      
      console.log(`Updated ${updateResult.count} results to PENDING status`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();