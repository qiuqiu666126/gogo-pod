import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { assetsToSubmitInput, type SubmitFeatureTaskInput } from "./featureTasks";
import { TaskMaterialUploadSection } from "./TaskMaterialUploadSection";
import { useInitialAssets } from "./useInitialAssets";
import type { UploadedAsset } from "./api/uploadApi";

export function TitleExtractTaskModal({
  open,
  onClose,
  onSubmit,
  initialAssets,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (input: SubmitFeatureTaskInput) => void;
  initialAssets?: UploadedAsset[];
}) {
  const [assets, setAssets] = useInitialAssets(open, initialAssets);
  const [language, setLanguage] = useState("英语");

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(920px,94vw)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新建标题提取任务</Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto max-h-[calc(88vh-72px)] space-y-4">
            <TaskMaterialUploadSection assets={assets} onAssetsChange={setAssets} />

            <div className="flex items-center gap-3 text-[13px]">
              <span className="font-medium text-foreground shrink-0">输出语言</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-9 flex-1 max-w-[200px] rounded-md border border-border bg-muted/50 px-3 outline-none focus:border-primary/60"
              >
                <option>英语</option>
                <option>德语</option>
                <option>法语</option>
                <option>西班牙语</option>
                <option>日语</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-5 rounded-md border border-border text-[13px] hover:bg-muted/40"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmit?.(
                    assetsToSubmitInput(assets, {
                      params: [{ label: "输出语言", value: language }],
                    }),
                  );
                  onClose();
                }}
                className="h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90"
              >
                提交
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
