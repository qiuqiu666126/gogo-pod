import { useEffect, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { IMAGE_OPERATION_MENU, type DesignFeatureId } from "./designFeatureActions";

const barBtnClass =
  "h-8 px-3.5 rounded-md bg-[#63686f] hover:bg-[#70757d] text-white text-[13px] font-normal transition-colors shrink-0 disabled:opacity-45 disabled:cursor-not-allowed";

export function TaskDetailBatchBar({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearSelection,
  onSaveToProductLibrary,
  onDownload,
  onDiscard,
  onRecover,
  onTag,
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
  onTag?: () => void;
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
        {imageOpsOpen && onOpenFeature && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[min(320px,90vw)] rounded-xl border border-white/10 bg-[#3d4147] shadow-2xl py-2 px-1 max-h-[min(360px,45vh)] overflow-y-auto"
            onMouseLeave={() => setImageOpsOpen(false)}
          >
            {IMAGE_OPERATION_MENU.map((group) => (
              <div key={group.title} className="py-1">
                <div className="px-4 py-1.5 text-[11px] text-white/50">{group.title}</div>
                {group.items.map((item) => (
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
                    className="w-full text-left px-4 py-2.5 text-[13px] text-white/90 hover:bg-white/8 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl bg-[#4A4E54] px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="relative flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-2 text-[13px] text-white cursor-pointer">
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
              className="flex items-center text-white/80 hover:text-white p-0.5"
              aria-label="全选选项"
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${selectMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {selectMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 py-1 rounded-lg bg-[#3d4147] border border-white/10 shadow-lg min-w-[120px] z-10">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-[12px] text-white/90 hover:bg-white/8"
                  onClick={() => {
                    onSelectAll(true);
                    setSelectMenuOpen(false);
                  }}
                >
                  全选
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-[12px] text-white/90 hover:bg-white/8"
                  onClick={() => {
                    onSelectAll(false);
                    setSelectMenuOpen(false);
                  }}
                >
                  取消全选
                </button>
              </div>
            )}
            <span className="text-[13px] text-white/75 whitespace-nowrap">
              已选择：<span className="text-white">{selectedCount}</span>项内容
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
            {onTag && (
              <button type="button" className={barBtnClass} onClick={onTag}>
                打标签
              </button>
            )}
            {onOpenFeature && (
              <div
                className="relative shrink-0"
                onMouseEnter={() => setImageOpsOpen(true)}
              >
                <button
                  type="button"
                  className={`${barBtnClass} flex items-center gap-1.5 ${
                    imageOpsOpen ? "bg-[#70757d] ring-1 ring-white/20" : ""
                  }`}
                >
                  <Sparkles size={14} className="opacity-90" />
                  图片操作
                </button>
              </div>
            )}

            <span className="hidden sm:block w-px h-5 bg-white/25 shrink-0 mx-0.5" />

            <button type="button" className={barBtnClass} onClick={onClearSelection}>
              取消选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
