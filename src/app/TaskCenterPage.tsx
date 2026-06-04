import { useMemo, useState } from "react";
import { Calendar, Inbox } from "lucide-react";
import { addDownloadRecord } from "./downloadCenterStore";
import { FeatureTaskDetailPage } from "./FeatureTaskDetailPage";
import { WorkflowTaskDetailPage } from "./WorkflowTaskDetailPage";
import {
  deleteFeatureTask,
  FEATURE_TASK_LABELS,
  type FeatureTaskStatus,
  type FeatureTaskType,
} from "./featureTasks";
import { useTaskCenterRecords } from "./taskCenterStore";
import {
  deleteWorkflowTask,
  useWorkflowTasks,
  type WorkflowTask,
  type WorkflowTaskStatus,
} from "./workflowTasks";
import { showDownloadStartedSuccess } from "./taskToast";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

function statusClass(status: FeatureTaskStatus | WorkflowTaskStatus) {
  if (status === "已完成") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (status === "运行中") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  if (status === "已终止") return "bg-muted text-muted-foreground border-border";
  return "bg-red-500/10 text-red-600 border-red-500/20";
}

type TaskCenterListRow =
  | {
      kind: "feature";
      id: string;
      typeLabel: string;
      type: FeatureTaskType;
      preview: string;
      batch: string;
      total: number;
      success: number;
      createdAt: string;
      operator: string;
      status: FeatureTaskStatus;
    }
  | {
      kind: "workflow";
      id: string;
      typeLabel: string;
      task: WorkflowTask;
      preview: string;
      batch: string;
      total: number;
      success: number;
      createdAt: string;
      operator: string;
      status: WorkflowTaskStatus;
    };

export function TaskCenterPage({ onNavigateDownloads }: { onNavigateDownloads?: () => void }) {
  const records = useTaskCenterRecords();
  const workflowTasks = useWorkflowTasks();
  const [detailFeatureId, setDetailFeatureId] = useState<string | null>(null);
  const [detailWorkflowId, setDetailWorkflowId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchQuery, setBatchQuery] = useState("");

  const featureDetail = detailFeatureId ? records.find((r) => r.id === detailFeatureId) : null;
  const workflowDetail = detailWorkflowId
    ? workflowTasks.find((t) => t.id === detailWorkflowId)
    : null;

  const allRows = useMemo<TaskCenterListRow[]>(() => {
    const wfRows: TaskCenterListRow[] = workflowTasks.map((task) => ({
      kind: "workflow",
      id: task.id,
      typeLabel: "工作流",
      task,
      preview: task.preview,
      batch: task.batch,
      total: 1,
      success: task.status === "已完成" ? 1 : 0,
      createdAt: task.createdAt,
      operator: task.operator,
      status: task.status,
    }));
    const featureRows: TaskCenterListRow[] = records.map((row) => ({
      kind: "feature",
      id: row.id,
      typeLabel: row.typeLabel,
      type: row.type,
      preview: row.preview,
      batch: row.batch,
      total: row.total,
      success: row.success,
      createdAt: row.createdAt,
      operator: row.operator,
      status: row.status,
    }));
    return [...wfRows, ...featureRows].sort(
      (a, b) =>
        new Date(b.createdAt.replace(/-/g, "/")).getTime() -
        new Date(a.createdAt.replace(/-/g, "/")).getTime(),
    );
  }, [workflowTasks, records]);

  const filtered = useMemo(() => {
    return allRows.filter((row) => {
      if (typeFilter === "workflow" && row.kind !== "workflow") return false;
      if (typeFilter && typeFilter !== "workflow" && (row.kind !== "feature" || row.type !== typeFilter)) {
        return false;
      }
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (batchQuery && !row.batch.includes(batchQuery)) return false;
      return true;
    });
  }, [allRows, typeFilter, statusFilter, batchQuery]);

  if (featureDetail) {
    return (
      <FeatureTaskDetailPage
        task={featureDetail}
        taskType={featureDetail.type}
        onBack={() => setDetailFeatureId(null)}
      />
    );
  }

  if (workflowDetail) {
    return (
      <WorkflowTaskDetailPage
        task={workflowDetail}
        onBack={() => setDetailWorkflowId(null)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <h1 className="text-[16px] font-semibold text-foreground">任务中心</h1>
        <button
          type="button"
          onClick={onNavigateDownloads}
          className="h-8 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          下载中心
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-border shrink-0">
        <select
          className={filterSelectClass}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">任务类型</option>
          <option value="workflow">工作流</option>
          {(Object.keys(FEATURE_TASK_LABELS) as FeatureTaskType[]).map((key) => (
            <option key={key} value={key}>
              {FEATURE_TASK_LABELS[key]}
            </option>
          ))}
        </select>
        <input
          className={filterInputClass}
          placeholder="批次"
          value={batchQuery}
          onChange={(e) => setBatchQuery(e.target.value)}
        />
        <select
          className={filterSelectClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="已完成">已完成</option>
          <option value="运行中">运行中</option>
          <option value="已终止">已终止</option>
          <option value="失败">失败</option>
        </select>
        <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-background text-[13px] text-muted-foreground">
          <span>开始日期</span>
          <span className="text-border">→</span>
          <span>结束日期</span>
          <Calendar size={14} className="ml-1 text-muted-foreground" />
        </div>
        <button
          type="button"
          onClick={() => {
            setTypeFilter("");
            setStatusFilter("all");
            setBatchQuery("");
          }}
          className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors ml-auto"
        >
          重置
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card min-h-[320px] flex flex-col items-center justify-center text-muted-foreground">
            <Inbox size={32} className="opacity-40 mb-3" />
            <p className="text-[13px]">暂无任务，请在作图或视频中创建任务后自动同步至此</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[100px]">
                    预览图
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">任务类型</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">批次</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">任务数量</th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[220px]">
                    信息
                  </th>
                  <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`align-top hover:bg-muted/20 ${i < filtered.length - 1 ? "border-b border-border/60" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <img
                        src={row.preview}
                        alt=""
                        className="w-14 h-14 rounded-md object-cover border border-border/60"
                      />
                    </td>
                    <td className="px-4 py-4 text-foreground">{row.typeLabel}</td>
                    <td className="px-4 py-4 text-muted-foreground font-mono text-[12px]">{row.batch}</td>
                    <td className="px-4 py-4">
                      <div className="text-foreground">总数: {row.total}</div>
                      <div className={row.success > 0 ? "text-emerald-500" : "text-muted-foreground"}>
                        成功: {row.success}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-[12px] leading-relaxed">
                        <div className="text-muted-foreground">创建时间: {row.createdAt}</div>
                        <div className="text-muted-foreground">操作人: {row.operator}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">状态:</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusClass(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={row.kind === "feature" && row.status !== "已完成"}
                          onClick={() => {
                            if (row.kind === "workflow") setDetailWorkflowId(row.id);
                            else setDetailFeatureId(row.id);
                          }}
                          className="text-left text-[13px] text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                          查看详情
                        </button>
                        <button
                          type="button"
                          disabled={row.status !== "已完成"}
                          onClick={() => {
                            addDownloadRecord({
                              title: `${row.typeLabel}-下载-${row.batch}`,
                              count: Math.max(1, row.success || row.total),
                            });
                            showDownloadStartedSuccess();
                          }}
                          className="text-left text-[13px] text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                          下载
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (row.kind === "workflow") deleteWorkflowTask(row.id);
                            else deleteFeatureTask(row.type, row.id);
                          }}
                          className="text-left text-[13px] text-primary hover:text-primary/80"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
