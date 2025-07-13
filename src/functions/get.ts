import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ItemService } from '../services/itemService';
import { validateId } from '../utils/validation';
import { successResponse, notFoundResponse, badRequestResponse, errorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Get item request:', JSON.stringify(event, null, 2));

    // Extract and validate ID from path parameters
    const id = event.pathParameters?.id;
    if (!id) {
      return badRequestResponse('Item ID is required');
    }

    const validatedId = validateId(id);

    // Get item from DynamoDB
    const item = await ItemService.getItem(validatedId);

    if (!item) {
      return notFoundResponse(`Item with ID ${validatedId} not found`);
    }

    console.log('Item retrieved successfully:', item.id);
    return successResponse(item);

  } catch (error) {
    console.error('Error getting item:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid ID format')) {
        return badRequestResponse('Invalid item ID format');
      }
    }

    return errorResponse('Failed to get item');
  }
}; 