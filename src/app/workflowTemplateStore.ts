import { useSyncExternalStore } from "react";
import {
  WORKFLOW_CATEGORY_TABS,
  type WorkflowCategory,
  getOfficialWorkflowTemplatesForUser,
  getOfficialWorkflowTemplatesRecord,
  subscribeOfficialWorkflowTemplates,
} from "../shared/workflowTemplates";
import { showTaskActionSuccess } from "./taskToast";

export { WORKFLOW_CATEGORY_TABS, type WorkflowCategory };

export type WorkflowTemplateSource = "official" | "team" | "mine";

export type WorkflowTemplate = {
  id: string;
  name: string;
  steps: string[];
  stepConfigs?: Record<string, Record<string, unknown>>;
};

function getTeamTemplates(category: WorkflowCategory): WorkflowTemplate[] {
  return getOfficialWorkflowTemplatesForUser(category)
    .slice(0, 2)
    .map((item, index) => ({
      ...item,
      id: `team-${category}-${index}`,
      name: `${item.name}（团队）`,
    }));
}

function seedUser(): Record<WorkflowCategory, WorkflowTemplate[]> {
  const raw: Partial<Record<WorkflowCategory, { name: string; steps: string[] }[]>> = {
    服饰: [
      { name: "全幅连衣裙-裂变二创", steps: ["印花图提取", "图裂变", "一键抠图", "商品套图", "标题提取"] },
      { name: "热门T恤-走量跟款", steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"] },
    ],
    手机壳: [{ name: "手机壳-高还原度跟款", steps: ["印花图提取", "商品套图", "标题提取"] }],
  };
  const out = {} as Record<WorkflowCategory, WorkflowTemplate[]>;
  for (const category of WORKFLOW_CATEGORY_TABS) {
    out[category] = (raw[category] ?? []).map((item, index) => ({
      ...item,
      id: `mine-${category}-${index}`,
    }));
  }
  return out;
}

let userTemplates = seedUser();
let version = 0;
const listeners = new Set<() => void>();

function subscribeLocal(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function subscribe(listener: () => void) {
  const onOfficialChange = () => {
    version += 1;
    listener();
  };
  const unsubOfficial = subscribeOfficialWorkflowTemplates(onOfficialChange);
  const unsubLocal = subscribeLocal(listener);
  return () => {
    unsubOfficial();
    unsubLocal();
  };
}

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return version;
}

export function getWorkflowTemplates(
  source: WorkflowTemplateSource,
  category: WorkflowCategory,
): WorkflowTemplate[] {
  if (source === "official") return getOfficialWorkflowTemplatesForUser(category);
  if (source === "team") return getTeamTemplates(category);
  return userTemplates[category] ?? [];
}

export function findWorkflowTemplateById(id: string): WorkflowTemplate | undefined {
  for (const category of WORKFLOW_CATEGORY_TABS) {
    const found = getOfficialWorkflowTemplatesForUser(category).find((t) => t.id === id);
    if (found) return found;
  }
  for (const category of WORKFLOW_CATEGORY_TABS) {
    const team = getTeamTemplates(category).find((t) => t.id === id);
    if (team) return team;
  }
  for (const category of WORKFLOW_CATEGORY_TABS) {
    const found = userTemplates[category]?.find((t) => t.id === id);
    if (found) return found;
  }
  return undefined;
}

export function addUserWorkflowTemplate(
  category: WorkflowCategory,
  input: { name: string; steps: string[] },
) {
  const item: WorkflowTemplate = {
    id: `mine-${Date.now()}`,
    name: input.name.trim(),
    steps: [...input.steps],
  };
  userTemplates = {
    ...userTemplates,
    [category]: [...(userTemplates[category] ?? []), item],
  };
  emit();
  showTaskActionSuccess(`已添加到我的模版：${item.name}`);
  return item;
}

export function useWorkflowTemplateVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** 供创建工作流弹窗等沿用 */
export function getOfficialTemplatesRecord() {
  return getOfficialWorkflowTemplatesRecord();
}

export function getUserTemplatesRecord() {
  const record: Record<string, { name: string; steps: string[] }[]> = {};
  for (const category of WORKFLOW_CATEGORY_TABS) {
    record[category] = (userTemplates[category] ?? []).map(({ name, steps }) => ({ name, steps }));
  }
  return record;
}
