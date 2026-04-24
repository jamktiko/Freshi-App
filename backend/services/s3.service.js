// Import AWS S3 client (ES Modules syntax)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Create S3 client instance using AWS region
const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1"
});

/**
 * 📤 Upload file buffer to AWS S3
 *
 * @param {Buffer} fileBuffer - binary file data from multer
 * @param {string} key - S3 object path (filename in bucket)
 * @param {string} contentType - MIME type (image/jpeg etc.)
 * @returns {Promise<string>} uploaded file key
 */
export async function uploadToS3(fileBuffer, key, contentType) {

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET, // target bucket name
      Key: key,                      // file path in S3
      Body: fileBuffer,              // actual binary file data
      ContentType: contentType,      // MIME type
      ACL: "private"                 // keep file private (secure default)
    })
  );

  // return file reference so backend can store it in DynamoDB
  return key;
}