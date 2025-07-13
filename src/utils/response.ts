export interface ApiResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': string;
  };
  body: string;
}

export const createResponse = (statusCode: number, body: any): ApiResponse => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
  },
  body: JSON.stringify(body),
});

export const successResponse = (data: any, statusCode: number = 200): ApiResponse => 
  createResponse(statusCode, { success: true, data });

export const errorResponse = (message: string, statusCode: number = 500, details?: any): ApiResponse => 
  createResponse(statusCode, { 
    success: false, 
    error: message,
    ...(details && { details })
  });

export const notFoundResponse = (message: string = 'Resource not found'): ApiResponse => 
  errorResponse(message, 404);

export const badRequestResponse = (message: string, details?: any): ApiResponse => 
  errorResponse(message, 400, details);

export const createdResponse = (data: any): ApiResponse => 
  successResponse(data, 201);

export const noContentResponse = (): ApiResponse => 
  createResponse(204, null); 