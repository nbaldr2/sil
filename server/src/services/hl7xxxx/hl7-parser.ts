interface HL7Field {
  value: string;
  components?: string[];
  subcomponents?: string[][];
}

interface HL7Segment {
  name: string;
  fields: HL7Field[];
}

export class HL7Parser {
  parse(message: string) {
    const segments = message.split('\r').filter(s => s.length > 0);
    const parsedSegments: HL7Segment[] = [];

    for (const segment of segments) {
      const fields = segment.split('|');
      const segmentName = fields[0];
      const parsedFields: HL7Field[] = [];

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

  private getMessageType(segments: HL7Segment[]): string {
    const msh = segments.find(s => s.name === 'MSH');
    if (!msh) return '';
    return msh.fields[8]?.components?.[0] || '';
  }

  private getSendingApplication(segments: HL7Segment[]): string {
    const msh = segments.find(s => s.name === 'MSH');
    if (!msh) return '';
    return msh.fields[2]?.value || '';
  }

  private getSendingFacility(segments: HL7Segment[]): string {
    const msh = segments.find(s => s.name === 'MSH');
    if (!msh) return '';
    return msh.fields[3]?.value || '';
  }

  private getControlId(segments: HL7Segment[]): string {
    const msh = segments.find(s => s.name === 'MSH');
    if (!msh) return '';
    return msh.fields[9]?.value || '';
  }
}
