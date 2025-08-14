class HL7Parser {
  parse(message) {
    // Handle both \r and \n line endings
    const segments = message.split(/\r\n|\r|\n/).filter(Boolean);
    const parsedMessage = {
      raw: message,
      type: '',
      sendingApplication: '',
      sendingFacility: '',
      controlId: '',
      segments: []
    };

    segments.forEach(segment => {
      const fields = segment.split('|');
      const segmentType = fields[0];

      switch (segmentType) {
        case 'MSH':
          this.parseMSH(fields, parsedMessage);
          break;
        case 'PID':
          parsedMessage.patient = this.parsePID(fields);
          break;
        case 'OBR':
          parsedMessage.order = this.parseOBR(fields);
          break;
        case 'OBX':
          if (!parsedMessage.results) {
            parsedMessage.results = [];
          }
          parsedMessage.results.push(this.parseOBX(fields));
          break;
      }

      parsedMessage.segments.push({
        type: segmentType,
        fields: fields.slice(1)
      });
    });

    return parsedMessage;
  }

  parseMSH(fields, message) {
    const separators = fields[1];
    message.separators = {
      field: '|',
      component: '^',
      repeat: '~',
      escape: '\\',
      subcomponent: separators[3] || '&'
    };

    message.sendingApplication = fields[3];
    message.sendingFacility = fields[4];
    message.receivingApplication = fields[5];
    message.receivingFacility = fields[6];
    message.timestamp = fields[7];
    
    const messageType = fields[8].split(message.separators.component);
    message.type = messageType[0];
    message.triggerEvent = messageType[1];
    
    message.controlId = fields[9];
    message.processingId = fields[10];
    message.version = fields[11];
  }

  parsePID(fields) {
    return {
      setId: fields[1],
      patientId: fields[2],
      patientIdentifierList: fields[3],
      alternatePatientId: fields[4],
      patientName: this.parseComponentField(fields[5]),
      dateOfBirth: fields[7],
      gender: fields[8]
    };
  }

  parseOBR(fields) {
    return {
      setId: fields[1],
      placerOrderNumber: fields[2],
      fillerOrderNumber: fields[3],
      universalServiceId: this.parseComponentField(fields[4]),
      observationDateTime: fields[7],
      specimenActionCode: fields[11],
      relevantClinicalInfo: fields[13],
      specimenReceivedDateTime: fields[14]
    };
  }

  parseOBX(fields) {
    return {
      setId: fields[1],
      valueType: fields[2],
      observationIdentifier: this.parseComponentField(fields[3]),
      observationSubId: fields[4],
      observationValue: fields[5],
      units: fields[6],
      referenceRange: fields[7],
      abnormalFlags: fields[8],
      probability: fields[9],
      observationResultStatus: fields[11],
      effectiveDateTime: fields[14]
    };
  }

  parseComponentField(field) {
    if (!field) return null;
    const components = field.split('^');
    if (components.length === 1) return components[0];
    
    return {
      id: components[0],
      text: components[1],
      codingSystem: components[2],
      alternateId: components[3],
      alternateText: components[4],
      alternateCodingSystem: components[5]
    };
  }
}

module.exports = { HL7Parser };