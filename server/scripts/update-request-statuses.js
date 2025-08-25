const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRequestStatuses() {
  try {
    // Get all requests that are IN_PROGRESS
    const requests = await prisma.request.findMany({
      where: { status: 'IN_PROGRESS' },
      include: {
        results: true
      }
    });
    
    console.log(`Found ${requests.length} IN_PROGRESS requests to check`);
    
    let updatedCount = 0;
    
    // For each request, check if all results are validated
    for (const request of requests) {
      // Skip requests with no results
      if (!request.results || request.results.length === 0) {
        continue;
      }
      
      // Check if all results are validated
      const allValidated = request.results.every(result => result.status === 'VALIDATED');
      
      // If all results are validated, update the request status to COMPLETED
      if (allValidated) {
        await prisma.request.update({
          where: { id: request.id },
          data: { status: 'COMPLETED' }
        });
        updatedCount++;
        console.log(`Request ${request.id} status updated to COMPLETED`);
      }
    }
    
    console.log(`Updated ${updatedCount} requests to COMPLETED status`);
  } catch (error) {
    console.error('Error updating request statuses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRequestStatuses();