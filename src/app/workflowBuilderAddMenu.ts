import { IMAGE_OPERATION_MENU } from "./designFeatureActions";

/** 工作流「+」菜单：作图类能力（不含视频） */
export const WORKFLOW_DESIGN_ADD_ITEMS = IMAGE_OPERATION_MENU.flatMap((group) =>
  group.items.filter((item) => item.id !== "video" && item.id !== "tk-video"),
);

/** 工作流「+」菜单：视频类能力 */
export const WORKFLOW_VIDEO_ADD_ITEMS = [
  { id: "video" as const, label: "视频生成" },
  { id: "tk-video" as const, label: "TK 视频生成" },
];
