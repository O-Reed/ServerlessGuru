#!/bin/bash

# Deployment Script for Serverless Framework
STAGE=${1:-dev}

echo "🚀 Deploying to $STAGE stage..."

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured. Please run: ./scripts/setup-aws.sh"
    exit 1
fi

# Run tests before deployment
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Deploy to specified stage
echo "📦 Deploying to $STAGE..."
serverless deploy --stage $STAGE

if [ $? -eq 0 ]; then
    echo "✅ Deployment to $STAGE completed successfully!"
    echo ""
    echo "📋 API Endpoints:"
    serverless info --stage $STAGE
else
    echo "❌ Deployment failed!"
    exit 1
fi 