"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7Parser = void 0;
class HL7Parser {
    parse(message) {
        const segments = message.split('\r').filter(s => s.length > 0);
        const parsedSegments = [];
        for (const segment of segments) {
            const fields = segment.split('|');
            const segmentName = fields[0];
            const parsedFields = [];
            for (let i = 1; i < fields.length; i++) {
                const field = fields[i];
                const components = field.split('^');
                const subcomponents = components.map(comp => comp.split('&'));
                parsedFields.push({
                    value: field,
                    components: components,
                    subcomponents: subcomponents
                });
            }
            parsedSegments.push({
                name: segmentName,
                fields: parsedFields
            });
        }
        return {
            type: this.getMessageType(parsedSegments),
            sendingApplication: this.getSendingApplication(parsedSegments),
            sendingFacility: this.getSendingFacility(parsedSegments),
            controlId: this.getControlId(parsedSegments),
            segments: parsedSegments,
            toString: () => message
        };
    }
    getMessageType(segments) {
        const msh = segments.find(s => s.name === 'MSH');
        if (!msh)
            return '';
        return msh.fields[8]?.components?.[0] || '';
    }
    getSendingApplication(segments) {
        const msh = segments.find(s => s.name === 'MSH');
        if (!msh)
            return '';
        return msh.fields[2]?.value || '';
    }
    getSendingFacility(segments) {
        const msh = segments.find(s => s.name === 'MSH');
        if (!msh)
            return '';
        return msh.fields[3]?.value || '';
    }
    getControlId(segments) {
        const msh = segments.find(s => s.name === 'MSH');
        if (!msh)
            return '';
        return msh.fields[9]?.value || '';
    }
}
exports.HL7Parser = HL7Parser;
