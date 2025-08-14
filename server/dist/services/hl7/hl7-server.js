"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7Server = void 0;
const net_1 = __importDefault(require("net"));
const hl7_parser_1 = require("./hl7-parser");
const hl7_processor_1 = require("./hl7-processor");
const client_1 = require("../../../prisma/client");
const START_BLOCK = Buffer.from([0x0b]); // VT
const END_BLOCK = Buffer.from([0x1c, 0x0d]); // FS + CR
class HL7Server {
    constructor(port) {
        this.port = port;
        this.parser = new hl7_parser_1.HL7Parser();
        this.server = net_1.default.createServer((socket) => this.handleConnection(socket));
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
                    const parsedMessage = this.parser.parse(hl7Message);
                    const ack = await this.processMessage(parsedMessage, socket.remoteAddress || 'unknown');
                    // Send acknowledgment
                    socket.write(START_BLOCK);
                    socket.write(ack);
                    socket.write(END_BLOCK);
                }
                catch (error) {
                    console.error('Error processing HL7 message:', error);
                    // Send NACK
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
        return (buffer.indexOf(START_BLOCK) === 0 &&
            buffer.indexOf(END_BLOCK, buffer.length - 2) === buffer.length - 2);
    }
    extractMessage(buffer) {
        return buffer.slice(1, -2).toString('utf8');
    }
    async processMessage(message, sourceIp) {
        try {
            // Log incoming message
            await client_1.prisma.hl7Message.create({
                data: {
                    raw: message.toString(),
                    messageType: message.type,
                    sourceIp,
                    status: 'received',
                    timestamp: new Date(),
                },
            });
            // Process the message
            const result = await (0, hl7_processor_1.processMessage)(message);
            // Create ACK message
            return this.createACK(message);
        }
        catch (error) {
            throw error;
        }
    }
    createACK(message) {
        const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
        return [
            'MSH|^~\\&|SIL_LAB|LAB|' + message.sendingApplication + '|' + message.sendingFacility + '|' + timestamp + '||ACK^' + message.type + '|' + timestamp + '|P|2.5.1',
            'MSA|AA|' + message.controlId + '|Message accepted|',
        ].join('\r');
    }
    createNACK(error) {
        const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
        return [
            'MSH|^~\\&|SIL_LAB|LAB|ERROR|ERROR|' + timestamp + '||ACK|' + timestamp + '|P|2.5.1',
            'MSA|AE|0|' + error.message + '|',
        ].join('\r');
    }
}
exports.HL7Server = HL7Server;
