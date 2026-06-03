import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderOpen,
  ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import type { AttachmentDto, AttachmentListParams, AttachmentOwnerScope } from "../../shared/attachmentUtils";
import {
  formatAttachmentMeta,
  formatAttachmentOwner,
  formatAttachmentTime,
  isPreviewableAttachment,
  resolveAttachmentUrl,
} from "../../shared/attachmentUtils";
import * as adminAttachmentApi from "../api/attachmentApi";
import * as frontAttachmentApi from "../../app/api/attachmentApi";
import { AttachmentPreviewModal } from "./AttachmentPreviewModal";
import { AttachmentThumbnail } from "./AttachmentThumbnail";
import { Btn, fieldInputCls, inputCls } from "./ui";

export type AttachmentPickerProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
  hint?: string;
  showUrlInput?: boolean;
  tone?: "light" | "dark";
  scope?: "admin" | "front";
};

function listAttachmentsByScope(scope: "admin" | "front", params: AttachmentListParams) {
  if (scope === "front") {
    return frontAttachmentApi.listMyAttachments(params);
  }
  return adminAttachmentApi.listAttachments(params);
}

function uploadAttachmentByScope(scope: "admin" | "front", file: File) {
  if (scope === "front") {
    return frontAttachmentApi.uploadMyAttachment(file);
  }
  return adminAttachmentApi.uploadAttachment(file);
}

