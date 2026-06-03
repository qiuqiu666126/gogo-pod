/** 官方套图模板（后台配置，localStorage 持久化，供用户端「官方」Tab 展示） */

import { migrateLocalStorageKey } from "./storageMigrate";

export const PRODUCT_SET_CATEGORY_TABS = [
  "推荐",
  "服饰",
  "铁皮画",
  "家用纺织",
  "挂钟",
  "装饰画",
  "手机壳",
  "亚克力",
  "其他",
] as const;

export type ProductSetCategory = (typeof PRODUCT_SET_CATEGORY_TABS)[number];

export type ProductSetPlacement = {
  id: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  angle?: number;
};

export type ProductSetMockupImage = {
  id: string;
  name: string;
  imageUrl: string;
  placements: ProductSetPlacement[];
};

export type OfficialProductSetTemplate = {
  id: string;
  name: string;
  category: ProductSetCategory;
  images: ProductSetMockupImage[];
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};

const STORAGE_KEY = "pod_official_product_set_templates";
const LEGACY_STORAGE_KEY = "lingtu_official_product_set_templates";

function img(seed: string, w = 200, h = 240) {
  return `https://images.unsplash.com/${seed}?w=${w}&h=${h}&fit=crop&auto=format`;
}

function createImage(
  id: string,
  name: string,
  imageUrl: string,
  placements: ProductSetPlacement[],
): ProductSetMockupImage {
  return { id, name, imageUrl, placements };
}

const SEED: Omit<OfficialProductSetTemplate, "id" | "sortOrder" | "updatedAt">[] = [
  {
    name: "男士短袖黑色T恤- 白色背景",
    category: "推荐",
    images: [
      createImage("tee-front", "正面主图", img("photo-1521572163474-6864f9cf17ab", 400, 480), [
        { id: "print-main", name: "胸前印花区域", left: 29, top: 18, width: 42, height: 48 },
      ]),
      createImage("tee-side", "侧面展示", img("photo-1583743814966-8936f5b7be1a", 400, 480), [
        { id: "print-side", name: "侧面印花区域", left: 31, top: 20, width: 38, height: 44 },
      ]),
      createImage("tee-detail", "细节展示", img("photo-1576566588028-4147f3842f27", 400, 480), [
        { id: "print-detail", name: "局部印花区域", left: 26, top: 24, width: 46, height: 36 },
      ]),
    ],
    enabled: true,
  },
  {
    name: "母亲节拼图摆件",
    category: "推荐",
    images: [
      createImage("puzzle-main", "正面主图", img("photo-1518199266791-5375a83190b7", 400, 480), [
        { id: "puzzle-front", name: "拼图正面区域", left: 31, top: 24, width: 38, height: 42 },
      ]),
      createImage("puzzle-scene", "场景补图", img("photo-1513151233558-d860c5398176", 400, 480), [
        { id: "puzzle-scene-front", name: "场景拼图区域", left: 34, top: 22, width: 34, height: 40 },
      ]),
    ],
    enabled: true,
  },
  {
    name: "花瓶",
    category: "家用纺织",
    images: [
      createImage("vase-main", "正面主图", img("photo-1578662996442-48f60103fc96", 400, 480), [
        { id: "vase-front", name: "花瓶主体区域", left: 34, top: 19, width: 32, height: 48 },
      ]),
      createImage("vase-scene", "家居场景", img("photo-1505693416388-ac5ce068fe85", 400, 480), [
        { id: "vase-scene-front", name: "场景主体区域", left: 36, top: 18, width: 30, height: 44 },
      ]),
    ],
    enabled: true,
  },
  {
    name: "母亲节贺卡",
    category: "推荐",
    images: [
      createImage("card-main", "正面主图", img("photo-1513151233558-d860c5398176", 400, 480), [
        { id: "card-front", name: "贺卡正面区域", left: 23, top: 21, width: 52, height: 58 },
      ]),
    ],
    enabled: true,
  },
  {
    name: "手机壳白底套图",
    category: "手机壳",
    images: [
      createImage("case-main", "背面主图", img("photo-1511499767150-a48a237f0083", 400, 480), [
        { id: "case-back", name: "壳背贴图区域", left: 30, top: 15, width: 40, height: 68 },
      ]),
      createImage("case-angle", "斜角展示", img("photo-1511707171634-5f897ff02aa9", 400, 480), [
        { id: "case-angle-back", name: "斜角贴图区域", left: 34, top: 18, width: 34, height: 60 },
      ]),
    ],
    enabled: true,
  },
  {
    name: "铁皮画木框展示",
    category: "铁皮画",
    images: [
      createImage("tin-main", "正面主图", img("photo-1513519245088-7e1c73012638", 400, 480), [
        { id: "tin-main", name: "铁皮画主体区域", left: 20, top: 20, width: 60, height: 55 },
      ]),
    ],
    enabled: true,
  },
  {
    name: "挂钟墙面样机",
    category: "挂钟",
    images: [
      createImage("clock-main", "墙面主图", img("photo-1563867773852-7eafb13afda0", 400, 480), [
        { id: "clock-face", name: "表盘区域", left: 23, top: 18, width: 54, height: 54 },
      ]),
    ],
    enabled: true,
  },
];

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function buildSeed(): OfficialProductSetTemplate[] {
  return SEED.map((item, index) => ({
    ...item,
    id: `pst-official-${index}`,
    sortOrder: index,
    updatedAt: now(),
  }));
}

