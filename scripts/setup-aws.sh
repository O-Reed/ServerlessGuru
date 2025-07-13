#!/bin/bash

# AWS Setup Script for Serverless Framework
echo "🚀 Setting up AWS credentials for Serverless Framework..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured."
    echo "Please run one of the following:"
    echo "1. aws configure"
    echo "2. aws configure set aws_access_key_id YOUR_ACCESS_KEY"
    echo "3. Set environment variables:"
    echo "   export AWS_ACCESS_KEY_ID=your_access_key"
    echo "   export AWS_SECRET_ACCESS_KEY=your_secret_key"
    echo "   export AWS_DEFAULT_REGION=us-east-1"
    exit 1
fi

echo "✅ AWS credentials are configured!"
echo "Current AWS account:"
aws sts get-caller-identity

echo ""
echo "📋 Next steps:"
echo "1. Deploy to dev: npm run deploy:dev"
echo "2. Deploy to prod: npm run deploy:prod"
echo "3. Run locally: npm run dev" 