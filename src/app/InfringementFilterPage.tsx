import { useState } from "react";
import { ArrowLeft, Calendar, GraduationCap, Plus } from "lucide-react";
import { InfringementFilterTaskModal } from "./InfringementFilterTaskModal";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const sampleImg =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=240&fit=crop&auto=format";

function InfringementExamplePreview() {
  return (
    <div className="flex items-stretch gap-3 h-full p-3">
      <div className="relative w-[42%] shrink-0 rounded-lg border border-border bg-white overflow-hidden">
        <img src={sampleImg} alt="" className="w-full h-full object-cover min-h-[160px]" />
        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white font-medium">
          侵权概率高
        </span>
      </div>
      <div className="flex-1 min-w-0 rounded-lg border border-border bg-muted/40 p-2 flex flex-col gap-2">
        <div className="text-[11px] font-medium text-foreground">风险过滤结果</div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="rounded-md border border-border bg-card p-2">
            <div className="text-[10px] text-muted-foreground mb-1">风险源</div>
            <div className="space-y-1">
              <div className="h-2 rounded bg-muted" />
              <div className="h-2 rounded bg-muted w-4/5" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-2">
            <div className="text-[10px] text-muted-foreground mb-1">相似图片</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square rounded bg-muted" />
              <div className="aspect-square rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfringementFilterPage({ onBack }: { onBack: () => void }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { tasks, submitTask, listProps, DetailView } = useFeatureTaskDetail("infringement");

  if (DetailView) return DetailView;

  return (
    <>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 h-14 border-b border-border shrink-0">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[16px] font-semibold text-foreground">侵权风险过滤</h1>
          <button className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <GraduationCap size={13} />
            教程
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border shrink-0">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus size={14} />
            新建任务
          </button>
          <input className={filterInputClass} placeholder="批次" />
          <input className={filterInputClass} placeholder="备注" />
          <select className={filterSelectClass} defaultValue="all">
            <option value="all">全部状态</option>
          </select>
          <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-background text-[13px] text-muted-foreground">
            <span>开始日期</span>
            <span className="text-border">→</span>
            <span>结束日期</span>
            <Calendar size={14} className="ml-1 text-muted-foreground" />
          </div>
          <button className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors ml-auto">
            查询
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-10 scrollbar-none">
          {tasks.length > 0 ? (
            <FeatureTaskTable {...listProps} />
          ) : (
          <div className="max-w-[760px] mx-auto">
            <h2 className="text-[22px] font-semibold text-foreground text-center">玩转侵权风险过滤</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => setTaskModalOpen(true)}
                className="flex flex-col items-center justify-center min-h-[280px] rounded-xl border border-dashed border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-3">
                  <Plus size={28} />
                </div>
                <span className="text-[14px] font-medium text-foreground">创建新任务</span>
              </button>

              <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[280px] flex flex-col">
                <div className="px-4 pt-3">
                  <span className="text-[10px] font-medium text-primary border border-primary/30 px-1.5 py-0.5 rounded">
                    示例
                  </span>
                </div>
                <p className="px-4 pt-2 pb-1 text-[13px] font-medium text-foreground">深度过滤，智能检测规避TRO</p>
                <div className="flex-1 min-h-[180px] bg-muted/30">
                  <InfringementExamplePreview />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <InfringementFilterTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(input) => submitTask(input)}
      />
    </>
  );
}
