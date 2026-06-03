import { useMemo, useState } from "react";
import { Calendar, ChevronRight, GraduationCap, Plus } from "lucide-react";
import { DEFAULT_OPERATOR } from "./appConstants";
import { WorkflowTaskDetailPage } from "./WorkflowTaskDetailPage";
import {
  deleteWorkflowTask,
  type WorkflowTaskStatus,
  useWorkflowTasks,
} from "./workflowTasks";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

function statusClass(status: WorkflowTaskStatus) {
  if (status === "已完成") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (status === "运行中") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (status === "已终止") return "bg-muted text-muted-foreground border-border";
  return "bg-red-500/10 text-red-600 border-red-500/20";
}

export function WorkflowPage({
  onNewTask,
  onManageTemplates,
  onGoTaskCenter,
}: {
  onNewTask: () => void;
  onManageTemplates: () => void;
  onGoTaskCenter?: () => void;
}) {
  const tasks = useWorkflowTasks();
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = detailTaskId ? tasks.find((t) => t.id === detailTaskId) : null;
  const [creator, setCreator] = useState(DEFAULT_OPERATOR);
  const [batchQuery, setBatchQuery] = useState("");
  const [remarkQuery, setRemarkQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return tasks.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (batchQuery && !row.batch.includes(batchQuery)) return false;
      if (remarkQuery && !row.remark?.includes(remarkQuery)) return false;
      if (creator && row.operator !== creator) return false;
      return true;
    });
  }, [tasks, statusFilter, batchQuery, remarkQuery, creator]);

  if (detailTask) {
    return (
      <WorkflowTaskDetailPage
        task={detailTask}
        onBack={() => setDetailTaskId(null)}
        onGoTaskCenter={onGoTaskCenter}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-3 px-6 h-14 border-b border-border shrink-0">
        <h1 className="text-[16px] font-semibold text-foreground">工作流</h1>
        <button
          type="button"
          className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <GraduationCap size={13} />
          教程
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border shrink-0">
        <button
          type="button"
          onClick={onNewTask}
          className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={14} />
          新建任务
        </button>
        <button
          type="button"
          onClick={onManageTemplates}
          className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/40 transition-colors shrink-0"
        >
          工作流模板管理
        </button>
        <select
          className={filterSelectClass}
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
        >
          <option value={DEFAULT_OPERATOR}>{DEFAULT_OPERATOR}</option>
          <option value="">全部创建人</option>
        </select>
        <input
          className={filterInputClass}
          placeholder="批次"
          value={batchQuery}
          onChange={(e) => setBatchQuery(e.target.value)}
        />
        <input
          className={filterInputClass}
          placeholder="备注"
          value={remarkQuery}
          onChange={(e) => setRemarkQuery(e.target.value)}
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
            setBatchQuery("");
            setRemarkQuery("");
            setStatusFilter("all");
            setCreator(DEFAULT_OPERATOR);
          }}
          className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors ml-auto"
        >
          查询
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[100px]">
                  预览图
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[140px]">
                  批次
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[280px]">
                  任务进度
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[220px]">
                  信息
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">
                  操作
                </th>
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
                  <td className="px-4 py-4 text-muted-foreground font-mono text-[12px]">{row.batch}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground leading-relaxed">
                      {row.steps.map((step, si) => (
                        <span key={`${row.id}-${step}`} className="flex items-center gap-1">
                          <span className="text-foreground/90">{step}</span>
                          {si < row.steps.length - 1 && (
                            <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
                          )}
                        </span>
                      ))}
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
                        disabled={row.status !== "已完成"}
                        onClick={() => setDetailTaskId(row.id)}
                        className="text-left text-[13px] text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
                      >
                        查看详情
                      </button>
                      <button
                        type="button"
                        className="text-left text-[13px] text-primary hover:text-primary/80"
                      >
                        备注
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWorkflowTask(row.id)}
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
      </div>
    </div>
  );
}
