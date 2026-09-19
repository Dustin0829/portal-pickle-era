import { createPresignedDownload } from "../../lib/storage/s3.js";

type DownloadFn = typeof createPresignedDownload;

export async function resolveWaitlistImageUrl(
  imageKey: string | null,
  download: DownloadFn = createPresignedDownload,
): Promise<string | null> {
  if (!imageKey) return null;
  try {
    const result = await download({ key: imageKey });
    return result.url;
  } catch {
    return null;
  }
}
