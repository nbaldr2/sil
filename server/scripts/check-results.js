const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const pendingResults = await prisma.result.findMany({ 
      where: { status: 'PENDING' },
      select: { id: true, status: true, validatedAt: true, validatedBy: true }
    });
    console.log('Pending results count:', pendingResults.length);
    if (pendingResults.length > 0) {
      console.log('Sample pending result:', pendingResults[0]);
    }

    const validatedResults = await prisma.result.findMany({ 
      where: { status: 'VALIDATED' },
      select: { id: true, status: true, validatedAt: true, validatedBy: true }
    });
    console.log('Validated results count:', validatedResults.length);
    if (validatedResults.length > 0) {
      console.log('Sample validated result:', validatedResults[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();