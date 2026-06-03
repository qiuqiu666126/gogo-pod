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
export const IMAGE_SUFFIXES = "jpg,jpeg,png,gif,webp,svg,bmp";

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

export function formatAttachmentMeta(item: AttachmentDto): string {
  const parts = [
    item.size_info,
    item.suffix ? item.suffix.toUpperCase() : "",
    item.mime_type,
  ];
  if (item.image_width && item.image_height) {
    parts.push(`${item.image_width}×${item.image_height}`);
  }
  return parts.filter(Boolean).join(" · ");
}

export function formatAttachmentOwner(item: AttachmentDto): string {
  const user = item.creator_nickname || item.creator_username || "未知用户";
  return `${item.owner_scope_label} · ${user}`;
}

export function formatAttachmentTime(value?: string): string {
  if (!value) return "";
  return value.replace("T", " ").slice(0, 16);
}
