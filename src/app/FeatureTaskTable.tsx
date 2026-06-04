import { Inbox } from "lucide-react";
import { addDownloadRecord } from "./downloadCenterStore";
import type { FeatureTask } from "./featureTasks";
import { showDownloadStartedSuccess } from "./taskToast";

export function FeatureTaskTable({
  tasks,
  showParams = false,
  onViewDetail,
  onDelete,
}: {
  tasks: FeatureTask[];
  showParams?: boolean;
  onViewDetail?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-border overflow-hidden bg-card min-h-[320px]">
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-3">
            <Inbox size={28} className="opacity-40" />
          </div>
          <span className="text-[13px]">暂无任务记录</span>
        </div>
      </div>
    );
  }

  const statusClass = (status: FeatureTask["status"]) => {
    if (status === "已完成") return "bg-emerald-500/10 text-emerald-600";
    if (status === "运行中") return "bg-amber-500/10 text-amber-600";
    return "bg-red-500/10 text-red-600";
  };

  return (
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
            {showParams && (
              <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[180px]">
                参数
              </th>
            )}
            <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">
              任务数量
            </th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[200px]">
              信息
            </th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[220px]">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-4 align-top">
                <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                  <img src={task.preview} alt="" className="w-full h-full object-cover" />
                </div>
              </td>
              <td className="px-4 py-4 align-top text-foreground">{task.batch}</td>
              {showParams && (
                <td className="px-4 py-4 align-top text-[12px] text-muted-foreground leading-relaxed">
                  {task.params?.map((item) => (
                    <div key={`${task.id}-${item.label}`}>
                      {item.label}：{item.value}
                    </div>
                  ))}
                </td>
              )}
              <td className="px-4 py-4 align-top text-[12px] leading-relaxed">
                <div className="text-foreground">总数：{task.total}</div>
                <div className={task.success > 0 ? "text-emerald-600" : "text-muted-foreground"}>
                  成功：{task.success}
                </div>
              </td>
              <td className="px-4 py-4 align-top text-[12px] text-muted-foreground leading-relaxed">
                <div>创建时间：{task.createdAt}</div>
                <div>操作人：{task.operator}</div>
                <div className="mt-1">
                  状态：
                  <span
                    className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${statusClass(task.status)}`}
                  >
                    {task.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex flex-col gap-1 text-[12px]">
                  <button
                    type="button"
                    disabled={task.status !== "已完成"}
                    onClick={() => onViewDetail?.(task.id)}
                    className="text-left text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                  >
                    查看详情
                  </button>
                  <button
                    type="button"
                    disabled={task.status !== "已完成"}
                    onClick={() => {
                      addDownloadRecord({
                        title: `${task.batch}-下载`,
                        count: Math.max(1, task.success || task.total),
                      });
                      showDownloadStartedSuccess();
                    }}
                    className="text-left text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                  >
                    下载
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(task.id)}
                    className="text-left text-primary hover:text-primary/80 transition-colors"
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
  );
}
