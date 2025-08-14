"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessage = processMessage;
const client_1 = require("../../../prisma/client");
async function processMessage(message) {
    const messageType = message.type;
    switch (messageType) {
        case 'ORU^R01': // Results
            return await processResults(message);
        case 'ORM^O01': // Orders
            return await processOrders(message);
        default:
            throw new Error(`Unsupported message type: ${messageType}`);
    }
}
async function processResults(message) {
    const results = [];
    let patientId = null;
    let orderId = null;
    for (const segment of message.segments) {
        switch (segment.name) {
            case 'PID': // Patient Identification
                patientId = await findOrCreatePatient(segment);
                break;
            case 'OBR': // Observation Request
                orderId = segment.fields[2]?.value; // Placer Order Number
                break;
            case 'OBX': // Observation/Result
                results.push({
                    testCode: segment.fields[3]?.value || '',
                    value: segment.fields[5]?.value || '',
                    unit: segment.fields[6]?.value || '',
                    referenceRange: segment.fields[7]?.value || '',
                    status: segment.fields[11]?.value || 'F',
                    performedAt: new Date()
                });
                break;
        }
    }
    if (!patientId || !orderId) {
        throw new Error('Missing patient or order information');
    }
    // Save results to database
    for (const result of results) {
        await client_1.prisma.analysisResult.create({
            data: {
                analysisRequestId: orderId,
                testCode: result.testCode,
                value: result.value,
                unit: result.unit,
                referenceRange: result.referenceRange,
                status: result.status,
                performedAt: result.performedAt,
                source: 'HL7',
                validated: false
            }
        });
    }
    return { success: true, results };
}
async function processOrders(message) {
    // Implement order processing logic here
    throw new Error('Order processing not implemented yet');
}
async function findOrCreatePatient(pidSegment) {
    const patientId = pidSegment.fields[2]?.value; // Patient ID
    const lastName = pidSegment.fields[5]?.components?.[0] || '';
    const firstName = pidSegment.fields[5]?.components?.[1] || '';
    const birthDate = pidSegment.fields[7]?.value || '';
    const gender = pidSegment.fields[8]?.value || '';
    // Check if patient exists
    const existingPatient = await client_1.prisma.patient.findFirst({
        where: { externalId: patientId }
    });
    if (existingPatient) {
        return existingPatient.id;
    }
    // Create new patient
    const newPatient = await client_1.prisma.patient.create({
        data: {
            externalId: patientId,
            lastName,
            firstName,
            birthDate: new Date(birthDate),
            gender: gender === 'M' ? 'MALE' : gender === 'F' ? 'FEMALE' : 'OTHER'
        }
    });
    return newPatient.id;
}
