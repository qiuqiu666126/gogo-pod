export type PublishPlatform = "temu" | "amazon" | "shein";

export const PUBLISH_PLATFORMS: { label: string; value: PublishPlatform }[] = [
  { label: "Temu", value: "temu" },
  { label: "Amazon", value: "amazon" },
  { label: "Shein", value: "shein" },
];

export type PublishTemplateSection = {
  label: string;
  value: string;
};

export type OfficialPublishTemplate = {
  id: string;
  name: string;
  platform: PublishPlatform;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
  description: string;
  storeName: string;
  site: string;
  categoryPath: string;
  publishMode: string;
  priceRule: string;
  inventoryRule: string;
  titleRule: string;
  imageRule: string;
  attributeRule: string;
  suitableFor: string[];
  requiredFields: string[];
  highlights: string[];
  sections: PublishTemplateSection[];
};

function normalizeTemplate(
  template: Partial<OfficialPublishTemplate>,
  fallbackId: string,
  fallbackSortOrder: number,
): OfficialPublishTemplate {
  return {
    id: template.id || fallbackId,
    name: template.name || "未命名模板",
    platform: (template.platform || "temu") as PublishPlatform,
    enabled: template.enabled ?? true,
    sortOrder: template.sortOrder ?? fallbackSortOrder,
    updatedAt: template.updatedAt || now(),
    description: template.description || "",
    storeName: template.storeName || "",
    site: template.site || "",
    categoryPath: template.categoryPath || "",
    publishMode: template.publishMode || "",
    priceRule: template.priceRule || "",
    inventoryRule: template.inventoryRule || "",
    titleRule: template.titleRule || "",
    imageRule: template.imageRule || "",
    attributeRule: template.attributeRule || "",
    suitableFor: Array.isArray(template.suitableFor) ? template.suitableFor.filter(Boolean) : [],
    requiredFields: Array.isArray(template.requiredFields)
      ? template.requiredFields.filter(Boolean)
      : [],
    highlights: Array.isArray(template.highlights) ? template.highlights.filter(Boolean) : [],
    sections: Array.isArray(template.sections)
      ? template.sections
          .map((section) => ({
            label: section?.label || "未命名配置",
            value: section?.value || "",
          }))
          .filter((section) => section.value)
      : [],
  };
}

