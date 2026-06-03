import { useState } from "react";
import { Calendar, GraduationCap, Play, Plus } from "lucide-react";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";
import { VideoTaskModal } from "./VideoTaskModal";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const examples = [
  {
    id: "model",
    tag: "示例",
    title: "模特动作",
    before:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d7b?w=320&h=240&fit=crop&auto=format",
    after:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d7b?w=320&h=240&fit=crop&auto=format",
    arrowColor: "text-sky-400",
  },
  {
    id: "product",
    tag: "示例",
    title: "商品律动",
    before:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=240&fit=crop&auto=format",
    after:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=240&fit=crop&auto=format",
    arrowColor: "text-primary",
  },
];

export function VideoPage() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { tasks, submitTask, listProps, DetailView } = useFeatureTaskDetail("video");

  if (DetailView) return DetailView;

  return (
    <>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 h-14 border-b border-border shrink-0">
          <h1 className="text-[16px] font-semibold text-foreground">视频生成</h1>
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
            <option value="completed">已完成</option>
            <option value="running">运行中</option>
            <option value="failed">失败</option>
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

        <div className="flex-1 overflow-auto px-6 py-6 scrollbar-none">
          {tasks.length > 0 ? (
            <FeatureTaskTable {...listProps} />
          ) : (
            <>
              <h2 className="text-[14px] font-semibold text-foreground mb-4">玩转视频生成</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="group flex flex-col items-center justify-center gap-3 min-h-[280px] rounded-2xl border border-border bg-card hover:border-primary/35 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Plus size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-[14px] font-medium text-foreground">创建新任务</span>
                </button>

                {examples.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card overflow-hidden min-h-[280px] flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-border/60">
                      <span className="text-[11px] font-semibold text-primary border border-primary/30 px-1.5 py-0.5 rounded mr-2">
                        {item.tag}
                      </span>
                      <span className="text-[14px] font-semibold text-foreground">{item.title}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={item.before} alt="原图" className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white">
                            原图
                          </span>
                        </div>
                      </div>
                      <div className={`shrink-0 text-2xl font-light ${item.arrowColor}`}>›</div>
                      <div className="flex-1 min-w-0">
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={item.after} alt="生成视频" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-foreground shadow-md">
                              <Play size={16} className="ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <VideoTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(input) => {
          submitTask(input);
          setTaskModalOpen(false);
        }}
      />
    </>
  );
}
