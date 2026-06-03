import { useEffect, useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Info, X } from "lucide-react";
import type { UploadedAsset } from "./api/uploadApi";
import { assetsToSubmitInput, type SubmitFeatureTaskInput } from "./featureTasks";
import { SelectFromMySpaceButton } from "./SelectFromMySpaceButton";
import { TaskMaterialUploadSection } from "./TaskMaterialUploadSection";
import { useInitialAssets } from "./useInitialAssets";
import { DynamicFormFields } from "./components/DynamicFormFields";
import {
  CRACK_SCENE_KEYS,
  applyOptionChange,
  buildScenePrompt,
  collectDefaultValues,
  flattenFieldsForParams,
  type FormValue,
  getSceneFormPreset,
  listSceneFormPresets,
  subscribeScenePresets,
  getScenePresets,
} from "../shared/sceneFormSchema";

function useScenePresets() {
  return useSyncExternalStore(subscribeScenePresets, getScenePresets, getScenePresets);
}

export function CrackScenePresetPreview({
  sceneKey,
  fields,
  values,
  onChange,
}: {
  sceneKey: string;
  fields: import("../shared/sceneFormSchema").FormControl[];
  values: Record<string, FormValue>;
  onChange: (key: string, value: FormValue) => void;
}) {
  const scenePreset = {
    formFields: fields,
  };
  const ironStyleField = fields.find((field) => field.key === "ironStyle");
  const sampleOptions = (ironStyleField?.options ?? []).slice(0, 4);
  const clockTickStyles = [1, 2, 3, 4, 5, 6, 7, 8];
  const tinTextures = [1, 2, 3, 4, 5, 6];

  if (sceneKey === "挂钟") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-6">
          <div className="flex items-center justify-center gap-3">
            <button className="h-9 rounded-md border border-border bg-transparent px-7 text-[13px] text-foreground">
              上传图片
            </button>
            <button className="h-9 rounded-md border border-border bg-transparent px-7 text-[13px] text-foreground">
              从我的空间选取
            </button>
          </div>
          <div className="mt-3 text-center text-[12px] text-muted-foreground">
            将文件/文件夹拖放到此处，不超过1000张
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 border-t border-dashed border-border/60 pt-3">
            <span className="text-[14px] font-medium text-muted-foreground">没有参考图？试试</span>
            {["青", "橙", "蓝", "湖"].map((label, index) => (
              <button
                key={label}
                className={`h-12 w-12 rounded-md border border-border text-[13px] text-foreground ${
                  index === 0 ? "bg-primary/10 border-primary" : "bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[13px] font-medium text-foreground">生成模式</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {["3D立体增强V2", "3D立体增强", "通用"].map((mode, index) => (
              <button
                key={mode}
                type="button"
                className={`rounded-xl border p-3 text-left transition-colors ${
                  index === 0 ? "border-primary bg-primary/10" : "border-border bg-muted"
                }`}
              >
                <div className="text-[22px] font-semibold text-foreground">{mode}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {index === 0
                    ? "生成效果更立体"
                    : index === 1
                      ? "不支持自定义表盘"
                      : "表盘种类更丰富"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[13px] font-medium text-foreground">选择表盘刻度样式</div>
          <select className="h-8 rounded-md border border-border bg-muted px-2 text-[13px] text-foreground">
            <option>随机组合生成</option>
            <option>固定刻度样式</option>
          </select>
        </div>

        <div className="rounded-xl border border-border bg-muted p-3">
          <label className="mb-3 flex items-center gap-2 text-[14px] text-foreground">
            <input type="radio" checked readOnly className="accent-primary" />
            表盘刻度
          </label>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {clockTickStyles.map((styleNo, index) => (
              <button
                key={styleNo}
                type="button"
                className={`h-20 rounded-md border p-1 ${
                  index === 0 ? "border-primary bg-primary/10" : "border-border bg-muted"
                }`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full border border-[#bababa] bg-white text-[11px] text-[#444]">
                  {styleNo}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="font-medium text-foreground">出图数量</span>
          {[1, 2, 4, 6, 8].map((num, index) => (
            <button
              key={num}
              type="button"
              className={`min-w-8 rounded-md border px-2 py-1.5 ${
                index === 1 ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (sceneKey === "铁皮画") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-5 text-[13px]">
          <span className="flex items-center gap-1 font-medium text-foreground">
            模式选择 <Info size={13} className="text-muted-foreground" />
          </span>
          <label className="flex items-center gap-2 text-foreground">
            <input type="radio" checked readOnly className="accent-primary" />
            艺术设计
          </label>
          <label className="flex items-center gap-2 text-foreground">
            <input type="radio" readOnly className="accent-primary" />
            文字强化
          </label>
        </div>

        <div className="rounded-xl border border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <span className="min-w-[94px] text-[13px] text-foreground">参考强度</span>
            <input type="range" min={0} max={1} step={0.1} defaultValue={1} className="w-[220px] accent-primary" />
            <span className="text-[13px] text-foreground">高</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[13px]">
          <span className="flex items-center gap-1 font-medium text-foreground">
            形状 <Info size={13} className="text-muted-foreground" />
          </span>
          <label className="flex items-center gap-2 text-foreground">
            <input type="radio" checked readOnly className="accent-primary" />
            默认
          </label>
          <label className="flex items-center gap-2 text-foreground">
            <input type="radio" readOnly className="accent-primary" />
            圆形
          </label>
        </div>

        <div className="rounded-xl border border-border bg-muted p-3">
          <label className="mb-3 flex items-center gap-2 text-[13px] text-foreground">
            <input type="checkbox" checked readOnly className="accent-primary" />
            贴合样式
          </label>
          <div className="mb-3 flex items-center gap-4 text-[13px] text-foreground">
            <label className="flex items-center gap-2">
              <input type="radio" checked readOnly className="accent-primary" />
              锈斑
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" readOnly className="accent-primary" />
              自定义上传
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
            {tinTextures.map((styleNo, index) => (
              <button
                key={styleNo}
                type="button"
                className={`h-20 rounded-md border p-1 ${
                  index === 0 ? "border-primary bg-primary/10" : "border-border bg-secondary"
                }`}
              >
                <div className="h-full w-full rounded-sm border border-[#5c606a] bg-gradient-to-br from-[#64676f] via-[#4c4f56] to-[#2f3138]" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="font-medium text-foreground">出图数量</span>
          {[1, 2, 4, 6, 8].map((num, index) => (
            <button
              key={num}
              type="button"
              className={`min-w-8 rounded-md border px-2 py-1.5 ${
                index === 1 ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (sceneKey === "铁艺图形") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-6">
          <div className="flex items-center justify-center gap-3">
            <button className="h-9 rounded-md border border-border bg-transparent px-7 text-[13px] text-foreground">
              上传图片
            </button>
            <button className="h-9 rounded-md border border-border bg-transparent px-7 text-[13px] text-foreground">
              从我的空间选取
            </button>
          </div>
          <div className="mt-3 text-center text-[12px] text-muted-foreground">
            将文件/文件夹拖放到此处，不超过1000张
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 border-t border-dashed border-border/60 pt-3">
            <span className="text-[14px] font-medium text-muted-foreground">没有参考图？试试</span>
            {sampleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange("ironStyle", option.value)}
                className="h-12 w-12 rounded-md border border-border bg-secondary text-[13px] text-foreground"
              >
                {option.previewText || option.label.slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
        <DynamicFormFields fields={scenePreset.formFields} values={values} onChange={onChange} />
      </div>
    );
  }

  return <DynamicFormFields fields={scenePreset.formFields} values={values} onChange={onChange} />;
}

export function CrackImageModal({
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
  const [scene, setScene] = useState("默认");
  const [mode, setMode] = useState<"art" | "text" | "hot" | "general">("art");
  const [onlyPatternPart, setOnlyPatternPart] = useState(true);
  const [shape, setShape] = useState<"default" | "circle">("default");
  const [ratio, setRatio] = useState("原图比例");
  const [count, setCount] = useState(2);
  const [hotVariant, setHotVariant] = useState<"主体" | "姿势" | "背景" | "爆改">("爆改");
  const [bgColor, setBgColor] = useState<"随机" | "黑色" | "白色">("随机");
  const [clockGenMode, setClockGenMode] = useState<"3D立体增强V2" | "3D立体增强" | "通用">("3D立体增强V2");
  const [clockTickStyle, setClockTickStyle] = useState(1);
  const [tinMode, setTinMode] = useState<"art" | "text">("art");
  const [tinEffectEnabled, setTinEffectEnabled] = useState(true);
  const [tinEffectSource, setTinEffectSource] = useState<"rust" | "upload">("rust");
  const [tinEffectStyle, setTinEffectStyle] = useState(1);
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});

  useScenePresets();
  const sceneTabs = listSceneFormPresets("crack").map((p) => p.sceneKey);
  const fallbackTabs = sceneTabs.length ? sceneTabs : [...CRACK_SCENE_KEYS];
  const scenePreset = getSceneFormPreset("crack", scene);
  const isIronScene = scene === "铁艺图形";
  const isClockScene = scene === "挂钟";
  const isTinScene = scene === "铁皮画";
  const useConfigForm = !isClockScene && !isTinScene && Boolean(scenePreset);

  useEffect(() => {
    if (!open || !scenePreset || !useConfigForm) return;
    setFormValues(collectDefaultValues(scenePreset.formFields));
    const modeVal = scenePreset.formFields.find((f) => f.key === "mode")?.defaultValue;
    if (modeVal) setMode(String(modeVal) as typeof mode);
  }, [open, scene, scenePreset, useConfigForm]);

  const handleConfigFormChange = (key: string, value: FormValue) => {
    if (!scenePreset) return;
    setFormValues((prev) => {
      const base = { ...collectDefaultValues(scenePreset.formFields), ...prev };
      const next = applyOptionChange(scenePreset.formFields, base, key, value);
      if (key === "mode") setMode(String(value) as typeof mode);
      if (key === "count") setCount(Number(next.count ?? count));
      if (key === "ratio") setRatio(String(next.ratio ?? ratio));
      return next;
    });
  };
  const clockTickStyles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const tinTextures = [1, 2, 3, 4, 5, 6, 7];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(920px,94vw)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新建图裂变任务</Dialog.Title>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto max-h-[calc(90vh-72px)] space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {fallbackTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setScene(tab)}
                  className={`h-10 px-6 rounded-lg border text-[15px] font-semibold transition-colors ${
                    scene === tab
                      ? "bg-primary text-white border-primary"
                      : "bg-muted text-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <TaskMaterialUploadSection
              assets={assets}
              onAssetsChange={setAssets}
            />

            {isIronScene && scenePreset ? (
              <>
                <div className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <button className="h-9 px-7 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:border-primary/50 transition-colors">
                      上传图片
                    </button>
                    <SelectFromMySpaceButton
                      onPick={(picked) => setAssets([...assets, ...picked])}
                      className="bg-transparent"
                    />
                  </div>
                  <div className="mt-3 text-center text-[12px] text-muted-foreground">将文件/文件夹拖放到此处，不超过1000张</div>
                  <div className="mt-6 border-t border-dashed border-border/60 pt-3 flex items-center justify-center gap-3">
                    <span className="text-[14px] font-medium text-muted-foreground">没有参考图？试试</span>
                    {(scenePreset.formFields.find((field) => field.key === "ironStyle")?.options ?? [])
                      .slice(0, 4)
                      .map((option) => (
                      <button
                        key={`sample-${option.value}`}
                        onClick={() => handleConfigFormChange("ironStyle", option.value)}
                        className="w-12 h-12 rounded-md border border-border bg-secondary text-[13px] text-foreground hover:border-primary/50 transition-colors"
                      >
                        {option.previewText || option.label.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                </div>
                <DynamicFormFields
                  fields={scenePreset.formFields}
                  values={{
                    ...collectDefaultValues(scenePreset.formFields),
                    ...formValues,
                  }}
                  onChange={handleConfigFormChange}
                />
              </>
            ) : isClockScene ? (
              <>
                <div className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <button className="h-9 px-7 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:border-primary/50 transition-colors">
                      上传图片
                    </button>
                    <SelectFromMySpaceButton
                      onPick={(picked) => setAssets([...assets, ...picked])}
                      className="bg-transparent"
                    />
                  </div>
                  <div className="mt-3 text-center text-[12px] text-muted-foreground">将文件/文件夹拖放到此处，不超过1000张</div>
                  <div className="mt-6 border-t border-dashed border-border/60 pt-3 flex items-center justify-center gap-3">
                    <span className="text-[14px] font-medium text-muted-foreground">没有参考图？试试</span>
                    {["from-emerald-500 to-lime-400", "from-orange-400 to-amber-200", "from-sky-400 to-indigo-500", "from-cyan-400 to-blue-400"].map((bg, i) => (
                      <button
                        key={`clock-sample-${i}`}
                        className={`w-12 h-12 rounded-md border border-border bg-gradient-to-br ${bg} hover:scale-105 transition-transform`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[13px] font-medium text-foreground mb-2">生成模式</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setClockGenMode("3D立体增强V2")}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        clockGenMode === "3D立体增强V2" ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-border/80"
                      }`}
                    >
                      <div className="text-[26px] leading-none text-primary font-semibold">3D</div>
                      <div className="text-[20px] leading-tight text-primary font-semibold mt-1">立体增强V2</div>
                      <div className="mt-1 text-[20px] leading-tight text-primary font-semibold">生成效果更立体</div>
                    </button>
                    <button
                      onClick={() => setClockGenMode("3D立体增强")}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        clockGenMode === "3D立体增强" ? "border-primary bg-primary/5" : "border-border bg-muted hover:border-border/80"
                      }`}
                    >
                      <div className="text-[22px] leading-none text-foreground font-semibold">3D立体增强</div>
                      <div className="mt-1 text-[20px] leading-tight text-foreground font-semibold">不支持自定义表盘</div>
                    </button>
                    <button
                      onClick={() => setClockGenMode("通用")}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        clockGenMode === "通用" ? "border-primary bg-primary/5" : "border-border bg-muted hover:border-border/80"
                      }`}
                    >
                      <div className="text-[22px] leading-none text-foreground font-semibold">通用</div>
                      <div className="mt-1 text-[20px] leading-tight text-foreground font-semibold">表盘种类更丰富</div>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-medium text-foreground">选择表盘刻度样式</div>
                  <select className="h-8 rounded-md border border-border bg-muted px-2 text-[13px] text-foreground outline-none focus:border-primary/60">
                    <option>随机组合生成</option>
                    <option>固定刻度样式</option>
                  </select>
                </div>

                <div className="rounded-xl border border-border bg-muted p-3">
                  <label className="flex items-center gap-2 cursor-pointer text-[14px] text-foreground mb-3">
                    <input type="radio" checked readOnly className="accent-primary" />
                    表盘刻度
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {clockTickStyles.map((styleNo) => {
                      const active = styleNo === clockTickStyle;
                      return (
                        <button
                          key={styleNo}
                          onClick={() => setClockTickStyle(styleNo)}
                          className={`h-20 rounded-md border p-1 transition-all ${
                            active ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-primary/50"
                          }`}
                        >
                          <div className="w-full h-full rounded-full border border-[#bababa] bg-white flex items-center justify-center text-[11px] text-[#444]">
                            {styleNo}
                          </div>
                        </button>
                      );
                    })}
                    <button className="h-20 rounded-md border border-border bg-muted text-[16px] text-foreground hover:bg-secondary transition-colors">
                      更多 &gt;
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                  <span className="text-foreground font-medium">出图数量</span>
                  {[1, 2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`min-w-8 h-8 px-2 rounded-md border transition-colors ${
                        count === n ? "border-primary text-primary bg-primary/10" : "border-border text-foreground hover:border-border/80"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </>
            ) : isTinScene ? (
              <>
                <div className="flex items-center gap-5 text-[13px]">
                  <span className="text-foreground font-medium flex items-center gap-1">
                    模式选择 <Info size={13} className="text-muted-foreground" />
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-foreground">
                    <input type="radio" checked={tinMode === "art"} onChange={() => setTinMode("art")} className="accent-primary" />
                    艺术设计
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-foreground">
                    <input type="radio" checked={tinMode === "text"} onChange={() => setTinMode("text")} className="accent-primary" />
                    文字强化
                  </label>
                </div>

                <div className="rounded-xl border border-border bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <span className="min-w-[94px] text-[13px] text-foreground flex items-center gap-1">
                      参考强度 <Info size={13} className="text-muted-foreground" />
                    </span>
                    <input type="range" min={0} max={1} step={0.1} defaultValue={1} className="w-[220px] accent-primary" />
                    <span className="text-[13px] text-foreground">高</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-[13px]">
                  <span className="text-foreground font-medium flex items-center gap-1">
                    形状 <Info size={13} className="text-muted-foreground" />
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-foreground">
                    <input type="radio" checked={shape === "default"} onChange={() => setShape("default")} className="accent-primary" />
                    默认
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-foreground">
                    <input type="radio" checked={shape === "circle"} onChange={() => setShape("circle")} className="accent-primary" />
                    圆形
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[13px] text-foreground font-medium flex items-center gap-1">
                    裂变内容 <Info size={13} className="text-muted-foreground" />
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
                    <input
                      type="checkbox"
                      checked={onlyPatternPart}
                      onChange={(e) => setOnlyPatternPart(e.target.checked)}
                      className="accent-primary"
                    />
                    仅裂变素材中的图案部分
                  </label>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                  <span className="text-foreground font-medium">尺寸比例</span>
                  <select
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    className="h-8 rounded-md border border-border bg-muted px-2 text-[13px] text-foreground outline-none focus:border-primary/60"
                  >
                    <option>2:3</option>
                    <option>原图比例</option>
                    <option>1:1</option>
                    <option>3:2</option>
                    <option>9:16</option>
                    <option>16:9</option>
                  </select>
                </div>

                <div>
                  <div className="text-[13px] font-medium text-foreground mb-2">效果</div>
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground mb-2">
                    <input
                      type="checkbox"
                      checked={tinEffectEnabled}
                      onChange={(e) => setTinEffectEnabled(e.target.checked)}
                      className="accent-primary"
                    />
                    贴合样式
                  </label>
                  <div className="rounded-xl border border-border bg-muted p-3">
                    <div className="flex items-center gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
                        <input
                          type="radio"
                          checked={tinEffectSource === "rust"}
                          onChange={() => setTinEffectSource("rust")}
                          className="accent-primary"
                        />
                        锈斑
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
                        <input
                          type="radio"
                          checked={tinEffectSource === "upload"}
                          onChange={() => setTinEffectSource("upload")}
                          className="accent-primary"
                        />
                        自定义上传
                      </label>
                    </div>
                    {tinEffectSource === "rust" ? (
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {tinTextures.map((styleNo) => {
                          const active = styleNo === tinEffectStyle;
                          return (
                            <button
                              key={styleNo}
                              onClick={() => setTinEffectStyle(styleNo)}
                              className={`h-20 rounded-md border p-1 transition-all ${
                                active ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/50"
                              }`}
                            >
                              <div className="w-full h-full rounded-sm bg-gradient-to-br from-[#64676f] via-[#4c4f56] to-[#2f3138] border border-[#5c606a]" />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border/70 bg-background p-3">
                        <button className="h-10 px-4 rounded-md border border-border bg-transparent text-[14px] text-foreground hover:border-primary/50 transition-colors">
                          ＋ 上传透明底锈斑图
                        </button>
                        <div className="mt-3 text-[13px] text-primary underline underline-offset-2 cursor-pointer hover:text-primary/85">
                          下载示例文件
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                  <span className="text-foreground font-medium">出图数量</span>
                  {[1, 2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`min-w-8 h-8 px-2 rounded-md border transition-colors ${
                        count === n ? "border-primary text-primary bg-primary/10" : "border-border text-foreground hover:border-border/80"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

              </>
            ) : useConfigForm && scenePreset ? (
              <DynamicFormFields
                fields={scenePreset.formFields}
                values={{
                  ...collectDefaultValues(scenePreset.formFields),
                  ...formValues,
                }}
                onChange={handleConfigFormChange}
              />
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="h-9 px-5 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:bg-muted/40 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const quantity = Number(formValues.count ?? count);
                  const params =
                    useConfigForm && scenePreset
                      ? [
                          { label: "商品场景", value: scene },
                          ...flattenFieldsForParams(scenePreset.formFields, formValues),
                          { label: "合成提示词", value: buildScenePrompt(scenePreset, formValues) },
                        ]
                      : [
                          { label: "商品类型", value: scene },
                          { label: "模式", value: mode },
                          { label: "尺寸比例", value: ratio },
                        ];
                  onSubmit?.(assetsToSubmitInput(assets, { quantity, params }));
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
