import type { FeatureTaskMediaKind, FeatureTaskResultItem, FeatureTaskType } from "./featureTasks";
import { http, isApiEnabled } from "./api/apiClient";
import { getRuntimeModelId } from "./api/featureConfigApi";

/** 各功能默认 AI 模型标识（后台未配置时的回退） */
export const FEATURE_AI_MODEL: Record<FeatureTaskType, string> = {
  "pattern-extract": "pod-pattern-extract-v2",
  cutout: "pod-cutout-v1",
  crack: "pod-image-fission-v1",
  text2img: "pod-text2img-v3",
  vector: "pod-vectorize-v1",
  infringement: "pod-infringement-v1",
  "product-set": "pod-mockup-set-v1",
  "title-extract": "pod-title-extract-v1",
  video: "pod-video-gen-v2",
};

const DEMO_SOURCE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=800&fit=crop&auto=format";

const DEMO_RESULT_IMAGE = new URL("../assets/task-demo/result-pattern.png", import.meta.url).href;

const DEMO_RESULT_VIDEO =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d7b?w=640&h=480&fit=crop&auto=format";

const DEMO_TITLE =
  "White T-Shirt Super Mario Character Print Casual Wear for Men and Women Gaming Fans Streetwear Style";

export type ExecuteTaskPayload = {
  type: FeatureTaskType;
  taskId: string;
  /** 后台任务 ID，有则调用 POST /api/v1/tasks/:id/run */
  remoteTaskId?: string;
  quantity?: number;
  mediaKind?: FeatureTaskMediaKind;
  sourceUrl?: string;
  sourceUrls?: string[];
  assetIds?: string[];
};

export type ExecuteTaskResult = {
  items: FeatureTaskResultItem[];
  success: number;
  failed: number;
};

/**
 * 执行任务：优先调用后台（读取 Admin 配置的模型与提示词），否则本地 Mock
 */
export async function executeFeatureTask(payload: ExecuteTaskPayload): Promise<ExecuteTaskResult> {
  const modelId = await getRuntimeModelId(payload.type, FEATURE_AI_MODEL[payload.type]);
  const mediaKind = payload.mediaKind ?? (payload.type === "video" ? "video" : "image");

  if (isApiEnabled() && payload.remoteTaskId) {
    try {
      const remote = await http.post<{
        items: FeatureTaskResultItem[];
        success: number;
        failed: number;
      }>(`/api/v1/tasks/${payload.remoteTaskId}/run`);
      if (remote?.items?.length) return remote;
    } catch {
      /* 回退 Mock */
    }
  }

  const sources =
    payload.sourceUrls && payload.sourceUrls.length > 0
      ? payload.sourceUrls
      : [payload.sourceUrl ?? DEMO_SOURCE];
  const quantity = Math.max(payload.quantity ?? 1, sources.length);

  await new Promise((resolve) => setTimeout(resolve, 1800 + Math.random() * 800));
  void modelId;
  void payload.assetIds;

  const items: FeatureTaskResultItem[] = Array.from({ length: quantity }, (_, i) => ({
    id: `${payload.taskId}-item-${i}`,
    sourceUrl: sources[i] ?? sources[0] ?? DEMO_SOURCE,
    resultUrl:
      payload.type === "title-extract"
        ? DEMO_TITLE
        : mediaKind === "video"
          ? DEMO_RESULT_VIDEO
          : DEMO_RESULT_IMAGE,
    mediaKind: payload.type === "title-extract" ? "image" : mediaKind,
    discarded: false,
  }));

  return {
    items,
    success: items.length,
    failed: 0,
  };
}
