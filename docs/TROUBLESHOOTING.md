# Troubleshooting Guide

## Common Issues & Solutions

### 1. Deployment Issues

#### Issue: CloudFormation Stack Creation Fails
**Error**: `CREATE_FAILED` or `ROLLBACK_COMPLETE`

**Common Causes**:
- Insufficient IAM permissions
- Resource name conflicts
- Invalid configuration
- AWS service limits exceeded

**Solutions**:
```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name serverlessguru-api-dev

# Remove failed stack
serverless remove --stage dev

# Verify IAM permissions
aws iam get-user

# Check service limits
aws service-quotas get-service-quota \
  --service-code lambda \
  --quota-code L-2EBF8B7E
```

#### Issue: Lambda Function Deployment Fails
**Error**: `Function code size exceeds maximum allowed size`

**Solutions**:
```bash
# Check bundle size
npm run build
ls -la .serverless/

# Exclude unnecessary files in serverless.yml
package:
  exclude:
    - node_modules/**
    - tests/**
    - docs/**
    - .git/**
```

#### Issue: DynamoDB Table Creation Fails
**Error**: `Table already exists` or `Insufficient permissions`

**Solutions**:
```bash
# Check existing tables
aws dynamodb list-tables

# Delete existing table (if safe)
aws dynamodb delete-table --table-name serverlessguru-items-dev

# Verify DynamoDB permissions
aws dynamodb describe-table --table-name serverlessguru-items-dev
```

### 2. Runtime Issues

#### Issue: Lambda Function Timeout
**Error**: `Task timed out after 30.03 seconds`

**Solutions**:
```bash
# Increase timeout in serverless.yml
functions:
  createItem:
    handler: src/functions/createItem.handler
    timeout: 60  # Increase from 30

# Check function logs for bottlenecks
serverless logs -f createItem --stage dev --tail

# Monitor DynamoDB performance
aws dynamodb describe-table --table-name serverlessguru-items-dev
```

#### Issue: Lambda Function Memory Issues
**Error**: `Process exited before completing request`

**Solutions**:
```bash
# Increase memory allocation
functions:
  createItem:
    handler: src/functions/createItem.handler
    memorySize: 1024  # Increase from 512

# Check memory usage in logs
serverless logs -f createItem --stage dev | grep "Memory"
```

#### Issue: DynamoDB Throttling
**Error**: `ProvisionedThroughputExceededException`

**Solutions**:
```bash
# Switch to on-demand billing
aws dynamodb update-table \
  --table-name serverlessguru-items-dev \
  --billing-mode PAY_PER_REQUEST

# Or increase provisioned capacity
aws dynamodb update-table \
  --table-name serverlessguru-items-dev \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10
```

### 3. API Gateway Issues

#### Issue: CORS Errors
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solutions**:
```yaml
# Update CORS configuration in serverless.yml
cors:
  origin: '*'
  headers:
    - Content-Type
    - X-Amz-Date
    - Authorization
    - X-Api-Key
    - X-Amz-Security-Token
    - X-Requested-With
  allowCredentials: false
```

#### Issue: 4xx/5xx Errors
**Error**: `{"message": "Internal server error"}`

**Solutions**:
```bash
# Check API Gateway logs
aws logs tail /aws/apigateway/serverlessguru-api-dev --follow

# Check Lambda function logs
serverless logs -f createItem --stage dev --tail

# Verify function configuration
serverless info --stage dev
```

### 4. Environment Issues

#### Issue: Environment Variables Not Set
**Error**: `Cannot read property 'DYNAMODB_TABLE' of undefined`

**Solutions**:
```bash
# Check environment variables
serverless print --stage dev

# Verify .env file
cat .env

# Set environment variables in serverless.yml
provider:
  environment:
    DYNAMODB_TABLE: ${self:service}-items-${opt:stage, 'dev'}
```

#### Issue: AWS Credentials Not Configured
**Error**: `Unable to locate credentials`

**Solutions**:
```bash
# Configure AWS credentials
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1

# Verify credentials
aws sts get-caller-identity
```

### 5. Testing Issues

#### Issue: Tests Fail Locally
**Error**: `Cannot find module 'aws-sdk'` or similar

