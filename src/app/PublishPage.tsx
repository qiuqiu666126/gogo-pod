import { useState, useSyncExternalStore } from "react";
import {
  BadgeCheck,
  HelpCircle,
  Inbox,
  MessageSquareText,
  Package,
  Plus,
  Store,
} from "lucide-react";

import { AddStoreModal } from "./AddStoreModal";
import { AddListingTemplateModal } from "./AddListingTemplateModal";
import { ProductLibraryContent } from "./ProductLibraryContent";
import {
  PUBLISH_PLATFORMS,
  getOfficialPublishTemplatesList,
  subscribeOfficialPublishTemplates,
} from "../shared/publishTemplates";

function useOfficialPublishTemplates() {
  return useSyncExternalStore(
    subscribeOfficialPublishTemplates,
    getOfficialPublishTemplatesList,
    getOfficialPublishTemplatesList,
  );
}

const subNavItems = [
  { id: "products", label: "商品库", icon: Package },
  { id: "stores", label: "店铺管理", icon: Store },
  { id: "templates", label: "刊登模板", icon: MessageSquareText },
] as const;

const pageTitles: Record<(typeof subNavItems)[number]["id"], string> = {
  products: "商品库",
  stores: "店铺管理",
  templates: "刊登模板",
};

const filterInputClass =
  "h-9 min-w-[120px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

const filterSelectClass =
  "h-9 min-w-[100px] rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

export function PublishPage({
  onGoToPluginCollection,
  onGoToProductSetList,
}: {
  onGoToPluginCollection?: () => void;
  onGoToProductSetList?: () => void;
}) {
  const [subNav, setSubNav] = useState<(typeof subNavItems)[number]["id"]>("products");
  const [groupTab, setGroupTab] = useState<"all" | "ungrouped">("all");
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const officialTemplates = useOfficialPublishTemplates();
  const enabledTemplates = officialTemplates
    .filter((t) => t.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const title = pageTitles[subNav];
  const isStorePage = subNav === "stores";
  const isProductPage = subNav === "products";
  const isTemplatePage = subNav === "templates";

  return (
    <>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="flex flex-col w-[168px] shrink-0 border-r border-border bg-sidebar py-3">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const active = subNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubNav(item.id)}
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

        {isProductPage ? (
          <ProductLibraryContent
            onGoToPluginCollection={onGoToPluginCollection}
            onGoToProductSetList={onGoToProductSetList}
          />
        ) : (
          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <h1 className="text-[16px] font-semibold text-foreground">{title}</h1>
                {(isStorePage || isTemplatePage) && (
                  <button className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle size={13} />
                    {isStorePage ? "如何新增店铺" : "如何新增刊登模板"}
                  </button>
                )}
              </div>
              {(isStorePage || isTemplatePage) && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className={filterInputClass}
                    placeholder={isStorePage ? "店铺名称" : "模板名称"}
                  />
                  <select className={filterSelectClass} defaultValue="">
                    <option value="">平台</option>
                    <option value="temu">Temu</option>
                    <option value="amazon">Amazon</option>
                  </select>
                  {isStorePage ? (
                    <select className={filterSelectClass} defaultValue="">
                      <option value="">状态</option>
                      <option value="active">正常</option>
                      <option value="expired">已过期</option>
                    </select>
                  ) : null}
                  <button className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors">
                    查询
                  </button>
                  <button
                    onClick={() => (isStorePage ? setAddStoreOpen(true) : setAddTemplateOpen(true))}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={14} />
                    {isStorePage ? "新增店铺" : "新增模板"}
                  </button>
                </div>
              )}
            </div>

            {(isStorePage || isTemplatePage) && (
              <div className="flex items-center gap-4 px-6 py-3 border-b border-border shrink-0">
                <button
                  onClick={() => setGroupTab("all")}
                  className={`text-[13px] font-medium transition-colors ${
                    groupTab === "all" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setGroupTab("ungrouped")}
                  className={`text-[13px] font-medium transition-colors ${
                    groupTab === "ungrouped" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  未分组 <span className="text-muted-foreground">0</span>
                </button>
                <button className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors">
                  {isStorePage ? "创建分组" : "+ 创建分组"}
                </button>
              </div>
            )}

            <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
              <div className="rounded-xl border border-border overflow-hidden bg-card min-h-[480px]">
                {isTemplatePage ? (
                    <div className="flex h-full min-h-[480px] flex-col bg-card text-foreground">
                      <div className="flex items-center border-b border-border bg-muted/40 px-6 py-3 text-[13px] text-muted-foreground">
                        <span className="w-[36px]" />
                        <span className="flex-[1.25]">模板名称</span>
                        <span className="flex-[1.2]">适用品类 / 店铺</span>
                        <span className="w-[180px]">关键规则</span>
                        <span className="w-[180px]">更新时间</span>
                      </div>
                    {enabledTemplates.length > 0 ? (
                      <div className="flex-1 overflow-y-auto">
                        {enabledTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="flex items-start border-b border-border px-6 py-4 text-[13px] hover:bg-muted/30 transition-colors"
                          >
                            <span className="w-[36px] pt-1">
                              <input type="checkbox" className="accent-primary rounded" />
                            </span>
                            <div className="flex-[1.25] min-w-0 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{template.name}</span>
                                {template.platform === "temu" ? (
                                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                    Temu
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                                {template.description}
                              </p>
                            </div>
                            <div className="flex-[1.2] min-w-0 pr-4">
                              <p className="text-[12px] font-medium text-foreground">{template.categoryPath}</p>
                              <p className="mt-1 text-[12px] text-muted-foreground">
                                {template.storeName} · {template.site}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {template.suitableFor.slice(0, 3).map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="w-[180px] pr-4">
                              <div className="space-y-2">
                                {template.highlights.slice(0, 2).map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-start gap-1.5 text-[12px] text-muted-foreground"
                                  >
                                    <BadgeCheck size={13} className="mt-0.5 shrink-0 text-primary" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <span className="w-[180px] pt-0.5 text-muted-foreground">{template.updatedAt}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                          <MessageSquareText size={28} className="opacity-40" />
                        </div>
                        <span className="text-[13px]">暂无模板，快去新增吧～</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="w-10 px-4 py-3">
                          <input type="checkbox" className="accent-primary rounded" aria-label="全选" />
                        </th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">平台</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">名称</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">授权状态</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">店铺人员</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">状态</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">过期时间</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">创建时间</th>
                        <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={9} className="py-32">
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <AddStoreModal open={addStoreOpen} onClose={() => setAddStoreOpen(false)} />
      <AddListingTemplateModal open={addTemplateOpen} onClose={() => setAddTemplateOpen(false)} />
    </>
  );
}
