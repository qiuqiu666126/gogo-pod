import { useState } from "react";
import { ArrowLeft, Calendar, GraduationCap, Plus } from "lucide-react";
import { CutoutModal } from "./CutoutModal";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const pandaImg = "https://images.unsplash.com/photo-1564349683136-77e08dba1e7d?w=120&h=120&fit=crop&auto=format";

function CutoutExamplePreview() {
  return (
    <div className="flex items-center justify-center gap-3 h-full p-4">
      <div className="text-center shrink-0">
        <div className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-violet-200">
          <img src={pandaImg} alt="" className="w-full h-full object-cover" />
        </div>
        <span className="text-[10px] text-muted-foreground mt-1.5 block">原图</span>
      </div>
      <span className="text-primary text-xl shrink-0">→</span>
      <div className="text-center shrink-0">
        <div
          className="w-20 h-20 rounded-lg border border-border overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
            backgroundSize: "12px 12px",
            backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
          }}
        >
          <img src={pandaImg} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export function CutoutPage({ onBack }: { onBack: () => void }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { tasks, submitTask, listProps, DetailView } = useFeatureTaskDetail("cutout");

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
          <div className="relative">
            <h1 className="text-[16px] font-semibold text-foreground">一键抠图</h1>
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-violet-400 via-primary to-amber-400 opacity-80" />
          </div>
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
            <h2 className="text-[22px] font-semibold text-foreground text-center">玩转一键抠图</h2>
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
                <p className="px-4 pt-2 pb-1 text-[13px] font-medium text-foreground">一键完成抠图，迅速移除背景</p>
                <div className="flex-1 min-h-[180px] bg-muted/30">
                  <CutoutExamplePreview />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <CutoutModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(input) => submitTask(input)}
      />
    </>
  );
}
