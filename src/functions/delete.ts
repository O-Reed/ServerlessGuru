import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ItemService } from '../services/itemService';
import { validateId } from '../utils/validation';
import { noContentResponse, notFoundResponse, badRequestResponse, errorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Delete item request:', JSON.stringify(event, null, 2));

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

    // Delete item from DynamoDB
    await ItemService.deleteItem(validatedId);

    console.log('Item deleted successfully:', validatedId);
    return noContentResponse();

  } catch (error) {
    console.error('Error deleting item:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid ID format')) {
        return badRequestResponse('Invalid item ID format');
      }
    }

    return errorResponse('Failed to delete item');
  }
}; 