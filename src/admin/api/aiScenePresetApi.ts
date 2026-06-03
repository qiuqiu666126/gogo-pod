import type { FormControl } from "../../shared/sceneFormSchema";
import type { FeatureType } from "../types";
import { adminHttp } from "./adminApi";

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
): Promise<AiScenePresetListDto> {
  return adminHttp.get<AiScenePresetListDto>("/admin/ai-scene-preset/list", {
    fallbackMessage: "获取场景预设列表失败",
    query: {
      feature_code: params.feature_code,
      enabled: params.enabled,
      keyword: params.keyword?.trim() || undefined,
    },
  });
}

export async function getAiScenePresetDetail(
  dbId: number,
): Promise<AiScenePresetDetailDto> {
  return adminHttp.get<AiScenePresetDetailDto>(
    `/admin/ai-scene-preset/${dbId}`,
    { fallbackMessage: "获取场景预设详情失败" },
  );
}

export async function createAiScenePreset(
  payload: AiScenePresetSavePayload,
): Promise<AiScenePresetDetailDto> {
  return adminHttp.post<AiScenePresetDetailDto>(
    "/admin/ai-scene-preset",
    payload,
    { fallbackMessage: "创建场景预设失败" },
  );
}

export async function updateAiScenePreset(
  dbId: number,
  payload: AiScenePresetSavePayload,
): Promise<AiScenePresetDetailDto> {
  return adminHttp.put<AiScenePresetDetailDto>(
    `/admin/ai-scene-preset/${dbId}`,
    payload,
    { fallbackMessage: "保存场景预设失败" },
  );
}

export async function deleteAiScenePreset(dbId: number): Promise<void> {
  await adminHttp.delete<unknown>(`/admin/ai-scene-preset/${dbId}`, {
    fallbackMessage: "删除场景预设失败",
  });
}
