import {
  IMAGE_FILE_TYPE,
  type AttachmentDto,
  type AttachmentListDto,
  type AttachmentListParams,
} from "../../shared/attachmentUtils";
export {
  formatAttachmentMeta,
  formatAttachmentOwner,
  formatAttachmentTime,
  resolveAttachmentUrl,
  type AttachmentDto,
  type AttachmentListDto,
  type AttachmentListParams,
  type AttachmentOwnerScope,
} from "../../shared/attachmentUtils";
import { adminHttp } from "./adminApi";

export async function listAttachments(
  params: AttachmentListParams = {},
  options?: { defaultFileType?: string | false },
): Promise<AttachmentListDto> {
  const defaultFileType =
    options?.defaultFileType === false ? undefined : (options?.defaultFileType ?? IMAGE_FILE_TYPE);
  const fileType =
    params.file_type === undefined ? defaultFileType : params.file_type || undefined;

  return adminHttp.get<AttachmentListDto>("/admin/attachment/list", {
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 24,
      suffix: params.suffix,
      mime_type: params.mime_type,
      keyword: params.keyword?.trim() || params.origin_name?.trim() || undefined,
      owner_scope: params.owner_scope || undefined,
      file_type: fileType,
    },
    fallbackMessage: "获取附件列表失败",
  });
}

export async function uploadAttachment(file: File): Promise<AttachmentDto> {
  const formData = new FormData();
  formData.append("file", file);
  return adminHttp.post<AttachmentDto>("/admin/attachment/upload", formData, {
    fallbackMessage: "上传附件失败",
  });
}

export async function deleteAttachment(id: number): Promise<void> {
  await adminHttp.delete<unknown>(`/admin/attachment/${id}`, {
    fallbackMessage: "删除附件失败",
  });
}

export async function batchDeleteAttachments(ids: number[]): Promise<{ deleted: number }> {
  return adminHttp.post<{ deleted: number }>(
    "/admin/attachment/batch-delete",
    { ids },
    { fallbackMessage: "批量删除附件失败" },
  );
}
