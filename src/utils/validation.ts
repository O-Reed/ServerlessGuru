import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRequest = (schema: any, data: any): any => {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  if (!valid) {
    const errors: ValidationError[] = validate.errors?.map(error => ({
      field: error.instancePath || 'body',
      message: error.message || 'Invalid value'
    })) || [];
    
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }
  
  return data;
};

export const parseJsonBody = (body: string | null): any => {
  if (!body) {
    throw new Error('Request body is required');
  }
  
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
};

export const validateId = (id: string): string => {
  if (!id || typeof id !== 'string') {
    throw new Error('Valid ID is required');
  }
  
  // UUID validation pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id)) {
    throw new Error('Invalid ID format');
  }
  
  return id;
}; 