// Import AWS S3 client (ES Modules syntax)
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create S3 client instance using AWS region
const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1"
});

/**
 * 📤 Upload file buffer to AWS S3
 */
export async function uploadToS3(fileBuffer, key, contentType) {

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: "private"
    })
  );

  return key;
}

/**
 * 🔐 Generate temporary signed image URL
 */
export async function getSignedImageUrl(s3imageKey) {

  if (!s3imageKey) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: s3imageKey
  });

  return getSignedUrl(s3, command, {
    expiresIn: 60 * 60 * 24 // 24 hours
  });
}