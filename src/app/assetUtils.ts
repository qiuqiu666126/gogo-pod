import type { UploadedAsset } from "./api/uploadApi";

export function urlsToUploadedAssets(urls: string[], namePrefix = "workflow-image"): UploadedAsset[] {
  return urls.map((url, index) => ({
    id: `wf-import-${index}-${Date.now()}`,
    url,
    name: `${namePrefix}-${index + 1}.jpg`,
    size: 0,
    mimeType: "image/jpeg",
  }));
}
