import { getApiBase } from "./http";

export type AttachmentOwnerScope = "admin" | "front";

export type AttachmentDto = {
  id: number;
  storage_mode: number;
  origin_name: string;
  object_name: string;
  hash: string;
  mime_type: string;
  storage_path: string;
  suffix: string;
  size_byte: number;
  size_info: string;
  url: string;
  owner_scope: AttachmentOwnerScope;
  owner_scope_label: string;
  creator_username?: string | null;
  creator_nickname?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  is_image: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  remark: string;
};

export type AttachmentListDto = {
  list: AttachmentDto[];
  total: number;
};

export type AttachmentListParams = {
  page?: number;
  page_size?: number;
  suffix?: string;
  mime_type?: string;
  origin_name?: string;
  keyword?: string;
  owner_scope?: AttachmentOwnerScope | "";
  file_type?: string;
};

export const IMAGE_FILE_TYPE = "image";
export const VIDEO_FILE_TYPE = "video";
export const IMAGE_SUFFIXES = "jpg,jpeg,png,gif,webp,svg,bmp";

const VIDEO_SUFFIXES = new Set(["mp4", "mov", "avi", "webm", "mkv", "m4v"]);
const AUDIO_SUFFIXES = new Set(["mp3", "wav", "aac", "ogg", "m4a", "flac"]);

export type AttachmentKind = "image" | "video" | "audio" | "file";

export function getAttachmentSuffix(value?: string | null): string {
  return (value ?? "").trim().replace(/^\./, "").toLowerCase();
}

export function isVideoAttachment(item: {
  mime_type?: string | null;
  suffix?: string | null;
}): boolean {
  const mime = (item.mime_type ?? "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  return VIDEO_SUFFIXES.has(getAttachmentSuffix(item.suffix));
}

export function isAudioAttachment(item: {
  mime_type?: string | null;
  suffix?: string | null;
}): boolean {
  const mime = (item.mime_type ?? "").toLowerCase();
  if (mime.startsWith("audio/")) return true;
  return AUDIO_SUFFIXES.has(getAttachmentSuffix(item.suffix));
}

export function getAttachmentKind(item: {
  url?: string;
  mime_type?: string | null;
  suffix?: string | null;
  is_image?: boolean;
}): AttachmentKind {
  if (item.is_image || (item.mime_type ?? "").startsWith("image/")) return "image";
  if (isVideoAttachment(item)) return "video";
  if (isAudioAttachment(item)) return "audio";
  const fromUrl = guessAttachmentKindFromUrl(item.url ?? "");
  if (fromUrl !== "file") return fromUrl;
  return "file";
}

export function guessAttachmentKindFromUrl(url: string): AttachmentKind {
  const clean = url.split("?")[0]?.split("#")[0] ?? "";
  const ext = getAttachmentSuffix(clean.split(".").pop());
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (VIDEO_SUFFIXES.has(ext)) return "video";
  if (AUDIO_SUFFIXES.has(ext)) return "audio";
  return "file";
}

export function isPreviewableAttachment(item: {
  url?: string;
  mime_type?: string | null;
  suffix?: string | null;
  is_image?: boolean;
}): boolean {
  const kind = getAttachmentKind(item);
  return kind === "image" || kind === "video" || kind === "audio";
}

/** 将相对路径转为可访问的完整 URL */
export function resolveAttachmentUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  if (raw.startsWith("//")) {
    if (typeof window !== "undefined" && window.location?.protocol) {
      return `${window.location.protocol}${raw}`;
    }
    return `https:${raw}`;
  }
  const base = getApiBase();
  if (!base) return raw;
  const normalizedBase = base.replace(/\/$/, "");
  if (raw.startsWith(normalizedBase)) return raw;
  return raw.startsWith("/") ? `${normalizedBase}${raw}` : `${normalizedBase}/${raw}`;
}

/** 将字节数格式化为 B / KB / MB（1024 进制） */
export function formatAttachmentSize(bytes?: number | null): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "";
  const size = Math.floor(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    const kb = size / 1024;
    return `${kb >= 100 ? Math.round(kb) : Number(kb.toFixed(1))} KB`;
  }
  const mb = size / (1024 * 1024);
  return `${mb >= 100 ? Math.round(mb) : Number(mb.toFixed(2))} MB`;
}

export function formatAttachmentMeta(item: {
  size_byte?: number;
  size_info?: string;
  suffix?: string;
  mime_type?: string;
  image_width?: number | null;
  image_height?: number | null;
}): string {
  const sizeText =
    item.size_byte != null && item.size_byte >= 0
      ? formatAttachmentSize(item.size_byte)
      : item.size_info;
  const parts = [
    sizeText,
    item.suffix ? item.suffix.toUpperCase() : "",
    item.mime_type,
  ];
  if (item.image_width && item.image_height) {
    parts.push(`${item.image_width}×${item.image_height}`);
  }
  return parts.filter(Boolean).join(" · ");
}

export function formatAttachmentOwner(item: {
  owner_scope_label?: string;
  creator_nickname?: string | null;
  creator_username?: string | null;
}): string {
  const user = item.creator_nickname || item.creator_username || "未知用户";
  return `${item.owner_scope_label || "未知来源"} · ${user}`;
}

export function formatAttachmentTime(value?: string): string {
  if (!value) return "";
  return value.replace("T", " ").slice(0, 16);
}

/** 按文件大小估算上传超时（毫秒），默认至少 3 分钟，最大 15 分钟 */
export function estimateUploadTimeoutMs(fileSizeBytes: number): number {
  const minMs = 3 * 60 * 1000;
  const maxMs = 15 * 60 * 1000;
  const estimated = Math.ceil(fileSizeBytes / (512 * 1024)) * 1000;
  return Math.min(maxMs, Math.max(minMs, estimated));
}
