import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Edit3,
  RefreshCw,
} from "lucide-react";
import {
  showDownloadStartedSuccess,
  showSaveToProductLibrarySuccess,
  showTaskActionSuccess,
  showTaskError,
} from "./taskToast";
import type { UploadedAsset } from "./api/uploadApi";
import { urlsToUploadedAssets } from "./assetUtils";
import { CutoutModal } from "./CutoutModal";
import { CrackImageModal } from "./CrackImageModal";
import {
  FEATURE_ID_TO_TASK_TYPE,
  type DesignFeatureId,
} from "./designFeatureActions";
import type { FeatureTask, FeatureTaskResultItem, FeatureTaskType } from "./featureTasks";
import {
  discardFeatureTaskItem,
  FEATURE_TASK_LABELS,
  updateFeatureTaskItemResult,
  assetsToSubmitInput,
  submitFeatureTask,
} from "./featureTasks";
import { InfringementFilterTaskModal } from "./InfringementFilterTaskModal";
import { addDownloadRecord } from "./downloadCenterStore";
import { addProductsFromTaskResults } from "./productLibrary";
import { PatternExtractModal } from "./PatternExtractModal";
import { ProductSetTaskModal } from "./ProductSetTaskModal";
import { RecreateModal } from "./RecreateModal";
import { SmartEditModal } from "./SmartEditModal";
import { TaskDetailBatchBar } from "./TaskDetailBatchBar";
import { TaskResultComparisonPanel } from "./TaskResultComparisonPanel";
import { VectorTaskModal } from "./VectorTaskModal";
import { VideoTaskModal } from "./VideoTaskModal";

