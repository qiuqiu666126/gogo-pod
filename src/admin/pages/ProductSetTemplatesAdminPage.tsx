import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  GripVertical,
  Plus,
  Save,
  Search,
  SquarePen,
  Undo2,
  Redo2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

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

function fieldCls(dark = false) {
  if (!dark) return inputCls;
  return "w-full rounded-md border border-[#3a3a3d] bg-[#141416] px-3 py-2 text-[12px] text-white placeholder:text-[#6e6f76] focus:outline-none focus:ring-2 focus:ring-[#d16d41]/30 focus:border-[#d16d41]";
}

function ThumbnailRail({
  images,
  activeImageId,
  onSelect,
  onCreate,
  onDelete,
}: {
  images: ProductSetMockupImage[];
  activeImageId: string;
  onSelect: (imageId: string) => void;
  onCreate: () => void;
  onDelete: (imageId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#252628]">
      <div className="border-b border-[#37383c] px-3 py-3">
        <div className="text-[11px] font-semibold tracking-[0.06em] text-white/90">商品套图缩略图</div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {images.map((image, index) => {
          const active = image.id === activeImageId;
          return (
            <div
              key={image.id}
              className={`group rounded-xl border p-2 text-left transition ${
                active
                  ? "border-[#d16d41] bg-[#3a312d] shadow-[0_0_0_1px_rgba(209,109,65,0.25)]"
                  : "border-[#3b3c40] bg-[#2d2f33] hover:border-[#5a5c62]"
              }`}
            >
              <button type="button" onClick={() => onSelect(image.id)} className="block w-full">
                <div className="overflow-hidden rounded-lg bg-[#1d1e20]">
                  {image.imageUrl ? (
                    <img src={image.imageUrl} alt={image.name} className="aspect-[4/5] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center text-[11px] text-[#8d8f97]">
                      暂无图片
                    </div>
                  )}
                </div>
              </button>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-5 min-w-5 items-center justify-center rounded bg-white text-[10px] font-semibold text-[#1e1f22]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-white/92">{image.name || `轮播图${index + 1}`}</span>
                {images.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onDelete(image.id)}
                    className="rounded p-1 text-[#9fa2ab] opacity-0 transition hover:bg-[#ffffff10] hover:text-white group-hover:opacity-100"
                    aria-label={`删除${image.name || `轮播图${index + 1}`}`}
                  >
                    <X size={12} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={onCreate}
          className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#595b61] bg-[#34363a] text-[#d4d5da] transition hover:border-[#d16d41] hover:text-white"
        >
          <Plus size={20} />
          <span className="mt-2 text-[11px]">添加轮播图</span>
        </button>
      </div>
      <div className="border-t border-[#37383c] px-3 py-3">
        <div className="rounded bg-[#3a3b40] px-2 py-1 text-right text-[10px] text-[#81838b]">{images.length}/20</div>
      </div>
    </div>
  );
}

function CornerHandle({ className }: { className: string }) {
  return <span className={`absolute h-2.5 w-2.5 rounded-full border border-[#ffb497] bg-white ${className}`} />;
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

function PlacementEditorCanvas({
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
    <div className="flex h-full flex-col bg-black">
      <div className="flex items-center justify-between border-b border-[#2b2b2f] px-5 py-3">
        <div className="text-[12px] text-[#d7d7db]">{image?.name || "未选择图片"}</div>
        <div className="text-[11px] text-[#757780]">拖拽空白区域创建印花位，拖动框体调整位置</div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
        <div
          ref={canvasRef}
          className="relative flex h-full max-h-[760px] w-full max-w-[920px] items-center justify-center overflow-hidden"
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
              name: `印花位 ${placements.length + 1}`,
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
                placement.id === drag.placementId ? { ...placement, left: nextLeft, top: nextTop } : placement,
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
            <img src={image.imageUrl} alt={image.name} className="max-h-full max-w-full object-contain shadow-2xl" />
          ) : (
            <div className="flex aspect-[4/5] w-full max-w-[500px] items-center justify-center rounded-2xl border border-dashed border-[#414247] bg-[#111214] text-[13px] text-[#7b7d86]">
              先上传当前套图图片
            </div>
          )}

          <div className="pointer-events-none absolute inset-0">
            {placements.map((placement) => {
              const active = placement.id === selectedPlacementId;
              return (
                <div
                  key={placement.id}
                  data-placement-id={placement.id}
                  className={`pointer-events-auto absolute border-2 ${
                    active ? "border-[#ff9d73] bg-[#ff8b5f14]" : "border-[#ffc1a6] bg-[#ffffff08]"
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
                  <CornerHandle className="-left-1.5 -top-1.5" />
                  <CornerHandle className="-right-1.5 -top-1.5" />
                  <CornerHandle className="-left-1.5 -bottom-1.5" />
                  <CornerHandle className="-right-1.5 -bottom-1.5" />
                  <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#222] shadow">
                    <span>{placement.name}</span>
                  </div>
                </div>
              );
            })}

            {draftRect ? (
              <div
                className="absolute border-2 border-dashed border-[#ff9d73] bg-[#ff8b5f14]"
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

function PlacementForm({
  placement,
  onChange,
  onDelete,
}: {
  placement?: ProductSetPlacement;
  onChange: (next: ProductSetPlacement) => void;
  onDelete: () => void;
}) {
  if (!placement) {
    return (
      <div className="rounded-xl border border-dashed border-[#3a3a3d] bg-[#121315] px-4 py-8 text-center text-[12px] text-[#7f8189]">
        先在中间画布创建或选中一个印花区域
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#3a3a3d] bg-[#121315] p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded bg-[#ff8d5a1a] px-2 py-1 text-[11px] font-medium text-[#ff9b72]">
          {placement.name}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 text-[11px] text-[#ff8b7a]"
        >
          <Trash2 size={12} /> 删除
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="区域名称">
          <input
            className={fieldCls(true)}
            value={placement.name}
            onChange={(event) => onChange({ ...placement, name: event.target.value })}
          />
        </Field>
        <Field label="区域 ID">
          <input
            className={fieldCls(true)}
            value={placement.id}
            onChange={(event) => onChange({ ...placement, id: event.target.value })}
          />
        </Field>
        <Field label="左侧位置（%）">
          <input
            type="number"
            className={fieldCls(true)}
            value={placement.left}
            onChange={(event) => onChange({ ...placement, left: clamp(Number(event.target.value) || 0, 0, 100) })}
          />
        </Field>
        <Field label="顶部位置（%）">
          <input
            type="number"
            className={fieldCls(true)}
            value={placement.top}
            onChange={(event) => onChange({ ...placement, top: clamp(Number(event.target.value) || 0, 0, 100) })}
          />
        </Field>
        <Field label="区域宽度（%）">
          <input
            type="number"
            className={fieldCls(true)}
            value={placement.width}
            onChange={(event) =>
              onChange({ ...placement, width: clamp(Number(event.target.value) || 0, 0, 100) })
            }
          />
        </Field>
        <Field label="区域高度（%）">
          <input
            type="number"
            className={fieldCls(true)}
            value={placement.height}
            onChange={(event) =>
              onChange({ ...placement, height: clamp(Number(event.target.value) || 0, 0, 100) })
            }
          />
        </Field>
        <Field label="印花底图 URL" className="sm:col-span-2">
          <input className={fieldCls(true)} placeholder="https://... 或上传本地图案" />
        </Field>
        <div className="sm:col-span-2 flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-[#4a4b50] px-3 py-2 text-[11px] text-white/90 hover:border-[#d16d41]"
          >
            <Upload size={12} />
            上传印花底图
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-[#33353a] px-3 py-2 text-[11px] text-[#7f8189]"
          >
            我的空间
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorSidebar({
  editing,
  activeImage,
  selectedPlacement,
  onTemplateChange,
  onImageChange,
  onImageUpload,
  onDeleteImage,
  onAddPlacement,
  onPlacementChange,
  onDeletePlacement,
}: {
  editing: OfficialProductSetTemplate;
  activeImage?: ProductSetMockupImage;
  selectedPlacement?: ProductSetPlacement;
  onTemplateChange: (next: OfficialProductSetTemplate) => void;
  onImageChange: (next: ProductSetMockupImage) => void;
  onImageUpload: (file?: File) => void;
  onDeleteImage: () => void;
  onAddPlacement: () => void;
  onPlacementChange: (next: ProductSetPlacement) => void;
  onDeletePlacement: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[#191a1d] text-white">
      <div className="border-b border-[#2f3034] px-4 py-4">
        <div className="text-[12px] font-semibold text-white/92">基础信息</div>
      </div>
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-3 rounded-xl border border-[#2f3034] bg-[#101114] p-3">
          <Field label="模板名称">
            <input
              className={fieldCls(true)}
              value={editing.name}
              onChange={(event) => onTemplateChange({ ...editing, name: event.target.value })}
            />
          </Field>
          <Field label="品类">
            <select
              className={fieldCls(true)}
              value={editing.category}
              onChange={(event) =>
                onTemplateChange({ ...editing, category: event.target.value as ProductSetCategory })
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
              className={fieldCls(true)}
              value={editing.sortOrder}
              onChange={(event) => onTemplateChange({ ...editing, sortOrder: Number(event.target.value) || 0 })}
            />
          </Field>
          <label className="flex items-center gap-2 text-[12px] text-white/88">
            <input
              type="checkbox"
              checked={editing.enabled}
              onChange={(event) => onTemplateChange({ ...editing, enabled: event.target.checked })}
            />
            在前台官方模板中展示
          </label>
        </div>

        <div className="space-y-3 rounded-xl border border-[#2f3034] bg-[#101114] p-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-white/92">当前轮播图</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#7f8189]">{activeImage ? "已选中" : "未选择"}</span>
              {activeImage ? (
                <button
                  type="button"
                  onClick={onDeleteImage}
                  className="inline-flex items-center gap-1 text-[11px] text-[#ff8b7a]"
                >
                  <Trash2 size={12} /> 删除
                </button>
              ) : null}
            </div>
          </div>
          <Field label="图片名称">
            <input
              className={fieldCls(true)}
              value={activeImage?.name ?? ""}
              disabled={!activeImage}
              onChange={(event) => {
                if (!activeImage) return;
                onImageChange({ ...activeImage, name: event.target.value });
              }}
            />
          </Field>
          <Field label="图片 URL">
            <input
              className={fieldCls(true)}
              value={activeImage?.imageUrl ?? ""}
              disabled={!activeImage}
              placeholder="https://... 或上传本地图片"
              onChange={(event) => {
                if (!activeImage) return;
                onImageChange({ ...activeImage, imageUrl: event.target.value });
              }}
            />
          </Field>
          <div className="flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#47484d] px-3 py-2 text-[11px] text-white/90 hover:border-[#d16d41]">
              <Upload size={12} />
              上传本地图片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  onImageUpload(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-[#2f3034] bg-[#101114] p-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-white/92">当前图片轮播图</div>
            <button
              type="button"
              onClick={onAddPlacement}
              className="inline-flex items-center gap-1 text-[11px] text-[#ff9b72]"
            >
              <Plus size={12} /> 添加印花区域
            </button>
          </div>
          {activeImage ? (
            <div className="space-y-2 rounded-xl border border-[#3a3a3d] bg-[#121315] p-3">
              <span className="inline-flex rounded bg-[#ffffff0d] px-2 py-1 text-[11px] text-white/88">
                {activeImage.name || "未命名图片"}
              </span>
              <div className="rounded-md border border-[#32343a] bg-[#0d0e10] p-2">
                {activeImage.imageUrl ? (
                  <img src={activeImage.imageUrl} alt={activeImage.name} className="aspect-[4/3] w-full rounded object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-[11px] text-[#7f8189]">
                    暂无图片预览
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#3a3a3d] px-4 py-8 text-center text-[12px] text-[#7f8189]">
              先从左侧选择一张商品图
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-[#2f3034] bg-[#101114] p-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-white/92">印花区域</div>
            <span className="text-[10px] text-[#7f8189]">实时同步画布</span>
          </div>
          <PlacementForm placement={selectedPlacement} onChange={onPlacementChange} onDelete={onDeletePlacement} />
        </div>
      </div>
    </div>
  );
}

function EditorLayout({
  editing,
  activeImageId,
  selectedPlacementId,
  onClose,
  onSave,
  onTemplateChange,
  onActiveImageIdChange,
  onSelectedPlacementIdChange,
  onUploadImage,
}: {
  editing: OfficialProductSetTemplate;
  activeImageId: string;
  selectedPlacementId: string;
  onClose: () => void;
  onSave: () => void;
  onTemplateChange: (next: OfficialProductSetTemplate) => void;
  onActiveImageIdChange: (imageId: string) => void;
  onSelectedPlacementIdChange: (placementId: string) => void;
  onUploadImage: (imageId: string, file?: File) => void;
}) {
  const activeImage = editing.images.find((image) => image.id === activeImageId) ?? editing.images[0];
  const selectedPlacement = activeImage?.placements.find((placement) => placement.id === selectedPlacementId);
  const imageIndex = activeImage ? editing.images.findIndex((image) => image.id === activeImage.id) : -1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111214] text-white">
      <div className="flex h-11 items-center justify-between border-b border-[#292a2e] bg-[#1a1b1f] px-4">
        <div className="flex items-center gap-3 text-[12px]">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1 text-white/80 hover:text-white">
            <ChevronLeft size={14} />
            返回
          </button>
          <span className="text-white/90">{editing.name || "未命名模板"}</span>
          <div className="ml-2 flex items-center gap-1 text-[#7f8189]">
            <button type="button" className="rounded p-1 hover:bg-[#ffffff10] hover:text-white">
              <Undo2 size={13} />
            </button>
            <button type="button" className="rounded p-1 hover:bg-[#ffffff10] hover:text-white">
              <Redo2 size={13} />
            </button>
            <button type="button" className="rounded p-1 hover:bg-[#ffffff10] hover:text-white">
              <Copy size={13} />
            </button>
            <button type="button" className="rounded p-1 hover:bg-[#ffffff10] hover:text-white">
              <GripVertical size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1 rounded-md bg-[#c66e45] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#d6794f]"
          >
            <Save size={13} />
            保存
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid min-h-full grid-cols-[104px_minmax(0,1fr)_360px]">
          <ThumbnailRail
            images={editing.images}
            activeImageId={activeImage?.id ?? ""}
            onSelect={(imageId) => {
              onActiveImageIdChange(imageId);
              const image = editing.images.find((item) => item.id === imageId);
              onSelectedPlacementIdChange(image?.placements[0]?.id ?? "");
            }}
            onCreate={() => {
              const imageId = createProductSetImageId();
              const next = {
                ...editing,
                images: [
                  ...editing.images,
                  {
                    id: imageId,
                    name: `轮播图${editing.images.length + 1}`,
                    imageUrl: "",
                    placements: [],
                  },
                ],
              };
              onTemplateChange(next);
              onActiveImageIdChange(imageId);
              onSelectedPlacementIdChange("");
            }}
            onDelete={(imageId) => {
              const nextImages = editing.images.filter((item) => item.id !== imageId);
              onTemplateChange({ ...editing, images: nextImages });
              const nextActive =
                nextImages[Math.max(0, imageIndex - (activeImage?.id === imageId ? 1 : 0))] ?? nextImages[0];
              onActiveImageIdChange(nextActive?.id ?? "");
              onSelectedPlacementIdChange(nextActive?.placements[0]?.id ?? "");
            }}
          />

          <div className="flex min-h-full flex-col">
            <div className="flex h-10 items-center justify-between border-b border-[#292a2e] bg-[#0e0f11] px-4 text-[11px] text-[#999ba4]">
              <div className="flex items-center gap-2">
                <span className="text-white/92">{editing.name || "未命名模板"}</span>
                <ChevronRight size={12} />
                <span>{activeImage?.name || "未选择轮播图"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#3c3d42] px-2 py-0.5">
                  {selectedPlacement ? selectedPlacement.name : "未选中区域"}
                </span>
              </div>
            </div>
            <PlacementEditorCanvas
              image={activeImage}
              selectedPlacementId={selectedPlacementId}
              onSelectPlacement={onSelectedPlacementIdChange}
              onChangePlacements={(placements) => {
                if (!activeImage) return;
                onTemplateChange(updateImageAt(editing, activeImage.id, (image) => ({ ...image, placements })));
              }}
            />
          </div>

          <EditorSidebar
            editing={editing}
            activeImage={activeImage}
            selectedPlacement={selectedPlacement}
            onTemplateChange={onTemplateChange}
            onImageChange={(next) => {
              if (!activeImage) return;
              onTemplateChange(updateImageAt(editing, activeImage.id, () => next));
            }}
            onImageUpload={(file) => {
              if (!activeImage) return;
              void onUploadImage(activeImage.id, file);
            }}
            onDeleteImage={() => {
              if (!activeImage || editing.images.length <= 1) return;
              const nextImages = editing.images.filter((item) => item.id !== activeImage.id);
              onTemplateChange({ ...editing, images: nextImages });
              const nextActive = nextImages[Math.max(0, imageIndex - 1)] ?? nextImages[0];
              onActiveImageIdChange(nextActive?.id ?? "");
              onSelectedPlacementIdChange(nextActive?.placements[0]?.id ?? "");
            }}
            onAddPlacement={() => {
              if (!activeImage) return;
              const placementId = createProductSetPlacementId();
              onTemplateChange(
                updateImageAt(editing, activeImage.id, (image) => ({
                  ...image,
                  placements: [
                    ...image.placements,
                    {
                      id: placementId,
                      name: `印花位 ${image.placements.length + 1}`,
                      left: 24,
                      top: 24,
                      width: 32,
                      height: 32,
                      angle: 0,
                    },
                  ],
                })),
              );
              onSelectedPlacementIdChange(placementId);
            }}
            onPlacementChange={(next) => {
              if (!activeImage || !selectedPlacement) return;
              onTemplateChange(
                updateImageAt(editing, activeImage.id, (image) => ({
                  ...image,
                  placements: image.placements.map((placement) =>
                    placement.id === selectedPlacement.id ? next : placement,
                  ),
                })),
              );
            }}
            onDeletePlacement={() => {
              if (!activeImage || !selectedPlacement) return;
              const nextPlacements = activeImage.placements.filter(
                (placement) => placement.id !== selectedPlacement.id,
              );
              onTemplateChange(
                updateImageAt(editing, activeImage.id, (image) => ({
                  ...image,
                  placements: nextPlacements,
                })),
              );
              onSelectedPlacementIdChange(nextPlacements[0]?.id ?? "");
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({
  template,
}: {
  template: Pick<OfficialProductSetTemplate, "name" | "images" | "category" | "enabled">;
}) {
  const previewImage = template.images[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[16/10] bg-muted/25">
        {previewImage?.imageUrl ? (
          <>
            <img src={previewImage.imageUrl} alt={previewImage.name} className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0">
              {previewImage.placements.map((placement) => (
                <div
                  key={placement.id}
                  className="absolute rounded-md border-2 border-primary/80 bg-primary/10"
                  style={{
                    left: `${placement.left}%`,
                    top: `${placement.top}%`,
                    width: `${placement.width}%`,
                    height: `${placement.height}%`,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">暂无图片</div>
        )}
      </div>
      <div className="space-y-1 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge tone={template.enabled ? "success" : "default"}>{template.enabled ? "启用" : "停用"}</Badge>
          <span className="text-[11px] text-muted-foreground">{template.category}</span>
        </div>
        <div className="truncate text-[13px] font-medium text-foreground">{template.name}</div>
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
      list = list.filter((template) => template.name.toLowerCase().includes(q) || template.category.includes(q));
    }
    return list;
  }, [templates, categoryFilter, search]);

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
          name: "轮播图1",
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
          placements: image.placements.map((placement, index) => ({
            ...placement,
            id: placement.id.trim() || `placement-${index + 1}`,
            name: placement.name.trim() || `印花位 ${index + 1}`,
          })),
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
      subtitle="维护商品套图模板与印花区域，编辑时使用三栏工作台直接拖拽定位"
    >
      <div className="max-w-[1240px] space-y-4 p-6">
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
                placeholder="搜索模板名称…"
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

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <Card key={template.id} className="overflow-hidden !p-0">
              <TemplatePreview template={template} />
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-foreground">{template.name}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{template.images.length} 张套图图片</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-primary hover:bg-primary/10"
                    onClick={() => openEdit(template)}
                  >
                    <SquarePen size={13} />
                    编辑
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`删除官方模版「${template.name}」？`)) {
                        deleteOfficialProductSetTemplate(template.id);
                      }
                    }}
                  >
                    <Trash2 size={13} />
                    删除
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <div className="py-12 text-center text-[13px] text-muted-foreground">当前筛选下暂无套图模板</div>
          </Card>
        ) : null}
      </div>

      {editing ? (
        <EditorLayout
          editing={editing}
          activeImageId={activeImageId}
          selectedPlacementId={selectedPlacementId}
          onClose={() => {
            setEditing(null);
            setActiveImageId("");
            setSelectedPlacementId("");
          }}
          onSave={save}
          onTemplateChange={setEditing}
          onActiveImageIdChange={setActiveImageId}
          onSelectedPlacementIdChange={setSelectedPlacementId}
          onUploadImage={uploadImage}
        />
      ) : null}
    </AdminShell>
  );
}
