import { useState } from "react";
import { ArrowLeft, Calendar, GraduationCap, Plus } from "lucide-react";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { PatternExtractModal } from "./PatternExtractModal";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

export function PatternExtractPage({ onBack }: { onBack: () => void }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { submitTask, listProps, DetailView } = useFeatureTaskDetail("pattern-extract");

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
          <h1 className="text-[16px] font-semibold text-foreground">印花图提取</h1>
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

        <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
          <FeatureTaskTable {...listProps} />
        </div>
      </div>

      <PatternExtractModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(input) => submitTask(input)}
      />
    </>
  );
}
