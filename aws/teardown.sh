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

echo "[1/4] Deleting Compute Backend Stack... (This takes a few minutes)"
aws cloudformation delete-stack --stack-name FoodAppComputeStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppComputeStack --region $REGION
echo "✅ Compute Stack Deleted."

echo "[2/4] Deleting Data Storage Stack..."
aws cloudformation delete-stack --stack-name FoodAppDataStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppDataStack --region $REGION
echo "✅ Data Stack Deleted."

# echo "[3/4] Deleting Security Identity Stack..."
# Force-delete the secret so it doesn't cause soft-delete conflicts on redeploys
# echo "Force-deleting API Gateway Secret..."
# aws secretsmanager delete-secret --secret-id freshi/api-gateway-secret --force-delete-without-recovery --region $REGION || true
# 
# aws cloudformation delete-stack --stack-name FoodAppSecurityStack --region $REGION
# aws cloudformation wait stack-delete-complete --stack-name FoodAppSecurityStack --region $REGION
# echo "✅ Security Stack Deleted."
echo "⚠️  [3/4] SKIPPED: Security Identity Stack (Preserved so User Pool, Client ID, and Developer Users remain static!)"

echo "[4/4] Deleting Custom VPC Network Stack... (Takes a few minutes to detach NAT Gateway)"
aws cloudformation delete-stack --stack-name FoodAppVpcStack --region $REGION
aws cloudformation wait stack-delete-complete --stack-name FoodAppVpcStack --region $REGION
echo "✅ VPC Network Stack Deleted."

echo "==================================================="
echo "✅ TEARDOWN COMPLETE! You are no longer being billed."
echo "==================================================="
