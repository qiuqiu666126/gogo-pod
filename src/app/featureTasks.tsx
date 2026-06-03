import { useSyncExternalStore } from "react";
import type { UploadedAsset } from "./api/uploadApi";
import { createRemoteTask, type ProductSetTemplateConfig } from "./api/taskApi";
import { executeFeatureTask, type ExecuteTaskPayload } from "./featureTaskApi";
import { getCurrentOperator } from "./appConstants";
import { syncTaskCenterFromFeatureTasks } from "./taskCenterStore";
import { showTaskCreatedSuccess } from "./taskToast";

export type FeatureTaskType =
  | "pattern-extract"
  | "cutout"
  | "crack"
  | "text2img"
  | "vector"
  | "infringement"
  | "product-set"
  | "title-extract"
  | "video";

export type FeatureTaskMediaKind = "image" | "video";

export type FeatureTaskStatus = "运行中" | "已完成" | "失败";

export type FeatureTaskParam = { label: string; value: string };

export type FeatureTaskResultItem = {
  id: string;
  sourceUrl: string;
  resultUrl: string;
  mediaKind: FeatureTaskMediaKind;
  discarded?: boolean;
};

export type FeatureTask = {
  id: string;
  type: FeatureTaskType;
  batch: string;
  preview: string;
  total: number;
  success: number;
  createdAt: string;
  operator: string;
  status: FeatureTaskStatus;
  params?: FeatureTaskParam[];
  remark?: string;
  items: FeatureTaskResultItem[];
  /** 上传素材 ID（对接后台 assets 表） */
  assetIds?: string[];
  sourceUrls?: string[];
};

export type SubmitFeatureTaskInput = {
  quantity?: number;
  params?: FeatureTaskParam[];
  templateConfigs?: ProductSetTemplateConfig[];
  preview?: string;
  sourceUrl?: string;
  sourceUrls?: string[];
  assetIds?: string[];
  mediaKind?: FeatureTaskMediaKind;
};

/** 将上传组件返回的素材转为任务提交参数 */
export function assetsToSubmitInput(
  assets: UploadedAsset[],
  rest?: Omit<SubmitFeatureTaskInput, "sourceUrls" | "assetIds" | "preview" | "sourceUrl">,
): SubmitFeatureTaskInput {
  const urls = assets.map((a) => a.url);
  return {
    ...rest,
    sourceUrls: urls,
    assetIds: assets.map((a) => a.id),
    preview: urls[0],
    sourceUrl: urls[0],
    quantity: rest?.quantity ?? Math.max(1, urls.length),
  };
}

export const FEATURE_TASK_LABELS: Record<FeatureTaskType, string> = {
  "pattern-extract": "印花图提取",
  cutout: "一键抠图",
  crack: "图裂变",
  text2img: "文生图",
  vector: "转矢量图",
  infringement: "侵权风险过滤",
  "product-set": "商品套图",
  "title-extract": "标题提取",
  video: "视频生成",
};

const DEFAULT_PREVIEWS: Record<FeatureTaskType, string> = {
  "pattern-extract":
    "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=120&h=120&fit=crop&auto=format",
  cutout: "https://images.unsplash.com/photo-1564349683136-77e08dba1e7d?w=120&h=120&fit=crop&auto=format",
  crack: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop&auto=format",
  text2img:
    "https://images.unsplash.com/photo-1509555190665-477ef7b7e931?w=120&h=120&fit=crop&auto=format",
  vector: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=120&h=120&fit=crop&auto=format",
  infringement:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop&auto=format",
  "product-set":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop&auto=format",
  "title-extract":
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=120&h=120&fit=crop&auto=format",
  video: "https://images.unsplash.com/photo-1529139574466-a303027c1d7b?w=120&h=120&fit=crop&auto=format",
};

