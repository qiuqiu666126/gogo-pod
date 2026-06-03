import { appHttp, isApiEnabled } from "./apiClient";
import type { FeatureTaskType } from "../featureTasks";

export type PublicFeatureConfig = {
  featureType: FeatureTaskType;
  label: string;
  enabled: boolean;
  modelId: string;
  provider: string;
  hasApiKey: boolean;
  defaultParams: Record<string, unknown>;
};

export type FeaturePreset = {
  id: string;
  featureType: FeatureTaskType;
  presetKey: string;
  label: string;
  scene: string;
  promptTemplate: string;
};

let configCache: Map<FeatureTaskType, PublicFeatureConfig> | null = null;

/** 从后台拉取功能配置（不含 API Key） */
export async function loadFeatureConfigs(): Promise<Map<FeatureTaskType, PublicFeatureConfig>> {
  if (!isApiEnabled()) return new Map();
  try {
    const res = await appHttp.get<{ items: PublicFeatureConfig[] }>("/api/v1/config/features");
    const map = new Map<FeatureTaskType, PublicFeatureConfig>();
    for (const item of res.items) {
      if (item.enabled) map.set(item.featureType, item);
    }
    configCache = map;
    return map;
  } catch {
    return new Map();
  }
}

export async function getRuntimeModelId(type: FeatureTaskType, fallback: string): Promise<string> {
  if (!configCache) await loadFeatureConfigs();
  return configCache?.get(type)?.modelId ?? fallback;
}

export async function getFeaturePresets(type: FeatureTaskType, scene?: string) {
  if (!isApiEnabled()) return [];
  try {
    const res = await appHttp.get<{ items: FeaturePreset[] }>(
      `/api/v1/config/features/${type}/presets`,
      { query: scene ? { scene } : undefined },
    );
    return res.items;
  } catch {
    return [];
  }
}
