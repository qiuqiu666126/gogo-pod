import type { FeatureCategory, FeatureType } from "../types";
import { adminHttp } from "./adminApi";

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

export async function listAiFunctions(): Promise<AiFunctionSummaryDto[]> {
  return adminHttp.get<AiFunctionSummaryDto[]>("/admin/ai-function/list", {
    fallbackMessage: "获取 AI 功能列表失败",
  });
}

export async function getAiFunctionMeta(): Promise<AiFunctionMetaDto> {
  return adminHttp.get<AiFunctionMetaDto>("/admin/ai-function/meta", {
    fallbackMessage: "获取 AI 功能元数据失败",
  });
}

export async function getAiFunctionDetail(
  code: FeatureType,
): Promise<AiFunctionDetailDto> {
  return adminHttp.get<AiFunctionDetailDto>(
    `/admin/ai-function/${encodeURIComponent(code)}`,
    { fallbackMessage: "获取 AI 功能详情失败" },
  );
}

export async function saveAiFunction(
  code: FeatureType,
  payload: AiFunctionSavePayload,
): Promise<AiFunctionDetailDto> {
  return adminHttp.put<AiFunctionDetailDto>(
    `/admin/ai-function/${encodeURIComponent(code)}`,
    payload,
    { fallbackMessage: "保存 AI 功能配置失败" },
  );
}

export async function updateAiFunctionStatus(
  code: FeatureType,
  enabled: boolean,
): Promise<AiFunctionDetailDto> {
  return adminHttp.patch<AiFunctionDetailDto>(
    `/admin/ai-function/${encodeURIComponent(code)}/status`,
    { enabled },
    { fallbackMessage: "更新 AI 功能状态失败" },
  );
}
