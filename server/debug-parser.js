const { HL7Parser } = require('./src/services/hl7/hl7-parser');

const sampleHL7Message = `MSH|^~\\&|LAB_SYSTEM|LAB|SIL_LAB|SIL|20240811220000||ORU^R01|12345|P|2.5.1
PID|1||PATIENT123||DOE^JOHN^M||19800101|M|||123 MAIN ST^^CITY^STATE^12345||555-1234
OBR|1|ORDER123|FILLER123|CBC^COMPLETE BLOOD COUNT^L|||20240811210000
OBX|1|NM|WBC^WHITE BLOOD COUNT^L||7.5|10*3/uL|4.0-11.0|N|||F|||20240811210000
OBX|2|NM|RBC^RED BLOOD COUNT^L||4.2|10*6/uL|4.2-5.4|N|||F|||20240811210000`;

const parser = new HL7Parser();
const parsed = parser.parse(sampleHL7Message);

console.log('Parsed message:', JSON.stringify(parsed, null, 2));