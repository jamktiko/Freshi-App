#!/bin/bash
set -e

REGION="eu-central-1"

echo "========================================="
echo "🧨 TEARDOWN: Freshi-App AWS Infrastructure"
echo "========================================="
echo "WARNING: This will DESTROY all CloudFormation stacks and delete your DynamoDB data!"
read -p "Are you absolutely sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Teardown aborted."
    exit 1
fi

echo "Fetching S3 Bucket Name to empty it before deletion (CloudFormation cannot delete non-empty buckets)..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name FoodAppDataStack \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
    --output text 2>/dev/null || true)

if [ ! -z "$BUCKET_NAME" ] && [ "$BUCKET_NAME" != "None" ]; then
    echo "🗑️  Emptying S3 Bucket: $BUCKET_NAME"
    aws s3 rm s3://$BUCKET_NAME --recursive || true
fi

echo "[1/4] Deleting Notification Stack..."
aws cloudformation delete-stack --stack-name FoodAppNotificationStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppNotificationStack --region $REGION
echo "✅ Notification Stack Deleted."

echo "[2/4] Deleting Compute Backend Stack... (This takes a few minutes)"
aws cloudformation delete-stack --stack-name FoodAppComputeStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppComputeStack --region $REGION
echo "✅ Compute Stack Deleted."

echo "[3/4] Deleting Data Storage Stack..."
aws cloudformation delete-stack --stack-name FoodAppDataStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppDataStack --region $REGION
echo "✅ Data Stack Deleted."

echo "[4/4] Deleting Security Identity Stack..."
aws cloudformation delete-stack --stack-name FoodAppSecurityStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppSecurityStack --region $REGION
echo "✅ Security Stack Deleted."

echo "==================================================="
echo "✅ TEARDOWN COMPLETE! You are no longer being billed."
echo "==================================================="
