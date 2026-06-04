import { useState } from "react";
import { ArrowLeft, Calendar, GraduationCap, Plus } from "lucide-react";
import { VectorTaskModal } from "./VectorTaskModal";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const raccoonImg = "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&auto=format";
const treeImg = "https://images.unsplash.com/photo-1513836279014-a89e9a070860?w=200&h=200&fit=crop&auto=format";

function BitmapToVectorExample() {
  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="flex items-start gap-2">
        <div className="text-center shrink-0">
          <div className="w-14 h-14 rounded-lg border border-border bg-white overflow-hidden">
            <img src={raccoonImg} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">原图</span>
        </div>
        <div className="text-center shrink-0">
          <div className="w-14 h-14 rounded-lg border border-emerald-200 bg-emerald-50 overflow-hidden">
            <img src={raccoonImg} alt="" className="w-full h-full object-cover saturate-150" />
          </div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-1.5 min-h-0">
        <div className="rounded-md border border-border bg-white overflow-hidden relative">
          <img src={raccoonImg} alt="" className="w-full h-full object-cover scale-[2.5] origin-center opacity-90" />
          <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded bg-black/50 text-white">像素锯齿</span>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 overflow-hidden relative">
          <img src={raccoonImg} alt="" className="w-full h-full object-cover scale-[2.5] origin-center" />
          <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded bg-emerald-600/80 text-white">矢量平滑</span>
        </div>
      </div>
    </div>
  );
}

function VectorTraceExample() {
  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="flex items-start gap-2">
        <div className="text-center shrink-0">
          <div className="w-14 h-14 rounded-full border border-border bg-white overflow-hidden">
            <img src={treeImg} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">原图</span>
        </div>
        <div className="text-center shrink-0">
          <div className="w-14 h-14 rounded-full border border-lime-200 bg-lime-50 overflow-hidden p-1">
            <img src={treeImg} alt="" className="w-full h-full object-cover rounded-full mix-blend-multiply opacity-80" />
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-md border border-lime-200 bg-lime-50 overflow-hidden relative min-h-[80px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-lime-400/60 flex items-center justify-center">
            <img src={treeImg} alt="" className="w-14 h-14 object-cover rounded-full opacity-70" />
          </div>
        </div>
        <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded bg-lime-600/80 text-white">切割路线</span>
      </div>
    </div>
  );
}

export function VectorPage({ onBack }: { onBack: () => void }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { tasks, submitTask, listProps, DetailView } = useFeatureTaskDetail("vector");

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
          <h1 className="text-[16px] font-semibold text-foreground">转矢量图</h1>
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
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-[22px] font-semibold text-foreground text-center">玩转矢量图</h2>
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
              <p className="px-4 pt-2 pb-1 text-[13px] font-medium text-foreground">位图转矢量，无惧拉伸缩放</p>
              <div className="flex-1 min-h-[180px] bg-muted/30">
                <BitmapToVectorExample />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[280px] flex flex-col">
              <div className="px-4 pt-3">
                <span className="text-[10px] font-medium text-primary border border-primary/30 px-1.5 py-0.5 rounded">
                  示例
                </span>
              </div>
              <p className="px-4 pt-2 pb-1 text-[13px] font-medium text-foreground">矢量描边，轻松获取切割路线</p>
              <div className="flex-1 min-h-[180px] bg-muted/30">
                <VectorTraceExample />
              </div>
            </div>
          </div>
        </div>
          )}
      </div>
    </div>
    <VectorTaskModal
      open={taskModalOpen}
      onClose={() => setTaskModalOpen(false)}
      onSubmit={(input) => submitTask(input)}
    />
    </>
  );
}
