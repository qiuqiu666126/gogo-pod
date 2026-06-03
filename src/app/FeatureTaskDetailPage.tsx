import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Check,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  RefreshCw,
} from "lucide-react";
import {
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
import { addProductsFromTaskResults } from "./productLibrary";
import { PatternExtractModal } from "./PatternExtractModal";
import { ProductSetTaskModal } from "./ProductSetTaskModal";
import { RecreateModal } from "./RecreateModal";
import { SmartEditModal } from "./SmartEditModal";
import { TaskDetailBatchBar } from "./TaskDetailBatchBar";
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

function ResultPairCard({
  item,
  taskType,
  taskId,
  selected,
  onToggleSelect,
  onDiscard,
  onRecreate,
  onSmartEdit,
}: {
  item: FeatureTaskResultItem;
  taskType: FeatureTaskType;
  taskId: string;
  selected: boolean;
  onToggleSelect: () => void;
  onDiscard: () => void;
  onRecreate: () => void;
  onSmartEdit: () => void;
}) {
  const isVideo = item.mediaKind === "video";
  const discarded = item.discarded;

  if (discarded) {
    return (
      <div
        className={`rounded-xl border px-8 py-16 text-center text-[13px] text-muted-foreground transition-colors ${
          selected ? "border-primary ring-1 ring-primary/30 bg-primary/5" : "border-dashed border-border bg-muted/20"
        }`}
      >
        <label className="inline-flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 accent-[#ff6b2c] rounded"
          />
          <span className="text-[12px]">选择此项</span>
        </label>
        <div>
          该结果已废弃
          <button
            type="button"
            onClick={() => discardFeatureTaskItem(taskType, taskId, item.id, false)}
            className="ml-2 text-primary hover:underline"
          >
            恢复
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex-1 min-w-0">
        <div className="relative aspect-[4/5] max-h-[420px] rounded-xl border border-border overflow-hidden bg-muted">
          <img src={item.sourceUrl} alt="原图" className="w-full h-full object-contain" />
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[11px] font-medium bg-black/50 text-white">
            原图
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0 text-2xl text-muted-foreground font-light px-1">
        <ChevronRight size={28} />
        <ChevronRight size={28} className="-ml-3" />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`relative aspect-[4/5] max-h-[420px] rounded-xl border overflow-hidden bg-[#0f1419] group transition-all ${
            selected ? "border-primary ring-2 ring-primary/35" : "border-border"
          }`}
        >
          {isVideo ? (
            <>
              <img src={item.resultUrl} alt="生成视频" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <span className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-foreground" />
                </div>
              </div>
            </>
          ) : (
            <img src={item.resultUrl} alt="结果图" className="w-full h-full object-contain" />
          )}

          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[11px] font-medium bg-black/50 text-white">
            {isVideo ? "结果视频" : "结果图"}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDiscard();
            }}
            title="废弃"
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white/90 hover:bg-black/70 transition-colors"
          >
            <Ban size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`absolute top-3 left-3 flex items-center justify-center w-5 h-5 rounded border transition-colors ${
              selected
                ? "bg-primary border-primary text-white"
                : "bg-black/40 border-white/60 hover:border-white"
            }`}
          >
            {selected ? <Check size={12} strokeWidth={3} /> : null}
          </button>

          {!isVideo && (
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none"
              aria-label="预览"
            >
              <Eye size={28} className="text-white drop-shadow-md" />
            </button>
          )}

          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecreate();
                }}
                className="flex items-center gap-1 h-8 px-3 rounded-md bg-black/60 text-white text-[12px] hover:bg-black/80"
              >
                <RefreshCw size={14} />
                再次创作
              </button>
            )}
            <a
              href={item.resultUrl}
              download
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 h-8 px-3 rounded-md bg-black/60 text-white text-[12px] hover:bg-black/80"
            >
              <Download size={14} />
              下载
            </a>
            {!isVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSmartEdit();
                }}
                className="flex items-center gap-1 h-8 px-3 rounded-md bg-primary text-white text-[12px] hover:bg-primary/90"
              >
                <Pencil size={14} />
                智能编辑
              </button>
            )}
          </div>
        </div>
      </div>
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
    getSelectedItems().forEach((item) => {
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
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            className="h-7 px-3 rounded-md border border-border text-[12px] hover:bg-muted/40"
          >
            备注
          </button>
          <button
            type="button"
            className="h-7 px-3 rounded-md border border-border text-[12px] hover:bg-muted/40"
          >
            任务参数
          </button>
          <button
            type="button"
            className="h-7 px-3 rounded-md border border-primary text-primary text-[12px] hover:bg-primary/5"
          >
            重新编辑
          </button>
        </div>
      </div>

      <div className="px-6 py-2 text-[13px] text-muted-foreground shrink-0">
        {FEATURE_TASK_LABELS[taskType]} · 任务详情
        {task.remark && <span className="ml-2 text-foreground">（{task.remark}）</span>}
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
          <div className="space-y-8 max-w-[1100px] mx-auto">
            {task.items.map((item) => (
              <ResultPairCard
                key={item.id}
                item={item}
                taskType={taskType}
                taskId={task.id}
                selected={selectedIds.has(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
                onDiscard={() => discardFeatureTaskItem(taskType, task.id, item.id, true)}
                onRecreate={() => setRecreateItemId(item.id)}
                onSmartEdit={() => setSmartEditItemId(item.id)}
              />
            ))}
          </div>
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
        onTag={() => showTaskActionSuccess("打标签功能即将上线")}
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
