import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ItemService, CreateItemInput } from '../services/itemService';
import { validateRequest, parseJsonBody } from '../utils/validation';
import { createdResponse, badRequestResponse, errorResponse } from '../utils/response';
import createItemSchema from '../models/create-item-schema.json';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Create item request:', JSON.stringify(event, null, 2));

    // Parse and validate request body
    const body = parseJsonBody(event.body);
    const validatedData = validateRequest(createItemSchema, body) as CreateItemInput;

    // Create item in DynamoDB
    const item = await ItemService.createItem(validatedData);

    console.log('Item created successfully:', item.id);
    return createdResponse(item);

  } catch (error) {
    console.error('Error creating item:', error);

    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return badRequestResponse('Invalid request data', { 
          details: error.message 
        });
      }
      
      if (error.message.includes('Invalid JSON')) {
        return badRequestResponse('Invalid JSON in request body');
      }
    }

    return errorResponse('Failed to create item');
  }
}; 