import { useMemo, useState } from "react";
import { ArrowLeft, Check, ClipboardList, Copy, RefreshCw } from "lucide-react";
import { addProductsFromImageUrls } from "./productLibrary";
import { showSaveToProductLibrarySuccess } from "./taskToast";
import type { UploadedAsset } from "./api/uploadApi";
import { urlsToUploadedAssets } from "./assetUtils";
import { CutoutModal } from "./CutoutModal";
import { CrackImageModal } from "./CrackImageModal";
import {
  FEATURE_ID_TO_TASK_TYPE,
  type DesignFeatureId,
} from "./designFeatureActions";
import { assetsToSubmitInput, submitFeatureTask } from "./featureTasks";
import { InfringementFilterTaskModal } from "./InfringementFilterTaskModal";
import { PatternExtractModal } from "./PatternExtractModal";
import { ProductSetTaskModal } from "./ProductSetTaskModal";
import { VectorTaskModal } from "./VectorTaskModal";
import { VideoTaskModal } from "./VideoTaskModal";
import type { WorkflowTask } from "./workflowTasks";
import {
  buildWorkflowStepResults,
  type WorkflowStepResult,
} from "./workflowStepResults";
import { WorkflowSelectionToolbar } from "./WorkflowSelectionToolbar";

function StatusBadge({ status }: { status: WorkflowTask["status"] }) {
  const cls =
    status === "已完成"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "运行中"
        ? "bg-amber-500/10 text-amber-600"
        : status === "已终止"
          ? "bg-muted text-muted-foreground"
          : "bg-red-500/10 text-red-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

function StepProgressBar({
  steps,
  activeIndex,
  onSelect,
}: {
  steps: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0 px-6 py-5 border-b border-border bg-card/50 shrink-0 overflow-x-auto scrollbar-none">
      {steps.map((name, index) => {
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;
        return (
          <div key={name} className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onSelect(index)}
              className="flex flex-col items-center gap-2 min-w-[88px] group"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-primary bg-primary/15 text-primary"
                    : isPast
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-500"
                      : "border-border bg-muted/40 text-muted-foreground group-hover:border-primary/40"
                }`}
              >
                {isPast && !isActive ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span
                className={`text-[12px] whitespace-nowrap transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {name}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-px mx-1 mb-6 shrink-0 ${
                  index < activeIndex ? "bg-emerald-500/50" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

type SelectableImage = { id: string; url: string };

function getSelectableImages(result: WorkflowStepResult | undefined): SelectableImage[] {
  if (!result) return [];
  if (result.kind === "product-set") {
    return [
      { id: "source", url: result.sourceImageUrl },
      ...result.generatedImages
        .filter((g) => !g.discarded)
        .map((g) => ({ id: g.id, url: g.url })),
    ];
  }
  if (result.kind === "image") {
    return [{ id: "main", url: result.imageUrl }];
  }
  if (result.kind === "title") {
    return [{ id: "title-product", url: result.productImageUrl }];
  }
  return [];
}

function SelectableImageCard({
  id,
  url,
  label,
  selected,
  onToggle,
  aspectClass = "aspect-[3/4]",
}: {
  id: string;
  url: string;
  label?: string;
  selected: boolean;
  onToggle: (id: string) => void;
  aspectClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`relative rounded-lg overflow-hidden border-2 text-left transition-all ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
      }`}
    >
      <div className={`${aspectClass} bg-muted w-full min-w-[140px]`}>
        <img src={url} alt="" className="w-full h-full object-cover" />
      </div>
      <div
        className={`absolute top-2 left-2 flex items-center justify-center w-5 h-5 rounded border ${
          selected ? "bg-primary border-primary text-white" : "bg-black/40 border-white/60"
        }`}
      >
        {selected ? <Check size={12} /> : null}
      </div>
      {label && (
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] bg-black/50 text-white">
          {label}
        </span>
      )}
    </button>
  );
}

function ProductSetStepContent({
  result,
  selectedIds,
  onToggle,
}: {
  result: Extract<WorkflowStepResult, { kind: "product-set" }>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1200px]">
      <div className="shrink-0">
        <div className="text-[13px] font-medium text-foreground mb-3">原图</div>
        <SelectableImageCard
          id="source"
          url={result.sourceImageUrl}
          label="原图"
          selected={selectedIds.has("source")}
          onToggle={onToggle}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground mb-3">生成图</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {result.generatedImages
            .filter((g) => !g.discarded)
            .map((img) => (
              <SelectableImageCard
                key={img.id}
                id={img.id}
                url={img.url}
                selected={selectedIds.has(img.id)}
                onToggle={onToggle}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function ImageStepContent({
  result,
  selectedIds,
  onToggle,
}: {
  result: Extract<WorkflowStepResult, { kind: "image" }>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <SelectableImageCard
      id="main"
      url={result.imageUrl}
      selected={selectedIds.has("main")}
      onToggle={onToggle}
    />
  );
}

function TitleStepContent({
  result,
  onTitleChange,
  selectedIds,
  onToggle,
}: {
  result: Extract<WorkflowStepResult, { kind: "title" }>;
  onTitleChange: (title: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[800px]">
      <SelectableImageCard
        id="title-product"
        url={result.productImageUrl}
        selected={selectedIds.has("title-product")}
        onToggle={onToggle}
      />
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        <textarea
          value={result.title}
          onChange={(e) => onTitleChange(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 resize-none"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-4 rounded-md border border-border text-[13px] hover:bg-muted/40"
          >
            <Copy size={14} className="inline mr-1.5 -mt-0.5" />
            {copied ? "已复制" : "复制标题"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowTaskDetailPage({
  task,
  onBack,
  onGoTaskCenter,
}: {
  task: WorkflowTask;
  onBack: () => void;
  onGoTaskCenter?: () => void;
}) {
  const initialResults = useMemo(() => buildWorkflowStepResults(task), [task]);
  const [activeStepIndex, setActiveStepIndex] = useState(() => {
    const mockupIdx = task.steps.indexOf("商品套图");
    return mockupIdx >= 0 ? mockupIdx : Math.max(0, task.steps.length - 1);
  });
  const [stepResults, setStepResults] = useState(initialResults);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [featureModal, setFeatureModal] = useState<DesignFeatureId | null>(null);
  const [importAssets, setImportAssets] = useState<UploadedAsset[]>([]);

  const activeResult = stepResults[activeStepIndex];
  const selectable = useMemo(() => getSelectableImages(activeResult), [activeResult]);
  const selectedCount = selectable.filter((s) => selectedIds.has(s.id)).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(selectable.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleStepChange = (index: number) => {
    setActiveStepIndex(index);
    setSelectedIds(new Set());
  };

  const getSelectedUrls = () =>
    selectable.filter((s) => selectedIds.has(s.id)).map((s) => s.url);

  const openFeature = (featureId: DesignFeatureId) => {
    const urls = getSelectedUrls();
    if (urls.length === 0) return;
    setImportAssets(urlsToUploadedAssets(urls));
    setFeatureModal(featureId);
  };

  const closeFeatureModal = () => {
    setFeatureModal(null);
    setImportAssets([]);
  };

  const handleFeatureSubmit = (input: ReturnType<typeof assetsToSubmitInput>) => {
    const taskType = featureModal ? FEATURE_ID_TO_TASK_TYPE[featureModal] : undefined;
    if (taskType) {
      submitFeatureTask(taskType, input);
    }
    closeFeatureModal();
  };

  const updateTitle = (title: string) => {
    setStepResults((prev) =>
      prev.map((r, i) =>
        i === activeStepIndex && r.kind === "title" ? { ...r, title } : r,
      ),
    );
  };

  const handleDiscard = () => {
    if (activeResult?.kind !== "product-set") return;
    setStepResults((prev) =>
      prev.map((r, i) => {
        if (i !== activeStepIndex || r.kind !== "product-set") return r;
        return {
          ...r,
          generatedImages: r.generatedImages.map((img) =>
            selectedIds.has(img.id) ? { ...img, discarded: true } : img,
          ),
        };
      }),
    );
    setSelectedIds(new Set());
  };

  const handleSaveToProductLibrary = () => {
    const urls = getSelectedUrls();
    if (urls.length === 0) return;
    const fallbackSource =
      activeResult?.kind === "product-set" ? activeResult.sourceImageUrl : urls[0];
    const count = addProductsFromImageUrls(urls, {
      source: "工作流",
      taskBatch: task.batch,
      fallbackSourceUrl: fallbackSource,
    });
    showSaveToProductLibrarySuccess(count);
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background relative">
      <StepProgressBar
        steps={task.steps}
        activeIndex={activeStepIndex}
        onSelect={handleStepChange}
      />

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-muted text-muted-foreground"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          type="button"
          className="h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium hover:bg-primary/90"
        >
          下载全部
        </button>
        {selectedCount > 0 ? (
          <button
            type="button"
            onClick={() => handleSelectAll(true)}
            className="h-8 px-3 rounded-md border border-border text-[12px] hover:bg-muted/40"
          >
            快速选中
          </button>
        ) : null}
        <button
          type="button"
          className="h-8 px-3 rounded-md border border-border text-[12px] hover:bg-muted/40"
        >
          导出数据
        </button>
        <button
          type="button"
          className="h-8 px-3 rounded-md border border-border text-[12px] hover:bg-muted/40"
        >
          按模板导出
        </button>
        <div className="ml-auto flex items-center gap-2">
          {selectedCount > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 px-3 rounded-md border border-primary/50 text-primary text-[12px] hover:bg-primary/5"
            >
              取消批量操作
            </button>
          ) : (
            <button
              type="button"
              className="h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium hover:bg-primary/90"
            >
              批量操作
            </button>
          )}
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-muted"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 border-b border-border text-[12px] shrink-0">
        <span className="text-muted-foreground">
          批次：<span className="text-foreground font-mono">{task.batch}</span>
        </span>
        <span className="text-muted-foreground">
          创建时间：<span className="text-foreground">{task.createdAt}</span>
        </span>
        <span className="text-muted-foreground">
          总数：<span className="text-foreground">1</span>
          <span className="mx-1">|</span>
          成功：<span className="text-emerald-600">1</span>
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          状态：<StatusBadge status={task.status} />
        </span>
        <span className="text-muted-foreground">
          操作人：<span className="text-foreground">{task.operator}</span>
        </span>
      </div>

      <div
        className={`flex-1 overflow-auto px-8 py-8 scrollbar-none ${selectedCount > 0 ? "pb-28" : "pb-8"}`}
      >
        {activeResult?.kind === "product-set" ? (
          <ProductSetStepContent
            result={activeResult}
            selectedIds={selectedIds}
            onToggle={toggleSelect}
          />
        ) : activeResult?.kind === "title" ? (
          <TitleStepContent
            result={activeResult}
            onTitleChange={updateTitle}
            selectedIds={selectedIds}
            onToggle={toggleSelect}
          />
        ) : activeResult?.kind === "image" ? (
          <ImageStepContent
            result={activeResult}
            selectedIds={selectedIds}
            onToggle={toggleSelect}
          />
        ) : (
          <p className="text-[13px] text-muted-foreground">暂无该步骤生成内容</p>
        )}
      </div>

      <WorkflowSelectionToolbar
        selectedCount={selectedCount}
        totalSelectable={selectable.length}
        onSelectAll={handleSelectAll}
        onClearSelection={() => setSelectedIds(new Set())}
        onSaveToProductLibrary={handleSaveToProductLibrary}
        onDiscard={activeResult?.kind === "product-set" ? handleDiscard : undefined}
        onOpenFeature={openFeature}
      />

      {onGoTaskCenter && selectedCount === 0 && (
        <button
          type="button"
          onClick={onGoTaskCenter}
          className="fixed bottom-6 right-6 flex items-center gap-2 h-10 px-4 rounded-full bg-card border border-border shadow-lg text-[13px] hover:border-primary/40 z-10"
        >
          <ClipboardList size={16} className="text-primary" />
          任务中心
        </button>
      )}

      <PatternExtractModal
        open={featureModal === "pattern-extract"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={handleFeatureSubmit}
      />
      <CutoutModal
        open={featureModal === "cutout"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={handleFeatureSubmit}
      />
      <CrackImageModal
        open={featureModal === "crack"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={handleFeatureSubmit}
      />
      <VectorTaskModal
        open={featureModal === "vector"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={handleFeatureSubmit}
      />
      <InfringementFilterTaskModal
        open={featureModal === "infringement"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={handleFeatureSubmit}
      />
      <VideoTaskModal
        open={featureModal === "video"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={(input) => handleFeatureSubmit({ ...input, mediaKind: "video" })}
      />
      <ProductSetTaskModal
        open={featureModal === "product-set"}
        onClose={closeFeatureModal}
        initialAssets={importAssets}
        onSubmit={handleFeatureSubmit}
      />
    </div>
  );
}
