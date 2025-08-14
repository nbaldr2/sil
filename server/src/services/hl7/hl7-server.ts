import net from 'net';
import { HL7Parser } from './hl7-parser';
import { processMessage } from './hl7-processor';
import { prisma } from '../../prisma/client';

const START_BLOCK = Buffer.from([0x0b]); // VT
const END_BLOCK = Buffer.from([0x1c, 0x0d]); // FS + CR

export class HL7Server {
  private server: net.Server;
  private parser: HL7Parser;

  constructor(private port: number) {
    this.parser = new HL7Parser();
    this.server = net.createServer((socket) => this.handleConnection(socket));
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`HL7 server listening on port ${this.port}`);
    });
  }

  private handleConnection(socket: net.Socket) {
    console.log('New connection from:', socket.remoteAddress);
    let messageBuffer = Buffer.from([]);

    socket.on('data', async (data) => {
      messageBuffer = Buffer.concat([messageBuffer, data]);

      // Check for complete message
      if (this.isCompleteMessage(messageBuffer)) {
        try {
          const hl7Message = this.extractMessage(messageBuffer);
          const parsedMessage = this.parser.parse(hl7Message);
          const ack = await this.processMessage(parsedMessage, socket.remoteAddress || 'unknown');

          // Send acknowledgment
          socket.write(START_BLOCK);
          socket.write(ack);
          socket.write(END_BLOCK);
        } catch (error) {
          console.error('Error processing HL7 message:', error);
          // Send NACK
          const nack = this.createNACK(error as Error);
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

  private isCompleteMessage(buffer: Buffer): boolean {
    return (
      buffer.indexOf(START_BLOCK) === 0 &&
      buffer.indexOf(END_BLOCK, buffer.length - 2) === buffer.length - 2
    );
  }

  private extractMessage(buffer: Buffer): string {
    return buffer.slice(1, -2).toString('utf8');
  }

  private async processMessage(message: any, sourceIp: string) {
    try {
      // Log incoming message
      await prisma.hl7Message.create({
        data: {
          raw: message.toString(),
          messageType: message.type,
          sourceIp,
          status: 'received',
          timestamp: new Date(),
        },
      });

      // Process the message
      const result = await processMessage(message);
      
      // Create ACK message
      return this.createACK(message);
    } catch (error) {
      throw error;
    }
  }

  private createACK(message: any): string {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    return [
      'MSH|^~\\&|SIL_LAB|LAB|' + message.sendingApplication + '|' + message.sendingFacility + '|' + timestamp + '||ACK^' + message.type + '|' + timestamp + '|P|2.5.1',
      'MSA|AA|' + message.controlId + '|Message accepted|',
    ].join('\r');
  }

  private createNACK(error: Error): string {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    return [
      'MSH|^~\\&|SIL_LAB|LAB|ERROR|ERROR|' + timestamp + '||ACK|' + timestamp + '|P|2.5.1',
      'MSA|AE|0|' + error.message + '|',
    ].join('\r');
  }
}
