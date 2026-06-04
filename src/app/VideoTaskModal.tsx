import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronRight, Info, Plus, Trash2, X } from "lucide-react";
import type { UploadedAsset } from "./api/uploadApi";
import { assetsToSubmitInput, type SubmitFeatureTaskInput } from "./featureTasks";
import { AssetUploadZone } from "./AssetUploadZone";
import { SelectFromMySpaceButton } from "./SelectFromMySpaceButton";
import { useInitialAssets } from "./useInitialAssets";
import { useFeatureSceneTabs, useSceneFormState } from "./hooks/useSceneFormState";
import type { FormControl, FormControlOption, FormValue } from "../shared/sceneFormSchema";
import { HoverImagePreview } from "./components/HoverImagePreview";

type PromptEntry = { id: string; text: string };

function createPromptEntry(): PromptEntry {
  return {
    id: `video-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: "",
  };
}

function findField(fields: FormControl[], key: string): FormControl | undefined {
  for (const field of fields) {
    if (field.key === key) return field;
    for (const option of field.options ?? []) {
      const child = option.subFields ? findField(option.subFields, key) : undefined;
      if (child) return child;
    }
  }
  return undefined;
}

function readValue(values: Record<string, FormValue>, field?: FormControl) {
  if (!field) return undefined;
  return values[field.key] ?? field.defaultValue;
}

function VideoOptionCard({
  option,
  active,
  onClick,
}: {
  option: FormControlOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border text-left transition-all ${
        active
          ? "border-primary bg-primary/6 shadow-[0_10px_22px_rgba(242,100,25,0.16)]"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="aspect-[4/5] bg-muted/30">
        {option.thumbnailUrl ? (
          <HoverImagePreview src={option.thumbnailUrl} alt={option.label} />
        ) : (
          <div className="flex h-full items-center justify-center text-[22px] font-semibold text-foreground">
            {option.previewText || option.label.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="space-y-1 px-3 py-2.5">
        <div className="text-[13px] font-medium text-foreground">{option.label}</div>
        {option.previewDescription ? (
          <div className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
            {option.previewDescription}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function GenModeCard({
  option,
  active,
  onClick,
}: {
  option: FormControlOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-colors ${
        active ? "border-primary bg-primary/6" : "border-border bg-card hover:border-primary/35"
      }`}
    >
      <div className="text-[15px] font-semibold text-foreground">{option.label}</div>
      {option.previewDescription ? (
        <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{option.previewDescription}</div>
      ) : null}
    </button>
  );
}