function StatusBadge({ status }: { status: FeatureTask["status"] }) {
  const cls =
    status === "已完成"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "运行中"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-red-500/10 text-red-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

function TitleExtractResultCard({
  item,
  selected,
  onToggle,
  onTitleConfirm,
}: {
  item: FeatureTaskResultItem;
  selected: boolean;
  onToggle: (id: string) => void;
  onTitleConfirm: (id: string, title: string) => void;
}) {
  const fallbackTitle =
    "White T-Shirt Super Mario Character Print Casual Wear for Men and Women Gaming Fans Streetwear Style";
  const displayTitle = /^https?:\/\//.test(item.resultUrl) || item.resultUrl.startsWith("data:image/")
    ? fallbackTitle
    : item.resultUrl;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayTitle);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayTitle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      showTaskActionSuccess("标题已复制");
    } catch {
      showTaskError("复制失败，请手动复制");
    }
  };

  const handleDownloadSource = () => {
    addDownloadRecord({ title: "标题提取-原图下载", count: 1 });
    showDownloadStartedSuccess();
    const a = document.createElement("a");
    a.href = item.sourceUrl;
    a.download = "";
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
  };

  const handleEdit = () => {
    setDraft(displayTitle);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(displayTitle);
    setEditing(false);
  };

  const handleConfirm = () => {
    const next = draft.trim();
    if (!next) {
      showTaskError("标题不能为空");
      return;
    }
    onTitleConfirm(item.id, next);
    setEditing(false);
    showTaskActionSuccess("标题已更新");
  };

  return (
    <div className="w-[328px] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="relative h-[244px] bg-muted">
        <img src={item.sourceUrl} alt="原图" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded border ${
            selected ? "border-primary bg-primary text-white" : "border-white/70 bg-black/35"
          }`}
          aria-label="选择标题结果"
        >
          {selected ? <Check size={12} /> : null}
        </button>
      </div>

      <div className="relative min-h-[100px] border-t border-border px-3 py-3">
        {editing ? (
          <div className="rounded-md border border-primary bg-background p-3 shadow-sm">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              autoFocus
              className="w-full resize-none bg-transparent text-[12px] leading-5 text-foreground outline-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="h-8 rounded-md border border-border px-3 text-[12px] text-foreground hover:bg-muted/50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-white hover:bg-primary/90"
              >
                确认
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[12px] font-medium leading-5 text-foreground">{displayTitle}</p>
            <button
              type="button"
              onClick={handleEdit}
              className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="编辑标题"
            >
              <Edit3 size={15} />
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <button
          type="button"
          onClick={handleDownloadSource}
          className="h-10 border-r border-border text-[12px] font-medium text-foreground hover:bg-muted/40"
        >
          下载原图
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="h-10 text-[12px] font-medium text-foreground hover:bg-muted/40"
        >
          <Copy size={13} className="mr-1 inline -mt-0.5" />
          {copied ? "已复制" : "复制标题"}
        </button>
      </div>
    </div>
  );
}

function formatDetectionTime(createdAt: string) {
  const normalized = createdAt.replace(/-/g, "/");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return createdAt;
  const p = (value: number) => String(value).padStart(2, "0");
  return `${parsed.getFullYear()}/${p(parsed.getMonth() + 1)}/${p(parsed.getDate())}\n${p(parsed.getHours())}:${p(parsed.getMinutes())}`;
}

function InfringementReportTable({
  items,
  task,
}: {
  items: FeatureTaskResultItem[];
  task: FeatureTask;
}) {
  const detectionTime = formatDetectionTime(task.createdAt);
  const description =
    "图片中显著使用了任天堂（Nintendo）旗下经典IP角色马里奥（Mario）的完整形象（红帽、蓝工装裤、标志性姿态），并搭配“SUPER MARIO”文字及复古条纹背景，构成对《超级马里奥》系列商标与著作权的直接复制与商业性使用。该设计未获授权，高度符合典型侵权特征，属于明确侵犯任天堂知识产权的行为。";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-sm">
      <div className="grid min-w-[1120px] grid-cols-[180px_124px_138px_minmax(520px,1fr)_110px] border-b border-border bg-muted/30 px-4 py-4 text-[14px] font-semibold text-foreground">
        <div>产品图</div>
        <div>检测结果</div>
        <div>疑似侵权对象</div>
        <div>说明</div>
        <div className="text-right">检测时间</div>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid min-w-[1120px] grid-cols-[180px_124px_138px_minmax(520px,1fr)_110px] items-center gap-0 border-b border-border px-4 py-5 last:border-b-0"
        >
          <div>
            <div className="h-[148px] w-[148px] overflow-hidden rounded-md border border-border bg-muted">
              <img src={item.sourceUrl} alt="产品图" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[13px] font-medium text-red-600">
              高风险
            </span>
            <span className="block w-fit rounded-full bg-slate-100 px-3 py-1 text-[13px] text-slate-600">
              可信度 99%
            </span>
          </div>

          <div className="text-[14px] font-semibold leading-6 text-foreground">
            Nintendo、
            <br />
            Super Mario
          </div>

          <div className="pr-8 text-[14px] font-semibold leading-7 text-slate-700">
            {description}
          </div>

          <div className="whitespace-pre-line text-right text-[14px] leading-6 text-muted-foreground">
            {detectionTime}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeatureTaskDetailPage({
  task,
  taskType,
  onBack,
}: {
  task: FeatureTask;
  taskType: FeatureTaskType;
  onBack: () => void;
}) {
  const [smartEditItemId, setSmartEditItemId] = useState<string | null>(null);
  const [recreateItemId, setRecreateItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [featureModal, setFeatureModal] = useState<DesignFeatureId | null>(null);
  const [importAssets, setImportAssets] = useState<UploadedAsset[]>([]);

  const smartEditItem = task.items.find((i) => i.id === smartEditItemId);
  const recreateItem = task.items.find((i) => i.id === recreateItemId);

  const selectableItems = useMemo(
    () => task.items.filter((i) => task.status === "已完成"),
    [task.items, task.status],
  );
  const selectedCount = selectableItems.filter((i) => selectedIds.has(i.id)).length;

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
      setSelectedIds(new Set(selectableItems.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const getSelectedItems = () => task.items.filter((i) => selectedIds.has(i.id));

  const handleSaveToProductLibrary = () => {
    const selected = getSelectedItems().filter((i) => !i.discarded);
    if (selected.length === 0) {
      showTaskError("请选择未废弃的结果图后再保存");
      return;
    }
    const count = addProductsFromTaskResults(
      selected.map((i) => ({
        sourceUrl: i.sourceUrl,
        resultUrl: i.resultUrl,
        mediaKind: i.mediaKind,
      })),
      { source: FEATURE_TASK_LABELS[taskType], taskBatch: task.batch },
    );
    showSaveToProductLibrarySuccess(count);
    setSelectedIds(new Set());
  };

  const handleDownload = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;
    addDownloadRecord({
      title: `${FEATURE_TASK_LABELS[taskType]}-批量下载-${task.batch}`,
      count: selected.length,
    });
    showDownloadStartedSuccess();
    selected.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.resultUrl;
      a.download = "";
      a.target = "_blank";
      a.rel = "noreferrer";
      a.click();
    });
  };

  const handleBatchDiscard = () => {
    getSelectedItems().forEach((item) => {
      if (!item.discarded) {
        discardFeatureTaskItem(taskType, task.id, item.id, true);
      }
    });
    setSelectedIds(new Set());
    showTaskActionSuccess("已废弃所选结果");
  };

  const handleBatchRecover = () => {
    const discardedSelected = getSelectedItems().filter((i) => i.discarded);
    if (discardedSelected.length === 0) {
      showTaskError("所选内容无需恢复");
      return;
    }
    discardedSelected.forEach((item) => {
      discardFeatureTaskItem(taskType, task.id, item.id, false);
    });
    setSelectedIds(new Set());
    showTaskActionSuccess("已恢复所选结果");
  };

  const openFeature = (featureId: DesignFeatureId) => {
    const urls = getSelectedItems()
      .filter((i) => !i.discarded)
      .map((i) => i.resultUrl);
    if (urls.length === 0) {
      showTaskError("请先选择图片");
      return;
    }
    setImportAssets(urlsToUploadedAssets(urls));
    setFeatureModal(featureId);
  };

  const closeFeatureModal = () => {
    setFeatureModal(null);
    setImportAssets([]);
  };

  const handleFeatureSubmit = (input: ReturnType<typeof assetsToSubmitInput>) => {
    const mappedType = featureModal ? FEATURE_ID_TO_TASK_TYPE[featureModal] : undefined;
    if (mappedType) {
      submitFeatureTask(mappedType, input);
    }
    closeFeatureModal();
  };

  const activeItems = task.items.filter((i) => !i.discarded);
  const sourceUrl = task.sourceUrls?.[0] ?? task.items[0]?.sourceUrl ?? task.preview;

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background relative">
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
          onClick={() => {
            const count = activeItems.length;
            addDownloadRecord({
              title: `${FEATURE_TASK_LABELS[taskType]}-全部下载-${task.batch}`,
              count,
            });
            showDownloadStartedSuccess();
          }}
          className="h-8 px-3 rounded-md border border-border text-[12px] text-foreground hover:bg-muted/40"
        >
          下载全部
        </button>
        <button
          type="button"
          className="h-8 px-3 rounded-md border border-border text-[12px] text-foreground hover:bg-muted/40"
        >
          导出数据
        </button>
        <button
          type="button"
          className="h-8 px-3 rounded-md border border-border text-[12px] text-foreground hover:bg-muted/40"
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
              onClick={() => handleSelectAll(true)}
              className="h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium hover:bg-primary/90"
            >
              批量操作
            </button>
          )}
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-muted text-muted-foreground"
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
          总数：<span className="text-foreground">{task.total}</span>
          <span className="mx-1">|</span>
          成功：<span className="text-emerald-600">{task.success}</span>
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          状态：<StatusBadge status={task.status} />
        </span>
        <span className="text-muted-foreground">
          操作人：<span className="text-foreground">{task.operator}</span>
        </span>
      </div>

      <div className="px-6 py-2 text-[13px] text-muted-foreground shrink-0">
        {FEATURE_TASK_LABELS[taskType]} · 任务详情
      </div>

      <div
        className={`flex-1 overflow-auto px-6 py-6 scrollbar-none ${selectedCount > 0 ? "pb-28" : ""}`}
      >
        {task.status === "运行中" && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <RefreshCw size={32} className="animate-spin mb-4 opacity-60" />
            <p className="text-[14px]">任务执行中，正在调用 AI 模型处理…</p>
          </div>
        )}

        {task.status === "失败" && (
          <div className="flex flex-col items-center justify-center py-24 text-red-500/80">
            <p className="text-[14px]">任务执行失败，请重新提交或联系管理员</p>
          </div>
        )}

        {task.status === "已完成" && activeItems.length === 0 && task.items.length > 0 && (
          <div className="text-center py-24 text-muted-foreground text-[13px]">所有结果均已废弃</div>
        )}

        {task.status === "已完成" && taskType === "title-extract" && (
          <div className="flex flex-wrap gap-4">
            {activeItems.map((item) => (
              <TitleExtractResultCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={toggleSelect}
                onTitleConfirm={(id, title) => updateFeatureTaskItemResult(taskType, task.id, id, title)}
              />
            ))}
          </div>
        )}

        {task.status === "已完成" && taskType === "infringement" && (
          <InfringementReportTable items={activeItems} task={task} />
        )}

        {task.status === "已完成" && taskType !== "title-extract" && taskType !== "infringement" && (
          <TaskResultComparisonPanel
            sourceUrl={sourceUrl}
            generated={task.items.map((item, index) => ({
              id: item.id,
              url: item.resultUrl,
              mediaKind: item.mediaKind,
              selected: selectedIds.has(item.id),
              discarded: item.discarded,
              label: item.mediaKind === "video" ? `结果视频 ${index + 1}` : `结果图 ${index + 1}`,
            }))}
            onToggleGenerated={toggleSelect}
            onDiscardGenerated={(id) => discardFeatureTaskItem(taskType, task.id, id, true)}
            onSmartEditGenerated={setSmartEditItemId}
            onRecreateGenerated={setRecreateItemId}
          />
        )}
      </div>

      {taskType !== "title-extract" && taskType !== "infringement" ? (
        <TaskDetailBatchBar
          selectedCount={selectedCount}
          totalSelectable={selectableItems.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          onSaveToProductLibrary={handleSaveToProductLibrary}
          onDownload={handleDownload}
          onDiscard={handleBatchDiscard}
          onRecover={handleBatchRecover}
          onOpenFeature={openFeature}
        />
      ) : null}

      {smartEditItem && smartEditItem.mediaKind === "image" && (
        <SmartEditModal
          open={Boolean(smartEditItemId)}
          imageUrl={smartEditItem.resultUrl}
          onClose={() => setSmartEditItemId(null)}
          onSave={(editedUrl) => {
            updateFeatureTaskItemResult(taskType, task.id, smartEditItem.id, editedUrl);
            setSmartEditItemId(null);
          }}
        />
      )}

      {recreateItem && recreateItem.mediaKind === "image" && (
        <RecreateModal
          open={Boolean(recreateItemId)}
          imageUrl={recreateItem.resultUrl}
          onClose={() => setRecreateItemId(null)}
        />
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
