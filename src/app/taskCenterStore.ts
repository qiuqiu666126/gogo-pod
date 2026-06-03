import { useSyncExternalStore } from "react";
import {
  FEATURE_TASK_LABELS,
  type FeatureTask,
  type FeatureTaskType,
} from "./featureTasks";

export type TaskCenterRecord = FeatureTask & {
  typeLabel: string;
};

let records: TaskCenterRecord[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

function parseCreatedAt(createdAt: string) {
  return new Date(createdAt.replace(/-/g, "/")).getTime() || 0;
}

/** 从各功能任务列表同步到任务中心（按创建时间倒序） */
export function syncTaskCenterFromFeatureTasks(tasks: FeatureTask[]) {
  records = tasks
    .map((task) => ({
      ...task,
      typeLabel: FEATURE_TASK_LABELS[task.type],
    }))
    .sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
  emit();
}

export function getTaskCenterRecords() {
  return records;
}

export function useTaskCenterRecords() {
  return useSyncExternalStore(
    subscribe,
    () => getTaskCenterRecords(),
    () => getTaskCenterRecords(),
  );
}

export function getTaskCenterRecord(taskId: string) {
  return records.find((r) => r.id === taskId);
}

export function getTaskCenterRecordWithType(taskId: string): {
  type: FeatureTaskType;
  task: FeatureTask;
} | null {
  const row = getTaskCenterRecord(taskId);
  if (!row) return null;
  return { type: row.type, task: row };
}
