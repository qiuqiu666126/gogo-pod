import type { FeatureTaskType } from "./featureTasks";

export type DesignFeatureId =
  | "cutout"
  | "pattern-extract"
  | "crack"
  | "text2img"
  | "product-set"
  | "vector"
  | "infringement"
  | "video"
  | "title-extract"
  | "tk-video"
  | "uv-layer";

export type DesignFeatureMenuGroup = {
  title: string;
  items: { id: DesignFeatureId; label: string; hasModal: boolean }[];
};

/** 图片操作浮层菜单（与作图页能力对应） */
export const IMAGE_OPERATION_MENU: DesignFeatureMenuGroup[] = [
  {
    title: "套图&标题",
    items: [{ id: "title-extract", label: "标题提取", hasModal: false }],
  },
  {
    title: "印花提取",
    items: [
      { id: "cutout", label: "一键抠图", hasModal: true },
      { id: "pattern-extract", label: "印花图提取", hasModal: true },
    ],
  },
  {
    title: "印花设计",
    items: [
      { id: "crack", label: "图裂变", hasModal: true },
      { id: "text2img", label: "文生图", hasModal: true },
    ],
  },
  {
    title: "图案处理",
    items: [{ id: "vector", label: "转矢量图", hasModal: true }],
  },
  {
    title: "其他",
    items: [
      { id: "infringement", label: "侵权风险过滤", hasModal: true },
      { id: "video", label: "视频生成", hasModal: true },
      { id: "product-set", label: "商品套图", hasModal: true },
      { id: "tk-video", label: "TK 视频生成", hasModal: false },
      { id: "uv-layer", label: "UV 智能分层", hasModal: false },
    ],
  },
];

export const FEATURE_ID_TO_TASK_TYPE: Partial<Record<DesignFeatureId, FeatureTaskType>> = {
  cutout: "cutout",
  "pattern-extract": "pattern-extract",
  crack: "crack",
  text2img: "text2img",
  "product-set": "product-set",
  vector: "vector",
  infringement: "infringement",
  video: "video",
};
