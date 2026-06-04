import { useSyncExternalStore, type ReactNode } from "react";
import { ImagePlus, Layers, Package, PenTool, Scissors, ShieldAlert, Sparkles, Type, Wand2 } from "lucide-react";

export type FavoriteFeatureId =
  | "cutout"
  | "pattern-extract"
  | "crack"
  | "text2img"
  | "product-set"
  | "title-extract"
  | "vector"
  | "infringement";

export type FavoriteFeatureMeta = {
  id: FavoriteFeatureId;
  title: string;
  desc: string;
  icon: ReactNode;
  gradient: string;
  borderColor: string;
  hoverGlow: string;
};

export const favoriteFeatureMeta: Record<FavoriteFeatureId, FavoriteFeatureMeta> = {
  cutout: {
    id: "cutout",
    icon: <Scissors size={22} className="text-emerald-600" />,
    title: "一键抠图",
    desc: "智能识别主体，一键去除背景",
    gradient: "from-emerald-50 to-lime-50",
    borderColor: "border-emerald-200/80",
    hoverGlow: "hover:border-emerald-400/60",
  },
  "pattern-extract": {
    id: "pattern-extract",
    icon: <ImagePlus size={22} className="text-amber-600" />,
    title: "印花图提取",
    desc: "不惧模糊遮挡透视，独家支持多比例提取",
    gradient: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200/80",
    hoverGlow: "hover:border-primary/35",
  },
  crack: {
    id: "crack",
    icon: <Sparkles size={22} className="text-orange-500" />,
    title: "图裂变",
    desc: "识别图案卖点裂变图案",
    gradient: "from-orange-50 to-rose-50",
    borderColor: "border-orange-200/70",
    hoverGlow: "hover:border-primary/35",
  },
  text2img: {
    id: "text2img",
    icon: <PenTool size={22} className="text-primary" />,
    title: "文生图",
    desc: "输入提示词，AI 生成图片",
    gradient: "from-orange-50 to-amber-50",
    borderColor: "border-orange-200/80",
    hoverGlow: "hover:border-primary/35",
  },
  "product-set": {
    id: "product-set",
    icon: <Package size={22} className="text-pink-500" />,
    title: "商品套图",
    desc: "印花批量套商品图",
    gradient: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200/80",
    hoverGlow: "hover:border-pink-400/50",
  },
  "title-extract": {
    id: "title-extract",
    icon: <Type size={22} className="text-amber-600" />,
    title: "标题提取",
    desc: "生成商品标题",
    gradient: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-200/80",
    hoverGlow: "hover:border-yellow-400/60",
  },
  vector: {
    id: "vector",
    icon: <Layers size={22} className="text-sky-500" />,
    title: "转矢量图",
    desc: "批量转矢量",
    gradient: "from-sky-50 to-cyan-50",
    borderColor: "border-sky-200/80",
    hoverGlow: "hover:border-sky-400/60",
  },
  infringement: {
    id: "infringement",
    icon: <ShieldAlert size={22} className="text-blue-500" />,
    title: "侵权风险过滤",
    desc: "结合风险库生成检测报告",
    gradient: "from-blue-50 to-sky-50",
    borderColor: "border-blue-200/80",
    hoverGlow: "hover:border-blue-400/60",
  },
};

let favoriteFeatureIds: FavoriteFeatureId[] = ["text2img", "pattern-extract", "crack"];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getFavoriteFeatureIds() {
  return favoriteFeatureIds;
}

export function useFavoriteFeatureIds() {
  return useSyncExternalStore(subscribe, getFavoriteFeatureIds, getFavoriteFeatureIds);
}

export function isFavoriteFeature(id: FavoriteFeatureId) {
  return favoriteFeatureIds.includes(id);
}

export function toggleFavoriteFeature(id: FavoriteFeatureId) {
  favoriteFeatureIds = favoriteFeatureIds.includes(id)
    ? favoriteFeatureIds.filter((item) => item !== id)
    : [...favoriteFeatureIds, id];
  emit();
}