function InlineOptionButtons({
  field,
  value,
  onChange,
}: {
  field?: FormControl;
  value: FormValue | undefined;
  onChange: (next: FormValue) => void;
}) {
  if (!field) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {field.options?.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(field.type === "number-buttons" ? Number(option.value) : option.value)}
          className={`min-w-11 rounded-md border px-3 py-1.5 text-[12px] transition-colors ${
            String(value) === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground hover:border-primary/35"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CustomPromptList({
  prompts,
  onUpdate,
  onRemove,
  onAdd,
}: {
  prompts: PromptEntry[];
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {prompts.map((item, index) => (
        <div
          key={item.id}
          className={`${index < prompts.length - 1 ? "border-b border-border" : ""} flex items-stretch`}
        >
          <textarea
            value={item.text}
            onChange={(event) => onUpdate(item.id, event.target.value)}
            placeholder="结合图片，描述你想生成的画面和动作。例如：模特缓慢转身展示衣服前后身，并轻轻抬手整理衣摆。"
            className="min-h-[96px] flex-1 resize-none bg-transparent px-4 py-4 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="m-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            aria-label="删除提示词"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex h-12 w-full items-center px-4 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        aria-label="新增提示词"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

export function VideoTaskPresetPreview({
  sceneKey,
  fields,
  values,
  onChange,
}: {
  sceneKey: string;
  fields: FormControl[];
  values: Record<string, FormValue>;
  onChange: (key: string, value: FormValue) => void;
}) {
  const creativeModeField = useMemo(() => findField(fields, "creativeMode"), [fields]);
  const effectPresetField = useMemo(() => findField(fields, "effectPreset"), [fields]);
  const genModeField = useMemo(() => findField(fields, "genMode"), [fields]);
  const durationField = useMemo(() => findField(fields, "duration"), [fields]);
  const quantityField = useMemo(() => findField(fields, "quantity"), [fields]);
  const firstFrameField = useMemo(() => findField(fields, "firstFrameMode"), [fields]);
  const windStyleField = useMemo(() => findField(fields, "windStyle"), [fields]);

  const creativeMode = String(readValue(values, creativeModeField) ?? "preset");
  const effectPreset = String(readValue(values, effectPresetField) ?? "");
  const genMode = String(readValue(values, genModeField) ?? "standard");
  const duration = readValue(values, durationField);
  const quantity = Number(readValue(values, quantityField) ?? 1);
  const firstFrameMode = Boolean(readValue(values, firstFrameField));
  const windStyle = String(readValue(values, windStyleField) ?? "");

  return (
    <div className="space-y-5">
      {firstFrameField ? (
        <div className="rounded-xl border border-border bg-muted/25 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-foreground">{firstFrameField.label}</div>
              {firstFrameField.helpText ? (
                <div className="mt-1 text-[11px] text-muted-foreground">{firstFrameField.helpText}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onChange(firstFrameField.key, !firstFrameMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                firstFrameMode ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  firstFrameMode ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
        <div className="mb-2 text-[13px] font-medium text-foreground">
          {sceneKey === "wind" ? "添加参考素材" : "添加素材"}
        </div>
        <div className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-7 text-center">
          <div className="inline-flex h-9 items-center rounded-md border border-border bg-background px-7 text-[13px] text-foreground">
            上传图片
          </div>
          <div className="mt-3 text-[12px] text-muted-foreground">
            将文件拖放到此处，不超过 {sceneKey === "model" || sceneKey === "product" ? 1000 : 100} 张
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <div className="h-9 rounded-md border border-border bg-background px-7 text-[13px] leading-9 text-foreground">
            从我的空间选取
          </div>
        </div>
      </div>

      {sceneKey === "model" || sceneKey === "product" ? (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-foreground/80">
            该场景适合上传主体清晰的商品或模特图片，预览会优先按当前效果卡片和生成规则来展示。
          </p>
        </div>
      ) : null}

      {creativeModeField ? (
        <div className="space-y-3">
          <div className="text-[13px] font-medium text-foreground">视频创意</div>
          <div className="flex items-center gap-5 text-[13px]">
            {creativeModeField.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-foreground">
                <input
                  type="radio"
                  checked={creativeMode === option.value}
                  onChange={() => onChange(creativeModeField.key, option.value)}
                  className="accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {creativeMode === "preset" && effectPresetField ? (
        <div className="space-y-3">
          <div className="text-[13px] font-medium text-foreground">{effectPresetField.label}</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {effectPresetField.options?.map((option) => (
              <VideoOptionCard
                key={option.value}
                option={option}
                active={effectPreset === option.value}
                onClick={() => onChange(effectPresetField.key, option.value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {genModeField ? (
        <div className="space-y-3">
          <div className="text-[13px] font-medium text-foreground">{genModeField.label}</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {genModeField.options?.map((option) => (
              <GenModeCard
                key={option.value}
                option={option}
                active={genMode === option.value}
                onClick={() => onChange(genModeField.key, option.value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {sceneKey === "wind" && windStyleField ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/15 p-4">
          <div className="text-[13px] font-medium text-foreground">{windStyleField.label}</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {windStyleField.options?.map((option) => (
              <VideoOptionCard
                key={option.value}
                option={option}
                active={windStyle === option.value}
                onClick={() => onChange(windStyleField.key, option.value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {durationField ? (
          <div className="space-y-2">
            <div className="text-[13px] font-medium text-foreground">{durationField.label}</div>
            <InlineOptionButtons
              field={durationField}
              value={duration}
              onChange={(next) => onChange(durationField.key, next)}
            />
          </div>
        ) : null}

        {quantityField ? (
          <div className="space-y-2">
            <div className="text-[13px] font-medium text-foreground">{quantityField.label}</div>
            <InlineOptionButtons
              field={quantityField}
              value={quantity}
              onChange={(next) => onChange(quantityField.key, next)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function VideoTaskModal({
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
  const scenePresets = useFeatureSceneTabs("video");
  const [sceneTab, setSceneTab] = useState("model");
  const { preset, formValues, handleChange, submitParams } = useSceneFormState("video", sceneTab, open);
  const [customPrompts, setCustomPrompts] = useState<PromptEntry[]>([
    createPromptEntry(),
    createPromptEntry(),
  ]);

  useEffect(() => {
    if (scenePresets.length && !scenePresets.some((item) => item.sceneKey === sceneTab)) {
      setSceneTab(scenePresets[0].sceneKey);
    }
  }, [scenePresets, sceneTab]);

  useEffect(() => {
    if (!open) {
      setCustomPrompts([createPromptEntry(), createPromptEntry()]);
    }
  }, [open]);

  const creativeModeField = useMemo(() => findField(preset?.formFields ?? [], "creativeMode"), [preset]);
  const effectPresetField = useMemo(() => findField(preset?.formFields ?? [], "effectPreset"), [preset]);
  const genModeField = useMemo(() => findField(preset?.formFields ?? [], "genMode"), [preset]);
  const durationField = useMemo(() => findField(preset?.formFields ?? [], "duration"), [preset]);
  const quantityField = useMemo(() => findField(preset?.formFields ?? [], "quantity"), [preset]);
  const firstFrameField = useMemo(() => findField(preset?.formFields ?? [], "firstFrameMode"), [preset]);

  const creativeMode = String(readValue(formValues, creativeModeField) ?? "preset");
  const effectPreset = String(readValue(formValues, effectPresetField) ?? "");
  const genMode = String(readValue(formValues, genModeField) ?? "standard");
  const duration = readValue(formValues, durationField);
  const quantity = Number(readValue(formValues, quantityField) ?? 1);
  const firstFrameMode = Boolean(readValue(formValues, firstFrameField));

  const showCustomPrompts =
    (sceneTab === "model" || sceneTab === "product") && creativeMode === "custom";

  const updatePrompt = (id: string, text: string) => {
    setCustomPrompts((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const removePrompt = (id: string) => {
    setCustomPrompts((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const addPrompt = () => {
    setCustomPrompts((prev) => [...prev, createPromptEntry()]);
  };

  const sceneLabel = scenePresets.find((item) => item.sceneKey === sceneTab)?.sceneLabel ?? sceneTab;

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(980px,94vw)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新建视频生成任务</Dialog.Title>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-6 border-b border-border/80 px-5">
            {(scenePresets.length ? scenePresets : [{ sceneKey: "model", sceneLabel: "模特动作" }]).map((tab) => (
              <button
                key={tab.sceneKey}
                onClick={() => setSceneTab(tab.sceneKey)}
                className={`-mb-px border-b-2 py-3 text-[13px] font-medium transition-colors ${
                  sceneTab === tab.sceneKey
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.sceneLabel}
              </button>
            ))}
          </div>

          <div className="max-h-[calc(92vh-140px)] space-y-5 overflow-y-auto px-5 py-4">
            {firstFrameField ? (
              <div className="rounded-xl border border-border bg-muted/25 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{firstFrameField.label}</div>
                    {firstFrameField.helpText ? (
                      <div className="mt-1 text-[11px] text-muted-foreground">{firstFrameField.helpText}</div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange(firstFrameField.key, !firstFrameMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      firstFrameMode ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        firstFrameMode ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : null}

            {(sceneTab === "model" || sceneTab === "product") && (
              <>
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                  <AssetUploadZone assets={assets} onAssetsChange={setAssets} maxFiles={1000} />
                  <div className="mt-3 flex items-center justify-center">
                    <SelectFromMySpaceButton
                      onPick={(picked) => setAssets([...assets, ...picked])}
                      className="bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <Info size={15} className="mt-0.5 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-foreground/80">
                    该场景适合上传主体清晰的商品或模特图片，当前面板会优先使用后台配置的效果卡片和生成规则。
                    {sceneTab === "model" ? (
                      <>
                        如果是纯衣服展示，可往{" "}
                        <button className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80">
                          模特试衣
                          <ChevronRight size={12} />
                        </button>{" "}
                        进行模特上身。
                      </>
                    ) : null}
                  </p>
                </div>
              </>
            )}

            {sceneTab === "wind" ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                <div className="mb-2 text-[13px] font-medium text-foreground">添加参考素材</div>
                <AssetUploadZone assets={assets} onAssetsChange={setAssets} maxFiles={100} />
                <div className="mt-3 flex items-center justify-center">
                  <SelectFromMySpaceButton
                    onPick={(picked) => setAssets([...assets, ...picked])}
                    className="bg-transparent"
                  />
                </div>
              </div>
            ) : null}

            {creativeModeField ? (
              <div className="space-y-3">
                <div className="text-[13px] font-medium text-foreground">视频创意</div>
                <div className="flex items-center gap-5 text-[13px]">
                  {creativeModeField.options?.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-foreground">
                      <input
                        type="radio"
                        checked={creativeMode === option.value}
                        onChange={() => handleChange(creativeModeField.key, option.value)}
                        className="accent-primary"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {creativeMode === "preset" && effectPresetField ? (
              <div className="space-y-3">
                <div className="text-[13px] font-medium text-foreground">{effectPresetField.label}</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {effectPresetField.options?.map((option) => (
                    <VideoOptionCard
                      key={option.value}
                      option={option}
                      active={effectPreset === option.value}
                      onClick={() => handleChange(effectPresetField.key, option.value)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {showCustomPrompts ? (
              <div className="space-y-3">
                <div className="text-[13px] font-medium text-foreground">自定义提示词</div>
                <CustomPromptList
                  prompts={customPrompts}
                  onUpdate={updatePrompt}
                  onRemove={removePrompt}
                  onAdd={addPrompt}
                />
              </div>
            ) : null}

            {genModeField ? (
              <div className="space-y-3">
                <div className="text-[13px] font-medium text-foreground">{genModeField.label}</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {genModeField.options?.map((option) => (
                    <GenModeCard
                      key={option.value}
                      option={option}
                      active={genMode === option.value}
                      onClick={() => handleChange(genModeField.key, option.value)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {durationField ? (
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground">{durationField.label}</div>
                  <InlineOptionButtons
                    field={durationField}
                    value={duration}
                    onChange={(next) => handleChange(durationField.key, next)}
                  />
                </div>
              ) : null}

              {quantityField ? (
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground">{quantityField.label}</div>
                  <InlineOptionButtons
                    field={quantityField}
                    value={quantity}
                    onChange={(next) => handleChange(quantityField.key, next)}
                  />
                </div>
              ) : null}
            </div>

            {sceneTab === "wind" && preset ? (
              <div className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
                {preset.formFields
                  .filter((field) => !["duration"].includes(field.key))
                  .map((field) => {
                    if (field.key === "windStyle") {
                      const current = String(formValues[field.key] ?? field.defaultValue);
                      return (
                        <div key={field.id} className="space-y-3">
                          <div className="text-[13px] font-medium text-foreground">{field.label}</div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {field.options?.map((option) => (
                              <VideoOptionCard
                                key={option.value}
                                option={option}
                                active={current === option.value}
                                onClick={() => handleChange(field.key, option.value)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="h-9 rounded-md border border-border bg-transparent px-5 text-[13px] text-foreground transition-colors hover:bg-muted/40"
              >
                取消
              </button>
              <button
                onClick={() =>
                  onSubmit?.(
                    assetsToSubmitInput(assets, {
                      quantity,
                      mediaKind: "video",
                      params: [{ label: "场景", value: sceneLabel }, ...submitParams()],
                    }),
                  )
                }
                className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-primary/90"
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
