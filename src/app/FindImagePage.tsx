import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { CollectionTaskListContent } from "./CollectionTaskListContent";
import { addProductsFromImageUrls } from "./productLibrary";
import { showSaveToProductLibrarySuccess } from "./taskToast";

const contentTabs = ["插件采集列表"];

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const collectedItems = [
  {
    id: "plugin-collected-1",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=240&h=240&fit=crop&auto=format",
    title:
      "2D Flat - Set of 2, Flat Printed Autumn Leaf Design Throw Pillow Covers, Featuring Non-Realistic Embroidery, Maple Leaf Decorative Cushion Covers, Measuring 45.72 cm by 45.72 cm with Zippers, Suitable for Porch, Patio, Couch, Sofa, Living Room",
    sourcePlatform: "temu",
    productUrl: "https://www.temu.com/",
    rating: "4条",
    price: "¥4.17",
    createdAt: "2026-02-02 11:51:43",
  },
];

function CollectionContent({
  onOpenTaskList,
}: {
  onOpenTaskList: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount > 0 && selectedCount === collectedItems.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(collectedItems.map((item) => item.id)));
  };

  const saveItemsToProductLibrary = (ids: Set<string>) => {
    const selected = collectedItems.filter((item) => ids.has(item.id));
    if (selected.length === 0) return;
    const count = addProductsFromImageUrls(
      selected.map((item) => item.imageUrl),
      {
        source: "插件采集",
        taskBatch: "plugin-collection",
        fallbackSourceUrl: selected[0]?.imageUrl,
      },
    );
    showSaveToProductLibrarySuccess(count);
    setSelectedIds(new Set());
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 h-12 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          {contentTabs.map((tab) => (
            <button
              key={tab}
              className="h-8 px-4 rounded-full bg-muted text-[13px] font-medium text-foreground transition-colors"
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={onOpenTaskList}
          className="flex items-center gap-0.5 text-[13px] text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          采集任务列表
          <span className="text-[12px]">&gt;</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border shrink-0">
        <button className="h-9 rounded-md bg-[#b95f37] px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#a95532]">
          安装浏览器插件
        </button>
        <button className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          常见问题
          <HelpCircle size={14} />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button className="h-9 px-4 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors">
          批量操作
        </button>
        <button className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
          下载筛选内容
        </button>
        <select className={filterSelectClass} defaultValue="">
          <option value="">快速选中</option>
          <option value="all">全选</option>
          <option value="none">取消全选</option>
        </select>
        <select className={filterSelectClass} defaultValue="all">
          <option value="all">全部</option>
        </select>
        <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-background text-[12px] text-muted-foreground">
          <span>2026-05-25 00:00:00</span>
          <span className="text-border">→</span>
          <span>2026-05-27 23:59:00</span>
          <Calendar size={14} className="ml-1 text-muted-foreground" />
        </div>
        <button className="flex items-center justify-center w-9 h-9 rounded-md border border-border hover:border-primary/40 transition-colors ml-auto">
          <RefreshCw size={14} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 scrollbar-none">
        <div className="rounded-xl border border-border overflow-hidden bg-card min-h-[420px]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    aria-label="全选"
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      allSelected ? "border-primary bg-primary text-white" : "border-border bg-background"
                    }`}
                  >
                    {allSelected ? <Check size={11} strokeWidth={3} /> : null}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[100px]">图片</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">标题</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[200px]">信息</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {collectedItems.map((item, index) => {
                const selected = selectedIds.has(item.id);
                return (
                <tr
                  key={item.id}
                  className={`align-top hover:bg-muted/20 ${selected ? "bg-primary/5" : ""} ${index < collectedItems.length - 1 ? "border-b border-border/60" : ""}`}
                >
                  <td className="px-4 py-5">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      aria-label="选择记录"
                      className={`mt-2 flex h-4 w-4 items-center justify-center rounded border ${
                        selected ? "border-primary bg-primary text-white" : "border-border bg-background"
                      }`}
                    >
                      {selected ? <Check size={11} strokeWidth={3} /> : null}
                    </button>
                  </td>
                  <td className="px-4 py-5">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-muted">
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      {selected ? (
                        <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="max-w-[360px] text-[12px] leading-5 text-primary">
                      {item.title}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="space-y-2 text-[12px] leading-5 text-muted-foreground">
                      <div>
                        来源平台：<span className="text-foreground">{item.sourcePlatform}</span>
                      </div>
                      <div>
                        来源链接：
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          查看
                        </a>
                      </div>
                      <div>
                        评价：<span className="text-foreground">{item.rating}</span>
                      </div>
                      <div>
                        价格：<span className="text-foreground">{item.price}</span>
                      </div>
                      <div>
                        创建时间：<span className="text-foreground">{item.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col gap-2 text-[12px]">
                      <button
                        type="button"
                        onClick={() => saveItemsToProductLibrary(new Set([item.id]))}
                        className="text-left text-primary hover:text-primary/80"
                      >
                        保存到商品库
                      </button>
                      <button className="text-left text-destructive hover:text-destructive/80">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className="fixed bottom-5 left-1/2 z-20 flex w-[min(760px,calc(100%-48px))] -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-primary text-white">
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="text-[13px] text-foreground">全选</span>
            <span className="text-[13px] text-muted-foreground">
              已选择：<span className="text-foreground">{selectedCount}</span>项内容
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="h-8 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50">
              按模板导出
            </button>
            <button className="h-8 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50">
              导出数据
            </button>
            <button
              type="button"
              onClick={() => saveItemsToProductLibrary(selectedIds)}
              className="h-8 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50"
            >
              移到商品库
            </button>
            <button className="h-8 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50">
              下架
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50">
              <Sparkles size={13} />
              图片操作
            </button>
            <button className="h-8 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50">
              删除
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 rounded-md border border-border bg-background px-3 text-[12px] text-foreground hover:bg-muted/50"
            >
              取消选择
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function FindImagePage({
  pluginCollectionEntryKey = 0,
}: {
  pluginCollectionEntryKey?: number;
}) {
  const [showTaskList, setShowTaskList] = useState(false);

  useEffect(() => {
    if (pluginCollectionEntryKey > 0) {
      setShowTaskList(false);
    }
  }, [pluginCollectionEntryKey]);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {showTaskList && <CollectionTaskListContent onBack={() => setShowTaskList(false)} />}
        {!showTaskList && <CollectionContent onOpenTaskList={() => setShowTaskList(true)} />}
      </div>
    </div>
  );
}