function AttachmentLibraryModal({
  open,
  onClose,
  onSelect,
  scope,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  scope: "admin" | "front";
}) {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ownerScope, setOwnerScope] = useState<AttachmentOwnerScope | "">("");
  const [fileType, setFileType] = useState("image");
  const [items, setItems] = useState<Awaited<ReturnType<typeof listAttachmentsByScope>>["list"]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewItem, setPreviewItem] = useState<AttachmentDto | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 24;
  const isAdminScope = scope === "admin";

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAttachmentsByScope(scope, {
        page,
        page_size: pageSize,
        keyword: keyword || undefined,
        owner_scope: isAdminScope ? ownerScope : undefined,
        file_type: fileType || "image",
      });
      setItems(res.list);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载附件失败");
    } finally {
      setLoading(false);
    }
  }, [scope, fileType, isAdminScope, keyword, ownerScope, page]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setKeyword("");
    setSearchInput("");
    setOwnerScope("");
    setFileType("image");
    setError("");
    setItems([]);
    setTotal(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void loadList();
  }, [loadList, open]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const attachment = await uploadAttachmentByScope(scope, file);
      onSelect(attachment.url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <div className="text-[16px] font-semibold text-foreground">附件库</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              {isAdminScope ? "后台可管理全部附件，支持按来源与类型筛选" : "仅显示您本人上传的附件"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border/80 px-5 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="按文件名搜索…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKeyword(searchInput.trim());
                }
              }}
            />
          </div>
          {isAdminScope ? (
            <select
              className={`${inputCls} w-auto min-w-[120px]`}
              value={ownerScope}
              onChange={(e) => {
                setOwnerScope(e.target.value as AttachmentOwnerScope | "");
                setPage(1);
              }}
            >
              <option value="">全部来源</option>
              <option value="admin">后台上传</option>
              <option value="front">前台上传</option>
            </select>
          ) : null}
          <select
            className={`${inputCls} w-auto min-w-[120px]`}
            value={fileType}
            onChange={(e) => {
              setFileType(e.target.value);
              setPage(1);
            }}
          >
            <option value="image">全部图片</option>
            <option value="video">全部视频</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
            <option value="gif">GIF</option>
            <option value="svg">SVG</option>
          </select>
          <Btn
            variant="secondary"
            size="sm"
            onClick={() => {
              setPage(1);
              setKeyword(searchInput.trim());
            }}
          >
            搜索
          </Btn>
          <Btn size="sm" disabled={uploading} onClick={() => uploadInputRef.current?.click()}>
            {uploading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> 上传中…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Upload size={14} /> 上传图片
              </span>
            )}
          </Btn>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handleUpload(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </div>

        {error ? (
          <div className="mx-5 mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              加载中…
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-muted-foreground">
              暂无符合条件的附件
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-muted/10 transition hover:border-primary/50 hover:bg-muted/20 hover:shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className="flex w-full gap-3 p-3 text-left"
                  >
                    <AttachmentThumbnail
                      item={item}
                      className="h-20 w-20 shrink-0 rounded-lg border border-border"
                      fallbackClassName="h-20 w-20 shrink-0 rounded-lg border border-border"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="truncate text-[13px] font-medium text-foreground">{item.origin_name}</div>
                      <div className="text-[11px] leading-5 text-muted-foreground">{formatAttachmentMeta(item)}</div>
                      {isAdminScope ? (
                        <div className="text-[11px] text-muted-foreground">{formatAttachmentOwner(item)}</div>
                      ) : null}
                      <div className="text-[10px] text-muted-foreground/80">
                        {formatAttachmentTime(item.created_at)}
                      </div>
                    </div>
                  </button>
                  {isPreviewableAttachment(item) ? (
                    <button
                      type="button"
                      aria-label="预览附件"
                      className="absolute right-2 top-2 rounded-md bg-black/55 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/70"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPreviewItem(item);
                      }}
                    >
                      <Eye size={14} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <AttachmentPreviewModal
          item={previewItem}
          open={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          showOwner={isAdminScope}
        />

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
          <span>
            共 {total} 项，第 {page} / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <Btn
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={14} />
            </Btn>
            <Btn
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={14} />
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttachmentPicker({
  value,
  onChange,
  disabled = false,
  accept = "image/*",
  placeholder = "https://... 或从附件库选择 / 上传图片",
  hint,
  showUrlInput = true,
  tone = "light",
  scope = "admin",
}: AttachmentPickerProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [valuePreviewOpen, setValuePreviewOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = resolveAttachmentUrl(value);
  const isDark = tone === "dark";

  const valuePreviewItem = useMemo(() => {
    if (!value.trim()) return null;
    const name = value.split("?")[0]?.split("/").pop() || "当前附件";
    return {
      url: value,
      origin_name: name,
    };
  }, [value]);

  const canPreviewValue = valuePreviewItem ? isPreviewableAttachment(valuePreviewItem) : false;

  const actionBtnCls = isDark
    ? "inline-flex items-center gap-1 rounded-md border border-[#47484d] px-3 py-2 text-[11px] text-white/90 hover:border-[#d16d41] disabled:opacity-50"
    : "inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-[12px] text-foreground hover:border-primary/50 disabled:opacity-50";

  const inputClassName = isDark
    ? "w-full rounded-md border border-[#47484d] bg-[#121315] px-3 py-2 text-[12px] text-white placeholder:text-[#7f8189] focus:border-[#d16d41] focus:outline-none disabled:opacity-50"
    : fieldInputCls(Boolean(error));

  const handleUpload = async (file?: File) => {
    if (!file || disabled) return;
    setUploading(true);
    setError("");
    try {
      const attachment = await uploadAttachmentByScope(scope, file);
      onChange(attachment.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {showUrlInput ? (
          <input
            className={inputClassName}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              if (error) setError("");
            }}
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {previewUrl ? (
            <div className="relative">
              <AttachmentThumbnail
                item={{ url: value, origin_name: valuePreviewItem?.origin_name }}
                className={`h-14 w-14 shrink-0 rounded-lg border ${
                  isDark ? "border-[#47484d]" : "border-border"
                }`}
                fallbackClassName={`h-14 w-14 shrink-0 rounded-lg border ${
                  isDark ? "border-[#47484d]" : "border-border"
                }`}
                interactive={canPreviewValue}
                onClick={canPreviewValue ? () => setValuePreviewOpen(true) : undefined}
              />
              {canPreviewValue ? (
                <button
                  type="button"
                  aria-label="预览当前附件"
                  className="absolute -right-1 -top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/75"
                  onClick={() => setValuePreviewOpen(true)}
                >
                  <Eye size={11} />
                </button>
              ) : null}
            </div>
          ) : (
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed ${
                isDark ? "border-[#47484d] text-[#7f8189]" : "border-border text-muted-foreground"
              }`}
            >
              <ImageIcon size={18} />
            </div>
          )}

          <button
            type="button"
            className={actionBtnCls}
            disabled={disabled}
            onClick={() => setLibraryOpen(true)}
          >
            <FolderOpen size={13} className={isDark ? "" : "text-primary"} />
            从附件库选择
          </button>

          <button
            type="button"
            className={actionBtnCls}
            disabled={disabled || uploading}
            onClick={() => uploadInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 size={13} className="animate-spin" /> 上传中…
              </>
            ) : (
              <>
                <Upload size={13} className={isDark ? "" : "text-primary"} />
                上传图片
              </>
            )}
          </button>

          {value ? (
            <button
              type="button"
              className={`text-[12px] ${isDark ? "text-[#7f8189] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
              disabled={disabled}
              onClick={() => onChange("")}
            >
              清空
            </button>
          ) : null}

          <input
            ref={uploadInputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              void handleUpload(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </div>

        {hint ? (
          <p className={`text-[11px] ${isDark ? "text-[#7f8189]" : "text-muted-foreground"}`}>{hint}</p>
        ) : null}

        {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
      </div>

      <AttachmentLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setError("");
        }}
        scope={scope}
      />

      <AttachmentPreviewModal
        item={valuePreviewItem}
        open={valuePreviewOpen}
        onClose={() => setValuePreviewOpen(false)}
        showOwner={false}
      />
    </>
  );
}
