const { Prisma } = require('@prisma/client');

function generateOpenAPISchema(modelName) {
  const dmmf = Prisma.dmmf;
  const model = dmmf.datamodel.models.find(m => m.name === modelName);
  
  if (!model) {
    throw new Error(`Model ${modelName} not found in Prisma schema`);
  }

  const properties = {};
  const required = [];

  model.fields.forEach(field => {
    let type;
    let format;

    switch (field.type) {
      case 'String':
        type = 'string';
        break;
      case 'Int':
        type = 'integer';
        break;
      case 'Float':
        type = 'number';
        break;
      case 'Boolean':
        type = 'boolean';
        break;
      case 'DateTime':
        type = 'string';
        format = 'date-time';
        break;
      case 'Json':
        type = 'object';
        break;
      default:
        if (field.kind === 'enum') {
          type = 'string';
          properties[field.name] = {
            type: 'string',
            enum: dmmf.datamodel.enums.find(e => e.name === field.type)?.values.map(v => v.name) || []
          };
          break;
        }
        // Handle relationships
        if (field.kind === 'object') {
          type = 'object';
          properties[field.name] = {
            $ref: `#/components/schemas/${field.type}`
          };
          break;
        }
        type = 'string';
    }

    if (!properties[field.name]) {
      properties[field.name] = {
        type,
        ...(format && { format }),
        ...(field.documentation && { description: field.documentation })
      };
    }

    if (!field.isRequired && !field.hasDefaultValue) {
      properties[field.name].nullable = true;
    }

    if (field.isRequired && !field.hasDefaultValue) {
      required.push(field.name);
    }
  });

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  };
}

function generateSwaggerComponents() {
  const components = {
    schemas: {}
  };

  Prisma.dmmf.datamodel.models.forEach(model => {
    components.schemas[model.name] = generateOpenAPISchema(model.name);
  });

  return components;
}

module.exports = {
  generateSwaggerComponents
};
