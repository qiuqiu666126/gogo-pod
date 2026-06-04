import { useState } from "react";
import { ArrowLeft, Calendar, GraduationCap, Plus } from "lucide-react";
import { TextToImageModal } from "./TextToImageModal";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

function ThemeFissionExample() {
  return (
    <div className="flex items-center gap-2 h-full p-3">
      <div className="w-[38%] shrink-0 rounded-lg border border-border bg-white p-2">
        <div className="text-[10px] text-violet-700 bg-violet-50 rounded px-2 py-1 leading-relaxed">
          万圣节 南瓜 吸血鬼
        </div>
      </div>
      <span className="text-primary text-lg shrink-0">→</span>
      <div className="flex-1 grid grid-cols-3 gap-1 min-w-0">
        {[
          "https://images.unsplash.com/photo-1509555190665-477ef7b7e931?w=80&h=80&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1576086213369-fa02a840d2d4?w=80&h=80&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1509245858460-894736427208?w=80&h=80&fit=crop&auto=format",
        ].map((src) => (
          <div key={src} className="aspect-square rounded-md border border-border overflow-hidden bg-muted">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ElementFissionExample() {
  return (
    <div className="grid grid-cols-3 gap-1.5 h-full p-3">
      {[
        "https://images.unsplash.com/photo-1528164344705-47542687000d?w=100&h=100&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=100&h=100&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1549693578-4a3c4a5a2b88?w=100&h=100&fit=crop&auto=format",
      ].map((src) => (
        <div key={src} className="aspect-[4/5] rounded-md border border-amber-200 bg-amber-50 overflow-hidden">
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

export function TextToImagePage({ onBack }: { onBack: () => void }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<"tasks" | "examples">("tasks");
  const { tasks, submitTask, listProps, DetailView } = useFeatureTaskDetail("text2img");

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
            <h1 className="text-[16px] font-semibold text-foreground">文生图</h1>
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
          <div className="flex items-center rounded-md border border-border overflow-hidden shrink-0">
            <button
              onClick={() => setViewTab("tasks")}
              className={`h-9 px-4 text-[13px] font-medium transition-colors ${
                viewTab === "tasks"
                  ? "bg-muted text-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              任务列表
            </button>
            <button
              onClick={() => setViewTab("examples")}
              className={`h-9 px-4 text-[13px] font-medium transition-colors border-l border-border ${
                viewTab === "examples"
                  ? "bg-muted text-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              案例
            </button>
          </div>
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
          <div className="max-w-[960px] mx-auto">
            <h2 className="text-[22px] font-semibold text-foreground text-center">如何玩转文生图?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
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
                <p className="px-4 pt-2 pb-1 text-[13px] font-medium text-foreground">通过主题裂变爆款印花图</p>
                <div className="flex-1 min-h-[180px] bg-muted/30">
                  <ThemeFissionExample />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[280px] flex flex-col">
                <div className="px-4 pt-3">
                  <span className="text-[10px] font-medium text-primary border border-primary/30 px-1.5 py-0.5 rounded">
                    示例
                  </span>
                </div>
                <p className="px-4 pt-2 pb-1 text-[13px] font-medium text-foreground">通过元素裂变爆款印花图</p>
                <div className="flex-1 min-h-[180px] bg-muted/30">
                  <ElementFissionExample />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <TextToImageModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(input) => submitTask(input)}
      />
    </>
  );
}
