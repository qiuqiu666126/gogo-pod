import { useSyncExternalStore } from "react";
import { DEFAULT_OPERATOR } from "./appConstants";

const DEMO_PRINT = new URL("./assets/task-demo/result-pattern.png", import.meta.url).href;

const MOCKUP_URLS = [
  "https://images.unsplash.com/photo-1618354691373-d8519e0a5a96?w=320&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=320&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1622445275463-8781766c2ab8?w=320&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=320&h=400&fit=crop&auto=format",
];

export type PrintWorkflowStep = {
  label: string;
  imageUrl: string;
};

export type ProductItem = {
  id: string;
  carouselImages: string[];
  title: string | null;
  printImages: string[];
  printWorkflow: PrintWorkflowStep[];
  infringementStatus: "未检测" | "低风险" | "高风险";
  listingStatus: "待刊登" | "已刊登" | "刊登中";
  productionImages: string[];
  source: string;
  batch: string;
  createdAt: string;
  operator: string;
};

const SEED_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    carouselImages: MOCKUP_URLS,
    title: null,
    printImages: [DEMO_PRINT],
    printWorkflow: [
      { label: "印花图", imageUrl: DEMO_PRINT },
      {
        label: "上传",
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=240&fit=crop&auto=format",
      },
      { label: "图案裁剪", imageUrl: DEMO_PRINT },
      { label: "一键抠图", imageUrl: DEMO_PRINT },
    ],
    infringementStatus: "未检测",
    listingStatus: "待刊登",
    productionImages: [],
    source: "商品套图",
    batch: "260528112342001",
    createdAt: "2026-05-28 11:23:42",
    operator: DEFAULT_OPERATOR,
  },
];

let products: ProductItem[] = [...SEED_PRODUCTS];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

export function getProducts() {
  return products;
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function useProducts() {
  return useSyncExternalStore(subscribe, () => products, () => products);
}

export function deleteProduct(id: string) {
  products = products.filter((p) => p.id !== id);
  emit();
}

function formatDateTime(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

export type SaveToProductLibraryItem = {
  sourceUrl: string;
  resultUrl: string;
  mediaKind?: "image" | "video";
};

/** 从任务详情选中图创建商品库条目（每条结果对应一个商品） */
export function addProductsFromTaskResults(
  items: SaveToProductLibraryItem[],
  meta: { source: string; taskBatch: string },
): number {
  if (items.length === 0) return 0;
  const now = new Date();
  const created: ProductItem[] = items.map((item, index) => {
    const resultUrl = item.resultUrl;
    const sourceUrl = item.sourceUrl || resultUrl;
    const carousel =
      item.mediaKind === "video"
        ? [resultUrl]
        : Array.from(new Set([sourceUrl, resultUrl]));
    return {
      id: `prod-${now.getTime()}-${index}`,
      carouselImages: carousel,
      title: null,
      printImages: [resultUrl],
      printWorkflow: [
        { label: "印花图", imageUrl: resultUrl },
        { label: "上传", imageUrl: sourceUrl },
      ],
      infringementStatus: "未检测" as const,
      listingStatus: "待刊登" as const,
      productionImages: [],
      source: meta.source,
      batch: meta.taskBatch,
      createdAt: formatDateTime(now),
      operator: DEFAULT_OPERATOR,
    };
  });
  products = [...created, ...products];
  emit();
  return created.length;
}

/** 按图片 URL 批量入库（工作流等场景） */
export function addProductsFromImageUrls(
  urls: string[],
  meta: { source: string; taskBatch: string; fallbackSourceUrl?: string },
): number {
  const sourceUrl = meta.fallbackSourceUrl ?? urls[0] ?? "";
  return addProductsFromTaskResults(
    urls.map((url) => ({ sourceUrl, resultUrl: url, mediaKind: "image" as const })),
    meta,
  );
}
