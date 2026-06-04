import { useMemo, useState } from "react";
import { Calendar, Trash2 } from "lucide-react";
import { INITIAL_SPACE_IMAGES, type SpaceImage } from "./mySpaceData";
import { addDownloadRecord } from "./downloadCenterStore";
import { showDownloadStartedSuccess } from "./taskToast";

const filterSelectClass =
  "h-9 w-full min-w-0 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const filterInputClass =
  "h-9 w-full min-w-0 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

export function MySpacePage() {
  const [images, setImages] = useState<SpaceImage[]>(INITIAL_SPACE_IMAGES);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<"全部" | "采集" | "素材">("全部");

  const selectedCount = selectedIds.size;
  const showBatchBar = batchMode && selectedCount > 0;
  const filteredImages = useMemo(
    () => images.filter((item) => sourceFilter === "全部" || item.source === sourceFilter),
    [images, sourceFilter],
  );
  const allSelected = filteredImages.length > 0 && filteredImages.every((item) => selectedIds.has(item.id));

  const stats = useMemo(() => {
    const collect = images.filter((i) => i.source === "采集").length;
    const material = images.filter((i) => i.source === "素材").length;
    return { total: images.length, collect, material };
  }, [images]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map((i) => i.id)));
    }
  };

  const exitBatch = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    setImages((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
  };

  const enterBatchMode = () => {
    setBatchMode(true);
  };

  const applySourceFilter = (next: "全部" | "采集" | "素材") => {
    setSourceFilter(next);
    setSelectedIds(new Set());
  };

  const cardClass = (active: boolean) =>
    `rounded-xl border p-4 text-left transition-all ${
      active
        ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(242,100,25,0.16)]"
        : "border-border bg-card hover:border-primary/40 hover:bg-muted/20"
    }`;

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden relative">
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <h1 className="text-[16px] font-semibold text-foreground">我的空间</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (batchMode ? exitBatch() : enterBatchMode())}
            className={`h-8 px-4 rounded-md text-[13px] font-medium transition-colors ${
              batchMode
                ? "border border-primary/50 text-primary hover:bg-primary/5"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {batchMode ? "取消批量操作" : "批量操作"}
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-auto px-6 py-5 scrollbar-none ${showBatchBar ? "pb-28" : ""}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <button type="button" onClick={() => applySourceFilter("全部")} className={cardClass(sourceFilter === "全部")}>
            <div className="text-[12px] text-muted-foreground mb-1">全部</div>
            <div className="text-[14px] font-semibold text-foreground">已使用1%</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">0.01GB/1GB</div>
          </button>
          <button type="button" onClick={() => applySourceFilter("采集")} className={cardClass(sourceFilter === "采集")}>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              采集
            </div>
            <div className="text-[14px] font-semibold text-foreground">{stats.collect} 张</div>
          </button>
          <button type="button" onClick={() => applySourceFilter("素材")} className={cardClass(sourceFilter === "素材")}>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              素材
            </div>
            <div className="text-[14px] font-semibold text-foreground">{stats.material} 张</div>
          </button>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="text-[12px] text-muted-foreground">存储容量</div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
              >
                <Trash2 size={12} />
                释放空间
              </button>
            </div>
            <div className="relative h-1.5 rounded-full bg-muted overflow-visible">
              <div className="absolute inset-y-0 left-0 w-[1%] min-w-[6px] rounded-full bg-primary" />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
              <span>已使用1%</span>
              <span>0.01GB/1GB</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 mb-5">
          <select
            className={filterSelectClass}
            value={sourceFilter === "全部" ? "" : sourceFilter}
            onChange={(event) => applySourceFilter((event.target.value || "全部") as "全部" | "采集" | "素材")}
          >
            <option value="">全部来源</option>
            <option value="采集">采集</option>
            <option value="素材">素材</option>
          </select>
          <input className={filterInputClass} placeholder="批次" />
          <input className={filterInputClass} placeholder="请输入图片名称" />
          <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-background text-[13px] text-muted-foreground">
            <span>开始日期</span>
            <span>→</span>
            <span>结束日期</span>
            <Calendar size={14} className="ml-auto shrink-0" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <button
            type="button"
            className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5"
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((item) => {
            const selected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`group ${batchMode ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (batchMode) toggleSelect(item.id);
                }}
                onKeyDown={(e) => {
                  if (batchMode && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    toggleSelect(item.id);
                  }
                }}
                role={batchMode ? "button" : undefined}
                tabIndex={batchMode ? 0 : undefined}
              >
                <div
                  className={`relative aspect-[4/3] rounded-lg border bg-muted overflow-hidden transition-colors ${
                    selected
                      ? "border-primary ring-1 ring-primary/40"
                      : "border-border group-hover:border-primary/30"
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200 pointer-events-none"
                  />
                  {batchMode && (
                    <div
                      className="absolute top-2 left-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 accent-primary rounded border-border cursor-pointer"
                        aria-label={`选择 ${item.name}`}
                      />
                    </div>
                  )}
                  {item.usedCount > 0 && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/55 text-white backdrop-blur-sm pointer-events-none">
                      使用{item.usedCount}次
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[12px] text-muted-foreground truncate" title={item.name}>
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBatchBar && (
        <div className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 w-[min(960px,calc(100%-48px))] flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="accent-primary rounded"
                aria-label="全选"
              />
              全选
            </label>
            <span className="text-[13px] text-muted-foreground">
              已选择：<span className="text-foreground">{selectedCount}</span>项内容
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                addDownloadRecord({ title: `我的空间-批量下载`, count: selectedCount });
                showDownloadStartedSuccess();
              }}
              className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/50 transition-colors"
            >
              下载
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/50 transition-colors"
            >
              删除
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="h-9 px-4 rounded-md border border-border bg-background text-[13px] text-foreground hover:bg-muted/50 transition-colors"
            >
              取消选择
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
