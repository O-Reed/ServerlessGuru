import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ItemService } from '../services/itemService';
import { successResponse, badRequestResponse, errorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('List items request:', JSON.stringify(event, null, 2));

    // Parse query parameters
    const limit = event.queryStringParameters?.limit 
      ? parseInt(event.queryStringParameters.limit, 10) 
      : 10;
    
    const lastEvaluatedKey = event.queryStringParameters?.page 
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.page))
      : undefined;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return badRequestResponse('Limit must be between 1 and 100');
    }

    // Get items from DynamoDB
    const result = await ItemService.listItems(limit, lastEvaluatedKey);

    console.log(`Retrieved ${result.count} items`);
    return successResponse({
      items: result.items,
      count: result.count,
      hasMore: !!result.lastEvaluatedKey,
      nextPage: result.lastEvaluatedKey 
        ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey))
        : null
    });

  } catch (error) {
    console.error('Error listing items:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unexpected token')) {
        return badRequestResponse('Invalid page parameter format');
      }
    }

    return errorResponse('Failed to list items');
  }
}; 