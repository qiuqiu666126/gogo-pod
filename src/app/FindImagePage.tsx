import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  Calendar,
  Check,
  Database,
  HelpCircle,
  ImagePlus,
  Inbox,
  Plus,
  RefreshCw,
  ScanSearch,
} from "lucide-react";

import { CollectionTaskListContent } from "./CollectionTaskListContent";
import { SelectFromMySpaceButton } from "./SelectFromMySpaceButton";

const subNavItems = [
  { id: "collection", label: "数据采集", icon: Database },
  { id: "search", label: "以图搜图", icon: ScanSearch },
] as const;

const contentTabs = ["插件采集列表", "店铺采集列表"];

const searchPlatforms = [
  { id: "google", name: "Google", desc: "涵盖全球图片资源", mark: "G", markClass: "text-blue-500" },
  { id: "shutterstock", name: "Shutterstock", desc: "海量正版素材库", mark: "S", markClass: "text-red-500" },
  { id: "pinterest", name: "Pinterest", desc: "审美灵感分享网站", mark: "P", markClass: "text-red-600" },
  { id: "midjourney", name: "Midjourney", desc: "须MJ会员解锁权限", mark: "⛵", markClass: "text-sky-500" },
] as const;

type SearchPlatformId = (typeof searchPlatforms)[number]["id"];

const SEARCH_PLATFORM_URLS: Record<SearchPlatformId, string> = {
  google: "https://www.google.com/",
  shutterstock: "https://www.shutterstock.com/zh/",
  pinterest: "https://www.pinterest.com/",
  midjourney: "https://www.midjourney.com/explore?tab=top",
};

const filterSelectClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

function CollectionContent({
  activeTab,
  setActiveTab,
  onOpenTaskList,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTaskList: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 h-12 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          {contentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-8 px-4 rounded-full text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
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
        <button className="text-[13px] text-foreground hover:text-primary transition-colors">已安装浏览器插件</button>
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
                  <input type="checkbox" className="accent-primary rounded" aria-label="全选" />
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[100px]">图片</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">标题</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground min-w-[200px]">信息</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-24">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-3">
                      <Inbox size={28} className="opacity-40" />
                    </div>
                    <span className="text-[13px]">暂无数据</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ImageSearchContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [platform, setPlatform] = useState<SearchPlatformId | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const hasImage = Boolean(previewUrl);
  const canStart = hasImage && platform !== null;

  const setImageFromFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setImageName(file.name);
  };

  const clearImage = () => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setImageFromFile(file);
  };

  const handleStartSearch = () => {
    if (!canStart || !platform) return;
    window.open(SEARCH_PLATFORM_URLS[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto px-8 py-6 scrollbar-none">
      <h1 className="text-[16px] font-semibold text-foreground mb-6">以图搜图</h1>

      <div className="max-w-[920px] space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold text-primary">01</span>
            <span className="text-[14px] font-semibold text-foreground">选择素材</span>
          </div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-12 flex flex-col items-center justify-center text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFromFile(file);
              }}
            />
            {hasImage && previewUrl ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <img
                  src={previewUrl}
                  alt={imageName ?? "已选素材"}
                  className="max-h-40 max-w-full rounded-lg object-contain border border-border bg-background"
                />
                <p className="text-[12px] text-muted-foreground truncate max-w-full">{imageName}</p>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-[12px] text-primary hover:text-primary/80"
                >
                  重新选择
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-background border border-border">
                    <ImagePlus size={24} className="text-muted-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white">
                    <Plus size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="text-[13px] text-muted-foreground mb-4">将图片拖放到此处，仅支持单张搜图</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-7 rounded-md border border-border bg-background text-[13px] text-foreground hover:border-primary/50 transition-colors"
                  >
                    上传图片
                  </button>
                  <SelectFromMySpaceButton
                    onPick={(assets) => {
                      const asset = assets[0];
                      if (!asset) return;
                      setPreviewUrl((prev) => {
                        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                        return asset.url;
                      });
                      setImageName(asset.name);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold text-primary">02</span>
            <span className="text-[14px] font-semibold text-foreground">选择搜图平台</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {searchPlatforms.map((item) => {
              const selected = platform === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPlatform(item.id)}
                  className={`relative text-left rounded-xl border p-4 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  <div
                    className={`absolute top-3 right-3 flex items-center justify-center w-4 h-4 rounded-full border ${
                      selected ? "border-primary bg-primary text-white" : "border-border bg-background"
                    }`}
                  >
                    {selected && <Check size={10} strokeWidth={3} />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-lg font-semibold ${item.markClass}`}>
                      {item.mark}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-foreground">{item.name}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          disabled={!canStart}
          onClick={handleStartSearch}
          className={`w-full max-w-[920px] h-11 rounded-lg text-[14px] font-medium transition-colors ${
            canStart
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          开始搜索
        </button>
      </div>
    </div>
  );
}

export function FindImagePage({
  pluginCollectionEntryKey = 0,
}: {
  pluginCollectionEntryKey?: number;
}) {
  const [subNav, setSubNav] = useState<(typeof subNavItems)[number]["id"]>("collection");
  const [activeTab, setActiveTab] = useState(contentTabs[0]);
  const [showTaskList, setShowTaskList] = useState(false);

  useEffect(() => {
    if (pluginCollectionEntryKey > 0) {
      setSubNav("collection");
      setActiveTab("插件采集列表");
      setShowTaskList(false);
    }
  }, [pluginCollectionEntryKey]);

  const handleSubNavChange = (id: (typeof subNavItems)[number]["id"]) => {
    setSubNav(id);
    setShowTaskList(false);
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <aside className="flex flex-col w-[168px] shrink-0 border-r border-border bg-sidebar py-3">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const active = subNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSubNavChange(item.id)}
              className={`group flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium transition-all relative ${
                active
                  ? "text-primary bg-primary/5"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              <Icon size={16} className={active ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {subNav === "collection" && showTaskList && (
          <CollectionTaskListContent onBack={() => setShowTaskList(false)} />
        )}
        {subNav === "collection" && !showTaskList && (
          <CollectionContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenTaskList={() => setShowTaskList(true)}
          />
        )}
        {subNav === "search" && <ImageSearchContent />}
      </div>
    </div>
  );
}