**Solutions**:
```bash
# Install dependencies
npm install

# Run tests with proper environment
npm test

# Check test configuration
cat jest.config.js
```

#### Issue: Integration Tests Fail
**Error**: `Connection timeout` or `Resource not found`

**Solutions**:
```bash
# Ensure DynamoDB table exists
aws dynamodb describe-table --table-name serverlessguru-items-test

# Check API endpoint
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/health

# Run tests with proper environment variables
DYNAMODB_TABLE=serverlessguru-items-test npm run test:integration
```

## Error Code Reference

### Lambda Error Codes
- `Task timed out`: Function execution exceeded timeout
- `Process exited before completing request`: Memory or runtime error
- `Cannot find module`: Missing dependency
- `Access denied`: IAM permission issue

### DynamoDB Error Codes
- `ProvisionedThroughputExceededException`: Throttling
- `ResourceNotFoundException`: Table doesn't exist
- `ConditionalCheckFailedException`: Conditional write failed
- `ValidationException`: Invalid request parameters

### API Gateway Error Codes
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Debugging Tools

### 1. CloudWatch Logs
```bash
# View real-time logs
aws logs tail /aws/lambda/serverlessguru-api-dev-createItem --follow

# Search for specific errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/serverlessguru-api-dev-createItem \
  --filter-pattern "ERROR"

# Get log streams
aws logs describe-log-streams \
  --log-group-name /aws/lambda/serverlessguru-api-dev-createItem \
  --order-by LastEventTime \
  --descending
```

### 2. X-Ray Tracing
```bash
# Enable X-Ray in serverless.yml
provider:
  tracing:
    lambda: true
    apiGateway: true

# View traces in AWS Console
# https://console.aws.amazon.com/xray/
```

### 3. CloudWatch Metrics
```bash
# Get Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=serverlessguru-api-dev-createItem \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### 4. Serverless Framework Debug
```bash
# Enable verbose logging
serverless deploy --stage dev --verbose

# Print configuration
serverless print --stage dev

# Validate configuration
serverless config validate
```

## Performance Issues

### 1. Cold Start Optimization
```typescript
// Use connection pooling
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 5000
  }
});

// Lazy load dependencies
let heavyModule: any;
const getHeavyModule = () => {
  if (!heavyModule) {
    heavyModule = require('./heavyModule');
  }
  return heavyModule;
};
```

### 2. Memory Optimization
```typescript
// Minimize bundle size
import { DynamoDB } from 'aws-sdk';
// Instead of: import AWS from 'aws-sdk';

// Use tree-shaking
import { createItem } from './services/itemService';
// Instead of: import * as services from './services';
```

### 3. DynamoDB Optimization
```typescript
// Use batch operations
const batchGetItems = async (ids: string[]) => {
  const params = {
    RequestItems: {
      [process.env.DYNAMODB_TABLE!]: {
        Keys: ids.map(id => ({ id }))
      }
    }
  };
  return dynamodb.batchGet(params).promise();
};

// Use efficient queries
const getItemsByCategory = async (category: string) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    IndexName: 'category-createdAt-index',
    KeyConditionExpression: 'category = :category',
    ExpressionAttributeValues: {
      ':category': category
    }
  };
  return dynamodb.query(params).promise();
};
```

## Security Issues

### 1. IAM Permission Issues
```bash
# Check current permissions
aws iam get-user
aws iam list-attached-user-policies --user-name your-username

# Create minimal IAM policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:123456789012:function:serverlessguru-api-dev-*",
        "arn:aws:dynamodb:us-east-1:123456789012:table/serverlessguru-items-dev"
      ]
    }
  ]
}
```

### 2. Environment Variable Security
```bash
# Use AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "/serverlessguru/dev/database-url" \
  --value "your-database-url" \
  --type "SecureString"

# Reference in serverless.yml
provider:
  environment:
    DATABASE_URL: ${ssm:/serverlessguru/${opt:stage, 'dev'}/database-url}
```

## Getting Help

### 1. Documentation
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

### 2. Community Resources
- [Serverless Framework Forum](https://forum.serverless.com/)
- [AWS Developer Forums](https://forums.aws.amazon.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/serverless-framework)

### 3. Support Channels
- Create an issue in the repository
- Contact the development team
- Check the project's troubleshooting documentation 