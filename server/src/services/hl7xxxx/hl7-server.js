const net = require('net');
const { HL7Parser } = require('./hl7-parser');
const { processMessage } = require('./hl7-processor');
const { prisma } = require('../../../prisma/client');

const START_BLOCK = Buffer.from([0x0b]); // VT
const END_BLOCK = Buffer.from([0x1c, 0x0d]); // FS + CR

class HL7Server {
  constructor(port) {
    this.port = port;
    this.parser = new HL7Parser();
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

      if (this.isCompleteMessage(messageBuffer)) {
        try {
          const hl7Message = this.extractMessage(messageBuffer);
          const parsedMessage = this.parser.parse(hl7Message);
          const ack = await this.processMessage(parsedMessage, socket.remoteAddress || 'unknown');

          socket.write(START_BLOCK);
          socket.write(ack);
          socket.write(END_BLOCK);
        } catch (error) {
          console.error('Error processing HL7 message:', error);
          const nack = this.createNACK(error);
          socket.write(START_BLOCK);
          socket.write(nack);
          socket.write(END_BLOCK);
        }

        messageBuffer = Buffer.from([]);
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

  async processMessage(message, sourceIp) {
    try {
      await prisma.hl7Message.create({
        data: {
          raw: message.toString(),
          messageType: message.type,
          sourceIp,
          status: 'received',
          timestamp: new Date(),
        },
      });

      const result = await processMessage(message);
      return this.createACK(message);
    } catch (error) {
      throw error;
    }
  }

  createACK(message) {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    return [
      `MSH|^~\\&|SIL_LAB|LAB|${message.sendingApplication}|${message.sendingFacility}|${timestamp}||ACK^${message.type}|${timestamp}|P|2.5.1`,
      `MSA|AA|${message.controlId}|Message accepted|`
    ].join('\r');
  }

  createNACK(error) {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    return [
      `MSH|^~\\&|SIL_LAB|LAB|ERROR|ERROR|${timestamp}||ACK|${timestamp}|P|2.5.1`,
      `MSA|AE|0|${error.message}|`
    ].join('\r');
  }
}

module.exports = { HL7Server };
