import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GripVertical, ImageIcon, Move, Plus, Search, Trash2 } from "lucide-react";

import { AdminShell } from "../components/AdminShell";
import { Badge, Btn, Card, Field, inputCls } from "../components/ui";
import {
  PRODUCT_SET_CATEGORY_TABS,
  type OfficialProductSetTemplate,
  type ProductSetCategory,
  type ProductSetMockupImage,
  type ProductSetPlacement,
  createOfficialProductSetTemplateId,
  createProductSetImageId,
  createProductSetPlacementId,
  deleteOfficialProductSetTemplate,
  getOfficialProductSetTemplatesList,
  subscribeOfficialProductSetTemplates,
  upsertOfficialProductSetTemplate,
} from "../../shared/productSetTemplates";

function useOfficialProductSetTemplates() {
  return useSyncExternalStore(
    subscribeOfficialProductSetTemplates,
    getOfficialProductSetTemplatesList,
    getOfficialProductSetTemplatesList,
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("图片读取失败"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function updateImageAt(
  template: OfficialProductSetTemplate,
  imageId: string,
  updater: (image: ProductSetMockupImage) => ProductSetMockupImage,
) {
  return {
    ...template,
    images: template.images.map((image) => (image.id === imageId ? updater(image) : image)),
  };
}

function TemplatePreview({
  template,
  activeImageId,
}: {
  template: Pick<OfficialProductSetTemplate, "name" | "images">;
  activeImageId: string;
}) {
  const activeImage = template.images.find((image) => image.id === activeImageId) ?? template.images[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative flex h-[320px] bg-muted/25">
        <div className="scrollbar-none flex w-[100px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-border/50 p-2">
          {template.images.length > 0 ? (
            template.images.map((image) => (
              <div
                key={image.id}
                className={`overflow-hidden rounded-md border bg-background ${
                  activeImage?.id === image.id ? "border-primary" : "border-border/60"
                }`}
              >
                <img src={image.imageUrl} alt={image.name} className="aspect-[3/4] w-full object-cover" />
                <div className="truncate border-t border-border/60 px-2 py-1 text-[11px] text-foreground">
                  {image.name}
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center rounded-md border border-dashed border-border text-[11px] text-muted-foreground">
              暂无商品图
            </div>
          )}
        </div>
        <div className="relative flex flex-1 items-center justify-center p-3">
          {activeImage ? (
            <>
              <img src={activeImage.imageUrl} alt={activeImage.name} className="max-h-full max-w-full object-contain" />
              <div className="pointer-events-none absolute inset-3">
                {activeImage.placements.map((placement) => (
                  <div
                    key={placement.id}
                    className="absolute rounded-md border-2 border-primary/90 bg-primary/10"
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
            <div className="flex h-[220px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-background text-[12px] text-muted-foreground">
              未配置图片
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2.5">
        <span className="shrink-0 rounded border border-primary/40 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
          官方
        </span>
        <span className="truncate text-[13px] font-medium text-foreground">
          {template.name || "未命名模板"}
        </span>
      </div>
    </div>
  );
}

function ImageItem({
  index,
  image,
  active,
  onSelect,
  onChange,
  onUpload,
  onDelete,
}: {
  index: number;
  image: ProductSetMockupImage;
  active: boolean;
  onSelect: () => void;
  onChange: (next: ProductSetMockupImage) => void;
  onUpload: (file?: File) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-3 ${active ? "border-primary shadow-sm" : "border-border"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onSelect} className="flex items-center gap-2 text-left">
          <GripVertical size={14} className="text-muted-foreground" />
          <span className="text-[12px] font-medium text-foreground">套图图片 {index + 1}</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 text-[12px] text-destructive"
        >
          <Trash2 size={13} /> 删除
        </button>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_132px]">
        <div className="space-y-3">
          <Field label="图片名称">
            <input
              className={inputCls}
              value={image.name}
              onChange={(event) => onChange({ ...image, name: event.target.value })}
            />
          </Field>
          <Field label="图片 URL">
            <input
              className={inputCls}
              value={image.imageUrl}
              onChange={(event) => onChange({ ...image, imageUrl: event.target.value })}
              placeholder="https://... 或上传本地图片"
            />
          </Field>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-[12px] text-foreground hover:border-primary/50">
            <ImageIcon size={13} className="text-primary" />
            上传本地图片
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                onUpload(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="overflow-hidden rounded-lg border border-border bg-muted/30"
        >
          {image.imageUrl ? (
            <img src={image.imageUrl} alt={image.name} className="h-[160px] w-full object-cover" />
          ) : (
            <div className="flex h-[160px] items-center justify-center text-[11px] text-muted-foreground">
              预览
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

function PlacementList({
  placements,
  selectedPlacementId,
  onSelect,
  onChange,
  onDelete,
}: {
  placements: ProductSetPlacement[];
  selectedPlacementId: string;
  onSelect: (placementId: string) => void;
  onChange: (placementId: string, next: ProductSetPlacement) => void;
  onDelete: (placementId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {placements.length > 0 ? (
        placements.map((placement, index) => (
          <div
            key={placement.id}
            className={`rounded-xl border bg-card p-3 ${
              selectedPlacementId === placement.id ? "border-primary shadow-sm" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelect(placement.id)}
                className="text-[12px] font-medium text-foreground"
              >
                区域 {index + 1}
              </button>
              <button
                type="button"
                onClick={() => onDelete(placement.id)}
                className="inline-flex items-center gap-1 text-[12px] text-destructive"
              >
                <Trash2 size={13} /> 删除
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="区域名称">
                <input
                  className={inputCls}
                  value={placement.name}
                  onChange={(event) => onChange(placement.id, { ...placement, name: event.target.value })}
                />
              </Field>
              <Field label="区域 ID">
                <input
                  className={inputCls}
                  value={placement.id}
                  onChange={(event) => onChange(placement.id, { ...placement, id: event.target.value })}
                />
              </Field>
              <Field label="左侧位置（%）">
                <input
                  type="number"
                  className={inputCls}
                  value={placement.left}
                  onChange={(event) =>
                    onChange(placement.id, { ...placement, left: clamp(Number(event.target.value) || 0, 0, 100) })
                  }
                />
              </Field>
              <Field label="顶部位置（%）">
                <input
                  type="number"
                  className={inputCls}
                  value={placement.top}
                  onChange={(event) =>
                    onChange(placement.id, { ...placement, top: clamp(Number(event.target.value) || 0, 0, 100) })
                  }
                />
              </Field>
              <Field label="区域宽度（%）">
                <input
                  type="number"
                  className={inputCls}
                  value={placement.width}
                  onChange={(event) =>
                    onChange(placement.id, { ...placement, width: clamp(Number(event.target.value) || 0, 0, 100) })
                  }
                />
              </Field>
              <Field label="区域高度（%）">
                <input
                  type="number"
                  className={inputCls}
                  value={placement.height}
                  onChange={(event) =>
                    onChange(placement.id, { ...placement, height: clamp(Number(event.target.value) || 0, 0, 100) })
                  }
                />
              </Field>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-[12px] text-muted-foreground">
          当前图片还没有配置区域。点击“新增区域”后，直接在左侧画布拖出套取区域。
        </div>
      )}
    </div>
  );
}

type DragState =
  | { type: "create"; startX: number; startY: number }
  | {
      type: "move";
      placementId: string;
      offsetX: number;
      offsetY: number;
      width: number;
      height: number;
    };

function PlacementCanvas({
  image,
  selectedPlacementId,
  onSelectPlacement,
  onChangePlacements,
}: {
  image?: ProductSetMockupImage;
  selectedPlacementId: string;
  onSelectPlacement: (placementId: string) => void;
  onChangePlacements: (placements: ProductSetPlacement[]) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [draftRect, setDraftRect] = useState<ProductSetPlacement | null>(null);

  const placements = image?.placements ?? [];

  const toPercent = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-foreground">
          <Move size={14} className="text-primary" />
          拖拽配置套取区域
        </div>
        <p className="mb-3 text-[11px] leading-5 text-muted-foreground">
          先选中左侧某张套图图片，再在画布里拖出区域；拖动已有区域可以调整位置，右侧数值会实时同步。
        </p>

        <div
          ref={canvasRef}
          className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted/30"
          onPointerDown={(event) => {
            if (!image) return;
            const point = toPercent(event.clientX, event.clientY);
            if (!point) return;
            const target = (event.target as HTMLElement).closest("[data-placement-id]");
            if (target) {
              const placementId = target.getAttribute("data-placement-id");
              const placement = placements.find((item) => item.id === placementId);
              if (!placement) return;
              onSelectPlacement(placement.id);
              setDrag({
                type: "move",
                placementId: placement.id,
                offsetX: point.x - placement.left,
                offsetY: point.y - placement.top,
                width: placement.width,
                height: placement.height,
              });
              return;
            }
            const placementId = createProductSetPlacementId();
            onSelectPlacement(placementId);
            setDrag({ type: "create", startX: point.x, startY: point.y });
            setDraftRect({
              id: placementId,
              name: `区域 ${placements.length + 1}`,
              left: point.x,
              top: point.y,
              width: 0,
              height: 0,
              angle: 0,
            });
          }}
          onPointerMove={(event) => {
            if (!image || !drag) return;
            const point = toPercent(event.clientX, event.clientY);
            if (!point) return;
            if (drag.type === "create") {
              const left = Math.min(drag.startX, point.x);
              const top = Math.min(drag.startY, point.y);
              const width = Math.abs(point.x - drag.startX);
              const height = Math.abs(point.y - drag.startY);
              setDraftRect((prev) =>
                prev
                  ? {
                      ...prev,
                      left,
                      top,
                      width: clamp(width, 0, 100 - left),
                      height: clamp(height, 0, 100 - top),
                    }
                  : null,
              );
              return;
            }
            const nextLeft = clamp(point.x - drag.offsetX, 0, 100 - drag.width);
            const nextTop = clamp(point.y - drag.offsetY, 0, 100 - drag.height);
            onChangePlacements(
              placements.map((placement) =>
                placement.id === drag.placementId
                  ? { ...placement, left: nextLeft, top: nextTop }
                  : placement,
              ),
            );
          }}
          onPointerUp={() => {
            if (!image || !drag) return;
            if (drag.type === "create" && draftRect && draftRect.width > 2 && draftRect.height > 2) {
              onChangePlacements([...placements, draftRect]);
            }
            setDrag(null);
            setDraftRect(null);
          }}
          onPointerLeave={() => {
            if (drag?.type === "create") {
              setDrag(null);
              setDraftRect(null);
            }
          }}
        >
          {image?.imageUrl ? (
            <img src={image.imageUrl} alt={image.name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
              先上传或填写当前套图图片
            </div>
          )}

          <div className="pointer-events-none absolute inset-0">
            {placements.map((placement) => (
              <div
                key={placement.id}
                data-placement-id={placement.id}
                className={`pointer-events-auto absolute rounded-md border-2 ${
                  placement.id === selectedPlacementId
                    ? "border-primary bg-primary/15"
                    : "border-primary/70 bg-primary/8"
                }`}
                style={{
                  left: `${placement.left}%`,
                  top: `${placement.top}%`,
                  width: `${placement.width}%`,
                  height: `${placement.height}%`,
                  transform: `rotate(${placement.angle ?? 0}deg)`,
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="absolute -top-6 left-0 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                  {placement.name}
                </div>
              </div>
            ))}

            {draftRect ? (
              <div
                className="absolute rounded-md border-2 border-dashed border-primary bg-primary/10"
                style={{
                  left: `${draftRect.left}%`,
                  top: `${draftRect.top}%`,
                  width: `${draftRect.width}%`,
                  height: `${draftRect.height}%`,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductSetTemplatesAdminPage() {
  const templates = useOfficialProductSetTemplates();
  const [categoryFilter, setCategoryFilter] = useState<ProductSetCategory | "">("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<OfficialProductSetTemplate | null>(null);
  const [activeImageId, setActiveImageId] = useState("");
  const [selectedPlacementId, setSelectedPlacementId] = useState("");

  const filtered = useMemo(() => {
    let list = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
    if (categoryFilter) list = list.filter((template) => template.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (template) => template.name.toLowerCase().includes(q) || template.category.includes(q),
      );
    }
    return list;
  }, [templates, categoryFilter, search]);

  const activeImage =
    editing?.images.find((image) => image.id === activeImageId) ?? editing?.images[0];

  const openNew = () => {
    const category = (categoryFilter || "推荐") as ProductSetCategory;
    const firstImageId = createProductSetImageId();
    setEditing({
      id: createOfficialProductSetTemplateId(),
      name: "",
      category,
      images: [
        {
          id: firstImageId,
          name: "主图 1",
          imageUrl: "",
          placements: [],
        },
      ],
      enabled: true,
      sortOrder: filtered.length,
      updatedAt: "",
    });
    setActiveImageId(firstImageId);
    setSelectedPlacementId("");
  };

  const openEdit = (template: OfficialProductSetTemplate) => {
    setEditing(structuredClone(template));
    setActiveImageId(template.images[0]?.id ?? "");
    setSelectedPlacementId(template.images[0]?.placements[0]?.id ?? "");
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    upsertOfficialProductSetTemplate({
      ...editing,
      name: editing.name.trim(),
      images: editing.images
        .map((image) => ({
          ...image,
          name: image.name.trim() || "未命名图片",
          imageUrl: image.imageUrl.trim(),
        }))
        .filter((image) => image.imageUrl),
    });
    setEditing(null);
    setActiveImageId("");
    setSelectedPlacementId("");
  };

  const uploadImage = async (imageId: string, file?: File) => {
    if (!file || !editing) return;
    const dataUrl = await readFileAsDataUrl(file);
    setEditing(updateImageAt(editing, imageId, (image) => ({ ...image, imageUrl: dataUrl })));
  };

  return (
    <AdminShell
      title="套图模版"
      subtitle="按每张套图图片分别配置可替换区域，拖拽画布即可实时预览 AI 实际会替换的位置"
    >
      <div className="max-w-[1180px] space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${inputCls} w-auto min-w-[120px]`}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as ProductSetCategory | "")}
            >
              <option value="">全部品类</option>
              {PRODUCT_SET_CATEGORY_TABS.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${inputCls} w-[220px] pl-8`}
                placeholder="搜索模版名称…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <Btn onClick={openNew}>
            <span className="flex items-center gap-1.5">
              <Plus size={16} /> 新建官方模版
            </span>
          </Btn>
        </div>

        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="w-16 px-4 py-3 text-left font-medium">预览</th>
                <th className="px-4 py-3 text-left font-medium">名称</th>
                <th className="px-4 py-3 text-left font-medium">品类</th>
                <th className="px-4 py-3 text-left font-medium">套图数</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    {row.images[0]?.imageUrl ? (
                      <img
                        src={row.images[0].imageUrl}
                        alt=""
                        className="h-12 w-10 rounded object-cover bg-muted"
                      />
                    ) : (
                      <div className="h-12 w-10 rounded bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.images.length}</td>
                  <td className="px-4 py-3">
                    <Badge tone={row.enabled ? "success" : "default"}>
                      {row.enabled ? "启用" : "停用"}
                    </Badge>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-[12px] font-medium text-primary"
                      onClick={() => openEdit(row)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-[12px] font-medium text-destructive"
                      onClick={() => {
                        if (confirm(`删除官方模版「${row.name}」？`)) {
                          deleteOfficialProductSetTemplate(row.id);
                        }
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-muted-foreground">暂无模版</p>
          ) : null}
        </Card>

        <p className="text-[12px] text-muted-foreground">
          每一张套图图片都可以单独配置多个可替换区域。前台用户悬停模板时，会按当前图片显示这些区域；提交任务时，也会把图片级区域配置一起传给模型。
        </p>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[92vh] w-full max-w-[1380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="shrink-0 border-b border-border px-5 py-4 font-semibold">
              {templates.some((item) => item.id === editing.id) ? "编辑官方模版" : "新建官方模版"}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <Card title="基础信息">
                    <div className="grid gap-4">
                      <Field label="模版名称">
                        <input
                          className={inputCls}
                          value={editing.name}
                          onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                        />
                      </Field>
                      <Field label="品类">
                        <select
                          className={inputCls}
                          value={editing.category}
                          onChange={(event) =>
                            setEditing({ ...editing, category: event.target.value as ProductSetCategory })
                          }
                        >
                          {PRODUCT_SET_CATEGORY_TABS.map((tab) => (
                            <option key={tab} value={tab}>
                              {tab}
                            </option>
                          ))}
                        </select>
                      </Field>
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
                        在用户端官方 Tab 展示
                      </label>
                    </div>
                  </Card>

                  <Card
                    title="套图图片配置"
                    action={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[12px] text-primary"
                        onClick={() => {
                          const imageId = createProductSetImageId();
                          setEditing({
                            ...editing,
                            images: [
                              ...editing.images,
                              {
                                id: imageId,
                                name: `图片 ${editing.images.length + 1}`,
                                imageUrl: "",
                                placements: [],
                              },
                            ],
                          });
                          setActiveImageId(imageId);
                          setSelectedPlacementId("");
                        }}
                      >
                        <Plus size={13} /> 新增套图图片
                      </button>
                    }
                  >
                    <div className="space-y-3">
                      {editing.images.length > 0 ? (
                        editing.images.map((image, index) => (
                          <ImageItem
                            key={image.id}
                            index={index}
                            image={image}
                            active={activeImage?.id === image.id}
                            onSelect={() => {
                              setActiveImageId(image.id);
                              setSelectedPlacementId(image.placements[0]?.id ?? "");
                            }}
                            onChange={(next) => {
                              setEditing(updateImageAt(editing, image.id, () => next));
                            }}
                            onUpload={(file) => {
                              void uploadImage(image.id, file);
                            }}
                            onDelete={() => {
                              const nextImages = editing.images.filter((item) => item.id !== image.id);
                              setEditing({ ...editing, images: nextImages });
                              const nextActive = nextImages[0];
                              setActiveImageId(nextActive?.id ?? "");
                              setSelectedPlacementId(nextActive?.placements[0]?.id ?? "");
                            }}
                          />
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-[12px] text-muted-foreground">
                          还没有套图图片。建议至少配置 1 张主图，再补几张场景图或细节图，前台卡片会更完整。
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card title={activeImage ? `当前编辑：${activeImage.name}` : "拖拽画布"}>
                    <PlacementCanvas
                      image={activeImage}
                      selectedPlacementId={selectedPlacementId}
                      onSelectPlacement={setSelectedPlacementId}
                      onChangePlacements={(placements) => {
                        if (!editing || !activeImage) return;
                        setEditing(
                          updateImageAt(editing, activeImage.id, (image) => ({ ...image, placements })),
                        );
                      }}
                    />
                  </Card>
                  <Card title="前台卡片预览">
                    <TemplatePreview
                      template={editing}
                      activeImageId={activeImageId}
                    />
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card
                    title="当前图片区域配置"
                    action={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[12px] text-primary"
                        onClick={() => {
                          if (!editing || !activeImage) return;
                          const placementId = createProductSetPlacementId();
                          setEditing(
                            updateImageAt(editing, activeImage.id, (image) => ({
                              ...image,
                              placements: [
                                ...image.placements,
                                {
                                  id: placementId,
                                  name: `区域 ${image.placements.length + 1}`,
                                  left: 24,
                                  top: 24,
                                  width: 36,
                                  height: 36,
                                  angle: 0,
                                },
                              ],
                            })),
                          );
                          setSelectedPlacementId(placementId);
                        }}
                      >
                        <Plus size={13} /> 新增区域
                      </button>
                    }
                  >
                    <PlacementList
                      placements={activeImage?.placements ?? []}
                      selectedPlacementId={selectedPlacementId}
                      onSelect={setSelectedPlacementId}
                      onChange={(placementId, next) => {
                        if (!editing || !activeImage) return;
                        setEditing(
                          updateImageAt(editing, activeImage.id, (image) => ({
                            ...image,
                            placements: image.placements.map((placement) =>
                              placement.id === placementId ? next : placement,
                            ),
                          })),
                        );
                      }}
                      onDelete={(placementId) => {
                        if (!editing || !activeImage) return;
                        const nextPlacements = activeImage.placements.filter(
                          (placement) => placement.id !== placementId,
                        );
                        setEditing(
                          updateImageAt(editing, activeImage.id, (image) => ({
                            ...image,
                            placements: nextPlacements,
                          })),
                        );
                        setSelectedPlacementId(nextPlacements[0]?.id ?? "");
                      }}
                    />
                  </Card>

                  <Card title="配置建议">
                    <div className="space-y-3 text-[12px] leading-5 text-muted-foreground">
                      <p>先选中左侧某一张套图图片，再在中间拖出区域，这样每张图的套取位置会独立保存。</p>
                      <p>如果同一张图上有多个可替换位置，可以继续新增区域，模型提交时会收到完整的图片级区域列表。</p>
                      <p>区域越贴近实际可替换内容，后续 AI 合成的稳定性越高，尤其适合手机壳、挂钟和拼图摆件这类多角度模板。</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4">
              <Btn
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  setActiveImageId("");
                  setSelectedPlacementId("");
                }}
              >
                取消
              </Btn>
              <Btn onClick={save}>保存</Btn>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
