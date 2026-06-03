import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Calendar, Check, HelpCircle, Image, Inbox, Plus, Sparkles, X } from "lucide-react";
import { DEFAULT_OPERATOR } from "./appConstants";
import { ProductDetailPage } from "./ProductDetailPage";
import { deleteProduct, useProducts } from "./productLibrary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./components/ui/dialog";

const filterSelectClass =
  "h-9 w-full min-w-0 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 w-full min-w-0 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const batchBarButtonClass =
  "h-8 px-4 rounded-md bg-[#3f4247] text-white text-[13px] font-normal hover:bg-[#34373c] transition-colors disabled:opacity-45 disabled:cursor-not-allowed";

function OnboardingCard({
  title,
  actionLabel,
  preview,
  onAction,
}: {
  title: string;
  actionLabel: string;
  preview: ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <p className="text-[13px] text-foreground leading-relaxed">{title}</p>
      </div>
      <div className="px-5 pb-5">{preview}</div>
      <div className="px-5 pb-5 mt-auto">
        <button
          type="button"
          onClick={onAction}
          className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function PluginCollectionPreview() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/70 text-[11px] text-muted-foreground">
          <span className="text-primary font-medium">数据采集</span>
          <span>插件采集列表</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 p-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded bg-muted border border-border/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductSetPreview() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/70 text-[11px] text-muted-foreground">
          <span className="text-primary font-medium">商品套图</span>
          <span>套图详情</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] rounded bg-muted border border-border/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductLibraryContent({
  onGoToPluginCollection,
  onGoToProductSetList,
}: {
  onGoToPluginCollection?: () => void;
  onGoToProductSetList?: () => void;
}) {
  const products = useProducts();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const detailProduct = detailId ? products.find((p) => p.id === detailId) : null;

  const filtered = useMemo(() => products, [products]);

  const selectedCount = selectedIds.size;
  const hasProducts = filtered.length > 0;
  const showBatchBar = hasProducts && selectedCount > 0;
  const allSelected = hasProducts && selectedCount === filtered.length;
  const partialSelected = selectedCount > 0 && selectedCount < filtered.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partialSelected;
    }
  }, [partialSelected]);

  if (detailProduct) {
    return <ProductDetailPage product={detailProduct} onBack={() => setDetailId(null)} />;
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filtered.map((item) => item.id)) : new Set());
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => deleteProduct(id));
    clearSelection();
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-semibold text-foreground">商品库</h1>
          <button
            type="button"
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors"
          >
            <HelpCircle size={13} />
            如何新建商品
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBatchMode((v) => !v)}
            className={`h-9 px-4 rounded-md text-[13px] font-medium transition-colors ${
              batchMode
                ? "border border-primary/50 text-primary hover:bg-primary/5"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {batchMode ? "取消批量操作" : "批量操作"}
          </button>
          <button
            type="button"
            className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/50 transition-colors"
          >
            任务列表
          </button>
          <button
            type="button"
            className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/50 transition-colors"
          >
            刊登任务
          </button>
          <button
            type="button"
            className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/50 transition-colors"
          >
            订单记录
          </button>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-border shrink-0 space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          <select className={filterSelectClass} defaultValue="">
            <option value="">全部来源</option>
          </select>
          <input className={filterInputClass} placeholder="批次" />
          <select className={filterSelectClass} defaultValue={DEFAULT_OPERATOR}>
            <option value={DEFAULT_OPERATOR}>{DEFAULT_OPERATOR} (我)</option>
            <option value="">全部创建人</option>
          </select>
          <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-background text-[13px] text-muted-foreground">
            <span>开始日期</span>
            <span className="text-border">→</span>
            <span>结束日期</span>
            <Calendar size={14} className="ml-auto text-muted-foreground shrink-0" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto] gap-2">
          <select className={filterSelectClass} defaultValue="">
            <option value="">全部风险</option>
          </select>
          <select className={filterSelectClass} defaultValue="">
            <option value="">商品刊登状态</option>
          </select>
          <select className={filterSelectClass} defaultValue="">
            <option value="">平台店铺 (已刊登)</option>
          </select>
          <select className={filterSelectClass} defaultValue="">
            <option value="">平台店铺 (未刊登)</option>
          </select>
          <div className="flex items-center min-w-0">
            <select
              className="h-9 w-[72px] shrink-0 rounded-l-md border border-r-0 border-border bg-input-background px-2 text-[13px] text-foreground outline-none focus:border-primary/60"
              defaultValue="sku"
            >
              <option value="sku">SKU</option>
            </select>
            <input
              className="h-9 flex-1 min-w-0 rounded-r-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60"
              placeholder=""
            />
          </div>
          <div className="flex items-center gap-2 xl:justify-self-end">
            <button
              type="button"
              className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors"
            >
              查询
            </button>
            <button
              type="button"
              className="h-9 px-5 rounded-md border border-border text-[13px] hover:bg-muted/40"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-auto px-6 py-4 scrollbar-none ${showBatchBar ? "pb-24" : ""}`}>
        {hasProducts ? (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-3 py-3" />
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground min-w-[140px]">
                    轮播图
                  </th>
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground min-w-[120px]">
                    标题
                  </th>
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground min-w-[100px]">
                    印花图
                  </th>
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground w-[90px]">
                    侵权风险
                  </th>
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground w-[90px]">
                    刊登信息
                  </th>
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground w-[80px]">
                    生产图
                  </th>
                  <th className="text-left px-3 py-3 text-[12px] font-medium text-muted-foreground w-[100px]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`align-top hover:bg-muted/20 ${i < filtered.length - 1 ? "border-b border-border/60" : ""}`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="accent-primary rounded"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-1.5">
                        {row.carouselImages.slice(0, 2).map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt=""
                            className="w-14 h-14 rounded object-cover border border-border/60"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-[12px] text-muted-foreground">
                      {row.title ?? "未提取标题"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="flex items-center justify-center w-8 h-8 rounded border border-dashed border-border text-muted-foreground hover:border-primary/40"
                        >
                          <Plus size={14} />
                        </button>
                        {row.printImages[0] && (
                          <img
                            src={row.printImages[0]}
                            alt=""
                            className="w-10 h-10 rounded object-cover border border-border/60"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-muted text-muted-foreground">
                        {row.infringementStatus}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-600">
                        {row.listingStatus}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground text-[12px]">—</td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailId(row.id)}
                          className="text-left text-[13px] text-primary hover:text-primary/80"
                        >
                          商品详情
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIds(new Set([row.id]));
                            setListingDialogOpen(true);
                          }}
                          className="text-left text-[13px] text-primary hover:text-primary/80"
                        >
                          商品刊登
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(row.id)}
                          className="text-left text-[13px] text-primary hover:text-primary/80"
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
        ) : (
          <div className="max-w-[920px] mx-auto py-6">
            <h2 className="text-[15px] font-semibold text-foreground mb-5">如何新建商品?</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OnboardingCard
                title="进入【插件采集列表】，选择采集图片保存到商品库"
                actionLabel="前往插件采集列表"
                preview={<PluginCollectionPreview />}
                onAction={onGoToPluginCollection}
              />
              <OnboardingCard
                title="选择进入【商品套图详情】，将套图结果保存到商品库"
                actionLabel="前往商品套图列表"
                preview={<ProductSetPreview />}
                onAction={onGoToProductSetList}
              />
            </div>
          </div>
        )}
      </div>

      {showBatchBar && (
        <div className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-2 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-md bg-[#5a6068] px-4 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.28)]">
            <label className="flex items-center gap-2 text-[13px] text-white cursor-pointer shrink-0">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                  className="peer h-4 w-4 appearance-none rounded-full border border-white/45 bg-white/18 checked:border-[#ff7a3d] checked:bg-[#ff7a3d]"
                  aria-label="全选"
                />
                <Check
                  size={11}
                  className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
                />
              </span>
              <span>全选</span>
            </label>
            <span className="text-[12px] text-white/85 whitespace-nowrap">
              已选择：<span className="text-white">{selectedCount}</span>项内容
            </span>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button
                type="button"
                className={batchBarButtonClass}
                onClick={() => setListingDialogOpen(true)}
              >
                <span className="inline-flex items-center gap-1.5">
                  商品刊登
                  <span className="rounded-sm bg-emerald-500/20 px-1 text-[10px] leading-4 text-emerald-300">
                    Beta
                  </span>
                </span>
              </button>
              <button type="button" className={batchBarButtonClass}>
                按模板导出
              </button>
              <button type="button" className={batchBarButtonClass}>
                下载
              </button>
              <button type="button" className={`${batchBarButtonClass} inline-flex items-center gap-1.5`}>
                <Sparkles size={14} />
                图片操作
              </button>
              <button
                type="button"
                className={batchBarButtonClass}
                onClick={handleDeleteSelected}
              >
                删除
              </button>
              <span className="h-5 w-px bg-white/20" />
              <button type="button" onClick={clearSelection} className={batchBarButtonClass}>
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={listingDialogOpen} onOpenChange={setListingDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[1400px] w-[calc(100vw-32px)] h-[min(426px,calc(100vh-64px))] translate-y-[-48%] gap-0 rounded-md border-[#3a3a3a] bg-[#1f1f1f] p-0 text-[#d8d8d8] shadow-2xl [&>button]:hidden">
          <DialogTitle className="sr-only">商品刊登</DialogTitle>
          <DialogDescription className="sr-only">
            选择商品刊登模板后开始刊登。
          </DialogDescription>
          <div className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#333] px-6">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-[#dcdcdc]">商品刊登</h2>
                <button
                  type="button"
                  className="text-[12px] font-medium text-[#ff7a3d] hover:text-[#ff8b55]"
                >
                  如何刊登
                </button>
                <HelpCircle size={13} className="text-[#ff7a3d]" />
              </div>
              <button
                type="button"
                onClick={() => setListingDialogOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#9ca3af] hover:bg-white/5 hover:text-white"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden px-6 py-3">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className="h-8 w-[200px] rounded-md border border-[#343434] bg-[#202020] px-3 text-[13px] text-[#e5e5e5] outline-none placeholder:text-[#6f6f6f] focus:border-[#ff6b2c]"
                    placeholder="模板名称"
                  />
                  <select
                    className="h-8 w-[200px] rounded-md border border-[#343434] bg-[#202020] px-3 text-[13px] text-[#9ca3af] outline-none focus:border-[#ff6b2c]"
                    defaultValue=""
                  >
                    <option value="">请选择模板类型</option>
                  </select>
                  <button
                    type="button"
                    className="h-8 rounded-md border border-[#ff6b2c] px-5 text-[13px] text-[#ff7a3d] hover:bg-[#ff6b2c]/10"
                  >
                    查 询
                  </button>
                </div>

                <label className="flex items-center gap-2 text-[13px] font-medium text-[#cfcfcf]">
                  指定店铺图片查重
                  <input type="checkbox" className="peer sr-only" />
                  <span className="relative h-4 w-7 rounded-full bg-[#6b6b6b] transition-colors peer-checked:bg-[#ff6b2c]">
                    <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-3" />
                  </span>
                </label>
              </div>

              <div className="mb-5 flex items-center gap-7 text-[13px] font-semibold">
                <button type="button" className="text-[#ff7a3d]">
                  全部
                </button>
                <button type="button" className="flex items-center gap-1 text-[#cfcfcf]">
                  未分组
                  <span className="rounded-sm bg-[#5b5f66] px-1.5 text-[11px] leading-5 text-white">0</span>
                </button>
              </div>

              <div className="h-[193px] overflow-hidden border border-[#3b3b3b]">
                <table className="w-full table-fixed text-[13px]">
                  <thead>
                    <tr className="h-10 border-b border-[#373737] bg-[#232323] text-left text-[#d2d2d2]">
                      <th className="w-[48px] px-3 font-semibold">选择</th>
                      <th className="px-3 font-semibold">模板名称</th>
                      <th className="w-[200px] border-l border-[#373737] px-3 font-semibold">更新时间</th>
                      <th className="w-[200px] border-l border-[#373737] px-3 font-semibold">创建时间</th>
                    </tr>
                  </thead>
                </table>
                <div className="flex h-[151px] flex-col items-center justify-center text-[#8c8c8c]">
                  <Inbox size={38} className="mb-2 text-[#555]" />
                  <span className="text-[13px]">暂无数据</span>
                </div>
              </div>
            </div>

            <div className="flex h-16 shrink-0 items-center justify-end gap-3 px-6">
              <button
                type="button"
                onClick={() => setListingDialogOpen(false)}
                className="h-8 rounded-md border border-[#333] px-5 text-[14px] text-[#e0e0e0] hover:bg-white/5"
              >
                取 消
              </button>
              <button
                type="button"
                className="h-8 rounded-md bg-[#e46f42] px-5 text-[14px] text-white hover:bg-[#ef7d4e]"
              >
                开始刊登
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
