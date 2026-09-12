import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../app/env.js";
import { ValidationError } from "../errors.js";

function requireR2Config() {
  const missing = [
    ["R2_ACCOUNT_ID", env.R2_ACCOUNT_ID],
    ["R2_ACCESS_KEY_ID", env.R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", env.R2_SECRET_ACCESS_KEY],
    ["R2_BUCKET", env.R2_BUCKET],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new ValidationError(`R2 is not configured: ${missing.join(", ")}`);
  }
}

function createR2Client() {
  requireR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function createPresignedUpload(input: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: input.key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 300,
  });

  return {
    key: input.key,
    uploadUrl,
    publicUrl: env.R2_PUBLIC_BASE_URL ? `${env.R2_PUBLIC_BASE_URL}/${input.key}` : undefined,
  };
}
