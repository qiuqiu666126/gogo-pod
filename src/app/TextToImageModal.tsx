import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Bot,
  ChevronRight,
  FileSpreadsheet,
  ImagePlus,
  Trash2,
  X,
} from "lucide-react";
import {
  BatchImageReversePromptZone,
  type ReversePromptEntry,
} from "./BatchImageReversePromptZone";
import { assetsToSubmitInput, type SubmitFeatureTaskInput } from "./featureTasks";
import { DynamicFormFields } from "./components/DynamicFormFields";
import { DEFAULT_SCENE_KEY, useSceneFormState } from "./hooks/useSceneFormState";

type PromptRow = {
  id: string;
  prompt: string;
  imageUrl?: string;
  assetId?: string;
  selected: boolean;
};

function createEmptyPrompt(): PromptRow {
  return {
    id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    prompt: "",
    selected: true,
  };
}

export function TextToImageModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (input: SubmitFeatureTaskInput) => void;
}) {
  const [promptListEnabled, setPromptListEnabled] = useState(true);
  const [prompts, setPrompts] = useState<PromptRow[]>(() => [createEmptyPrompt()]);
  const { preset, formValues, handleChange, submitParams } = useSceneFormState(
    "text2img",
    DEFAULT_SCENE_KEY,
    open,
  );
  const count = Number(formValues.count ?? 2);

  useEffect(() => {
    if (!open) {
      setPromptListEnabled(true);
      setPrompts([createEmptyPrompt()]);
    }
  }, [open]);

  const selectedCount = prompts.filter((p) => p.selected && p.prompt.trim()).length;

  const handleReversePrompts = (entries: ReversePromptEntry[]) => {
    setPrompts((prev) => {
      const withoutEmpty = prev.filter((p) => p.prompt.trim() || p.imageUrl);
      const merged = [
        ...withoutEmpty,
        ...entries.map((e) => ({
          id: e.id,
          prompt: e.prompt,
          imageUrl: e.imageUrl,
          assetId: e.assetId,
          selected: true,
        })),
      ];
      return merged.length > 0 ? merged : [createEmptyPrompt()];
    });
  };

  const updatePrompt = (id: string, patch: Partial<PromptRow>) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePrompt = (id: string) => {
    setPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length > 0 ? next : [createEmptyPrompt()];
    });
  };

  const addPrompt = () => {
    setPrompts((prev) => [...prev, createEmptyPrompt()]);
  };

  const buildSubmitInput = (): SubmitFeatureTaskInput => {
    const active = prompts.filter((p) => p.selected && p.prompt.trim());
    const withImage = active.filter((p) => p.imageUrl);
    const assets = withImage.map((p) => ({
      id: p.assetId ?? p.id,
      url: p.imageUrl!,
      name: "reference",
      size: 0,
      mimeType: "image/jpeg",
    }));

    const base = assets.length > 0 ? assetsToSubmitInput(assets) : {};
    return {
      ...base,
      quantity: count,
      params: [
        ...submitParams(),
        { label: "提示词条数", value: String(active.length) },
        ...active.slice(0, 3).map((p, i) => ({
          label: `提示词${i + 1}`,
          value: p.prompt.slice(0, 80),
        })),
      ],
    };
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(920px,94vw)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-start justify-between px-5 py-4 border-b border-border/80">
            <div>
              <Dialog.Title className="text-[18px] font-semibold text-foreground">新建文生图任务</Dialog.Title>
              <p className="mt-1 text-[12px] text-muted-foreground">使用英文提示词，生成效果更好</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto max-h-[calc(90vh-72px)] space-y-5">
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">添加方式</div>
              <div className="flex gap-3">
                <BatchImageReversePromptZone onPromptsGenerated={handleReversePrompts} />
                <div className="flex flex-col gap-2 w-[148px] shrink-0">
                  <button
                    type="button"
                    className="flex items-center justify-between h-10 px-3 rounded-lg border border-border bg-background text-[13px] text-foreground hover:border-primary/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Bot size={15} className="text-muted-foreground" />
                      提示词助手
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-between h-10 px-3 rounded-lg border border-border bg-background text-[13px] text-foreground hover:border-primary/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet size={15} className="text-muted-foreground" />
                      导入EXCEL
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {preset ? (
              <DynamicFormFields fields={preset.formFields} values={formValues} onChange={handleChange} />
            ) : (
              <p className="text-[13px] text-muted-foreground">请在管理后台配置场景预设</p>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-[13px] font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promptListEnabled}
                    onChange={(e) => setPromptListEnabled(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  提示词列表
                </label>
                <span className="text-[12px] text-muted-foreground">
                  已添加 {prompts.length} 条提示词
                  {selectedCount > 0 && `，已选 ${selectedCount} 条`}
                </span>
              </div>
              <div
                className={`rounded-xl border border-border bg-background p-3 space-y-3 ${!promptListEnabled ? "opacity-50 pointer-events-none" : ""}`}
              >
                {prompts.map((row) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(e) => updatePrompt(row.id, { selected: e.target.checked })}
                      className="accent-primary rounded shrink-0"
                    />
                    {row.imageUrl && (
                      <div className="w-9 h-9 rounded-md border border-border overflow-hidden shrink-0 bg-muted">
                        <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      value={row.prompt}
                      onChange={(e) => updatePrompt(row.id, { prompt: e.target.value })}
                      placeholder="点击输入或者粘贴，描述想要生成的图片"
                      className="flex-1 h-9 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60"
                    />
                    <button
                      type="button"
                      className="flex items-center justify-center w-9 h-9 rounded-md border border-border hover:border-primary/40 transition-colors shrink-0"
                      title="参考图"
                    >
                      <ImagePlus size={15} className="text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePrompt(row.id)}
                      className="flex items-center justify-center w-9 h-9 rounded-md border border-border hover:border-destructive/40 transition-colors shrink-0"
                    >
                      <Trash2 size={15} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPrompt}
                  className="w-full h-9 rounded-md border border-dashed border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  + 添加新的提示词
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-5 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:bg-muted/40 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmit?.(buildSubmitInput());
                  onClose();
                }}
                className="h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
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
