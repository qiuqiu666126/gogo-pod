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

export type AiFunctionListParams = {
  keyword?: string;
  category?: FeatureCategory | "";
  enabled?: number;
};

function normalizeSummary(row: Partial<AiFunctionSummaryDto>): AiFunctionSummaryDto {
  return {
    id: Number(row.id ?? 0),
    code: String(row.code ?? ""),
    label: String(row.label ?? row.name ?? ""),
    name: String(row.name ?? row.label ?? ""),
    description: String(row.description ?? ""),
    category: (row.category === "video" ? "video" : "design") as FeatureCategory,
    category_code: String(row.category_code ?? (row.category === "video" ? "video" : "image")),
    modelId: String(row.modelId ?? ""),
    provider: String(row.provider ?? ""),
    enabled: Boolean(row.enabled),
    sort: Number(row.sort ?? 0),
    hasApiKey: Boolean(row.hasApiKey),
    apiKeyStatus: String(row.apiKeyStatus ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  };
}

function normalizeDetail(row: Partial<AiFunctionDetailDto>): AiFunctionDetailDto {
  return {
    ...normalizeSummary(row),
    apiBaseUrl: String(row.apiBaseUrl ?? ""),
    apiKey: String(row.apiKey ?? ""),
    createdAt: String(row.createdAt ?? row.updatedAt ?? ""),
  };
}

export async function listAiFunctions(
  params: AiFunctionListParams = {},
): Promise<AiFunctionSummaryDto[]> {
  const rows = await adminHttp.get<AiFunctionSummaryDto[]>("/admin/ai-function/list", {
    fallbackMessage: "获取 AI 功能列表失败",
    query: {
      keyword: params.keyword?.trim() || undefined,
      category: params.category || undefined,
      enabled: params.enabled,
    },
  });
  return (rows ?? []).map((row) => normalizeSummary(row));
}

export async function getAiFunctionMeta(): Promise<AiFunctionMetaDto> {
  return adminHttp.get<AiFunctionMetaDto>("/admin/ai-function/meta", {
    fallbackMessage: "获取 AI 功能元数据失败",
  });
}

export async function getAiFunctionDetail(code: FeatureType): Promise<AiFunctionDetailDto> {
  const row = await adminHttp.get<AiFunctionDetailDto>(
    `/admin/ai-function/${encodeURIComponent(code)}`,
    { fallbackMessage: "获取 AI 功能详情失败" },
  );
  return normalizeDetail(row);
}

export async function saveAiFunction(
  code: FeatureType,
  payload: AiFunctionSavePayload,
): Promise<AiFunctionDetailDto> {
  const row = await adminHttp.put<AiFunctionDetailDto>(
    `/admin/ai-function/${encodeURIComponent(code)}`,
    {
      label: payload.label ?? payload.name,
      description: payload.description,
      modelId: payload.modelId ?? payload.model_id,
      provider: payload.provider,
      apiBaseUrl: payload.apiBaseUrl ?? payload.api_base_url,
      apiKey: payload.apiKey ?? payload.api_key,
      enabled: payload.enabled,
    },
    { fallbackMessage: "保存 AI 功能配置失败" },
  );
  return normalizeDetail(row);
}

export async function updateAiFunctionStatus(
  code: FeatureType,
  enabled: boolean,
): Promise<AiFunctionDetailDto> {
  const row = await adminHttp.patch<AiFunctionDetailDto>(
    `/admin/ai-function/${encodeURIComponent(code)}/status`,
    { enabled },
    { fallbackMessage: "更新 AI 功能状态失败" },
  );
  return normalizeDetail(row);
}
