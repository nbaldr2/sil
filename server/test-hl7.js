const net = require('net');

// Sample HL7 message for testing
const sampleHL7Message = `MSH|^~\\&|LAB_SYSTEM|LAB|SIL_LAB|SIL|20240811220000||ORU^R01|12345|P|2.5.1
PID|1||PATIENT123||DOE^JOHN^M||19800101|M|||123 MAIN ST^^CITY^STATE^12345||555-1234
OBR|1|ORDER123|FILLER123|CBC^COMPLETE BLOOD COUNT^L|||20240811210000
OBX|1|NM|WBC^WHITE BLOOD COUNT^L||7.5|10*3/uL|4.0-11.0|N|||F|||20240811210000
OBX|2|NM|RBC^RED BLOOD COUNT^L||4.2|10*6/uL|4.2-5.4|N|||F|||20240811210000`;

const START_BLOCK = Buffer.from([0x0b]); // VT
const END_BLOCK = Buffer.from([0x1c, 0x0d]); // FS + CR

function sendHL7Message() {
  const client = new net.Socket();
  
  client.connect(2027, 'localhost', () => {
    console.log('Connected to HL7 server');
    
    // Send the HL7 message with proper framing
    const message = Buffer.concat([
      START_BLOCK,
      Buffer.from(sampleHL7Message, 'utf8'),
      END_BLOCK
    ]);
    
    console.log('Sending HL7 message...');
    client.write(message);
  });
  
  client.on('data', (data) => {
    console.log('Received response:', data.toString());
    client.destroy();
  });
  
  client.on('error', (err) => {
    console.error('Connection error:', err);
  });
  
  client.on('close', () => {
    console.log('Connection closed');
  });
}

// Wait a moment for the server to be ready, then send the test message
setTimeout(sendHL7Message, 2000);