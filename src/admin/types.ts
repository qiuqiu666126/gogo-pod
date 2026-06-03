export type FeatureType =
  | "pattern-extract"
  | "cutout"
  | "crack"
  | "text2img"
  | "vector"
  | "infringement"
  | "product-set"
  | "video";

export type FeatureCategory = "design" | "video";

export type ParamMapping = {
  id: string;
  /** 前台表单项 / params.label */
  uiLabel: string;
  /** 提示词模板变量名 */
  templateVar: string;
  /** 控件类型说明 */
  controlType: string;
  required: boolean;
  notes: string;
};

export type FeatureConfig = {
  featureType: FeatureType;
  label: string;
  category: FeatureCategory;
  description: string;
  enabled: boolean;
  modelId: string;
  provider: string;
  apiBaseUrl: string;
  apiKey: string;
  hasApiKey: boolean;
  systemPrompt: string;
  userPromptTemplate: string;
  defaultParams: Record<string, unknown>;
  paramMappings: ParamMapping[];
  limits: {
    maxBatch: number;
    maxQuantity: number;
    supportedRatios: string[];
  };
  notes: string;
  updatedAt: string;
};

export type FeaturePreset = {
  id: string;
  featureType: FeatureType;
  presetKey: string;
  label: string;
  scene: string;
  sceneLabel: string;
  promptTemplate: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AdminTask = {
  id: string;
  featureType: FeatureType;
  batch: string;
  status: "pending" | "running" | "completed" | "failed";
  modelId: string;
  quantity: number;
  operator: string;
  paramsSummary: string;
  createdAt: string;
};

export type NavId =
  | "dashboard"
  | "features"
  | "presets"
  | "recommendations"
  | "workflow-templates"
  | "product-set-templates"
  | "publish-templates"
  | "users"
  | "tasks"
  | "settings";
