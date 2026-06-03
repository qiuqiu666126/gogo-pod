import { http } from "../../shared/http";
import type { FormControl } from "../../shared/sceneFormSchema";
import type { FeatureType } from "../types";
import { assertSuccess, authHeaders, type AdminApiResponse } from "./adminApi";

export type AiScenePresetSummaryDto = {
  db_id: number;
  id: string;
  featureCode: string;
  feature_code: string;
  presetKind: string;
  sceneKey: string;
  sceneLabel: string;
  label: string;
  presetKey: string;
  promptTemplate: string;
  formFields?: FormControl[];
  control_count?: number;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AiScenePresetDetailDto = AiScenePresetSummaryDto & {
  formFields: FormControl[];
  created_by?: number;
  updated_by?: number;
  created_at?: string;
};

export type AiScenePresetListDto = {
  list: AiScenePresetSummaryDto[];
  total: number;
};

export type AiScenePresetSavePayload = {
  id?: string;
  featureCode: FeatureType;
  presetKind?: string;
  sceneKey: string;
  sceneLabel?: string;
  label: string;
  presetKey?: string;
  promptTemplate?: string;
  formFields?: FormControl[];
  enabled?: boolean;
  sortOrder?: number;
};

export type AiScenePresetListParams = {
  feature_code?: FeatureType;
  enabled?: number;
  keyword?: string;
};

export async function listAiScenePresets(
  params: AiScenePresetListParams,
  accessToken: string,
): Promise<AiScenePresetListDto> {
  const res = await http.get<AdminApiResponse<AiScenePresetListDto>>("/admin/ai-scene-preset/list", {
    headers: authHeaders(accessToken),
    query: {
      feature_code: params.feature_code,
      enabled: params.enabled,
      keyword: params.keyword?.trim() || undefined,
    },
  });
  return assertSuccess(res, "获取场景预设列表失败");
}

export async function getAiScenePresetDetail(
  dbId: number,
  accessToken: string,
): Promise<AiScenePresetDetailDto> {
  const res = await http.get<AdminApiResponse<AiScenePresetDetailDto>>(
    `/admin/ai-scene-preset/${dbId}`,
    { headers: authHeaders(accessToken) },
  );
  return assertSuccess(res, "获取场景预设详情失败");
}

export async function createAiScenePreset(
  payload: AiScenePresetSavePayload,
  accessToken: string,
): Promise<AiScenePresetDetailDto> {
  const res = await http.post<AdminApiResponse<AiScenePresetDetailDto>>(
    "/admin/ai-scene-preset",
    payload,
    { headers: authHeaders(accessToken) },
  );
  return assertSuccess(res, "创建场景预设失败");
}

export async function updateAiScenePreset(
  dbId: number,
  payload: AiScenePresetSavePayload,
  accessToken: string,
): Promise<AiScenePresetDetailDto> {
  const res = await http.put<AdminApiResponse<AiScenePresetDetailDto>>(
    `/admin/ai-scene-preset/${dbId}`,
    payload,
    { headers: authHeaders(accessToken) },
  );
  return assertSuccess(res, "保存场景预设失败");
}

export async function deleteAiScenePreset(dbId: number, accessToken: string): Promise<void> {
  const res = await http.delete<AdminApiResponse<unknown>>(`/admin/ai-scene-preset/${dbId}`, {
    headers: authHeaders(accessToken),
  });
  assertSuccess(res, "删除场景预设失败");
}
