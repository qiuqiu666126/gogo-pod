import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { UploadedAsset } from "./api/uploadApi";
import { assetsToSubmitInput, type SubmitFeatureTaskInput } from "./featureTasks";
import { TaskMaterialUploadSection } from "./TaskMaterialUploadSection";
import { useInitialAssets } from "./useInitialAssets";
import { DynamicFormFields } from "./components/DynamicFormFields";
import { DEFAULT_SCENE_KEY, useSceneFormState } from "./hooks/useSceneFormState";

export function InfringementFilterTaskModal({
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
  const [agreed, setAgreed] = useState(false);
  const { preset, formValues, handleChange, submitParams } = useSceneFormState(
    "infringement",
    DEFAULT_SCENE_KEY,
    open,
  );

  useEffect(() => {
    if (!open) setAgreed(false);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(920px,94vw)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新建侵权风险过滤任务</Dialog.Title>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto max-h-[calc(90vh-72px)] space-y-4">
            <TaskMaterialUploadSection assets={assets} onAssetsChange={setAssets} />

            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-[12px] text-foreground leading-relaxed">
              重要提醒：本服务为 AI 风险预警工具，检测结果基于现有 IP 数据库和算法分析，不构成任何法律意见或侵权保证。请您自行评估所有法律及上架风险。
            </div>

            {preset ? (
              <DynamicFormFields fields={preset.formFields} values={formValues} onChange={handleChange} />
            ) : (
              <p className="text-[13px] text-muted-foreground">请在管理后台配置场景预设</p>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="accent-primary rounded"
                />
                侵权风险过滤功能使用须知
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="h-9 px-5 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:bg-muted/40 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onSubmit?.(assetsToSubmitInput(assets, { params: submitParams() }));
                    onClose();
                  }}
                  className="h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
