import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../app/env.js";
import { ValidationError } from "../errors.js";

const DOWNLOAD_TTL_SECONDS = 5 * 60;

function requireS3Config() {
  const missing = [
    ["S3_ENDPOINT", env.S3_ENDPOINT],
    ["S3_ACCESS_KEY_ID", env.S3_ACCESS_KEY_ID],
    ["S3_SECRET_ACCESS_KEY", env.S3_SECRET_ACCESS_KEY],
    ["S3_BUCKET", env.S3_BUCKET],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new ValidationError(`Object storage is not configured: ${missing.join(", ")}`);
  }
}

function createS3Client() {
  requireS3Config();

  const endpoint = env.S3_ENDPOINT;
  const accessKeyId = env.S3_ACCESS_KEY_ID;
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new ValidationError("Object storage is not configured");
  }

  return new S3Client({
    region: env.S3_REGION || "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function createPresignedUpload(input: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const client = createS3Client();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: input.key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 300,
  });

  return {
    key: input.key,
    uploadUrl,
  };
}

export async function createPresignedDownload(input: { key: string; expiresInSeconds?: number }) {
  const client = createS3Client();
  const expiresIn = input.expiresInSeconds ?? DOWNLOAD_TTL_SECONDS;
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: input.key,
  });

  const url = await getSignedUrl(client, command, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  return { url, expiresAt };
}
