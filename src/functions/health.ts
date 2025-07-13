import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Health check request:', JSON.stringify(event, null, 2));

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'serverlessguru-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.AWS_REGION || 'us-east-1'
  };

  return successResponse(healthData);
}; 