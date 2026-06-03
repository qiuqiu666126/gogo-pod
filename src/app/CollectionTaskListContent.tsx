import { Calendar, Inbox } from "lucide-react";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

export function CollectionTaskListContent({ onBack }: { onBack?: () => void }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border shrink-0">
        <input className={filterInputClass} placeholder="批次" />
        <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-background text-[13px] text-muted-foreground">
          <span>开始日期</span>
          <span className="text-border">→</span>
          <span>结束日期</span>
          <Calendar size={14} className="ml-1 text-muted-foreground" />
        </div>
        <select className={filterSelectClass} defaultValue="all">
          <option value="all">全部状态</option>
          <option value="completed">已完成</option>
          <option value="running">运行中</option>
          <option value="failed">失败</option>
        </select>
        <button className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors ml-auto">
          查询
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="h-9 px-4 rounded-md border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            返回
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 scrollbar-none">
        <div className="rounded-xl border border-border overflow-hidden bg-card min-h-[480px]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">批次</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">任务数量</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">任务进度</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">状态</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">参数</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">操作人</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">创建时间</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="py-32">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-3">
                      <Inbox size={28} className="opacity-40" />
                    </div>
                    <span className="text-[13px]">暂无数据</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
