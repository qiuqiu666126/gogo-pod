import { useState } from "react";
import { ArrowLeft, Calendar, GraduationCap, Plus } from "lucide-react";
import { ProductSetTaskModal } from "./ProductSetTaskModal";
import { ProductSetTemplatesPage } from "./ProductSetTemplatesPage";
import { FeatureTaskTable } from "./FeatureTaskTable";
import { useFeatureTaskDetail } from "./useFeatureTaskDetail";

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const features = [
  {
    title: "零门槛上手",
    desc: "多款模板任选，批量导入印花，自动套图到商品白模",
    preview: (
      <div className="flex items-center justify-center gap-2 p-3">
        <div className="w-12 h-12 rounded bg-white border border-border overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542362567-b07e54358753?w=80&h=80&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-primary text-lg">→</span>
        <div className="w-16 h-20 rounded bg-white border border-border overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=120&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    title: "AI赋能",
    desc: "智能描边反色，图案自动适配深浅底色",
    preview: (
      <div className="grid grid-cols-2 gap-2 p-3">
        {[1, 2].map((i) => (
          <div key={i} className="aspect-[3/4] rounded bg-zinc-800 border border-border overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100&h=140&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "PSD样机复用",
    desc: "直接导入已有PSD样机，1:1还原套图效果",
    preview: (
      <div className="flex items-center justify-center gap-2 p-3">
        <div className="w-14 h-14 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-[11px] font-bold text-violet-600">
          PSD
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="w-12 h-12 rounded bg-muted border border-border overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=60&h=60&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-12 h-12 rounded bg-muted border border-border overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&h=60&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    ),
  },
];

export function ProductSetPage({ onBack }: { onBack: () => void }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [view, setView] = useState<"main" | "templates">("main");
  const { tasks, submitTask, listProps, DetailView } = useFeatureTaskDetail("product-set");

  if (DetailView) return DetailView;

  if (view === "templates") {
    return (
      <>
        <ProductSetTemplatesPage
          onBack={() => setView("main")}
          onNewTask={() => {
            setView("main");
            setTaskModalOpen(true);
          }}
          onAddTemplate={() => {
            /* 后续接入上传/新建套图模板 */
          }}
        />
        <ProductSetTaskModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          onSubmit={submitTask}
        />
      </>
    );
  }

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
          <h1 className="text-[16px] font-semibold text-foreground">商品套图</h1>
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
          <button
            type="button"
            onClick={() => setView("templates")}
            className="h-9 px-4 rounded-md border border-border text-[13px] text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            套图模板管理
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

        <div className="flex-1 overflow-auto px-6 py-4 pb-10 scrollbar-none space-y-4">
          {tasks.length > 0 && <FeatureTaskTable {...listProps} />}
          {tasks.length === 0 && (
          <div className="max-w-[920px] mx-auto text-center">
            <h2 className="text-[22px] font-semibold text-foreground">商品套图</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              批量商品套图，并可生成随机合成图，轻松解决上架判重问题
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
              {features.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="h-[120px] bg-muted/40 border-b border-border/60">{item.preview}</div>
                  <div className="p-4">
                    <div className="text-[14px] font-semibold text-foreground">{item.title}</div>
                    <div className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>

      <ProductSetTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(input) => submitTask(input)}
      />
    </>
  );
}
