import { useSyncExternalStore } from "react";
import { getCurrentOperator } from "./appConstants";
import { showWorkflowCreatedSuccess } from "./taskToast";

export type WorkflowTaskStatus = "已完成" | "运行中" | "已终止" | "失败";

export type WorkflowTask = {
  id: string;
  preview: string;
  batch: string;
  steps: string[];
  createdAt: string;
  operator: string;
  status: WorkflowTaskStatus;
  remark?: string;
};

const SEED_TASKS: WorkflowTask[] = [
  {
    id: "wf-1",
    preview: new URL("./assets/task-demo/result-pattern.png", import.meta.url).href,
    batch: "260520165455568",
    steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"],
    createdAt: "2026-05-20 16:54:56",
    operator: getCurrentOperator(),
    status: "已完成",
  },
  {
    id: "wf-2",
    preview:
      "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=120&h=120&fit=crop&auto=format",
    batch: "260519152245692",
    steps: ["印花图提取", "图裂变", "商品套图", "标题提取"],
    createdAt: "2026-05-19 15:22:45",
    operator: getCurrentOperator(),
    status: "已终止",
  },
  {
    id: "wf-3",
    preview:
      "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=120&h=120&fit=crop&auto=format",
    batch: "260519152242968",
    steps: ["印花图提取", "图裂变", "商品套图", "标题提取"],
    createdAt: "2026-05-19 15:22:42",
    operator: getCurrentOperator(),
    status: "已完成",
  },
];

let tasks: WorkflowTask[] = [...SEED_TASKS];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

function formatBatch(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${String(date.getFullYear()).slice(2)}${p(date.getMonth() + 1)}${p(date.getDate())}${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}${String(date.getMilliseconds()).padStart(3, "0")}`;
}

function formatDateTime(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

export function addWorkflowTask(input: {
  steps: string[];
  preview?: string;
  templateName?: string;
  remark?: string;
}) {
  const now = new Date();
  const task: WorkflowTask = {
    id: `wf-${now.getTime()}`,
    preview:
      input.preview ??
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop&auto=format",
    batch: formatBatch(now),
    steps: input.steps,
    createdAt: formatDateTime(now),
    operator: getCurrentOperator(),
    status: "运行中",
    remark: input.remark?.trim() || input.templateName,
  };
  tasks = [task, ...tasks];
  emit();
  showWorkflowCreatedSuccess(input.templateName);
  return task.id;
}

export function getWorkflowTasks() {
  return tasks;
}

export function getWorkflowTask(id: string) {
  return tasks.find((t) => t.id === id);
}

export function useWorkflowTasks() {
  return useSyncExternalStore(subscribe, () => tasks, () => tasks);
}

export function deleteWorkflowTask(id: string) {
  tasks = tasks.filter((t) => t.id !== id);
  emit();
}
