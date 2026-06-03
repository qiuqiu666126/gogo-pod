import type {
  FeatureConfigAdmin,
  FeatureConfigPublic,
  FeatureConfigRow,
  FeaturePresetDto,
  FeaturePresetRow,
} from "../types.js";
import { parseJson } from "../db.js";

export function toPublicConfig(row: FeatureConfigRow): FeatureConfigPublic {
  return {
    featureType: row.feature_type,
    label: row.label,
    enabled: Boolean(row.enabled),
    modelId: row.model_id,
    provider: row.provider,
    hasApiKey: Boolean(row.api_key?.trim()),
    defaultParams: parseJson(row.default_params, {}),
  };
}

export function toAdminConfig(row: FeatureConfigRow): FeatureConfigAdmin {
  return {
    ...toPublicConfig(row),
    apiBaseUrl: row.api_base_url,
    apiKey: row.api_key,
    systemPrompt: row.system_prompt,
    userPromptTemplate: row.user_prompt_template,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

export function toPresetDto(row: FeaturePresetRow): FeaturePresetDto {
  return {
    id: row.id,
    featureType: row.feature_type,
    presetKey: row.preset_key,
    label: row.label,
    scene: row.scene,
    paramKey: row.param_key,
    promptTemplate: row.prompt_template,
    extraParams: parseJson(row.extra_params, {}),
    sortOrder: row.sort_order,
    enabled: Boolean(row.enabled),
    updatedAt: row.updated_at,
  };
}

/** 将 {{key}} 占位符替换为 params 中的值 */
export function renderPromptTemplate(
  template: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = params[key];
    return v === undefined || v === null ? "" : String(v);
  });
}
