import { useState } from "react";
import { ArrowLeft, ClipboardList, Download, Headphones, Plus } from "lucide-react";
import type { ProductItem } from "./productLibrary";

function SectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ImageThumb({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`rounded-lg border border-border overflow-hidden bg-muted ${className}`}>
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  );
}

export function ProductDetailPage({
  product,
  onBack,
}: {
  product: ProductItem;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(product.title ?? "");

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background relative">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-muted text-muted-foreground"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[16px] font-semibold text-foreground">商品详情</h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-muted-foreground">
          <span>
            商品风险：<span className="text-foreground">{product.infringementStatus}</span>
          </span>
          <span>
            商品来源：<span className="text-foreground">{product.source}</span>
          </span>
          <span>
            创建：<span className="text-foreground">{product.createdAt}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6 scrollbar-none pb-8">
        <section className="mb-10">
          <SectionTitle title="轮播图" />
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] border border-border text-muted-foreground mb-3">
            来源 {product.source}
          </span>
          <div className="flex flex-wrap gap-3">
            {product.carouselImages.map((url, i) => (
              <ImageThumb key={url} src={url} className="w-[120px] aspect-[3/4]" />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionTitle title="标题" />
          <div className="rounded-xl border border-border bg-card p-6 max-w-[640px]">
            {title ? (
              <p className="text-[13px] text-foreground leading-relaxed">{title}</p>
            ) : (
              <p className="text-[13px] text-muted-foreground">未提取标题</p>
            )}
            <button
              type="button"
              onClick={() =>
                setTitle(
                  "White T-Shirt Super Mario Character Print Casual Wear for Men and Women Gaming Fans Streetwear Style",
                )
              }
              className="mt-4 h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90"
            >
              提取标题
            </button>
          </div>
        </section>

        <section className="mb-10">
          <SectionTitle title="印花图" hint="（可回溯印花图生成过程）" />
          <div className="flex flex-wrap gap-6">
            {product.printWorkflow.map((step) => (
              <div key={step.label} className="shrink-0">
                <div className="text-[12px] text-muted-foreground mb-2 text-center">{step.label}</div>
                {step.label === "印花图" ? (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-center w-[100px] h-[100px] rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground hover:border-primary/40"
                    >
                      <Plus size={20} />
                    </button>
                    <ImageThumb src={step.imageUrl} className="w-[100px] aspect-square" />
                  </div>
                ) : (
                  <ImageThumb src={step.imageUrl} className="w-[100px] aspect-square" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionTitle title="商品风险" />
          <div className="rounded-xl border border-border bg-card p-6 max-w-[640px]">
            <p className="text-[13px] text-muted-foreground">无商品检测报告</p>
            <button
              type="button"
              className="mt-4 h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90"
            >
              侵权检测过滤
            </button>
          </div>
        </section>

        <section className="mb-10">
          <SectionTitle title="生产图" />
          <div className="rounded-xl border border-border bg-card p-6 max-w-[640px]">
            <p className="text-[13px] text-muted-foreground">
              {product.productionImages.length > 0
                ? "已关联生产图"
                : "无关联的生产图"}
            </p>
          </div>
        </section>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        <button
          type="button"
          className="flex flex-col items-center gap-1 w-12 py-2 rounded-lg border border-border bg-card shadow-md text-[10px] text-muted-foreground hover:text-foreground relative"
        >
          <ClipboardList size={18} className="text-primary" />
          任务中心
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 w-12 py-2 rounded-lg border border-border bg-card shadow-md text-[10px] text-muted-foreground hover:text-foreground"
        >
          <Download size={18} />
          下载中心
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 w-12 py-2 rounded-lg border border-border bg-card shadow-md text-[10px] text-muted-foreground hover:text-foreground"
        >
          <Headphones size={18} />
          智能客服
        </button>
      </div>
    </div>
  );
}
