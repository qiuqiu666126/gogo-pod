/** 与前端 FeatureTaskType 对齐 */
export type FeatureType =
  | "pattern-extract"
  | "cutout"
  | "crack"
  | "text2img"
  | "vector"
  | "infringement"
  | "product-set"
  | "video";

export type TaskStatus = "pending" | "running" | "completed" | "failed";

export type FeatureConfigRow = {
  feature_type: FeatureType;
  label: string;
  enabled: number;
  model_id: string;
  provider: string;
  api_base_url: string;
  api_key: string;
  system_prompt: string;
  user_prompt_template: string;
  default_params: string;
  notes: string;
  updated_at: string;
};

export type FeaturePresetRow = {
  id: string;
  feature_type: FeatureType;
  preset_key: string;
  label: string;
  scene: string;
  param_key: string;
  prompt_template: string;
  extra_params: string;
  sort_order: number;
  enabled: number;
  updated_at: string;
};

export type TaskRow = {
  id: string;
  feature_type: FeatureType;
  model_id: string;
  status: TaskStatus;
  batch: string;
  quantity: number;
  params_json: string;
  template_configs_json: string;
  asset_ids_json: string;
  source_urls_json: string;
  result_json: string;
  error_message: string;
  remark: string;
  operator: string;
  created_at: string;
  updated_at: string;
};

export type FeatureConfigPublic = {
  featureType: FeatureType;
  label: string;
  enabled: boolean;
  modelId: string;
  provider: string;
  hasApiKey: boolean;
  defaultParams: Record<string, unknown>;
};

export type FeatureConfigAdmin = FeatureConfigPublic & {
  apiBaseUrl: string;
  apiKey: string;
  systemPrompt: string;
  userPromptTemplate: string;
  notes: string;
  updatedAt: string;
};

export type FeaturePresetDto = {
  id: string;
  featureType: FeatureType;
  presetKey: string;
  label: string;
  scene: string;
  paramKey: string;
  promptTemplate: string;
  extraParams: Record<string, unknown>;
  sortOrder: number;
  enabled: boolean;
  updatedAt: string;
};
