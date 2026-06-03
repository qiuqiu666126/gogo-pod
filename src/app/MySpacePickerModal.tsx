import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar, Check, FolderOpen, Upload, X } from "lucide-react";
import type { UploadedAsset } from "./api/uploadApi";
import { INITIAL_SPACE_IMAGES } from "./mySpaceData";

const selectClass =
  "h-9 min-w-[120px] rounded-md border border-[#3a3a3a] bg-[#171717] px-3 text-[13px] text-[#e5e5e5] outline-none";

export function MySpacePickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (assets: UploadedAsset[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount > 0 && selectedCount === INITIAL_SPACE_IMAGES.length;

  const pickedAssets = useMemo(
    () =>
      INITIAL_SPACE_IMAGES.filter((item) => selectedIds.has(item.id)).map((item) => ({
        id: `space-picked-${item.id}`,
        url: item.src,
        name: item.name,
        size: 0,
        mimeType: "image/jpeg",
      })),
    [selectedIds],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(INITIAL_SPACE_IMAGES.map((item) => item.id)));
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  const handlePick = () => {
    if (pickedAssets.length === 0) return;
    onPick(pickedAssets);
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] flex h-[min(92vh,880px)] w-[min(1560px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-[#3a3a3a] bg-[#161616] text-white shadow-2xl">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-5">
            <div className="flex items-center gap-8 text-[13px] font-semibold">
              <button type="button" className="text-primary">
                按素材选取
              </button>
              <button type="button" className="text-white/80 hover:text-white">
                按任务批次选取
              </button>
              <button type="button" className="text-white/80 hover:text-white">
                从智能检索选取
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/6 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-b border-white/8 px-5 py-3">
            <button className="flex h-8 items-center gap-2 rounded-md bg-primary px-4 text-[13px] text-white hover:bg-primary/90">
              <Upload size={14} />
              上传图片
            </button>
            <button className="flex h-8 items-center gap-2 rounded-md bg-primary px-4 text-[13px] text-white hover:bg-primary/90">
              <FolderOpen size={14} />
              上传文件夹
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3 px-5 py-4">
            <label className="flex items-center gap-2 text-[13px] text-white cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="accent-primary rounded"
              />
              全选
            </label>
            <select className={`${selectClass} ml-auto`} defaultValue="">
              <option value="">创梦师1772（我...）</option>
            </select>
            <select className={selectClass} defaultValue="">
              <option value="">全部</option>
            </select>
            <input className={`${selectClass} w-[170px]`} placeholder="来源" />
            <input className={`${selectClass} w-[160px]`} placeholder="批次" />
            <input className={`${selectClass} w-[160px]`} placeholder="标签" />
            <div className="flex h-9 items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#171717] px-3 text-[13px] text-white/65">
              <span>开始日期</span>
              <span>→</span>
              <span>结束日期</span>
              <Calendar size={14} className="ml-1" />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-5 pb-5">
            <div className="grid grid-cols-5 gap-4 xl:grid-cols-10">
              {INITIAL_SPACE_IMAGES.map((item) => {
                const selected = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className={`group relative overflow-hidden rounded-md border bg-[#2a2a2a] text-left transition-colors ${
                      selected ? "border-primary ring-1 ring-primary/50" : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <img src={item.src} alt={item.name} className="aspect-square w-full object-cover" />
                    <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-sm border border-white/30 bg-black/60">
                      {selected && <Check size={13} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex h-14 shrink-0 items-center justify-end gap-4 border-t border-white/8 px-6">
            <button
              type="button"
              onClick={handleClose}
              className="h-8 rounded-md border border-white/10 px-6 text-[13px] text-white/85 hover:bg-white/6"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handlePick}
              disabled={selectedCount === 0}
              className="h-8 rounded-md bg-primary px-6 text-[13px] text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              选取({selectedCount})
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
