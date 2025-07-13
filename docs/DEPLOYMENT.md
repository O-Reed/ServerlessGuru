# Deployment Guide

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Serverless Framework CLI installed

### 2. Required Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "iam:*",
        "cloudformation:*",
        "cloudwatch:*",
        "logs:*",
        "s3:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Environment Setup
```bash
# Install Node.js 18.x or higher
node --version

# Install Serverless Framework
npm install -g serverless

# Install AWS CLI
aws --version

# Configure AWS credentials
aws configure
```

## Environment Configuration

### 1. Environment Variables
Create `.env` file based on `.env.example`:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default

# Application Configuration
STAGE=dev
DYNAMODB_TABLE=serverlessguru-items-dev
API_NAME=serverlessguru-api

# Optional: Custom Domain
CUSTOM_DOMAIN=api.yourdomain.com
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxx
```

### 2. Stage-Specific Configuration
Each stage (dev, staging, prod) can have different configurations:

```yaml
# serverless.yml
custom:
  stages:
    dev:
      memorySize: 512
      timeout: 30
      dynamodb:
        billingMode: PAY_PER_REQUEST
    staging:
      memorySize: 1024
      timeout: 30
      dynamodb:
        billingMode: PROVISIONED
        readCapacity: 5
        writeCapacity: 5
    prod:
      memorySize: 1024
      timeout: 30
      dynamodb:
        billingMode: PROVISIONED
        readCapacity: 10
        writeCapacity: 10
```

## Deployment Process

### 1. Development Deployment
```bash
# Deploy to development environment
npm run deploy:dev

# Or using serverless directly
serverless deploy --stage dev --verbose
```

### 2. Staging Deployment
```bash
# Deploy to staging environment
npm run deploy:staging

# Or using serverless directly
serverless deploy --stage staging --verbose
```

### 3. Production Deployment
```bash
# Deploy to production environment
npm run deploy:prod

# Or using serverless directly
serverless deploy --stage prod --verbose
```

### 4. CI/CD Deployment
The project includes GitHub Actions workflows for automated deployment:

1. **Pull Request**: Runs tests and linting
2. **Merge to Main**: Deploys to staging
3. **Release**: Deploys to production

## Deployment Verification

### 1. Health Check
```bash
# Get the API endpoint
API_URL=$(aws apigateway get-rest-apis --query 'items[?name==`serverlessguru-api-dev`].id' --output text)
echo "https://${API_URL}.execute-api.us-east-1.amazonaws.com/dev/health"

# Test health endpoint
curl https://${API_URL}.execute-api.us-east-1.amazonaws.com/dev/health
```

### 2. Function Verification
```bash
# List deployed functions
serverless info --stage dev

# Check function logs
serverless logs -f createItem --stage dev --tail
```

### 3. DynamoDB Verification
```bash
# Check table creation
aws dynamodb describe-table --table-name serverlessguru-items-dev

# Test table access
aws dynamodb scan --table-name serverlessguru-items-dev --limit 1
```

## Rollback Procedures

### 1. Manual Rollback
```bash
# List deployments
serverless deploy list --stage dev

# Rollback to previous version
serverless rollback --stage dev --timestamp 1234567890
```

### 2. Emergency Rollback
```bash
# Remove current deployment
serverless remove --stage dev

# Deploy previous version
serverless deploy --stage dev --version 1.0.0
```

### 3. Database Rollback
```bash
# Restore DynamoDB table from backup
aws dynamodb restore-table-from-backup \
  --target-table-name serverlessguru-items-dev-restored \
  --backup-arn arn:aws:dynamodb:us-east-1:123456789012:table/serverlessguru-items-dev/backup/xxx
```

## Monitoring & Troubleshooting

### 1. CloudWatch Logs
```bash
# View function logs
aws logs tail /aws/lambda/serverlessguru-api-dev-createItem --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/serverlessguru-api-dev-createItem \
  --filter-pattern "ERROR"
```

### 2. API Gateway Monitoring
```bash
# Get API metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=serverlessguru-api-dev \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### 3. DynamoDB Monitoring
```bash
# Get table metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=serverlessguru-items-dev \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

## Common Issues & Solutions

### 1. Deployment Failures

**Issue**: CloudFormation stack creation fails
```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name serverlessguru-api-dev

# Common causes:
# - Insufficient IAM permissions
# - Resource name conflicts
# - Invalid configuration
```

**Solution**:
```bash
# Remove failed stack
serverless remove --stage dev

# Fix configuration and redeploy
serverless deploy --stage dev
```

### 2. Lambda Function Errors

**Issue**: Function timeout or memory issues
```bash
# Check function configuration
serverless info --stage dev

# Increase memory/timeout in serverless.yml
functions:
  createItem:
    handler: src/functions/createItem.handler
    memorySize: 1024  # Increase from 512
    timeout: 60       # Increase from 30
```

### 3. DynamoDB Issues

**Issue**: Throttling or capacity issues
```bash
# Check table metrics
aws dynamodb describe-table --table-name serverlessguru-items-dev

# Switch to on-demand billing
aws dynamodb update-table \
  --table-name serverlessguru-items-dev \
  --billing-mode PAY_PER_REQUEST
```

### 4. API Gateway Issues

**Issue**: CORS errors or 4xx/5xx responses
```bash
# Check API Gateway logs
aws logs tail /aws/apigateway/serverlessguru-api-dev --follow

# Verify CORS configuration in serverless.yml
cors:
  origin: '*'
  headers:
    - Content-Type
    - X-Amz-Date
    - Authorization
    - X-Api-Key
    - X-Amz-Security-Token
```

## Security Best Practices

### 1. IAM Roles
- Use least privilege principle
- Regularly audit permissions
- Use temporary credentials

### 2. Environment Variables
- Never commit secrets to Git
- Use AWS Systems Manager Parameter Store
- Rotate secrets regularly

### 3. Network Security
- Use VPC for Lambda functions (if needed)
- Configure security groups properly
- Enable VPC Flow Logs

### 4. Monitoring
- Set up CloudWatch alarms
- Monitor for unusual activity
- Regular security audits

## Cost Optimization

### 1. Lambda Optimization
```bash
# Monitor function costs
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=serverlessguru-api-dev-createItem \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### 2. DynamoDB Optimization
- Use on-demand billing for unpredictable workloads
- Monitor read/write capacity
- Optimize query patterns

### 3. API Gateway Optimization
- Enable caching where appropriate
- Use compression
- Monitor request volume

## Performance Tuning

### 1. Lambda Performance
- Right-size memory allocation
- Optimize cold start times
- Use connection pooling

### 2. DynamoDB Performance
- Design efficient key schemas
- Use appropriate indexes
- Implement pagination

### 3. API Gateway Performance
- Enable caching
- Use compression
- Monitor latency

## Backup & Recovery

### 1. Code Backup
- Use Git for version control
- Tag releases
- Maintain deployment history

### 2. Data Backup
- Enable DynamoDB point-in-time recovery
- Create manual backups for critical data
- Test restore procedures

### 3. Configuration Backup
- Store serverless.yml in Git
- Document environment variables
- Maintain deployment scripts 