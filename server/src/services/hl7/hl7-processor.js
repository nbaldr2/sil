const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add this function to log the transfer
async function logTransfer(automateId, messageType, status, duration, errorMsg) {
  try {
    // Only log if we have a valid automateId (not 'default')
    if (automateId && automateId !== 'default') {
      await prisma.automateTransferLog.create({
        data: {
          automateId,
          type: messageType,
          status,
          duration,
          errorMsg,
          timestamp: new Date()
        }
      });
    } else {
      console.log('Skipping transfer log - no valid automate found for:', messageType);
    }
  } catch (error) {
    console.error('Error logging transfer:', error);
    // Don't throw the error to avoid breaking the main processing flow
  }
}

// Modify processMessage to include logging
async function processMessage(parsedMessage) {
  const startTime = Date.now();
  try {
    console.log('Processing message:', JSON.stringify(parsedMessage, null, 2));
    
    // Auto-detect automateId by sendingApplication
    const automate = await prisma.automate.findFirst({
      where: { name: parsedMessage.sendingApplication }
    });
    const automateId = automate?.id || 'default';  // Fallback to 'default' or handle error

    // Update the HL7 message status to processing
    await prisma.hL7Message.updateMany({
      where: {
        raw: parsedMessage.raw,
        status: 'RECEIVED'
      },
      data: {
        status: 'PROCESSED',
        processedAt: new Date()
      }
    });

    // Process based on message type
    if (parsedMessage.type === 'ORU' && parsedMessage.triggerEvent === 'R01') {
      await processResults(parsedMessage);
    }

    // After successful processing
    const duration = Date.now() - startTime;
    console.log('About to log transfer:', { automateId, type: parsedMessage.type, status: 'success', duration });
    await logTransfer(automateId, parsedMessage.type, 'success', duration);
    console.log('Logged transfer successfully');

    return true;
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Auto-detect automateId for error logging
    const automate = await prisma.automate.findFirst({
      where: { name: parsedMessage.sendingApplication }
    });
    const automateId = automate?.id || 'default';

    // Update message status to error
    await prisma.hL7Message.updateMany({
      where: {
        raw: parsedMessage.raw,
        status: 'RECEIVED'
      },
      data: {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        processedAt: new Date()
      }
    });

    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('About to log transfer (error):', { automateId, type: parsedMessage.type, status: 'failed', duration, errorMsg: errorMessage });
    await logTransfer(automateId, parsedMessage.type, 'failed', duration, errorMessage);
    console.log('Logged transfer (error) successfully');

    throw error;
  }
}

async function processResults(message) {
  console.log('Processing results for message:', JSON.stringify(message, null, 2));
  const { patient, order, results } = message;

  // Find or create patient
  const patientRecord = await findOrCreatePatient(patient);

  // Create a request for this HL7 message
  const request = await createRequestForHL7Message(patientRecord.id, order);

  // Process each result
  if (results && Array.isArray(results)) {
    for (const result of results) {
      await processResult(result, order, request.id);
    }
  }
}

async function findOrCreatePatient(patientData) {
  if (!patientData) {
    throw new Error('Patient data is required');
  }
  
  const patientId = patientData.patientId || patientData.patientIdentifierList;
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  let patient = await prisma.patient.findFirst({
    where: {
      OR: [
        { id: patientId },
        { cnssNumber: patientId }
      ]
    }
  });

  if (!patient) {
    const name = patientData.patientName;
    // Provide a default date if dateOfBirth is not available (required field in schema)
    const defaultDate = new Date('1900-01-01');
    
    // Parse HL7 date format (YYYYMMDD) to JavaScript Date
    let dateOfBirth = defaultDate;
    if (patientData.dateOfBirth) {
      const dateStr = patientData.dateOfBirth;
      console.log('Parsing date:', dateStr, 'length:', dateStr.length);
      if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        console.log('Date parts:', { year, month, day });
        dateOfBirth = new Date(`${year}-${month}-${day}`);
        console.log('Parsed date:', dateOfBirth);
        
        // If the parsed date is invalid, use default
        if (isNaN(dateOfBirth.getTime())) {
          console.log('Date is invalid, using default');
          dateOfBirth = defaultDate;
        }
      } else {
        console.log('Date string length is not 8, using default');
      }
    }
    
    patient = await prisma.patient.create({
      data: {
        id: patientId,
        firstName: name?.text || 'Unknown',
        lastName: name?.alternateText || '',
        dateOfBirth: dateOfBirth,
        gender: patientData.gender || 'U'
      }
    });
  }

  return patient;
}

async function createRequestForHL7Message(patientId, order) {
  // Create a system user ID for HL7 automated requests (you might want to create a dedicated system user)
  const systemUserId = 'system-hl7'; // This should be a valid user ID in your system
  
  // Try to find an existing system user, or create one if it doesn't exist
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system-hl7@lab.com' }
  });
  
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        id: systemUserId,
        email: 'system-hl7@lab.com',
        password: 'system-generated', // This should be properly hashed in production
        name: 'HL7 System',
        role: 'TECHNICIAN'
      }
    });
  }

  const request = await prisma.request.create({
    data: {
      patientId: patientId,
      status: 'IN_PROGRESS',
      priority: 'NORMAL',
      sampleType: 'BLOOD', // Default, could be extracted from HL7 message
      notes: `Automated request from HL7 message - Order: ${order?.orderNumber || 'N/A'}`,
      createdById: systemUser.id
    }
  });

  return request;
}

async function processResult(result, order, requestId) {
  const observationId = result.observationIdentifier?.id;
  if (!observationId) {
    throw new Error('Observation ID is required');
  }

  // Find the analysis in the system
  const analysis = await prisma.analysis.findFirst({
    where: {
      OR: [
        { id: observationId },
        { code: observationId }
      ]
    }
  });

  if (!analysis) {
    console.warn(`Analysis not found for code: ${observationId}`);
    return;
  }

  // Create RequestAnalysis relationship if it doesn't exist
  await prisma.requestAnalysis.upsert({
    where: {
      requestId_analysisId: {
        requestId: requestId,
        analysisId: analysis.id
      }
    },
    update: {},
    create: {
      requestId: requestId,
      analysisId: analysis.id,
      price: analysis.price || 0
    }
  });

  // Create or update the result
  await prisma.result.create({
    data: {
      requestId: requestId,
      analysisId: analysis.id,
      value: result.observationValue,
      unit: result.units,
      reference: result.referenceRange,
      status: result.observationResultStatus === 'F' ? 'VALIDATED' : 'PENDING',
      notes: result.probability || null
    }
  });
}

module.exports = {
  logTransfer,
  processMessage
};