type LegacyTemplate = Partial<OfficialProductSetTemplate> & {
  thumbs?: string[];
  mainImage?: string;
  productImages?: string[];
  placements?: ProductSetPlacement[];
  images?: Array<Partial<ProductSetMockupImage>>;
};

function normalizePlacement(
  placement: Partial<ProductSetPlacement> | undefined,
  index: number,
): ProductSetPlacement {
  return {
    id: placement?.id || `placement-${index + 1}`,
    name: placement?.name || `区域 ${index + 1}`,
    left: Number(placement?.left ?? 25),
    top: Number(placement?.top ?? 25),
    width: Number(placement?.width ?? 40),
    height: Number(placement?.height ?? 40),
    angle: Number(placement?.angle ?? 0),
  };
}

export function createProductSetImageId() {
  return `pst-image-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createProductSetPlacementId() {
  return `pst-placement-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeImage(image: Partial<ProductSetMockupImage>, index: number): ProductSetMockupImage {
  return {
    id: image.id || `image-${index + 1}`,
    name: image.name || `图片 ${index + 1}`,
    imageUrl: image.imageUrl || "",
    placements: Array.isArray(image.placements)
      ? image.placements.map((placement, placementIndex) => normalizePlacement(placement, placementIndex))
      : [],
  };
}

function normalizeLegacyImages(template: LegacyTemplate): ProductSetMockupImage[] {
  if (Array.isArray(template.images) && template.images.length) {
    return template.images.map((image, index) => normalizeImage(image, index));
  }

  const legacyImages = Array.isArray(template.productImages)
    ? template.productImages.filter(Boolean)
    : Array.isArray(template.thumbs)
      ? template.thumbs.filter(Boolean)
      : [];

  const sourceImages = legacyImages.length
    ? legacyImages
    : template.mainImage
      ? [template.mainImage]
      : [];

  return sourceImages.map((imageUrl, index) =>
    normalizeImage(
      {
        id: `image-${index + 1}`,
        name: index === 0 ? "主图" : `商品图 ${index + 1}`,
        imageUrl,
        placements: index === 0 ? template.placements : [],
      },
      index,
    ),
  );
}

function normalizeTemplate(
  template: LegacyTemplate,
  fallbackId: string,
  fallbackSortOrder: number,
): OfficialProductSetTemplate {
  return {
    id: template.id || fallbackId,
    name: template.name || "未命名模板",
    category: (template.category || "推荐") as ProductSetCategory,
    images: normalizeLegacyImages(template).filter((image) => image.imageUrl),
    enabled: template.enabled ?? true,
    sortOrder: template.sortOrder ?? fallbackSortOrder,
    updatedAt: template.updatedAt || now(),
  };
}

function readStorage(): OfficialProductSetTemplate[] {
  if (typeof localStorage === "undefined") return buildSeed();
  migrateLocalStorageKey(STORAGE_KEY, LEGACY_STORAGE_KEY);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        return (JSON.parse(legacy) as LegacyTemplate[]).map((item, index) =>
          normalizeTemplate(item, `pst-official-${index}`, index),
        );
      }
      const seed = buildSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as LegacyTemplate[];
    const normalized = parsed.map((item, index) =>
      normalizeTemplate(item, `pst-official-${index}`, index),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return buildSeed();
  }
}

function writeStorage(list: OfficialProductSetTemplate[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

let cache = readStorage();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeOfficialProductSetTemplates(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficialProductSetTemplatesList(): OfficialProductSetTemplate[] {
  return cache;
}

export function reloadOfficialProductSetTemplates() {
  cache = readStorage();
  emit();
}

function saveList(list: OfficialProductSetTemplate[]) {
  cache = list;
  writeStorage(list);
  emit();
}

export function createOfficialProductSetTemplateId() {
  return `pst-official-${Date.now()}`;
}

export function upsertOfficialProductSetTemplate(
  input: Omit<OfficialProductSetTemplate, "updatedAt"> & { updatedAt?: string },
) {
  const list = getOfficialProductSetTemplatesList();
  const idx = list.findIndex((template) => template.id === input.id);
  const row: OfficialProductSetTemplate = {
    ...input,
    images: input.images
      .filter((image) => image.imageUrl.trim())
      .map((image, index) => normalizeImage(image, index)),
    updatedAt: input.updatedAt ?? now(),
  };
  if (idx >= 0) {
    saveList(list.map((template, index) => (index === idx ? row : template)));
  } else {
    saveList([...list, row]);
  }
}

export function deleteOfficialProductSetTemplate(id: string) {
  saveList(getOfficialProductSetTemplatesList().filter((template) => template.id !== id));
}

/** 用户端官方套图列表 */
export function getOfficialProductSetTemplatesForUser(category: ProductSetCategory) {
  const enabled = getOfficialProductSetTemplatesList()
    .filter((template) => template.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (category === "推荐") {
    return enabled
      .filter((template) => template.category === "推荐")
      .map((template) => ({ ...template, source: "official" as const, mockupType: "pod" as const }));
  }
  return enabled
    .filter((template) => template.category === category)
    .map((template) => ({ ...template, source: "official" as const, mockupType: "pod" as const }));
}
