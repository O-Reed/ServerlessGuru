import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ItemService, UpdateItemInput } from '../services/itemService';
import { validateRequest, parseJsonBody, validateId } from '../utils/validation';
import { successResponse, notFoundResponse, badRequestResponse, errorResponse } from '../utils/response';
import updateItemSchema from '../models/update-item-schema.json';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Update item request:', JSON.stringify(event, null, 2));

    // Extract and validate ID from path parameters
    const id = event.pathParameters?.id;
    if (!id) {
      return badRequestResponse('Item ID is required');
    }

    const validatedId = validateId(id);

    // Check if item exists
    const itemExists = await ItemService.itemExists(validatedId);
    if (!itemExists) {
      return notFoundResponse(`Item with ID ${validatedId} not found`);
    }

    // Parse and validate request body
    const body = parseJsonBody(event.body);
    const validatedData = validateRequest(updateItemSchema, body) as UpdateItemInput;

    // Update item in DynamoDB
    const updatedItem = await ItemService.updateItem(validatedId, validatedData);

    console.log('Item updated successfully:', updatedItem.id);
    return successResponse(updatedItem);

  } catch (error) {
    console.error('Error updating item:', error);

    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return badRequestResponse('Invalid request data', { 
          details: error.message 
        });
      }
      
      if (error.message.includes('Invalid JSON')) {
        return badRequestResponse('Invalid JSON in request body');
      }

      if (error.message.includes('Invalid ID format')) {
        return badRequestResponse('Invalid item ID format');
      }
    }

    return errorResponse('Failed to update item');
  }
}; 