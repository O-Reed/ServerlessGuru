import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = DynamoDBDocument.from(new DynamoDB());
const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: 'electronics' | 'clothing' | 'books' | 'other';
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  price: number;
  category?: 'electronics' | 'clothing' | 'books' | 'other';
  stock?: number;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  price?: number;
  category?: 'electronics' | 'clothing' | 'books' | 'other';
  stock?: number;
}

export interface ListItemsResult {
  items: Item[];
  lastEvaluatedKey?: any;
  count: number;
}

export class ItemService {
  static async createItem(itemData: CreateItemInput): Promise<Item> {
    const now = new Date().toISOString();
    const item: Item = {
      id: uuidv4(),
      ...itemData,
      createdAt: now,
      updatedAt: now,
    };

    const params = {
      TableName: TABLE_NAME,
      Item: item,
    };

    await dynamoDb.put(params);
    return item;
  }

  static async getItem(id: string): Promise<Item | null> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };

    const result = await dynamoDb.get(params);
    return result.Item as Item || null;
  }

  static async listItems(limit: number = 10, lastEvaluatedKey?: any): Promise<ListItemsResult> {
    const params: any = {
      TableName: TABLE_NAME,
      Limit: limit,
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await dynamoDb.scan(params);
    
    return {
      items: result.Items as Item[] || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: result.Count || 0,
    };
  }

  static async updateItem(id: string, updates: UpdateItemInput): Promise<Item> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof UpdateItemInput] !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updates[key as keyof UpdateItemInput];
      }
    });

    // Always update the updatedAt timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params: UpdateCommandInput = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamoDb.update(params);
    return result.Attributes as Item;
  }

  static async deleteItem(id: string): Promise<void> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };

    await dynamoDb.delete(params);
  }

  static async itemExists(id: string): Promise<boolean> {
    const item = await this.getItem(id);
    return item !== null;
  }
} 