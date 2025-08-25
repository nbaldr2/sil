const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const inProgressRequests = await prisma.request.findMany({ 
      where: { status: 'IN_PROGRESS' },
      select: { id: true, status: true }
    });
    console.log('IN_PROGRESS requests count:', inProgressRequests.length);
    if (inProgressRequests.length > 0) {
      console.log('Sample IN_PROGRESS request:', inProgressRequests[0]);
    }

    const completedRequests = await prisma.request.findMany({ 
      where: { status: 'COMPLETED' },
      select: { id: true, status: true }
    });
    console.log('COMPLETED requests count:', completedRequests.length);
    if (completedRequests.length > 0) {
      console.log('Sample COMPLETED request:', completedRequests[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();