const STORAGE_KEY = "pod_official_publish_templates";

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const SEED: Omit<OfficialPublishTemplate, "id" | "sortOrder" | "updatedAt">[] = [
  {
    name: "Temu 女装基础刊登模板",
    platform: "temu",
    enabled: true,
    description: "适合常规女装 SPU，覆盖标题、类目属性、主图数量与价格库存规则。",
    storeName: "Temu US 主店",
    site: "美国站",
    categoryPath: "Women Clothing > Tops > T-Shirts",
    publishMode: "生成草稿后提交审核",
    priceRule: "取销售价，低于 9.99 USD 时自动补差到 9.99 USD",
    inventoryRule: "同步广州成品仓可售库存，低于 20 件时预警",
    titleRule: "{品牌} {品名} {核心卖点} {颜色} {尺码}",
    imageRule: "1 张白底主图 + 6 张场景图，SKU 图按颜色维度拆分",
    attributeRule: "材质、领型、袖长必填，颜色和尺码取 SKU 销售属性",
    suitableFor: ["女装", "基础款", "多尺码"],
    requiredFields: ["Temu 店铺", "平台类目", "标题模板", "主图规则", "价格规则"],
    highlights: ["白底图合规检查", "SKU 颜色图自动匹配", "价格下限保护"],
    sections: [
      { label: "默认语言", value: "英语" },
      { label: "物流方案", value: "平台默认物流" },
      { label: "品牌字段", value: "取商品品牌，缺失时阻断提交" },
      { label: "审核策略", value: "发布前完整性校验 + 提交失败可重试" },
    ],
  },
  {
    name: "Temu 家居套装刊登模板",
    platform: "temu",
    enabled: true,
    description: "适合家居组合商品，强调套装规格、材质属性和包装图说明。",
    storeName: "Temu EU 店铺",
    site: "欧洲站",
    categoryPath: "Home & Kitchen > Home Decor > Decorative Accessories",
    publishMode: "保存草稿，人工复核后发布",
    priceRule: "成本价 x 2.4，按欧站规则换算 EUR 后四舍五入",
    inventoryRule: "读取义乌仓现货库存，不同步预售库存",
    titleRule: "{风格} {品名} {套装件数} {材质}",
    imageRule: "1 张主图 + 4 张细节图 + 1 张包装图",
    attributeRule: "件数、材质、适用空间必填，尺寸字段支持 cm/mm 自动换算",
    suitableFor: ["家居", "组合装", "欧站"],
    requiredFields: ["件数属性", "包装图", "材质字段", "欧站价格规则"],
    highlights: ["尺寸单位自动换算", "组合装件数校验", "包装图缺失拦截"],
    sections: [
      { label: "默认语言", value: "英语" },
      { label: "币种", value: "EUR" },
      { label: "运费策略", value: "大件按体积重标记人工复核" },
      { label: "售后备注", value: "易碎品默认附加包装说明" },
    ],
  },
  {
    name: "Amazon 爆款手机壳模版",
    platform: "amazon",
    enabled: true,
    description: "示例模板，用于兼容其他平台展示。",
    storeName: "Amazon US Store",
    site: "美国站",
    categoryPath: "Cell Phones & Accessories > Cases",
    publishMode: "导出刊登包",
    priceRule: "固定加价 25%",
    inventoryRule: "读取 FBA 可售库存",
    titleRule: "{品牌} {型号} {材质}",
    imageRule: "白底主图 + 生活方式图",
    attributeRule: "型号、材质、兼容品牌必填",
    suitableFor: ["手机壳"],
    requiredFields: ["型号", "主图"],
    highlights: ["跨平台占位示例"],
    sections: [
      { label: "说明", value: "当前重点对接 Temu，此模板仅保留兼容展示" },
    ],
  },
];

function buildSeed(): OfficialPublishTemplate[] {
  return SEED.map((item, index) =>
    normalizeTemplate(
      {
        ...item,
        id: `pt-official-${index}`,
        sortOrder: index,
        updatedAt: now(),
      },
      `pt-official-${index}`,
      index,
    ),
  );
}

function readStorage(): OfficialPublishTemplate[] {
  if (typeof localStorage === "undefined") return buildSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<OfficialPublishTemplate>[];
    const normalized = Array.isArray(parsed)
      ? parsed.map((item, index) => normalizeTemplate(item, `pt-official-${index}`, index))
      : buildSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return buildSeed();
  }
}

function writeStorage(list: OfficialPublishTemplate[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

let cache = readStorage();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeOfficialPublishTemplates(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficialPublishTemplatesList(): OfficialPublishTemplate[] {
  return cache;
}

function saveList(list: OfficialPublishTemplate[]) {
  cache = list;
  writeStorage(list);
  emit();
}

export function createOfficialPublishTemplateId() {
  return `pt-official-${Date.now()}`;
}

export function upsertOfficialPublishTemplate(
  input: Omit<OfficialPublishTemplate, "updatedAt"> & { updatedAt?: string },
) {
  const list = getOfficialPublishTemplatesList();
  const idx = list.findIndex((t) => t.id === input.id);
  const row: OfficialPublishTemplate = {
    ...input,
    updatedAt: input.updatedAt ?? now(),
  };
  if (idx >= 0) {
    saveList(list.map((t, i) => (i === idx ? row : t)));
  } else {
    saveList([...list, row]);
  }
}

export function deleteOfficialPublishTemplate(id: string) {
  saveList(getOfficialPublishTemplatesList().filter((t) => t.id !== id));
}
