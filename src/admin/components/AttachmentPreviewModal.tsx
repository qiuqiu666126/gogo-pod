import { ExternalLink, Music2, X } from "lucide-react";
import type { AttachmentOwnerScope } from "../../shared/attachmentUtils";
import {
  formatAttachmentMeta,
  formatAttachmentOwner,
  formatAttachmentTime,
  getAttachmentKind,
  resolveAttachmentUrl,
} from "../../shared/attachmentUtils";
import { AttachmentImage } from "./AttachmentImage";

export type AttachmentPreviewItem = {
  url: string;
  origin_name?: string;
  mime_type?: string | null;
  suffix?: string;
  is_image?: boolean;
  size_info?: string;
  size_byte?: number;
  owner_scope?: AttachmentOwnerScope;
  owner_scope_label?: string;
  creator_username?: string | null;
  creator_nickname?: string | null;
  created_at?: string;
  image_width?: number | null;
  image_height?: number | null;
  id?: number;
};

type AttachmentPreviewModalProps = {
  item: AttachmentPreviewItem | null;
  open: boolean;
  onClose: () => void;
  showOwner?: boolean;
};

export function AttachmentPreviewModal({
  item,
  open,
  onClose,
  showOwner = true,
}: AttachmentPreviewModalProps) {
  if (!open || !item) return null;

  const url = resolveAttachmentUrl(item.url);
  const kind = getAttachmentKind(item);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold text-foreground">
              {item.origin_name || "附件预览"}
            </div>
            {item.size_info || item.suffix || item.mime_type ? (
              <div className="mt-1 text-[12px] text-muted-foreground">{formatAttachmentMeta(item)}</div>
            ) : null}
            {showOwner && item.owner_scope_label ? (
              <div className="mt-1 text-[12px] text-muted-foreground">{formatAttachmentOwner(item)}</div>
            ) : null}
            {item.created_at ? (
              <div className="mt-1 text-[11px] text-muted-foreground">{formatAttachmentTime(item.created_at)}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="关闭预览"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/20 p-5">
          {kind === "image" ? (
            <AttachmentImage
              url={item.url}
              alt={item.origin_name}
              className="max-h-[70vh] max-w-full rounded-lg object-contain"
              fallbackClassName="flex h-40 w-40 items-center justify-center rounded-lg border border-border"
            />
          ) : null}

          {kind === "video" ? (
            <video
              src={url}
              controls
              playsInline
              preload="metadata"
              className="max-h-[70vh] max-w-full rounded-lg bg-black"
            />
          ) : null}

          {kind === "audio" ? (
            <div className="w-full max-w-[640px] space-y-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Music2 size={28} />
                <div>
                  <div className="text-[14px] font-medium text-foreground">{item.origin_name}</div>
                  <div className="text-[12px]">{item.mime_type || item.suffix.toUpperCase()}</div>
                </div>
              </div>
              <audio src={url} controls preload="metadata" className="w-full" />
            </div>
          ) : null}

          {kind === "file" ? (
            <div className="space-y-4 text-center">
              <div className="text-[14px] text-foreground">该文件类型暂不支持内嵌预览</div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-[13px] text-primary hover:bg-muted/40"
              >
                <ExternalLink size={14} />
                在新窗口打开
              </a>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
          <span className="truncate">{item.url}</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink size={13} />
            打开原文件
          </a>
        </div>
      </div>
    </div>
  );
}
