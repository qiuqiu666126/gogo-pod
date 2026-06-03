import type { SceneFormPreset } from "../../shared/sceneFormSchema";
import type { FeatureConfig, FeatureType } from "../types";
import type { AiFunctionDetailDto, AiFunctionSummaryDto } from "./aiFunctionApi";
import type { AiScenePresetDetailDto, AiScenePresetSummaryDto } from "./aiScenePresetApi";

const EMPTY_LIMITS: FeatureConfig["limits"] = {
  maxBatch: 0,
  maxQuantity: 0,
  supportedRatios: [],
};

export function mapAiFunctionSummaryToConfig(row: AiFunctionSummaryDto): FeatureConfig {
  return {
    featureType: row.code as FeatureType,
    label: row.label || row.name,
    category: row.category,
    description: row.description ?? "",
    enabled: row.enabled,
    modelId: row.modelId ?? "",
    provider: row.provider ?? "",
    apiBaseUrl: "",
    apiKey: "",
    hasApiKey: row.hasApiKey,
    systemPrompt: "",
    userPromptTemplate: "",
    defaultParams: {},
    paramMappings: [],
    limits: EMPTY_LIMITS,
    notes: "",
    updatedAt: row.updatedAt ?? "",
  };
}

export function mapAiFunctionDetailToConfig(row: AiFunctionDetailDto): FeatureConfig {
  return {
    ...mapAiFunctionSummaryToConfig(row),
    apiBaseUrl: row.apiBaseUrl ?? "",
    apiKey: row.apiKey ?? "",
    hasApiKey: (row.apiKey ?? "") !== "" || row.hasApiKey,
  };
}

export function mapAiScenePresetSummaryToFormPreset(row: AiScenePresetSummaryDto): SceneFormPreset {
  return {
    dbId: row.db_id,
    id: row.id,
    featureType: (row.featureCode || row.feature_code) as SceneFormPreset["featureType"],
    presetKind: (row.presetKind as SceneFormPreset["presetKind"]) || "scene-form",
    sceneKey: row.sceneKey,
    sceneLabel: row.sceneLabel,
    label: row.label,
    presetKey: row.presetKey,
    promptTemplate: row.promptTemplate ?? "",
    formFields: row.formFields ?? [],
    enabled: row.enabled,
    sortOrder: row.sortOrder ?? 0,
    updatedAt: row.updatedAt ?? "",
  };
}

export function mapAiScenePresetDetailToFormPreset(row: AiScenePresetDetailDto): SceneFormPreset {
  return {
    ...mapAiScenePresetSummaryToFormPreset(row),
    formFields: row.formFields ?? [],
  };
}
