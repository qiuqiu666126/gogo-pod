import { http } from "../../shared/http";
import type { FeatureCategory, FeatureType } from "../types";
import { assertSuccess, authHeaders, getAdminAuthHeaders, type AdminApiResponse } from "./adminApi";
import { FEATURE_LABELS } from "../data/initialData";

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
  const res = await http.get<{ items: Array<Record<string, unknown>> }>("/api/admin/v1/feature-configs", {
    headers: await getAdminAuthHeaders(),
  });
  return (res.items ?? []).map((row) => ({
    id: 0,
    code: String(row.featureType ?? ""),
    label: String(row.label ?? FEATURE_LABELS[String(row.featureType ?? "") as FeatureType] ?? ""),
    name: String(row.label ?? FEATURE_LABELS[String(row.featureType ?? "") as FeatureType] ?? ""),
    description: String(row.notes ?? ""),
    category: (String(row.featureType) === "video" ? "video" : "design") as FeatureCategory,
    category_code: String(String(row.featureType) === "video" ? "video" : "design"),
    modelId: String(row.modelId ?? ""),
    provider: String(row.provider ?? ""),
    enabled: Boolean(row.enabled),
    sort: 0,
    hasApiKey: Boolean(row.hasApiKey),
    apiKeyStatus: Boolean(row.hasApiKey) ? "configured" : "empty",
    updatedAt: String(row.updatedAt ?? ""),
  }));
}

export async function getAiFunctionMeta(accessToken: string): Promise<AiFunctionMetaDto> {
  return {
    providers: [
      { value: "openai-compatible", label: "OpenAI Compatible" },
      { value: "replicate", label: "Replicate" },
      { value: "custom", label: "Custom" },
    ],
    categories: [
      { value: "design", label: "作图" },
      { value: "video", label: "视频" },
    ],
    features: Object.entries(FEATURE_LABELS).map(([code, label]) => ({
      value: code,
      label,
      code,
    })),
  };
}

export async function getAiFunctionDetail(
  code: FeatureType,
  accessToken: string,
): Promise<AiFunctionDetailDto> {
  const res = await http.get<Record<string, unknown>>(
    `/api/admin/v1/feature-configs/${encodeURIComponent(code)}`,
    { headers: await getAdminAuthHeaders() },
  );
  return {
    id: 0,
    code,
    label: String(res.label ?? FEATURE_LABELS[code]),
    name: String(res.label ?? FEATURE_LABELS[code]),
    description: String(res.notes ?? ""),
    category: (code === "video" ? "video" : "design") as FeatureCategory,
    category_code: code === "video" ? "video" : "design",
    modelId: String(res.modelId ?? ""),
    provider: String(res.provider ?? ""),
    enabled: Boolean(res.enabled),
    sort: 0,
    hasApiKey: Boolean(res.hasApiKey),
    apiKeyStatus: Boolean(res.hasApiKey) ? "configured" : "empty",
    updatedAt: String(res.updatedAt ?? ""),
    apiBaseUrl: String(res.apiBaseUrl ?? ""),
    apiKey: String(res.apiKey ?? ""),
    createdAt: String(res.updatedAt ?? ""),
  };
}

export async function saveAiFunction(
  code: FeatureType,
  payload: AiFunctionSavePayload,
  accessToken: string,
): Promise<AiFunctionDetailDto> {
  const res = await http.put<Record<string, unknown>>(
    `/api/admin/v1/feature-configs/${encodeURIComponent(code)}`,
    {
      label: payload.label ?? payload.name,
      description: payload.description,
      modelId: payload.modelId ?? payload.model_id,
      provider: payload.provider,
      apiBaseUrl: payload.apiBaseUrl ?? payload.api_base_url,
      apiKey: payload.apiKey ?? payload.api_key,
      enabled: payload.enabled,
    },
    { headers: await getAdminAuthHeaders() },
  );
  return {
    id: 0,
    code,
    label: String(res.label ?? FEATURE_LABELS[code]),
    name: String(res.label ?? FEATURE_LABELS[code]),
    description: String(res.notes ?? ""),
    category: (code === "video" ? "video" : "design") as FeatureCategory,
    category_code: code === "video" ? "video" : "design",
    modelId: String(res.modelId ?? ""),
    provider: String(res.provider ?? ""),
    enabled: Boolean(res.enabled),
    sort: 0,
    hasApiKey: Boolean(res.hasApiKey),
    apiKeyStatus: Boolean(res.hasApiKey) ? "configured" : "empty",
    updatedAt: String(res.updatedAt ?? ""),
    apiBaseUrl: String(res.apiBaseUrl ?? ""),
    apiKey: String(res.apiKey ?? ""),
    createdAt: String(res.updatedAt ?? ""),
  };
}

export async function updateAiFunctionStatus(
  code: FeatureType,
  enabled: boolean,
  accessToken: string,
): Promise<AiFunctionDetailDto> {
  return saveAiFunction(code, { enabled }, accessToken);
}
