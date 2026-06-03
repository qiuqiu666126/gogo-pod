import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  BadgeCheck,
  FileJson,
  Globe2,
  ImageIcon,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Tag,
} from "lucide-react";

import { AdminShell } from "../components/AdminShell";
import { Badge, Btn, Card, Field, Tabs, inputCls, textareaCls } from "../components/ui";
import {
  PUBLISH_PLATFORMS,
  createOfficialPublishTemplateId,
  deleteOfficialPublishTemplate,
  getOfficialPublishTemplatesList,
  subscribeOfficialPublishTemplates,
  type OfficialPublishTemplate,
  type PublishPlatform,
  upsertOfficialPublishTemplate,
} from "../../shared/publishTemplates";

type EditorTab = "base" | "rules" | "quality";

const tabItems: { id: EditorTab; label: string }[] = [
  { id: "base", label: "基础信息" },
  { id: "rules", label: "刊登规则" },
  { id: "quality", label: "发布校验" },
];

function useOfficialPublishTemplates() {
  return useSyncExternalStore(
    subscribeOfficialPublishTemplates,
    getOfficialPublishTemplatesList,
    getOfficialPublishTemplatesList,
  );
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(list: string[]) {
  return list.join("\n");
}

function sectionsToText(template: OfficialPublishTemplate) {
  return template.sections.map((section) => `${section.label}：${section.value}`).join("\n");
}

function parseSections(value: string) {
  return splitLines(value).map((line) => {
    const [label, ...rest] = line.split("：");
    return {
      label: label?.trim() || "未命名配置",
      value: rest.join("：").trim() || "待补充",
    };
  });
}

function buildEmptyTemplate(platform: PublishPlatform): OfficialPublishTemplate {
  return {
    id: createOfficialPublishTemplateId(),
    name: "",
    platform,
    enabled: true,
    sortOrder: 0,
    updatedAt: "",
    description: "",
    storeName: "",
    site: platform === "temu" ? "美国站" : "",
    categoryPath: "",
    publishMode: "生成草稿后提交审核",
    priceRule: "",
    inventoryRule: "",
    titleRule: "",
    imageRule: "",
    attributeRule: "",
    suitableFor: [],
    requiredFields: [],
    highlights: [],
    sections: [],
  };
}

export function PublishTemplatesAdminPage() {
  const templates = useOfficialPublishTemplates();
  const [platformFilter, setPlatformFilter] = useState<PublishPlatform | "">("temu");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? "");
  const [editing, setEditing] = useState<OfficialPublishTemplate | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>("base");

  const filtered = useMemo(() => {
    let list = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
    if (platformFilter) list = list.filter((template) => template.platform === platformFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((template) => {
        return (
          template.name.toLowerCase().includes(q) ||
          template.categoryPath.toLowerCase().includes(q) ||
          template.storeName.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [platformFilter, search, templates]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId("");
      setEditing(null);
      return;
    }

    const exists = filtered.some((template) => template.id === selectedId);
    const fallback = filtered[0];
    if (!exists || !editing) {
      setSelectedId((current) => (exists ? current : fallback.id));
      setEditing(fallback);
    }
  }, [editing, filtered, selectedId]);

  const selectedTemplate = filtered.find((template) => template.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (selectedTemplate) {
      setEditing(selectedTemplate);
    }
  }, [selectedTemplate]);

  const openNew = () => {
    const platform = (platformFilter || "temu") as PublishPlatform;
    const next = buildEmptyTemplate(platform);
    next.sortOrder = filtered.length ? Math.max(...filtered.map((item) => item.sortOrder)) + 1 : 1;
    setSelectedId(next.id);
    setEditing(next);
    setEditorTab("base");
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return;
    upsertOfficialPublishTemplate({
      ...editing,
      name: editing.name.trim(),
      description: editing.description.trim(),
      storeName: editing.storeName.trim(),
      site: editing.site.trim(),
      categoryPath: editing.categoryPath.trim(),
      publishMode: editing.publishMode.trim(),
      priceRule: editing.priceRule.trim(),
      inventoryRule: editing.inventoryRule.trim(),
      titleRule: editing.titleRule.trim(),
      imageRule: editing.imageRule.trim(),
      attributeRule: editing.attributeRule.trim(),
      suitableFor: editing.suitableFor.map((item) => item.trim()).filter(Boolean),
      requiredFields: editing.requiredFields.map((item) => item.trim()).filter(Boolean),
      highlights: editing.highlights.map((item) => item.trim()).filter(Boolean),
      sections: editing.sections
        .map((section) => ({
          label: section.label.trim(),
          value: section.value.trim(),
        }))
        .filter((section) => section.label && section.value),
    });
  };

  return (
    <AdminShell
      title="刊登模版"
      subtitle="面向 Temu 商品刊登配置标题、类目、属性、图片、价格与发布校验规则"
    >
      <div className="p-6">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-border/80 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-semibold">模板列表</h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    先按平台筛选，再选择要编辑的刊登模板。
                  </p>
                </div>
                <Btn size="sm" onClick={openNew}>
                  <span className="flex items-center gap-1.5">
                    <Plus size={14} /> 新建
                  </span>
                </Btn>
              </div>
              <div className="mt-4 flex gap-2">
                <select
                  className={`${inputCls} min-w-[120px]`}
                  value={platformFilter}
                  onChange={(event) => setPlatformFilter(event.target.value as PublishPlatform | "")}
                >
                  {PUBLISH_PLATFORMS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    className={`${inputCls} pl-8`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索模板名、类目或店铺"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[760px] overflow-y-auto p-3">
              {filtered.length > 0 ? (
                filtered.map((template) => {
                  const active = template.id === selectedId;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(template.id);
                        setEditing(template);
                      }}
                      className={`mb-3 w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold text-foreground">
                              {template.name}
                            </span>
                            <Badge tone={template.enabled ? "success" : "default"}>
                              {template.enabled ? "启用" : "停用"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        {active ? <BadgeCheck size={16} className="shrink-0 text-primary" /> : null}
                      </div>

                      <div className="mt-3 grid gap-2 text-[12px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Store size={13} />
                          <span>{template.storeName || "未配置店铺"} · {template.site || "未配置站点"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag size={13} />
                          <span className="truncate">{template.categoryPath || "未配置 Temu 类目"}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {template.suitableFor.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-16 text-center text-[13px] text-muted-foreground">暂无模板</div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            {editing ? (
              <>
                <Card className="bg-gradient-to-br from-orange-50 via-white to-amber-50">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="primary">
                          {PUBLISH_PLATFORMS.find((item) => item.value === editing.platform)?.label}
                        </Badge>
                        <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] text-muted-foreground">
                          {editing.storeName || "未配置店铺"}
                        </span>
                        <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] text-muted-foreground">
                          {editing.site || "未配置站点"}
                        </span>
                      </div>
                      <h2 className="mt-3 text-[22px] font-semibold text-foreground">
                        {editing.name || "新建刊登模板"}
                      </h2>
                      <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted-foreground">
                        {editing.description || "为 Temu 商品刊登配置完整的标题、属性、图片、价格和审核规则。"}
                      </p>
                    </div>

                    <div className="grid min-w-[220px] gap-2 text-[12px]">
                      <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                        <p className="text-muted-foreground">当前类目</p>
                        <p className="mt-1 text-foreground">{editing.categoryPath || "未配置"}</p>
                      </div>
                      <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                        <p className="text-muted-foreground">发布时间策略</p>
                        <p className="mt-1 text-foreground">{editing.publishMode || "未配置"}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex items-center justify-between gap-3">
                  <Tabs items={tabItems} value={editorTab} onChange={(id) => setEditorTab(id as EditorTab)} />
                  <div className="flex items-center gap-2">
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        if (templates.some((item) => item.id === editing.id) && confirm(`删除模板「${editing.name || "未命名模板"}」？`)) {
                          deleteOfficialPublishTemplate(editing.id);
                        }
                      }}
                    >
                      删除
                    </Btn>
                    <Btn variant="secondary" onClick={() => selectedTemplate && setEditing(selectedTemplate)}>
                      重置
                    </Btn>
                    <Btn onClick={save}>保存模板</Btn>
                  </div>
                </div>

                {editorTab === "base" ? (
                  <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_360px]">
                    <Card title="基础信息">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="模板名称">
                          <input
                            className={inputCls}
                            value={editing.name}
                            onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                            placeholder="例如：Temu 女装基础刊登模板"
                          />
                        </Field>
                        <Field label="平台">
                          <select
                            className={inputCls}
                            value={editing.platform}
                            onChange={(event) =>
                              setEditing({ ...editing, platform: event.target.value as PublishPlatform })
                            }
                          >
                            {PUBLISH_PLATFORMS.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Temu 店铺">
                          <input
                            className={inputCls}
                            value={editing.storeName}
                            onChange={(event) => setEditing({ ...editing, storeName: event.target.value })}
                            placeholder="例如：Temu US 主店"
                          />
                        </Field>
                        <Field label="站点 / 市场">
                          <input
                            className={inputCls}
                            value={editing.site}
                            onChange={(event) => setEditing({ ...editing, site: event.target.value })}
                            placeholder="例如：美国站"
                          />
                        </Field>
                        <Field label="Temu 类目路径" className="md:col-span-2">
                          <input
                            className={inputCls}
                            value={editing.categoryPath}
                            onChange={(event) => setEditing({ ...editing, categoryPath: event.target.value })}
                            placeholder="Women Clothing > Tops > T-Shirts"
                          />
                        </Field>
                        <Field label="模板说明" className="md:col-span-2">
                          <textarea
                            className={textareaCls}
                            value={editing.description}
                            onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                            placeholder="说明这个模板适合哪些商品，以及为什么要这样配置。"
                          />
                        </Field>
                        <Field label="适用品类标签" hint="一行一个，例如：女装 / 基础款 / 多尺码" className="md:col-span-2">
                          <textarea
                            className={textareaCls}
                            value={joinLines(editing.suitableFor)}
                            onChange={(event) => setEditing({ ...editing, suitableFor: splitLines(event.target.value) })}
                            placeholder={"女装\n基础款\n多尺码"}
                          />
                        </Field>
                      </div>
                    </Card>

                    <Card title="前台展示摘要">
                      <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center gap-2 text-[13px] font-semibold">
                            <Globe2 size={15} className="text-primary" />
                            模板信息卡
                          </div>
                          <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
                            前台会展示模板名称、描述、店铺、站点、适用品类和规则摘要，帮助用户选择合适模板。
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[12px] font-medium text-foreground">当前会展示的标签</p>
                          <div className="flex flex-wrap gap-2">
                            {editing.suitableFor.length > 0 ? (
                              editing.suitableFor.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-[12px] text-muted-foreground">暂无标签</span>
                            )}
                          </div>
                        </div>
                        <Field label="排序">
                          <input
                            type="number"
                            className={inputCls}
                            value={editing.sortOrder}
                            onChange={(event) =>
                              setEditing({ ...editing, sortOrder: Number(event.target.value) || 0 })
                            }
                          />
                        </Field>
                        <label className="flex items-center gap-2 text-[13px]">
                          <input
                            type="checkbox"
                            checked={editing.enabled}
                            onChange={(event) => setEditing({ ...editing, enabled: event.target.checked })}
                          />
                          在前台模板选择器中展示
                        </label>
                      </div>
                    </Card>
                  </div>
                ) : null}

                {editorTab === "rules" ? (
                  <div className="grid gap-6">
                    <Card title="Temu 刊登规则">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="发布方式">
                          <input
                            className={inputCls}
                            value={editing.publishMode}
                            onChange={(event) => setEditing({ ...editing, publishMode: event.target.value })}
                            placeholder="例如：生成草稿后提交审核"
                          />
                        </Field>
                        <Field label="标题规则">
                          <input
                            className={inputCls}
                            value={editing.titleRule}
                            onChange={(event) => setEditing({ ...editing, titleRule: event.target.value })}
                            placeholder="{品牌} {品名} {核心卖点} {颜色} {尺码}"
                          />
                        </Field>
                        <Field label="价格规则" className="md:col-span-2">
                          <textarea
                            className={textareaCls}
                            value={editing.priceRule}
                            onChange={(event) => setEditing({ ...editing, priceRule: event.target.value })}
                            placeholder="描述价格来源、加价逻辑、最低价保护。"
                          />
                        </Field>
                        <Field label="库存规则" className="md:col-span-2">
                          <textarea
                            className={textareaCls}
                            value={editing.inventoryRule}
                            onChange={(event) => setEditing({ ...editing, inventoryRule: event.target.value })}
                            placeholder="描述库存来源仓、同步周期、低库存预警。"
                          />
                        </Field>
                        <Field label="图片规则" className="md:col-span-2">
                          <textarea
                            className={textareaCls}
                            value={editing.imageRule}
                            onChange={(event) => setEditing({ ...editing, imageRule: event.target.value })}
                            placeholder="例如：1 张白底主图 + 6 张场景图，SKU 图按颜色拆分。"
                          />
                        </Field>
                        <Field label="属性映射规则" className="md:col-span-2">
                          <textarea
                            className={textareaCls}
                            value={editing.attributeRule}
                            onChange={(event) => setEditing({ ...editing, attributeRule: event.target.value })}
                            placeholder="描述 Temu 类目必填属性、取值来源和单位转换。"
                          />
                        </Field>
                      </div>
                    </Card>

                    <div className="grid gap-6 2xl:grid-cols-2">
                      <Card title="模板亮点" action={<ImageIcon size={15} className="text-primary" />}>
                        <Field label="前台关键规则亮点" hint="一行一个，前台列表和详情页会优先展示前几条">
                          <textarea
                            className={textareaCls}
                            value={joinLines(editing.highlights)}
                            onChange={(event) => setEditing({ ...editing, highlights: splitLines(event.target.value) })}
                            placeholder={"白底图合规检查\nSKU 颜色图自动匹配\n价格下限保护"}
                          />
                        </Field>
                      </Card>

                      <Card title="配置摘要" action={<FileJson size={15} className="text-primary" />}>
                        <Field label="模板摘要字段" hint="格式：字段名：内容，一行一个">
                          <textarea
                            className={textareaCls}
                            value={sectionsToText(editing)}
                            onChange={(event) => setEditing({ ...editing, sections: parseSections(event.target.value) })}
                            placeholder={"默认语言：英语\n物流方案：平台默认物流\n品牌字段：取商品品牌，缺失时阻断提交"}
                          />
                        </Field>
                      </Card>
                    </div>
                  </div>
                ) : null}

                {editorTab === "quality" ? (
                  <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                    <Card title="发布校验规则">
                      <Field label="必填字段清单" hint="一行一个，前台导出或发布前会按此清单校验">
                        <textarea
                          className={textareaCls}
                          value={joinLines(editing.requiredFields)}
                          onChange={(event) =>
                            setEditing({ ...editing, requiredFields: splitLines(event.target.value) })
                          }
                          placeholder={"Temu 店铺\n平台类目\n标题模板\n主图规则\n价格规则"}
                        />
                      </Field>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                            <ShieldCheck size={15} className="text-primary" />
                            发布前拦截建议
                          </div>
                          <div className="mt-3 space-y-2 text-[12px] leading-5 text-muted-foreground">
                            <p>缺少 Temu 类目、主图、价格规则时直接阻断提交。</p>
                            <p>品牌、材质、规格等核心属性缺失时标记为高优先错误。</p>
                            <p>图片数量不满足模板要求时提示用户补图或切换模板。</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                            <BadgeCheck size={15} className="text-primary" />
                            状态回写建议
                          </div>
                          <div className="mt-3 space-y-2 text-[12px] leading-5 text-muted-foreground">
                            <p>保存 Temu 返回的商品 ID、SKU ID 和审核状态。</p>
                            <p>提交失败时记录错误码，并允许用户按模板重试。</p>
                            <p>审核中与已上架状态建议在商品库中可追踪。</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card title="实施提醒">
                      <div className="space-y-3 text-[12px] leading-5 text-muted-foreground">
                        <p>当前页面是模板原型，下一步接接口时建议把模板拆成主表、属性映射表、媒体规则表、SKU 规则表。</p>
                        <p>Temu 模板最好与店铺授权绑定，不同站点和店铺的价格、运费、审核规则通常不同。</p>
                        <p>前台“选择模板”应只展示启用状态模板，且按排序字段控制顺序。</p>
                      </div>
                    </Card>
                  </div>
                ) : null}
              </>
            ) : (
              <Card>
                <div className="py-24 text-center text-[13px] text-muted-foreground">
                  当前筛选下暂无模板，请先新建一条 Temu 刊登模板。
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
