import { http } from "../../shared/http";
import type { FeatureCategory, FeatureType } from "../types";
import { assertSuccess, authHeaders, getAdminAuthHeaders, type AdminApiResponse } from "./adminApi";

export type AiFunctionSummaryDto = {
  id: number;
  code: string;
  label: string;
  name: string;
  description: string;
  category: FeatureCategory;
  category_code: string;
  modelId: string;
  provider: string;
  enabled: boolean;
  sort: number;
  hasApiKey: boolean;
  apiKeyStatus: string;
  updatedAt: string;
};

export type AiFunctionDetailDto = AiFunctionSummaryDto & {
  apiBaseUrl: string;
  apiKey: string;
  createdAt: string;
};

export type AiFunctionMetaDto = {
  providers: Array<{ value: string; label: string; code?: string }>;
  categories: Array<{ value: string; label: string; code?: string }>;
  features: Array<{ value: string; label: string; code: string; enabled?: boolean }>;
};

export type AiFunctionSavePayload = {
  name?: string;
  label?: string;
  description?: string;
  modelId?: string;
  model_id?: string;
  provider?: string;
  apiBaseUrl?: string;
  api_base_url?: string;
  apiKey?: string;
  api_key?: string;
  enabled?: boolean;
};

export async function listAiFunctions(accessToken: string): Promise<AiFunctionSummaryDto[]> {
  const res = await http.get<AdminApiResponse<AiFunctionSummaryDto[]>>("/admin/ai-function/list", {
    headers: await getAdminAuthHeaders(),
  });
  return assertSuccess(res, "获取 AI 功能列表失败");
}

export async function getAiFunctionMeta(accessToken: string): Promise<AiFunctionMetaDto> {
  const res = await http.get<AdminApiResponse<AiFunctionMetaDto>>("/admin/ai-function/meta", {
    headers: await getAdminAuthHeaders(),
  });
  return assertSuccess(res, "获取 AI 功能元数据失败");
}

export async function getAiFunctionDetail(
  code: FeatureType,
  accessToken: string,
): Promise<AiFunctionDetailDto> {
  const res = await http.get<AdminApiResponse<AiFunctionDetailDto>>(
    `/admin/ai-function/${encodeURIComponent(code)}`,
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "获取 AI 功能详情失败");
}

export async function saveAiFunction(
  code: FeatureType,
  payload: AiFunctionSavePayload,
  accessToken: string,
): Promise<AiFunctionDetailDto> {
  const res = await http.put<AdminApiResponse<AiFunctionDetailDto>>(
    `/admin/ai-function/${encodeURIComponent(code)}`,
    payload,
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "保存 AI 功能配置失败");
}

export async function updateAiFunctionStatus(
  code: FeatureType,
  enabled: boolean,
  accessToken: string,
): Promise<AiFunctionDetailDto> {
  const res = await http.patch<AdminApiResponse<AiFunctionDetailDto>>(
    `/admin/ai-function/${encodeURIComponent(code)}/status`,
    { enabled },
    { headers: await getAdminAuthHeaders() },
  );
  return assertSuccess(res, "更新 AI 功能状态失败");
}
