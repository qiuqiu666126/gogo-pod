/** 官方工作流模板（后台配置，localStorage 持久化，供用户端「官方」Tab 展示） */

import { migrateLocalStorageKey } from "./storageMigrate";

export const WORKFLOW_CATEGORY_TABS = [
  "服饰",
  "铁皮画",
  "家用纺织",
  "挂钟",
  "装饰画",
  "手机壳",
  "亚克力",
  "其他",
] as const;

export type WorkflowCategory = (typeof WORKFLOW_CATEGORY_TABS)[number];

export type WorkflowStepConfigs = Record<string, Record<string, unknown>>;

export type OfficialWorkflowTemplate = {
  id: string;
  category: WorkflowCategory;
  name: string;
  steps: string[];
  /** 各节点参数，按节点名称（如「印花图提取」）索引 */
  stepConfigs?: WorkflowStepConfigs;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};

const STORAGE_KEY = "pod_official_workflow_templates";
const LEGACY_STORAGE_KEY = "lingtu_official_workflow_templates";

const SEED: Omit<OfficialWorkflowTemplate, "id" | "sortOrder" | "updatedAt">[] = [
  { category: "服饰", name: "全幅连衣裙-裂变二创", steps: ["印花图提取", "图裂变", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "满印长袖衬衫-高还原跟款", steps: ["印花图提取", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "热门T恤-走量跟款", steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "长袖衬衫-满印", steps: ["印花图提取", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "T恤-走量跟款", steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "全副连衣裙-高还原度跟款", steps: ["印花图提取", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "T恤-防吃TRO跟款", steps: ["图案裁剪", "侵权风险过滤", "商品套图", "标题提取"], enabled: true },
  { category: "服饰", name: "卫衣-高核价通过率", steps: ["图案裁剪", "图裂变", "商品套图", "标题提取"], enabled: true },
  { category: "铁皮画", name: "铁皮画-爆款二创", steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "铁皮画", name: "铁皮画-走量跟款", steps: ["印花图提取", "一键抠图", "商品套图"], enabled: true },
  { category: "家用纺织", name: "床品四件套-满印", steps: ["印花图提取", "商品套图", "标题提取"], enabled: true },
  { category: "家用纺织", name: "抱枕-图案裂变", steps: ["图案裁剪", "图裂变", "商品套图", "标题提取"], enabled: true },
  { category: "挂钟", name: "挂钟-高还原度跟款", steps: ["印花图提取", "一键抠图", "商品套图"], enabled: true },
  { category: "挂钟", name: "挂钟-爆款二创", steps: ["图案裁剪", "商品套图", "标题提取"], enabled: true },
  { category: "装饰画", name: "装饰画-批量生成", steps: ["印花图提取", "商品套图", "标题提取"], enabled: true },
  { category: "装饰画", name: "装饰画-高还原跟款", steps: ["印花图提取", "一键抠图", "商品套图"], enabled: true },
  { category: "手机壳", name: "手机壳-爆款二创", steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "手机壳", name: "手机壳-高还原度跟款", steps: ["印花图提取", "商品套图", "标题提取"], enabled: true },
  { category: "手机壳", name: "手机壳-批量上架", steps: ["图案裁剪", "商品套图", "标题提取"], enabled: true },
  { category: "手机壳", name: "手机壳-侵权过滤", steps: ["图案裁剪", "侵权风险过滤", "商品套图"], enabled: true },
  { category: "亚克力", name: "亚克力摆件-批量生成", steps: ["印花图提取", "一键抠图", "商品套图"], enabled: true },
  { category: "亚克力", name: "亚克力钥匙扣-跟款", steps: ["图案裁剪", "商品套图", "标题提取"], enabled: true },
  { category: "其他", name: "通用-爆款二创", steps: ["图案裁剪", "一键抠图", "商品套图", "标题提取"], enabled: true },
  { category: "其他", name: "通用-高还原度", steps: ["印花图提取", "商品套图", "标题提取"], enabled: true },
];

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function buildSeed(): OfficialWorkflowTemplate[] {
  return SEED.map((item, index) => ({
    ...item,
    id: `official-${item.category}-${index}`,
    sortOrder: index,
    updatedAt: now(),
  }));
}

function readStorage(): OfficialWorkflowTemplate[] {
  if (typeof localStorage === "undefined") return buildSeed();
  migrateLocalStorageKey(STORAGE_KEY, LEGACY_STORAGE_KEY);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        return JSON.parse(legacy) as OfficialWorkflowTemplate[];
      }
      const seed = buildSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as OfficialWorkflowTemplate[];
  } catch {
    return buildSeed();
  }
}

function writeStorage(list: OfficialWorkflowTemplate[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

let cache = readStorage();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeOfficialWorkflowTemplates(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficialWorkflowTemplatesList(): OfficialWorkflowTemplate[] {
  return cache;
}

export function reloadOfficialWorkflowTemplates() {
  cache = readStorage();
  emit();
}

function saveList(list: OfficialWorkflowTemplate[]) {
  cache = list;
  writeStorage(list);
  emit();
}

export function createOfficialWorkflowTemplateId() {
  return `official-${Date.now()}`;
}

export function upsertOfficialWorkflowTemplate(
  input: Omit<OfficialWorkflowTemplate, "updatedAt"> & { updatedAt?: string },
) {
  const list = getOfficialWorkflowTemplatesList();
  const idx = list.findIndex((t) => t.id === input.id);
  const row: OfficialWorkflowTemplate = {
    ...input,
    updatedAt: input.updatedAt ?? now(),
  };
  if (idx >= 0) {
    saveList(list.map((t, i) => (i === idx ? row : t)));
  } else {
    saveList([...list, row]);
  }
}

export function deleteOfficialWorkflowTemplate(id: string) {
  saveList(getOfficialWorkflowTemplatesList().filter((t) => t.id !== id));
}

/** 用户端：按品类取已启用的官方模板 */
export function getOfficialWorkflowTemplatesForUser(category: WorkflowCategory) {
  return getOfficialWorkflowTemplatesList()
    .filter((t) => t.enabled && t.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name, steps, stepConfigs }) => ({ id, name, steps, stepConfigs }));
}

export function getOfficialWorkflowTemplatesRecord() {
  const record: Record<
    string,
    { name: string; steps: string[]; stepConfigs?: WorkflowStepConfigs }[]
  > = {};
  for (const category of WORKFLOW_CATEGORY_TABS) {
    record[category] = getOfficialWorkflowTemplatesForUser(category).map(
      ({ name, steps, stepConfigs }) => ({
        name,
        steps,
        stepConfigs,
      }),
    );
  }
  return record;
}
