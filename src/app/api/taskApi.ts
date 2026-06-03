import { getApiBase, http } from "./apiClient";
import type { FeatureTaskParam, FeatureTaskType } from "../featureTasks";
import { FEATURE_AI_MODEL } from "../featureTaskApi";
import type { ProductSetMockupImage } from "../../shared/productSetTemplates";

export type ProductSetTemplateConfig = {
  templateId: string;
  templateName: string;
  category: string;
  images: ProductSetMockupImage[];
  promptTemplate?: string;
};

export type CreateRemoteTaskBody = {
  type: FeatureTaskType;
  modelId: string;
  assetIds?: string[];
  sourceUrls?: string[];
  params?: FeatureTaskParam[];
  templateConfigs?: ProductSetTemplateConfig[];
  quantity?: number;
  remark?: string;
};

export type CreateRemoteTaskResponse = {
  id: string;
  batch?: string;
};

/** 在后台创建任务记录；无 API 地址时返回 null，由前端本地 store 管理 */
export async function createRemoteTask(
  body: CreateRemoteTaskBody,
): Promise<CreateRemoteTaskResponse | null> {
  if (!getApiBase() && !import.meta.env.DEV) return null;

  try {
    return await http.post<CreateRemoteTaskResponse>(
      "/api/v1/tasks",
      {
        ...body,
        modelId: body.modelId || FEATURE_AI_MODEL[body.type],
      },
    );
  } catch {
    return null;
  }
}
