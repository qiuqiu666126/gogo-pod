import { appHttp } from "./apiClient";
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
} from "../../shared/attachmentUtils";

export async function listMyAttachments(params: AttachmentListParams = {}): Promise<AttachmentListDto> {
  return appHttp.get<AttachmentListDto>("/api/v1/attachment/list", {
    assertSuccess: true,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 24,
      suffix: params.suffix,
      mime_type: params.mime_type,
      keyword: params.keyword?.trim() || params.origin_name?.trim() || undefined,
      file_type: params.file_type || IMAGE_FILE_TYPE,
    },
    fallbackMessage: "获取附件列表失败",
  });
}

export async function uploadMyAttachment(file: File): Promise<AttachmentDto> {
  const formData = new FormData();
  formData.append("file", file);
  return appHttp.post<AttachmentDto>("/api/v1/attachment/upload", formData, {
    assertSuccess: true,
    fallbackMessage: "上传附件失败",
  });
}

export async function deleteMyAttachment(id: number): Promise<void> {
  await appHttp.delete<unknown>(`/api/v1/attachment/${id}`, {
    assertSuccess: true,
    fallbackMessage: "删除附件失败",
  });
}
