import { getApiBase, http } from "./apiClient";

export type UploadedAsset = {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  /** 无后台时为本地上传的 blob URL */
  local?: boolean;
};

type PresignResponse = {
  assetId: string;
  uploadUrl: string;
  assetUrl?: string;
  publicUrl?: string;
  headers?: Record<string, string>;
};

const localObjectUrls = new Set<string>();

function localUpload(file: File): UploadedAsset {
  const url = URL.createObjectURL(file);
  localObjectUrls.add(url);
  return {
    id: `local-${crypto.randomUUID()}`,
    url,
    name: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
    local: true,
  };
}

async function uploadViaPresign(file: File): Promise<UploadedAsset> {
  const presign = await http.post<PresignResponse>(
    "/api/v1/upload/presign",
    {
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    },
  );
  const assetUrl = presign.assetUrl ?? presign.publicUrl;
  if (!assetUrl) {
    throw new Error("上传预签名响应缺少 assetUrl");
  }

  const putHeaders = new Headers(presign.headers ?? {});
  if (!putHeaders.has("Content-Type") && file.type) {
    putHeaders.set("Content-Type", file.type);
  }

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: putHeaders,
  });

  if (!putRes.ok) {
    throw new Error(`上传到存储失败: ${putRes.status}`);
  }

  return {
    id: presign.assetId,
    url: assetUrl,
    name: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

/**
 * 上传单个素材：优先走后端预签名 OSS；失败或未配置 API 时回退为本地 blob URL
 */
export async function uploadAsset(file: File): Promise<UploadedAsset> {
  const hasRemote = Boolean(getApiBase()) || import.meta.env.DEV;
  if (!hasRemote) {
    return localUpload(file);
  }

  try {
    return await uploadViaPresign(file);
  } catch {
    return localUpload(file);
  }
}

export async function uploadAssets(files: File[]): Promise<UploadedAsset[]> {
  const results: UploadedAsset[] = [];
  for (const file of files) {
    results.push(await uploadAsset(file));
  }
  return results;
}

export function revokeLocalAssetUrl(url: string) {
  if (localObjectUrls.has(url)) {
    URL.revokeObjectURL(url);
    localObjectUrls.delete(url);
  }
}
