import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Switch } from "./components/ui/switch";

export type WorkflowNodeConfigMap = Record<string, Record<string, unknown>>;

type PanelProps = {
  config: Record<string, unknown>;
  onConfigChange: (patch: Record<string, unknown>) => void;
  manualReview: boolean;
  onManualReviewChange: (v: boolean) => void;
};

const LABEL_ALIASES: Record<string, string> = {
  围裂变: "图裂变",
};

export function resolveWorkflowNodeKind(label: string): string {
  return LABEL_ALIASES[label] ?? label;
}

function ManualReviewToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 pt-2 border-t border-border/60">
      <div>
        <div className="text-[13px] font-medium text-foreground">人工审核</div>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          该节点任务结束后，进行人工审核与验收
        </p>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

function FieldLabel({ children, hint }: { children: ReactNode; hint?: boolean }) {
  return (
    <span className="text-[13px] font-medium text-foreground flex items-center gap-1 shrink-0">
      {children}
      {hint && <Info size={13} className="text-muted-foreground" />}
    </span>
  );
}

function PillTabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`h-8 px-3 rounded-md border text-[12px] font-medium transition-colors ${
            value === tab
              ? "bg-primary text-white border-primary"
              : "bg-muted/50 text-foreground border-border hover:border-primary/40"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function CountPicker({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`min-w-9 h-8 px-2 rounded-md border text-[13px] transition-colors ${
            value === n
              ? "border-primary text-primary bg-primary/10"
              : "border-border text-foreground hover:border-primary/40"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function cfgStr(config: Record<string, unknown>, key: string, fallback: string) {
  const v = config[key];
  return typeof v === "string" ? v : fallback;
}

function cfgBool(config: Record<string, unknown>, key: string, fallback: boolean) {
  const v = config[key];
  return typeof v === "boolean" ? v : fallback;
}

function cfgNum(config: Record<string, unknown>, key: string, fallback: number) {
  const v = config[key];
  return typeof v === "number" ? v : fallback;
}

function MaterialNodeConfig() {
  return (
    <p className="text-[13px] text-muted-foreground leading-relaxed">
      工作流起始节点。执行任务时将引导上传图片或从「我的空间」选取素材，无需在此配置参数。
    </p>
  );
}

function PatternExtractNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const mode = cfgStr(config, "mode", "pro");
  const transparentBg = cfgBool(config, "transparentBg", true);
  const resolution = cfgStr(config, "resolution", "1k");
  const ratio = cfgStr(config, "ratio", "1:1");

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>模式选择</FieldLabel>
        <div className="grid grid-cols-1 gap-3 mt-2">
          <button
            type="button"
            onClick={() => onConfigChange({ mode: "pro" })}
            className={`text-left rounded-xl border p-3 transition-colors ${
              mode === "pro" ? "border-primary/80 bg-primary/5" : "border-border bg-muted/30 hover:border-primary/35"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-primary border border-primary/40 px-1.5 py-0.5 rounded">
                专刀
              </span>
              <span className="text-[14px] font-semibold text-foreground">专项提取</span>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">
              适用遮挡少的印花类商品，支持抱枕/地毯/杯子/拖鞋/手机壳等品类
            </p>
          </button>
          <button
            type="button"
            onClick={() => onConfigChange({ mode: "all" })}
            className={`text-left rounded-xl border p-3 transition-colors ${
              mode === "all" ? "border-primary/80 bg-primary/5" : "border-border bg-muted/30 hover:border-primary/35"
            }`}
          >
            <div className="text-[14px] font-semibold text-foreground">全能提取</div>
            <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">
              适用大幅褶皱、遮挡严重、低清晰度或全副印花商品
            </p>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FieldLabel hint>透明底图</FieldLabel>
        <Switch checked={transparentBg} onCheckedChange={(v) => onConfigChange({ transparentBg: v })} />
      </div>

      <div className="flex flex-wrap items-center gap-6 text-[13px]">
        <div className="flex items-center gap-4">
          <FieldLabel>分辨率</FieldLabel>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={resolution === "1k"}
              onChange={() => onConfigChange({ resolution: "1k" })}
              className="accent-[var(--primary)]"
            />
            标清(1k)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={resolution === "4k"}
              onChange={() => onConfigChange({ resolution: "4k" })}
              className="accent-[var(--primary)]"
            />
            超清(4k)
          </label>
        </div>
        <div className="flex items-center gap-3">
          <FieldLabel>尺寸比例</FieldLabel>
          <select
            value={ratio}
            onChange={(e) => onConfigChange({ ratio: e.target.value })}
            className="h-8 rounded-md border border-border bg-muted/50 px-2 text-foreground outline-none focus:border-primary/60"
          >
            {["1:1", "2:3", "3:2", "9:16", "16:9"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function CrackNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const scene = cfgStr(config, "scene", "服装/纺织");
  const mode = cfgStr(config, "crackMode", "art");
  const onlyPatternPart = cfgBool(config, "onlyPatternPart", true);
  const ratio = cfgStr(config, "ratio", "原图比例");
  const count = cfgNum(config, "count", 4);
  const nightMode = cfgBool(config, "nightMode", false);

  return (
    <div className="space-y-5">
      <PillTabs
        options={["默认", "服装/纺织", "手机壳", "铁艺图形", "挂钟", "装饰画", "铁皮画"]}
        value={scene}
        onChange={(v) => onConfigChange({ scene: v })}
      />

      <div className="space-y-3">
        <FieldLabel hint>模式选择</FieldLabel>
        <div className="flex flex-wrap gap-4 text-[13px]">
          {[
            ["art", "艺术设计"],
            ["text", "文字强化"],
            ["general", "通用"],
          ].map(([value, text]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === value}
                onChange={() => onConfigChange({ crackMode: value })}
                className="accent-[var(--primary)]"
              />
              {text}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel hint>参考强度</FieldLabel>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          defaultValue={cfgNum(config, "refStrength", 0.6)}
          onChange={(e) => onConfigChange({ refStrength: Number(e.target.value) })}
          className="flex-1 accent-[var(--primary)]"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-[13px]">
        <input
          type="checkbox"
          checked={onlyPatternPart}
          onChange={(e) => onConfigChange({ onlyPatternPart: e.target.checked })}
          className="accent-[var(--primary)]"
        />
        <span className="font-medium">裂变内容</span>
        <span className="text-muted-foreground">仅裂变素材中的图案部分</span>
      </label>

      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>尺寸比例</FieldLabel>
        <select
          value={ratio}
          onChange={(e) => onConfigChange({ ratio: e.target.value })}
          className="h-8 flex-1 rounded-md border border-border bg-muted/50 px-2 outline-none focus:border-primary/60"
        >
          {["原图比例", "1:1", "2:3", "3:2", "9:16", "16:9"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>出图数量</FieldLabel>
        <CountPicker options={[1, 2, 4, 6, 8]} value={count} onChange={(n) => onConfigChange({ count: n })} />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-foreground">夜间模式</div>
          <p className="mt-1 text-[12px] text-muted-foreground">错峰调度任务，享夜间折扣</p>
        </div>
        <Switch checked={nightMode} onCheckedChange={(v) => onConfigChange({ nightMode: v })} />
      </div>

      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function CutoutNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const cutoutMode = cfgStr(config, "cutoutMode", "background");
  const edgeProcessing = cfgBool(config, "edgeProcessing", false);

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>抠图模式</FieldLabel>
        <div className="flex flex-wrap gap-6 mt-2 text-[13px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={cutoutMode === "background"}
              onChange={() => onConfigChange({ cutoutMode: "background" })}
              className="accent-[var(--primary)]"
            />
            去背景
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={cutoutMode === "head"}
              onChange={() => onConfigChange({ cutoutMode: "head" })}
              className="accent-[var(--primary)]"
            />
            抠头
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <FieldLabel hint>边缘处理</FieldLabel>
          <Switch checked={edgeProcessing} onCheckedChange={(v) => onConfigChange({ edgeProcessing: v })} />
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground">自动裁剪掉印花边缘空白的区域</p>
      </div>

      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function ProductSetNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const edgeProcessing = cfgBool(config, "edgeProcessing", true);
  const strokeEnabled = cfgBool(config, "strokeEnabled", true);
  const duplicateCheck = cfgBool(config, "duplicateCheck", false);
  const fileFormat = cfgStr(config, "fileFormat", "JPEG");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel hint>印花查重校验</FieldLabel>
        <Switch checked={duplicateCheck} onCheckedChange={(v) => onConfigChange({ duplicateCheck: v })} />
      </div>

      <div>
        <FieldLabel>印花处理</FieldLabel>
        <div className="mt-3 space-y-4 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="flex items-center gap-3">
            <span className="text-[13px]">边缘处理</span>
            <Switch checked={edgeProcessing} onCheckedChange={(v) => onConfigChange({ edgeProcessing: v })} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px]">描边</span>
            <Switch checked={strokeEnabled} onCheckedChange={(v) => onConfigChange({ strokeEnabled: v })} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>输出格式</FieldLabel>
        <select
          value={fileFormat}
          onChange={(e) => onConfigChange({ fileFormat: e.target.value })}
          className="h-8 rounded-md border border-border bg-muted/50 px-2 outline-none focus:border-primary/60"
        >
          <option>JPEG</option>
          <option>PNG</option>
        </select>
      </div>

      <p className="text-[12px] text-muted-foreground">套图模板与印花位映射在创建任务时选择。</p>

      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function PatternCropNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const autoDetect = cfgBool(config, "autoDetect", true);
  const margin = cfgStr(config, "margin", "默认");

  return (
    <div className="space-y-5">
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        从商品图中智能识别并裁切印花区域，建议在进行裂变或侵权检测前先完成图案裁剪。
      </p>
      <div className="flex items-center gap-3">
        <FieldLabel>智能识别印花</FieldLabel>
        <Switch checked={autoDetect} onCheckedChange={(v) => onConfigChange({ autoDetect: v })} />
      </div>
      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>裁切边距</FieldLabel>
        <select
          value={margin}
          onChange={(e) => onConfigChange({ margin: e.target.value })}
          className="h-8 flex-1 rounded-md border border-border bg-muted/50 px-2 outline-none focus:border-primary/60"
        >
          <option>默认</option>
          <option>紧凑</option>
          <option>宽松</option>
        </select>
      </div>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function TitleExtractNodeConfig({ manualReview, onManualReviewChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        根据商品图与印花信息自动生成刊登标题，支持多语言与平台规则校验。
      </p>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 text-[13px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">输出语言</span>
          <span className="text-foreground">英语（默认）</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">标题长度</span>
          <span className="text-foreground">平台自适应</span>
        </div>
      </div>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function InfringementNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const mode = cfgStr(config, "filterMode", "deep");

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[12px] text-muted-foreground">
        建议先完成「图案裁剪」再进行侵权检测，以获得更准确的结果。
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => onConfigChange({ filterMode: "deep" })}
          className={`text-left rounded-xl border p-3 transition-colors ${
            mode === "deep" ? "border-primary bg-primary/5" : "border-border hover:border-primary/35"
          }`}
        >
          <div className={`text-[14px] font-semibold mb-1 ${mode === "deep" ? "text-primary" : "text-foreground"}`}>
            深度过滤
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            结合 TRO 案件与版权库深度检索，生成证据链式分析报告
          </p>
        </button>
        <button
          type="button"
          onClick={() => onConfigChange({ filterMode: "basic" })}
          className={`text-left rounded-xl border p-3 transition-colors ${
            mode === "basic" ? "border-primary bg-primary/5" : "border-border hover:border-primary/35"
          }`}
        >
          <div className={`text-[14px] font-semibold mb-1 ${mode === "basic" ? "text-primary" : "text-foreground"}`}>
            基础过滤
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            快速比对知名商标与热门 IP
          </p>
        </button>
      </div>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function Text2imgNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const mode = cfgStr(config, "text2imgMode", "general");
  const ratio = cfgStr(config, "ratio", "1:1");
  const count = cfgNum(config, "count", 4);

  return (
    <div className="space-y-5">
      <PillTabs
        options={["通用", "写实", "插画", "3D"]}
        value={mode}
        onChange={(v) => onConfigChange({ text2imgMode: v })}
      />
      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>尺寸比例</FieldLabel>
        <select
          value={ratio}
          onChange={(e) => onConfigChange({ ratio: e.target.value })}
          className="h-8 flex-1 rounded-md border border-border bg-muted/50 px-2 outline-none focus:border-primary/60"
        >
          {["1:1", "2:3", "3:2", "9:16", "16:9"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>出图数量</FieldLabel>
        <CountPicker options={[1, 2, 4]} value={count} onChange={(n) => onConfigChange({ count: n })} />
      </div>
      <p className="text-[12px] text-muted-foreground">提示词在创建任务时填写或批量导入。</p>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function VectorNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const imageStyle = cfgStr(config, "imageStyle", "normal");

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>原图风格</FieldLabel>
        <div className="flex gap-3 mt-2">
          {[
            ["normal", "常规"],
            ["bw", "黑白"],
          ].map(([value, text]) => (
            <button
              key={value}
              type="button"
              onClick={() => onConfigChange({ imageStyle: value })}
              className={`flex-1 h-10 rounded-lg border text-[13px] font-medium transition-colors ${
                imageStyle === value
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border hover:border-primary/35"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function VideoNodeConfig({ config, onConfigChange, manualReview, onManualReviewChange }: PanelProps) {
  const scene = cfgStr(config, "videoScene", "model");
  const duration = cfgStr(config, "duration", "5s");
  const quantity = cfgNum(config, "quantity", 1);

  return (
    <div className="space-y-5">
      <PillTabs
        options={["模特动作", "商品律动", "风铃转动"]}
        value={scene === "model" ? "模特动作" : scene === "product" ? "商品律动" : "风铃转动"}
        onChange={(label) => {
          const map: Record<string, string> = { 模特动作: "model", 商品律动: "product", 风铃转动: "wind" };
          onConfigChange({ videoScene: map[label] ?? "model" });
        }}
      />
      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>视频时长</FieldLabel>
        <div className="flex gap-1.5">
          {["5s", "10s"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onConfigChange({ duration: d })}
              className={`min-w-12 h-8 px-3 rounded-md border text-[13px] ${
                duration === d ? "border-primary text-primary bg-primary/10" : "border-border"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 text-[13px]">
        <FieldLabel>生成数量</FieldLabel>
        <CountPicker options={[1, 2]} value={quantity} onChange={(n) => onConfigChange({ quantity: n })} />
      </div>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

function GenericNodeConfig({
  label,
  manualReview,
  onManualReviewChange,
}: PanelProps & { label: string }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        「{label}」将使用平台默认参数执行。保存模板后，可在具体任务中调整素材与批次。
      </p>
      <ManualReviewToggle enabled={manualReview} onChange={onManualReviewChange} />
    </div>
  );
}

export function WorkflowNodeConfigPanel({
  nodeLabel,
  isMaterial,
  config,
  onConfigChange,
  manualReview,
  onManualReviewChange,
}: {
  nodeLabel: string;
  isMaterial?: boolean;
  config: Record<string, unknown>;
  onConfigChange: (patch: Record<string, unknown>) => void;
  manualReview: boolean;
  onManualReviewChange: (v: boolean) => void;
}) {
  const props: PanelProps = { config, onConfigChange, manualReview, onManualReviewChange };

  if (isMaterial) return <MaterialNodeConfig />;

  const kind = resolveWorkflowNodeKind(nodeLabel);

  switch (kind) {
    case "印花图提取":
      return <PatternExtractNodeConfig {...props} />;
    case "图裂变":
      return <CrackNodeConfig {...props} />;
    case "一键抠图":
      return <CutoutNodeConfig {...props} />;
    case "商品套图":
      return <ProductSetNodeConfig {...props} />;
    case "图案裁剪":
      return <PatternCropNodeConfig {...props} />;
    case "标题提取":
      return <TitleExtractNodeConfig {...props} />;
    case "侵权风险过滤":
      return <InfringementNodeConfig {...props} />;
    case "文生图":
      return <Text2imgNodeConfig {...props} />;
    case "转矢量图":
      return <VectorNodeConfig {...props} />;
    case "视频生成":
    case "TK 视频生成":
      return <VideoNodeConfig {...props} />;
    default:
      return <GenericNodeConfig {...props} label={nodeLabel} />;
  }
}
