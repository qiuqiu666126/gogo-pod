import { useSyncExternalStore } from "react";
import {
  PRODUCT_SET_CATEGORY_TABS,
  type ProductSetCategory,
  type ProductSetMockupImage,
  getOfficialProductSetTemplatesForUser,
  subscribeOfficialProductSetTemplates,
} from "../shared/productSetTemplates";
import { showTaskActionSuccess } from "./taskToast";

export type ProductSetMockupType = "pod" | "psd";
export type ProductSetTemplateSource = "official" | "team" | "mine";

export { PRODUCT_SET_CATEGORY_TABS, type ProductSetCategory };
export type { ProductSetMockupImage };

export type ProductSetTemplate = {
  id: string;
  name: string;
  mockupType: ProductSetMockupType;
  source: ProductSetTemplateSource;
  category: ProductSetCategory;
  images: ProductSetMockupImage[];
};

function img(seed: string, w = 200, h = 240) {
  return `https://images.unsplash.com/${seed}?w=${w}&h=${h}&fit=crop&auto=format`;
}

const teamTemplates: ProductSetTemplate[] = [
  {
    id: "pst-team-0",
    name: "帆布包场景样机",
    mockupType: "pod",
    source: "team",
    category: "服饰",
    images: [
      {
        id: "bag-front",
        name: "正面主图",
        imageUrl: img("photo-1553062407-98eeb64c6a62", 400, 480),
        placements: [{ id: "bag-front", name: "帆布包正面", left: 29, top: 24, width: 42, height: 48 }],
      },
    ],
  },
];

let userTemplates: ProductSetTemplate[] = [];
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
  const unsubOfficial = subscribeOfficialProductSetTemplates(onOfficialChange);
  const unsubLocal = subscribeLocal(listener);
  return () => {
    unsubOfficial();
    unsubLocal();
  };
}

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function useProductSetTemplateVersion() {
  return useSyncExternalStore(subscribe, () => version, () => version);
}

export function getProductSetTemplates(
  source: ProductSetTemplateSource,
  category: ProductSetCategory,
): ProductSetTemplate[] {
  if (source === "official") {
    return getOfficialProductSetTemplatesForUser(category) as ProductSetTemplate[];
  }
  const pool = source === "team" ? teamTemplates : userTemplates;
  if (category === "推荐") {
    return pool.filter((template) => template.category === "推荐");
  }
  return pool.filter((template) => template.category === category);
}

export function addUserProductSetTemplate(input: {
  name: string;
  mockupType: ProductSetMockupType;
  category: ProductSetCategory;
  images?: ProductSetMockupImage[];
  copyFrom?: ProductSetTemplate;
}) {
  const item: ProductSetTemplate = {
    id: `pst-mine-${Date.now()}`,
    name: input.name.trim(),
    mockupType: input.mockupType,
    source: "mine",
    category: input.category,
    images:
      input.images ??
      input.copyFrom?.images ??
      [
        {
          id: "default-image",
          name: "主图",
          imageUrl: img("photo-1521572163474-6864f9cf17ab", 400, 480),
          placements: [{ id: "default-placement", name: "默认贴图区域", left: 26, top: 20, width: 48, height: 56 }],
        },
      ],
  };
  userTemplates = [...userTemplates, item];
  emit();
  showTaskActionSuccess(`已添加到我的模版：${item.name}`);
  return item;
}

export function findProductSetTemplate(id: string) {
  for (const category of PRODUCT_SET_CATEGORY_TABS) {
    const official = getOfficialProductSetTemplatesForUser(category).find((template) => template.id === id);
    if (official) return official as ProductSetTemplate;
  }
  return [...teamTemplates, ...userTemplates].find((template) => template.id === id);
}
