# ServerlessGuru - REST API

A production-ready REST API built with AWS Serverless Framework, featuring full CRUD operations, comprehensive testing, and CI/CD pipeline.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│   Lambda        │───▶│   DynamoDB      │
│                 │    │   Functions     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CORS          │    │   Validation    │    │   Auto Scaling  │
│   Rate Limiting │    │   Error Handling│    │   Backup        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Runtime**: Node.js 18.x with TypeScript
- **Framework**: AWS Serverless Framework
- **API Gateway**: AWS API Gateway (REST)
- **Compute**: AWS Lambda
- **Database**: Amazon DynamoDB
- **Testing**: Jest with supertest
- **CI/CD**: GitHub Actions
- **Linting**: ESLint with TypeScript support

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- AWS CLI configured with appropriate permissions
- Serverless Framework CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ServerlessGuru
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS configuration
   ```

4. **Deploy to AWS**
   ```bash
   npm run deploy:dev
   ```

## 📚 API Documentation

### Base URL
```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### Create Item
```http
POST /items
Content-Type: application/json

{
  "name": "Sample Item",
  "description": "A sample item description",
  "category": "electronics",
  "price": 99.99,
  "tags": ["new", "featured"]
}
```

**Response:**
```json
{
  "id": "item-123",
  "name": "Sample Item",
  "description": "A sample item description",
  "category": "electronics",
  "price": 99.99,
  "tags": ["new", "featured"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Item
```http
GET /items/{id}
```

#### List Items
```http
GET /items?limit=10&category=electronics&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 20, max: 100)
- `category` (optional): Filter by category
- `sortBy` (optional): Sort field (createdAt, updatedAt, name, price)
- `sortOrder` (optional): Sort order (asc, desc)

#### Update Item
```http
PUT /items/{id}
Content-Type: application/json

{
  "name": "Updated Item Name",
  "price": 149.99
}
```

#### Delete Item
```http
DELETE /items/{id}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "price",
      "issue": "Price must be a positive number"
    }
  }
}
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Structure
- `tests/unit/` - Unit tests for Lambda functions
- `tests/integration/` - Integration tests
- `tests/utils/` - Test utilities and mocks

## 🚀 Deployment

### Development
```bash
npm run deploy:dev
```

### Staging
```bash
npm run deploy:staging
```

### Production
```bash
npm run deploy:prod
```

### Environment Variables
- `AWS_REGION` - AWS region for deployment
- `STAGE` - Deployment stage (dev, staging, prod)
- `DYNAMODB_TABLE` - DynamoDB table name

## 🔧 Development

### Available Scripts
```bash
npm run build          # Build TypeScript
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run test           # Run tests
npm run deploy:dev     # Deploy to dev
npm run remove:dev     # Remove dev deployment
npm run logs:dev       # View dev logs
```

### Project Structure
```
├── src/
│   ├── functions/     # Lambda function handlers
│   ├── services/      # Business logic and data access
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── tests/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── utils/         # Test utilities
├── config/            # Configuration files
├── scripts/           # Deployment and utility scripts
└── .github/           # CI/CD workflows
```

## 🔒 Security

- Input validation on all endpoints
- CORS configuration
- Rate limiting via API Gateway
- IAM roles with least privilege
- DynamoDB encryption at rest
- HTTPS enforcement

## 📊 Monitoring

- CloudWatch logs for all Lambda functions
- API Gateway metrics
- DynamoDB metrics
- Custom application metrics
- Error tracking and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting guide
- Review the API documentation

## 📈 Performance

- Lambda cold start optimization
- DynamoDB query optimization
- API Gateway caching
- Connection pooling
- Response compression

## 🔄 CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline with:

1. **Pull Request Validation**
   - Code linting
   - Unit tests
   - Integration tests
   - Security scanning

2. **Deployment Pipeline**
   - Automated testing
   - Staging deployment
   - Production deployment
   - Rollback capabilities

3. **Monitoring**
   - Health checks
   - Performance monitoring
   - Error tracking
   - Alert notifications 