function formatBatch(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${String(date.getFullYear()).slice(2)}${p(date.getMonth() + 1)}${p(date.getDate())}${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}${String(date.getMilliseconds()).padStart(3, "0")}`;
}

function formatDateTime(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

export function createFeatureTask(
  type: FeatureTaskType,
  overrides?: Partial<FeatureTask>,
): FeatureTask {
  const now = new Date();
  const quantity = overrides?.total ?? 1;
  return {
    id: `${type}-${now.getTime()}`,
    type,
    batch: formatBatch(now),
    preview: overrides?.preview ?? DEFAULT_PREVIEWS[type],
    total: quantity,
    success: 0,
    createdAt: formatDateTime(now),
    operator: getCurrentOperator(),
    status: "运行中",
    items: [],
    ...overrides,
  };
}

const emptyTasks: Record<FeatureTaskType, FeatureTask[]> = {
  "pattern-extract": [],
  cutout: [],
  crack: [],
  text2img: [],
  vector: [],
  infringement: [],
  "product-set": [],
  "title-extract": [],
  video: [],
};

let tasksByType: Record<FeatureTaskType, FeatureTask[]> = { ...emptyTasks };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getAllFeatureTasksFlat(): FeatureTask[] {
  return (Object.keys(tasksByType) as FeatureTaskType[]).flatMap((type) => tasksByType[type]);
}

function emit() {
  listeners.forEach((listener) => listener());
  syncTaskCenterFromFeatureTasks(getAllFeatureTasksFlat());
}

function patchTask(type: FeatureTaskType, taskId: string, patch: Partial<FeatureTask>) {
  tasksByType = {
    ...tasksByType,
    [type]: tasksByType[type].map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
  };
  emit();
}

export function addFeatureTask(type: FeatureTaskType, overrides?: Partial<FeatureTask>) {
  tasksByType = {
    ...tasksByType,
    [type]: [createFeatureTask(type, overrides), ...tasksByType[type]],
  };
  emit();
}

/** 提交任务：写入列表、同步任务中心，并异步调用后台 AI 模型 */
export function submitFeatureTask(type: FeatureTaskType, input?: SubmitFeatureTaskInput) {
  const sourceUrls =
    input?.sourceUrls ?? (input?.sourceUrl ? [input.sourceUrl] : undefined);
  const quantity = input?.quantity ?? Math.max(1, sourceUrls?.length ?? 1);
  const mediaKind = input?.mediaKind ?? (type === "video" ? "video" : "image");
  const preview = input?.preview ?? sourceUrls?.[0];

  const task = createFeatureTask(type, {
    total: quantity,
    success: 0,
    status: "运行中",
    params: input?.params,
    templateConfigs: input?.templateConfigs,
    preview,
    items: [],
    assetIds: input?.assetIds,
    sourceUrls,
  });

  tasksByType = {
    ...tasksByType,
    [type]: [task, ...tasksByType[type]],
  };
  emit();
  showTaskCreatedSuccess(type);

  const runExecution = (remoteTaskId?: string) => {
    const payload: ExecuteTaskPayload = {
      type,
      taskId: task.id,
      remoteTaskId,
      quantity,
      mediaKind,
      sourceUrl: sourceUrls?.[0],
      sourceUrls,
      assetIds: input?.assetIds,
    };
    return executeFeatureTask(payload);
  };

  void createRemoteTask({
    type,
    assetIds: input?.assetIds,
    sourceUrls,
    params: input?.params,
    templateConfigs: input?.templateConfigs,
    quantity,
  })
    .then((remote) => {
      if (remote?.batch) {
        patchTask(type, task.id, { batch: remote.batch });
      }
      return runExecution(remote?.id);
    })
    .then((result) => {
      const nextPreview =
        result.items.find((item) => !item.discarded)?.resultUrl ?? task.preview;
      patchTask(type, task.id, {
        status: "已完成",
        success: result.success,
        preview: nextPreview,
        items: result.items,
      });
    })
    .catch(() => {
      patchTask(type, task.id, { status: "失败", success: 0 });
    });

  return task.id;
}

export function getFeatureTasks(type: FeatureTaskType) {
  return tasksByType[type];
}

export function getFeatureTask(type: FeatureTaskType, taskId: string) {
  return tasksByType[type].find((t) => t.id === taskId);
}

export function getFeatureTaskById(taskId: string) {
  for (const type of Object.keys(tasksByType) as FeatureTaskType[]) {
    const task = getFeatureTask(type, taskId);
    if (task) return { type, task };
  }
  return null;
}

export function deleteFeatureTask(type: FeatureTaskType, taskId: string) {
  tasksByType = {
    ...tasksByType,
    [type]: tasksByType[type].filter((t) => t.id !== taskId),
  };
  emit();
}

export function updateFeatureTaskRemark(type: FeatureTaskType, taskId: string, remark: string) {
  patchTask(type, taskId, { remark });
}

export function discardFeatureTaskItem(
  type: FeatureTaskType,
  taskId: string,
  itemId: string,
  discarded = true,
) {
  const task = getFeatureTask(type, taskId);
  if (!task) return;
  patchTask(type, taskId, {
    items: task.items.map((item) =>
      item.id === itemId ? { ...item, discarded } : item,
    ),
  });
}

export function updateFeatureTaskItemResult(
  type: FeatureTaskType,
  taskId: string,
  itemId: string,
  resultUrl: string,
) {
  const task = getFeatureTask(type, taskId);
  if (!task) return;
  const items = task.items.map((item) =>
    item.id === itemId ? { ...item, resultUrl, discarded: false } : item,
  );
  patchTask(type, taskId, {
    items,
    preview: items.find((i) => !i.discarded)?.resultUrl ?? task.preview,
  });
}

export function useFeatureTasks(type: FeatureTaskType) {
  const tasks = useSyncExternalStore(
    subscribe,
    () => getFeatureTasks(type),
    () => getFeatureTasks(type),
  );

  return {
    tasks,
    addTask: (overrides?: Partial<FeatureTask>) => addFeatureTask(type, overrides),
    submitTask: (input?: SubmitFeatureTaskInput) => submitFeatureTask(type, input),
  };
}
