#!/bin/bash
set -e

REGION="eu-central-1"

echo "======================================"
echo "🚀 Deploying Freshi-App Infrastructure"
echo "======================================"

echo "[1/4] Deploying Security & Identity Stack (Cognito)..."
aws cloudformation deploy \
    --template-file 01-security-identity.yaml \
    --stack-name FoodAppSecurityStack \
    --region $REGION \
    --capabilities CAPABILITY_IAM

echo "[2/4] Deploying Data & Storage Stack (DynamoDB, S3, CloudFront)..."
aws cloudformation deploy \
    --template-file 02-data-storage.yaml \
    --stack-name FoodAppDataStack \
    --region $REGION

echo "Fetching the latest Node.js 24 Elastic Beanstalk Platform for your region..."
PLATFORM=$(aws elasticbeanstalk list-available-solution-stacks --region $REGION --query "SolutionStacks[?contains(@, 'running Node.js 24')] | [0]" --output text)

if [ "$PLATFORM" == "None" ] || [ -z "$PLATFORM" ]; then
    echo "Could not fetch platform dynamically. Falling back to default."
    PLATFORM="64bit Amazon Linux 2023 v6.10.1 running Node.js 24"
fi
echo "Using Platform: $PLATFORM"

echo "[3/4] Deploying Compute Backend Stack (API Gateway, Elastic Beanstalk)..."
aws cloudformation deploy \
    --template-file 03-compute-backend.yaml \
    --stack-name FoodAppComputeStack \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides SolutionStackName="$PLATFORM"

echo "[4/4] Deploying Notification Stack (EventBridge, Lambda, Secrets)..."
aws cloudformation deploy \
    --template-file 04-notifications.yaml \
    --stack-name FoodAppNotificationStack \
    --region $REGION \
    --capabilities CAPABILITY_IAM

echo "======================================"
echo "✅ All AWS Infrastructure is DEPLOYED!"
echo "======================================"
