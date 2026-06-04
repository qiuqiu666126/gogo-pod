import { useMemo, useState } from "react";
import {
  ArrowLeft,
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

        {task.status === "已完成" && (
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
