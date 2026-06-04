import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileText,
  ImagePlus,
  Layers3,
  Package,
  Scissors,
  ShieldAlert,
  Sparkles,
  Type,
  Video,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { IMAGE_OPERATION_MENU, type DesignFeatureId } from "./designFeatureActions";

const barBtnClass =
  "h-8 px-3.5 rounded-md border border-border bg-background hover:bg-muted/50 text-foreground text-[13px] font-normal transition-colors shrink-0 disabled:opacity-45 disabled:cursor-not-allowed";

const featureMeta: Partial<Record<DesignFeatureId, { icon: LucideIcon; desc: string }>> = {
  "title-extract": { icon: FileText, desc: "从商品图里提炼可用标题" },
  cutout: { icon: Scissors, desc: "快速去背景，得到透明素材" },
  "pattern-extract": { icon: ImagePlus, desc: "从图片中提取印花图案" },
  crack: { icon: Wand2, desc: "基于选中图生成多张变体" },
  text2img: { icon: Type, desc: "用文字描述生成新图案" },
  vector: { icon: Layers3, desc: "转成更适合印刷的矢量效果" },
  infringement: { icon: ShieldAlert, desc: "过滤疑似侵权风险图" },
  video: { icon: Video, desc: "把图片生成短视频素材" },
  "product-set": { icon: Package, desc: "套用商品模板生成套图" },
  "tk-video": { icon: Video, desc: "TikTok 视频能力即将开放" },
  "uv-layer": { icon: Layers3, desc: "智能拆分 UV 分层文件" },
};

export function TaskDetailBatchBar({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearSelection,
  onSaveToProductLibrary,
  onDownload,
  onDiscard,
  onRecover,
  onOpenFeature,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onSaveToProductLibrary?: () => void;
  onDownload?: () => void;
  onDiscard?: () => void;
  onRecover?: () => void;
  onOpenFeature?: (featureId: DesignFeatureId) => void;
}) {
  const [imageOpsOpen, setImageOpsOpen] = useState(false);
  const [selectMenuOpen, setSelectMenuOpen] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = totalSelectable > 0 && selectedCount === totalSelectable;
  const partialSelected = selectedCount > 0 && selectedCount < totalSelectable;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partialSelected;
    }
  }, [partialSelected]);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-5 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[min(1200px,calc(100%-32px))] relative">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
          <div className="relative flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded accent-[#ff6b2c] cursor-pointer"
              />
              <span>全选</span>
            </label>
            <button
              type="button"
              onClick={() => setSelectMenuOpen((v) => !v)}
              className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
              aria-label="全选选项"
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${selectMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {selectMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 py-1 rounded-lg bg-card border border-border shadow-lg min-w-[120px] z-10">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-[12px] text-foreground hover:bg-muted/50"
                  onClick={() => {
                    onSelectAll(true);
                    setSelectMenuOpen(false);
                  }}
                >
                  全选
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-[12px] text-foreground hover:bg-muted/50"
                  onClick={() => {
                    onSelectAll(false);
                    setSelectMenuOpen(false);
                  }}
                >
                  取消全选
                </button>
              </div>
            )}
            <span className="text-[13px] text-muted-foreground whitespace-nowrap">
              已选择：<span className="text-foreground">{selectedCount}</span>项内容
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {onSaveToProductLibrary && (
              <button type="button" className={barBtnClass} onClick={onSaveToProductLibrary}>
                保存到商品库
              </button>
            )}
            {onDownload && (
              <button type="button" className={barBtnClass} onClick={onDownload}>
                下载
              </button>
            )}
            {onDiscard && (
              <button type="button" className={barBtnClass} onClick={onDiscard}>
                废弃
              </button>
            )}
            {onRecover && (
              <button type="button" className={barBtnClass} onClick={onRecover}>
                恢复
              </button>
            )}
            {onOpenFeature && (
              <div
                className="relative shrink-0"
                onMouseEnter={() => setImageOpsOpen(true)}
                onMouseLeave={() => setImageOpsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setImageOpsOpen((v) => !v)}
                  className={`${barBtnClass} flex items-center gap-1.5 ${
                    imageOpsOpen ? "border-primary/50 bg-primary/5 text-primary" : ""
                  }`}
                  aria-expanded={imageOpsOpen}
                >
                  <Sparkles size={14} className="opacity-90" />
                  图片操作
                </button>

                {imageOpsOpen && (
                  <>
                    <div className="absolute bottom-full right-0 h-3 w-full" />
                    <div className="absolute bottom-full right-0 mb-3 w-[min(620px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
                      <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Sparkles size={15} />
                            </span>
                            图片操作
                          </div>
                          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                            基于已选中的 {selectedCount} 项内容继续处理，选择一个能力后会进入对应任务配置。
                          </p>
                        </div>
                      </div>

                      <div className="max-h-[min(520px,58vh)] overflow-y-auto p-4">
                        <div className="space-y-4">
                          {IMAGE_OPERATION_MENU.map((group) => (
                            <section key={group.title}>
                              <div className="mb-2 flex items-center gap-2">
                                <span className="h-px flex-1 bg-border" />
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {group.title}
                                </span>
                                <span className="h-px flex-1 bg-border" />
                              </div>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {group.items.map((item) => {
                                  const meta = featureMeta[item.id] ?? {
                                    icon: Sparkles,
                                    desc: "继续处理当前选中的图片",
                                  };
                                  const Icon = meta.icon;

                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      disabled={!item.hasModal}
                                      onClick={() => {
                                        if (item.hasModal) {
                                          onOpenFeature(item.id);
                                          setImageOpsOpen(false);
                                        }
                                      }}
                                      className="group flex min-h-[72px] items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-55 disabled:hover:border-border disabled:hover:shadow-none"
                                    >
                                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-disabled:bg-muted group-disabled:text-muted-foreground">
                                        <Icon size={17} />
                                      </span>
                                      <span className="min-w-0">
                                        <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                                          {item.label}
                                          {!item.hasModal && (
                                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                                              即将开放
                                            </span>
                                          )}
                                        </span>
                                        <span className="mt-1 block text-[12px] leading-5 text-muted-foreground">
                                          {meta.desc}
                                        </span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </section>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <span className="hidden sm:block w-px h-5 bg-border shrink-0 mx-0.5" />

            <button type="button" className={barBtnClass} onClick={onClearSelection}>
              取消选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
