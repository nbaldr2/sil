const net = require('net');
const { PrismaClient } = require('@prisma/client');

const START_BLOCK = Buffer.from([0x0b]); // VT
const END_BLOCK = Buffer.from([0x1c, 0x0d]); // FS + CR

const { HL7Parser } = require('./hl7-parser');
const { processMessage } = require('./hl7-processor');

class HL7Server {
  constructor(port, prismaInstance) {
    this.port = port;
    this.prisma = prismaInstance || new PrismaClient();
    this.server = net.createServer((socket) => this.handleConnection(socket));
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`HL7 server listening on port ${this.port}`);
    });
  }

  handleConnection(socket) {
    console.log('New connection from:', socket.remoteAddress);
    let messageBuffer = Buffer.from([]);

    socket.on('data', async (data) => {
      messageBuffer = Buffer.concat([messageBuffer, data]);

      // Check for complete message
      if (this.isCompleteMessage(messageBuffer)) {
        try {
          const hl7Message = this.extractMessage(messageBuffer);
          console.log('Received HL7 message:', hl7Message);

          // Store the message in database
          await this.storeMessage(hl7Message, socket.remoteAddress);

          // Send acknowledgment
          const ack = this.createACK(hl7Message);
          socket.write(START_BLOCK);
          socket.write(ack);
          socket.write(END_BLOCK);

          // Clear buffer for next message
          messageBuffer = Buffer.from([]);
        } catch (error) {
          console.error('Error processing HL7 message:', error);
          const nack = this.createNACK(error);
          socket.write(START_BLOCK);
          socket.write(nack);
          socket.write(END_BLOCK);
        }
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('close', () => {
      console.log('Connection closed:', socket.remoteAddress);
    });
  }

  isCompleteMessage(buffer) {
    return (
      buffer.indexOf(START_BLOCK) === 0 &&
      buffer.indexOf(END_BLOCK, buffer.length - 2) === buffer.length - 2
    );
  }

  extractMessage(buffer) {
    return buffer.slice(1, -2).toString('utf8');
  }

  parseMessage(message) {
    console.log('Parsing message:', message);
    const segments = message.split('\r').filter(Boolean);
    const parsedMessage = {
      type: 'ORU',  // Default type for result messages
      sendingApplication: 'TEST-PYTHON',
      sendingFacility: 'LAB',
      controlId: new Date().getTime().toString(),
      segments: []
    };

    try {
      segments.forEach(segment => {
        const fields = segment.split('|');
        
        // Log each segment for debugging
        console.log('Processing segment:', {
          type: fields[0],
          fields: fields.slice(1)
        });

        if (fields[0] === 'MSH') {
          parsedMessage.type = fields[9]?.split('^')[0] || 'ORU';
          parsedMessage.sendingApplication = fields[3] || 'TEST-PYTHON';
          parsedMessage.sendingFacility = fields[4] || 'LAB';
          parsedMessage.controlId = fields[10] || parsedMessage.controlId;
        }

        // Store all segments
        parsedMessage.segments.push({
          type: fields[0],
          fields: fields.slice(1)
        });
      });
    } catch (error) {
      console.error('Error parsing message:', error);
      // Use default values if parsing fails
    }

    // Log the parsed result
    console.log('Parsed message:', parsedMessage);
    return parsedMessage;
  }

  async storeMessage(message, sourceIp) {
    const parser = new HL7Parser();
    const parsedMessage = parser.parse(message);
    // Ensure type and triggerEvent are set correctly from MSH
    if (parsedMessage.segments && parsedMessage.segments.length > 0) {
      const msh = parsedMessage.segments.find(seg => seg.type === 'MSH');
      if (msh && msh.fields[7]) {
        const typeParts = msh.fields[7].split('^');
        parsedMessage.type = typeParts[0] || 'ORU';
        parsedMessage.triggerEvent = typeParts[1] || 'R01';
      }
    }
    try {
      // Log the raw message for debugging
      console.log('Storing message:', {
        raw: message,
        type: parsedMessage.type,
        sourceIp: sourceIp
      });

      const storedMessage = await this.prisma.HL7Message.create({
        data: {
          raw: message,
          messageType: parsedMessage.type || 'UNKNOWN',
          sourceIp: sourceIp || 'unknown',
          status: 'RECEIVED',
          timestamp: new Date(),
        }
      });

      // Process the parsed HL7 message for patient/results insertion
      await processMessage(parsedMessage);

      console.log('Message stored and processed successfully:', storedMessage.id);
      return storedMessage;
    } catch (error) {
      console.error('Error storing message:', error);
      // Add more detailed error logging
      if (error.code) {
        console.error('Prisma error code:', error.code);
      }
      if (error.meta) {
        console.error('Error metadata:', error.meta);
      }
      throw error;
    }
  }

  createACK(message) {
    const parsedMessage = this.parseMessage(message);
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    
    return [
      'MSH|^~\\&|SIL-LIS|LAB|' + 
      parsedMessage.sendingApplication + '|' + 
      parsedMessage.sendingFacility + '|' + 
      timestamp + '||ACK^' + parsedMessage.type + '|' + 
      timestamp + '|P|2.5.1',
      'MSA|AA|' + parsedMessage.controlId + '|Message accepted|'
    ].join('\r');
  }

  createNACK(error) {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    return [
      'MSH|^~\\&|SIL-LIS|LAB|ERROR|ERROR|' + timestamp + '||ACK|' + timestamp + '|P|2.5.1',
      'MSA|AE|0|' + (error.message || 'Unknown error') + '|'
    ].join('\r');
  }
}

module.exports = { HL7Server };
