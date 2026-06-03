import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Loader2, Search, Trash2, Upload } from "lucide-react";
import {
  batchDeleteAttachments,
  deleteAttachment,
  listAttachments,
  uploadAttachment,
} from "../api/attachmentApi";
import type { AttachmentDto, AttachmentOwnerScope } from "../../shared/attachmentUtils";
import {
  formatAttachmentMeta,
  formatAttachmentTime,
  isPreviewableAttachment,
  isVideoAttachment,
} from "../../shared/attachmentUtils";
import { AdminShell } from "../components/AdminShell";
import { AttachmentPreviewModal } from "../components/AttachmentPreviewModal";
import { AttachmentThumbnail } from "../components/AttachmentThumbnail";
import { Badge, Btn, Card, inputCls } from "../components/ui";

const PAGE_SIZE = 20;

export function AttachmentsPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [ownerScope, setOwnerScope] = useState<AttachmentOwnerScope | "">("");
  const [fileType, setFileType] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AttachmentDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<AttachmentDto | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAttachments(
        {
          page,
          page_size: PAGE_SIZE,
          keyword: keyword || undefined,
          owner_scope: ownerScope || undefined,
          file_type: fileType || undefined,
        },
        { defaultFileType: false },
      );
      setItems(res.list);
      setTotal(res.total);
      setSelectedIds((prev) => prev.filter((id) => res.list.some((item) => item.id === id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载附件列表失败");
    } finally {
      setLoading(false);
    }
  }, [fileType, keyword, ownerScope, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleDeleteOne = async (id: number) => {
    if (!confirm("确定删除该附件？")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAttachment(id);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.length} 个附件？`)) return;
    setDeleting(true);
    setError("");
    try {
      await batchDeleteAttachments(selectedIds);
      setSelectedIds([]);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadAttachment(file);
      setPage(1);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const statsText = useMemo(() => {
    const imageCount = items.filter((item) => item.is_image).length;
    const videoCount = items.filter((item) => isVideoAttachment(item)).length;
    return `本页 ${items.length} 项，其中图片 ${imageCount} 项、视频 ${videoCount} 项`;
  }, [items]);

  return (
    <AdminShell title="附件管理" subtitle="管理后台与前台用户上传的文件，支持筛选与批量删除">
      <div className="p-6 space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${inputCls} w-[240px] pl-9`}
                placeholder="按文件名搜索…"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
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
            <select
              className={`${inputCls} w-auto min-w-[120px]`}
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类型</option>
              <option value="image">全部图片</option>
              <option value="video">全部视频</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
              <option value="gif">GIF</option>
              <option value="pdf">PDF</option>
            </select>
            <Btn variant="secondary" onClick={handleSearch}>
              搜索
            </Btn>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Btn
              variant="danger"
              disabled={deleting || selectedIds.length === 0}
              onClick={() => void handleBatchDelete()}
            >
              <span className="inline-flex items-center gap-1.5">
                <Trash2 size={14} />
                批量删除{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
              </span>
            </Btn>
            <Btn disabled={uploading} onClick={() => uploadInputRef.current?.click()}>
              {uploading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" /> 上传中…
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Upload size={14} /> 上传文件
                </span>
              )}
            </Btn>
            <input
              ref={uploadInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                void handleUpload(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">预览</th>
                  <th className="text-left px-4 py-3 font-medium">文件名</th>
                  <th className="text-left px-4 py-3 font-medium">类型 / 大小</th>
                  <th className="text-left px-4 py-3 font-medium">来源 / 上传者</th>
                  <th className="text-left px-4 py-3 font-medium">上传时间</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        加载中…
                      </span>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      暂无附件
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleOne(item.id)}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <AttachmentThumbnail
                          item={item}
                          className="h-14 w-14 rounded-lg border border-border"
                          fallbackClassName="h-14 w-14 rounded-lg border border-border"
                          interactive={isPreviewableAttachment(item)}
                          onClick={
                            isPreviewableAttachment(item)
                              ? () => setPreviewItem(item)
                              : undefined
                          }
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-foreground">{item.origin_name}</div>
                        <div className="mt-1 max-w-[280px] truncate text-[11px] text-muted-foreground">{item.url}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        <div>{formatAttachmentMeta(item)}</div>
                        {item.image_width && item.image_height ? (
                          <div className="mt-1 text-[11px]">
                            尺寸 {item.image_width}×{item.image_height}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge tone={item.owner_scope === "admin" ? "primary" : "default"}>
                          {item.owner_scope_label}
                        </Badge>
                        <div className="mt-1 text-[12px] text-muted-foreground">
                          {item.creator_nickname || item.creator_username || "未知用户"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatAttachmentTime(item.created_at)}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex items-center justify-end gap-3">
                          {isPreviewableAttachment(item) ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                              onClick={() => setPreviewItem(item)}
                            >
                              <Eye size={13} />
                              预览
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="text-[12px] text-destructive hover:underline disabled:opacity-50"
                            disabled={deleting}
                            onClick={() => void handleDeleteOne(item.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
            <span>
              共 {total} 项 · {statsText} · 第 {page} / {totalPages} 页
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
        </Card>

        <AttachmentPreviewModal
          item={previewItem}
          open={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
        />
      </div>
    </AdminShell>
  );
}
