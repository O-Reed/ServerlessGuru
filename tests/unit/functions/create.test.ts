import { handler } from '../../../src/functions/create';
import { ItemService } from '../../../src/services/itemService';

// Mock the ItemService
jest.mock('../../../src/services/itemService');
const mockedItemService = ItemService as jest.Mocked<typeof ItemService>;

describe('create function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create item successfully', async () => {
    const mockEvent = {
      body: JSON.stringify({
        name: 'Test Item',
        description: 'Test Description',
        price: 99.99,
        category: 'electronics'
      }),
      pathParameters: null,
      queryStringParameters: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      httpMethod: 'POST',
      path: '/items',
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueQueryStringParameters: null
    };

    const mockCreatedItem = {
      id: 'test-uuid',
      name: 'Test Item',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics' as const,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    mockedItemService.createItem.mockResolvedValue(mockCreatedItem);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: mockCreatedItem
    });
    expect(mockedItemService.createItem).toHaveBeenCalledWith({
      name: 'Test Item',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics'
    });
  });

  it('should return 400 for invalid input', async () => {
    const mockEvent = {
      body: JSON.stringify({
        name: '', // Invalid: empty name
        price: -10 // Invalid: negative price
      }),
      pathParameters: null,
      queryStringParameters: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      httpMethod: 'POST',
      path: '/items',
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueQueryStringParameters: null
    };

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('success', false);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('should return 400 for invalid JSON', async () => {
    const mockEvent = {
      body: 'invalid json',
      pathParameters: null,
      queryStringParameters: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      httpMethod: 'POST',
      path: '/items',
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueQueryStringParameters: null
    };

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('success', false);
    expect(JSON.parse(result.body).error).toContain('Invalid JSON');
  });
}); 