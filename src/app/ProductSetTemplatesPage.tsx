import { useMemo, useState } from "react";
import { Copy, Eye, Plus, Search } from "lucide-react";
import {
  PRODUCT_SET_CATEGORY_TABS,
  addUserProductSetTemplate,
  getProductSetTemplates,
  type ProductSetCategory,
  type ProductSetTemplate,
  type ProductSetTemplateSource,
  useProductSetTemplateVersion,
} from "./productSetTemplateStore";
import { ProductSetTemplateCopyModal } from "./ProductSetTemplateCopyModal";

const SOURCE_TABS: { id: ProductSetTemplateSource; label: string }[] = [
  { id: "team", label: "团队" },
  { id: "official", label: "官方" },
];

function TemplateCard({
  template,
  sourceLabel,
  onView,
  onNew,
  onCopy,
}: {
  template: ProductSetTemplate;
  sourceLabel: string;
  onView: () => void;
  onNew: () => void;
  onCopy: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [activeImageId, setActiveImageId] = useState(template.images[0]?.id ?? "");
  const activeImage = template.images.find((image) => image.id === activeImageId) ?? template.images[0];

  return (
    <div
      className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex h-[220px] bg-muted/25">
        <div className="scrollbar-none flex w-[84px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-border/50 p-2">
          {template.images.map((image) => (
            <button
              key={image.id}
              type="button"
              onMouseEnter={() => setActiveImageId(image.id)}
              onClick={() => setActiveImageId(image.id)}
              className={`aspect-[3/4] shrink-0 overflow-hidden rounded-md border bg-background transition-colors ${
                activeImage?.id === image.id ? "border-primary shadow-sm" : "border-border/60"
              }`}
            >
              <img src={image.imageUrl} alt={image.name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center p-2">
          {activeImage ? (
            <>
              <img
                src={activeImage.imageUrl}
                alt={activeImage.name}
                className="max-h-full max-w-full object-contain"
              />
              <div
                className={`pointer-events-none absolute inset-y-2 left-[92px] right-2 transition-opacity ${
                  hovered ? "opacity-100" : "opacity-0"
                }`}
              >
                {activeImage.placements.map((placement) => (
                  <div
                    key={placement.id}
                    className="absolute rounded-md border-2 border-primary/90 bg-primary/10 shadow-[0_0_0_999px_rgba(0,0,0,0.04)]"
                    style={{
                      left: `${placement.left}%`,
                      top: `${placement.top}%`,
                      width: `${placement.width}%`,
                      height: `${placement.height}%`,
                      transform: `rotate(${placement.angle ?? 0}deg)`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                      {placement.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-border bg-background text-[12px] text-muted-foreground">
              暂无套图图片
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={onView}
            className="flex h-8 items-center gap-1.5 rounded-md bg-white/95 px-3 text-[12px] font-medium text-foreground shadow-sm hover:bg-white"
          >
            <Eye size={14} />
            查看
          </button>
          <button
            type="button"
            onClick={onNew}
            className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-white shadow-sm hover:bg-primary/90"
          >
            <Plus size={14} />
            新建
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="flex h-8 items-center gap-1.5 rounded-md bg-white/95 px-3 text-[12px] font-medium text-foreground shadow-sm hover:bg-white"
          >
            <Copy size={14} />
            副本
          </button>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 border-t border-border/60 px-3 py-2.5">
        <span className="shrink-0 rounded border border-primary/40 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
          {sourceLabel}
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">{template.name}</span>
      </div>
    </div>
  );
}

export function ProductSetTemplatesPage({
  onBack,
  onNewTask,
  onAddTemplate,
}: {
  onBack?: () => void;
  onNewTask?: (template: ProductSetTemplate) => void;
  onAddTemplate?: () => void;
}) {
  useProductSetTemplateVersion();
  const [source, setSource] = useState<ProductSetTemplateSource>("official");
  const [category, setCategory] = useState<ProductSetCategory>("推荐");
  const [copyTarget, setCopyTarget] = useState<ProductSetTemplate | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [preview, setPreview] = useState<ProductSetTemplate | null>(null);
  const [previewImageId, setPreviewImageId] = useState("");

  const templates = useMemo(() => getProductSetTemplates(source, category), [source, category]);

  const sourceLabel = source === "official" ? "官方" : source === "team" ? "团队" : "我的";
  const previewImage = preview?.images.find((image) => image.id === previewImageId) ?? preview?.images[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
        <div className="flex min-w-0 items-center gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground"
            >
              返回
            </button>
          ) : null}
          <h1 className="relative pb-1 text-[18px] font-semibold text-foreground">
            套图模板
            <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary" />
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-md border border-border px-4 text-[13px] text-foreground hover:bg-muted/40"
          >
            <Search size={14} className="text-muted-foreground" />
            查询
          </button>
          <button
            type="button"
            onClick={onAddTemplate}
            className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary/90"
          >
            <Plus size={14} />
            新增模板
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-6 py-3">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSource(tab.id)}
            className={`h-8 rounded-full px-4 text-[13px] font-medium transition-colors ${
              source === tab.id
                ? "border border-border bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {PRODUCT_SET_CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setCategory(tab)}
            className={`h-8 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors ${
              category === tab
                ? tab === "推荐"
                  ? "font-semibold text-primary"
                  : "border border-border bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="scrollbar-none flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              sourceLabel={template.source === "mine" ? "我的" : sourceLabel}
              onView={() => {
                setPreview(template);
                setPreviewImageId(template.images[0]?.id ?? "");
              }}
              onNew={() => onNewTask?.(template)}
              onCopy={() => {
                setCopyTarget(template);
                setCopyOpen(true);
              }}
            />
          ))}
        </div>
        {templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center text-[13px] text-muted-foreground">
            当前筛选下暂无套图模板
          </div>
        ) : null}
      </div>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setPreview(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-[520px] bg-muted/20">
              <div className="scrollbar-none flex w-[120px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-border/70 p-3">
                {preview.images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setPreviewImageId(image.id)}
                    className={`overflow-hidden rounded-lg border text-left ${
                      previewImage?.id === image.id ? "border-primary shadow-sm" : "border-border"
                    }`}
                  >
                    <img src={image.imageUrl} alt={image.name} className="aspect-[3/4] w-full object-cover" />
                    <div className="truncate border-t border-border/60 px-2 py-1 text-[11px] text-foreground">
                      {image.name}
                    </div>
                  </button>
                ))}
              </div>
              <div className="relative flex flex-1 items-center justify-center p-4">
                {previewImage ? (
                  <>
                    <img
                      src={previewImage.imageUrl}
                      alt={previewImage.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="pointer-events-none absolute inset-4">
                      {previewImage.placements.map((placement) => (
                        <div
                          key={placement.id}
                          className="absolute rounded-md border-2 border-primary bg-primary/10"
                          style={{
                            left: `${placement.left}%`,
                            top: `${placement.top}%`,
                            width: `${placement.width}%`,
                            height: `${placement.height}%`,
                            transform: `rotate(${placement.angle ?? 0}deg)`,
                          }}
                        >
                          <div className="absolute -top-6 left-0 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                            {placement.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border/70 px-4 py-3">
              <span className="text-[14px] font-medium text-foreground">{preview.name}</span>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-[13px] text-primary hover:text-primary/80"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ProductSetTemplateCopyModal
        open={copyOpen && Boolean(copyTarget)}
        defaultName={copyTarget ? `${copyTarget.name}-副本` : ""}
        defaultCategory={copyTarget?.category ?? "推荐"}
        onClose={() => {
          setCopyOpen(false);
          setCopyTarget(null);
        }}
        onConfirm={(name, targetCategory) => {
          if (!copyTarget) return;
          addUserProductSetTemplate({
            name,
            category: targetCategory,
            mockupType: copyTarget.mockupType,
            copyFrom: copyTarget,
          });
          setCopyOpen(false);
          setCopyTarget(null);
        }}
      />
    </div>
  );
}
