import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Badge, Field, inputCls, textareaCls } from "./ui";
import { AttachmentPicker } from "./AttachmentPicker";
import { AttachmentImage } from "./AttachmentImage";
import {
  CONTROL_TYPE_LABELS,
  createControl,
  type ControlType,
  type FormControl,
  type FormControlOption,
} from "../../shared/sceneFormSchema";

const CONTROL_TYPES = Object.entries(CONTROL_TYPE_LABELS) as [ControlType, string][];

type ControlTreeNode = {
  id: string;
  label: string;
  meta: string;
  depth: number;
  tone?: "control" | "option";
  children?: ControlTreeNode[];
};

function controlNodeId(controlId: string) {
  return `scene-control-${controlId}`;
}

function optionNodeId(controlId: string, index: number) {
  return `scene-option-${controlId}-${index}`;
}

function parseOptions(text: string): FormControlOption[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label, prompt, thumbnailUrl, previewText, previewDescription] = line.split("|");
      return {
        value: value?.trim() ?? "",
        label: (label ?? value)?.trim() ?? "",
        promptFragment: prompt?.trim() || undefined,
        thumbnailUrl: thumbnailUrl?.trim() || undefined,
        previewText: previewText?.trim() || undefined,
        previewDescription: previewDescription?.trim() || undefined,
        subFields: [],
      };
    });
}

function formatOptions(options: FormControlOption[] = []) {
  return options
    .map((o) =>
      [
        o.value,
        o.label,
        o.promptFragment ?? "",
        o.thumbnailUrl ?? "",
        o.previewText ?? "",
        o.previewDescription ?? "",
      ].join("|"),
    )
    .join("\n");
}

function updateOptionSubFields(
  control: FormControl,
  optionValue: string,
  subFields: FormControl[],
): FormControl {
  return {
    ...control,
    options: control.options?.map((o) =>
      o.value === optionValue ? { ...o, subFields: subFields.length ? subFields : undefined } : o,
    ),
  };
}

function updateOptionAt(
  control: FormControl,
  index: number,
  patch: Partial<FormControlOption>,
): FormControl {
  const options = [...(control.options ?? [])];
  const prev = options[index];
  if (!prev) return control;
  options[index] = { ...prev, ...patch };
  return { ...control, options };
}

function removeOptionAt(control: FormControl, index: number): FormControl {
  return {
    ...control,
    options: (control.options ?? []).filter((_, i) => i !== index),
  };
}

function appendOption(control: FormControl): FormControl {
  const nextIndex = (control.options ?? []).length + 1;
  return {
    ...control,
    options: [
      ...(control.options ?? []),
      {
        value: `option_${nextIndex}`,
        label: `新选项 ${nextIndex}`,
        promptFragment: "",
        thumbnailUrl: "",
        previewText: "",
        previewDescription: "",
        subFields: [],
      },
    ],
  };
}

function createSubFieldByType(type: "text" | "radio" | "multi-checkbox", index: number) {
  if (type === "radio") {
    return createControl({
      key: `field_${index}`,
      label: "自定义单选",
      type: "radio",
      layout: "inline",
      defaultValue: "option_1",
      options: [
        { value: "option_1", label: "选项1" },
        { value: "option_2", label: "选项2" },
      ],
    });
  }

  if (type === "multi-checkbox") {
    return createControl({
      key: `field_${index}`,
      label: "自定义多选",
      type: "multi-checkbox",
      layout: "block",
      defaultValue: [],
      options: [
        { value: "option_1", label: "选项1" },
        { value: "option_2", label: "选项2" },
      ],
    });
  }

  return createControl({
    key: `field_${index}`,
    label: "新参数",
    type: "text",
    defaultValue: "",
  });
}

function mergeOptions(parsed: FormControlOption[], existing: FormControlOption[] = []) {
  return parsed.map((p) => {
    const prev = existing.find((e) => e.value === p.value);
    return { ...p, subFields: prev?.subFields };
  });
}

export function FormControlEditor({
  control,
  onChange,
  onDelete,
  depth = 0,
  pathLabel,
  controlDomId,
  onFocusControl,
}: {
  control: FormControl;
  onChange: (next: FormControl) => void;
  onDelete?: () => void;
  depth?: number;
  pathLabel?: string;
  controlDomId?: string;
  onFocusControl?: (control: FormControl) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const [optionMode, setOptionMode] = useState<"visual" | "text">("visual");
  const hasOptions = ["radio", "select", "number-buttons", "multi-checkbox"].includes(control.type);

  return (
    <div
      id={controlDomId}
      className={`overflow-hidden rounded-xl border bg-card ${
        depth === 0 ? "border-border shadow-sm" : "border-border/70"
      }`}
      style={{ marginLeft: depth * 14 }}
    >
      <button
        type="button"
        onClick={() => {
          onFocusControl?.(control);
          setOpen(!open);
        }}
        className={`w-full text-left transition-colors hover:bg-muted/40 ${
          depth === 0 ? "px-4 py-3" : "px-3 py-2.5"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <Badge tone="primary">{CONTROL_TYPE_LABELS[control.type]}</Badge>
              <span className="truncate text-[13px] font-medium">{control.label}</span>
              <code className="text-[10px] text-muted-foreground">{control.key}</code>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5">
                {depth === 0 ? "顶层控件" : `第 ${depth} 层子控件`}
              </span>
              {pathLabel ? <span className="truncate">所属路径：{pathLabel}</span> : null}
            </div>
          </div>
          <div className="shrink-0">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-4">
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="显示名称">
              <input
                className={inputCls}
                value={control.label}
                onFocus={() => onFocusControl?.(control)}
                onChange={(e) => onChange({ ...control, label: e.target.value })}
              />
            </Field>
            <Field label="字段 key">
              <input
                className={inputCls}
                value={control.key}
                onFocus={() => onFocusControl?.(control)}
                onChange={(e) => onChange({ ...control, key: e.target.value })}
              />
            </Field>
            <Field label="控件类型">
              <select
                className={inputCls}
                value={control.type}
                onFocus={() => onFocusControl?.(control)}
                onChange={(e) => onChange({ ...control, type: e.target.value as ControlType })}
              >
                {CONTROL_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="默认值">
              <input
                className={inputCls}
                value={Array.isArray(control.defaultValue) ? control.defaultValue.join(",") : String(control.defaultValue)}
                onFocus={() => onFocusControl?.(control)}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (control.type === "multi-checkbox") {
                    onChange({
                      ...control,
                      defaultValue: raw
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    });
                    return;
                  }
                  const num = Number(raw);
                  onChange({
                    ...control,
                    defaultValue:
                      Number.isNaN(num) || control.type === "text" || control.type === "textarea"
                        ? raw
                        : num,
                  });
                }}
              />
            </Field>
            <Field label="布局">
              <select
                className={inputCls}
                value={control.layout ?? "block"}
                onFocus={() => onFocusControl?.(control)}
                onChange={(e) =>
                  onChange({ ...control, layout: e.target.value as FormControl["layout"] })
                }
              >
                <option value="block">普通</option>
                <option value="group">灰色分组</option>
                <option value="inline">横向</option>
              </select>
            </Field>
            <Field label="展示样式">
              <select
                className={inputCls}
                value={control.uiVariant ?? "default"}
                onFocus={() => onFocusControl?.(control)}
                onChange={(e) =>
                  onChange({ ...control, uiVariant: e.target.value as FormControl["uiVariant"] })
                }
              >
                <option value="default">默认控件</option>
                <option value="card">图文卡片</option>
              </select>
            </Field>
            <Field label="启用">
              <label className="flex items-center gap-2 text-[13px] mt-2">
                <input
                  type="checkbox"
                  checked={control.enabled}
                  onFocus={() => onFocusControl?.(control)}
                  onChange={(e) => onChange({ ...control, enabled: e.target.checked })}
                  className="accent-primary"
                />
                在前台显示
              </label>
            </Field>
          </div>

          {hasOptions && (
            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[13px] font-medium text-foreground">选项配置</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    优先用图形化编辑，批量粘贴时再切到文本模式。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-border bg-card p-1">
                    <button
                      type="button"
                      onClick={() => setOptionMode("visual")}
                      className={`rounded-md px-3 py-1 text-[12px] transition-colors ${
                        optionMode === "visual"
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      图形化
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptionMode("text")}
                      className={`rounded-md px-3 py-1 text-[12px] transition-colors ${
                        optionMode === "text"
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      文本
                    </button>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] text-primary"
                    onClick={() => onChange(appendOption(control))}
                  >
                    <Plus size={13} /> 添加选项
                  </button>
                </div>
              </div>

              {optionMode === "visual" ? (
                <div className="space-y-3">
                  {(control.options ?? []).length > 0 ? (
                    (control.options ?? []).map((opt, index) => (
                      <div
                        id={optionNodeId(control.id, index)}
                        key={`${opt.value}-${index}`}
                        className="rounded-xl border border-border bg-card p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-foreground">
                              选项 {index + 1}
                            </span>
                            <code className="text-[10px] text-muted-foreground">{opt.value}</code>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[12px] text-destructive"
                            onClick={() => onChange(removeOptionAt(control, index))}
                          >
                            <Trash2 size={13} /> 删除
                          </button>
                        </div>

                        <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="值">
                              <input
                                className={inputCls}
                                value={opt.value}
                                onFocus={() => onFocusControl?.(control)}
                                onChange={(e) =>
                                  onChange(updateOptionAt(control, index, { value: e.target.value }))
                                }
                              />
                            </Field>
                            <Field label="显示名">
                              <input
                                className={inputCls}
                                value={opt.label}
                                onFocus={() => onFocusControl?.(control)}
                                onChange={(e) =>
                                  onChange(updateOptionAt(control, index, { label: e.target.value }))
                                }
                              />
                            </Field>
                            <Field label="选项提示词" className="sm:col-span-2">
                              <input
                                className={inputCls}
                                value={opt.promptFragment ?? ""}
                                onFocus={() => onFocusControl?.(control)}
                                onChange={(e) =>
                                  onChange(
                                    updateOptionAt(control, index, {
                                      promptFragment: e.target.value,
                                    }),
                                  )
                                }
                                placeholder="例如：图形风格：夸张罗马充"
                              />
                            </Field>
                            <Field label="缩略图 URL" className="sm:col-span-2">
                              <AttachmentPicker
                                value={opt.thumbnailUrl ?? ""}
                                onChange={(thumbnailUrl) =>
                                  onChange(updateOptionAt(control, index, { thumbnailUrl }))
                                }
                                placeholder="https://... 或从附件库选择 / 上传图片"
                                hint="用于前台卡片展示，图片会保存为附件 URL"
                              />
                            </Field>
                            <Field label="预览字">
                              <input
                                className={inputCls}
                                value={opt.previewText ?? ""}
                                onFocus={() => onFocusControl?.(control)}
                                onChange={(e) =>
                                  onChange(
                                    updateOptionAt(control, index, {
                                      previewText: e.target.value,
                                    }),
                                  )
                                }
                                placeholder="例如：鹰"
                              />
                            </Field>
                            <Field label="补充说明">
                              <input
                                className={inputCls}
                                value={opt.previewDescription ?? ""}
                                onFocus={() => onFocusControl?.(control)}
                                onChange={(e) =>
                                  onChange(
                                    updateOptionAt(control, index, {
                                      previewDescription: e.target.value,
                                    }),
                                  )
                                }
                                placeholder="显示在前台卡片下方"
                              />
                            </Field>
                          </div>

                          <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
                            <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-foreground">
                              <ImageIcon size={14} className="text-primary" />
                              前台预览
                            </div>
                            <div className="overflow-hidden rounded-lg border border-border bg-card">
                              <div className="px-3 py-2 text-center text-[12px] font-medium text-foreground">
                                {opt.label || "未命名选项"}
                              </div>
                              <div className="relative h-24 border-t border-border bg-muted/50">
                                {opt.thumbnailUrl ? (
                                  <AttachmentImage
                                    url={opt.thumbnailUrl}
                                    alt={opt.label || "选项预览"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/35 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-2 text-[28px] font-semibold text-foreground">
                                  {opt.previewText || opt.label.slice(0, 1) || "图"}
                                </div>
                              </div>
                              <div className="px-3 py-2 text-[11px] leading-4 text-muted-foreground">
                                {opt.previewDescription || "这里显示该选项的补充说明"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground">
                      还没有选项，先新增一个。
                    </div>
                  )}
                </div>
              ) : (
                <Field
                  label="文本模式"
                  hint="格式：值|显示名|选项提示词|缩略图URL|预览字|补充说明，每行一个"
                >
                  <textarea
                    className={textareaCls}
                    rows={6}
                    value={formatOptions(control.options)}
                    onFocus={() => onFocusControl?.(control)}
                    onChange={(e) =>
                      onChange({
                        ...control,
                        options: mergeOptions(parseOptions(e.target.value), control.options),
                      })
                    }
                  />
                </Field>
              )}
            </div>
          )}

          {control.type === "slider" && (
            <div className="grid grid-cols-3 gap-2">
              <Field label="最小">
                <input
                  type="number"
                  className={inputCls}
                  value={control.slider?.min ?? 0}
                  onFocus={() => onFocusControl?.(control)}
                  onChange={(e) =>
                    onChange({
                      ...control,
                      slider: {
                        min: Number(e.target.value),
                        max: control.slider?.max ?? 1,
                        step: control.slider?.step ?? 0.1,
                        displayFormat: control.slider?.displayFormat,
                        valueLabels: control.slider?.valueLabels,
                      },
                    })
                  }
                />
              </Field>
              <Field label="最大">
                <input
                  type="number"
                  className={inputCls}
                  value={control.slider?.max ?? 1}
                  onFocus={() => onFocusControl?.(control)}
                  onChange={(e) =>
                    onChange({
                      ...control,
                      slider: {
                        min: control.slider?.min ?? 0,
                        max: Number(e.target.value),
                        step: control.slider?.step ?? 0.1,
                        displayFormat: control.slider?.displayFormat,
                        valueLabels: control.slider?.valueLabels,
                      },
                    })
                  }
                />
              </Field>
              <Field label="步进">
                <input
                  type="number"
                  className={inputCls}
                  value={control.slider?.step ?? 0.1}
                  onFocus={() => onFocusControl?.(control)}
                  onChange={(e) =>
                    onChange({
                      ...control,
                      slider: {
                        min: control.slider?.min ?? 0,
                        max: control.slider?.max ?? 1,
                        step: Number(e.target.value),
                        displayFormat: control.slider?.displayFormat,
                        valueLabels: control.slider?.valueLabels,
                      },
                    })
                  }
                />
              </Field>
            </div>
          )}

          <Field label="控件提示词" hint="{{value}} 替换为用户值">
            <input
              className={inputCls}
              value={control.promptFragment ?? ""}
              onFocus={() => onFocusControl?.(control)}
              onChange={(e) => onChange({ ...control, promptFragment: e.target.value })}
            />
          </Field>

          {hasOptions &&
            control.options?.map((opt) => (
              <div
                key={opt.value}
                className="rounded-xl border border-dashed border-border bg-muted/10 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[12px] font-semibold text-foreground">选项「{opt.label}」</div>
                    <div className="text-[11px] text-muted-foreground">
                      选中这个选项后，才会显示下面这一组子控件。
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] text-primary"
                      onClick={() => {
                        const sub = opt.subFields ?? [];
                        onChange(
                          updateOptionSubFields(control, opt.value, [
                            ...sub,
                            createSubFieldByType("text", sub.length),
                          ]),
                        );
                      }}
                    >
                      <Plus size={12} /> 文本
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] text-primary"
                      onClick={() => {
                        const sub = opt.subFields ?? [];
                        onChange(
                          updateOptionSubFields(control, opt.value, [
                            ...sub,
                            createSubFieldByType("radio", sub.length),
                          ]),
                        );
                      }}
                    >
                      <Plus size={12} /> 单选
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] text-primary"
                      onClick={() => {
                        const sub = opt.subFields ?? [];
                        onChange(
                          updateOptionSubFields(control, opt.value, [
                            ...sub,
                            createSubFieldByType("multi-checkbox", sub.length),
                          ]),
                        );
                      }}
                    >
                      <Plus size={12} /> 多选
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-border/70 bg-background/80 p-3">
                  <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5">条件显示</span>
                    <span>当用户选择「{opt.label}」时，展示以下子控件</span>
                  </div>

                  {(opt.subFields ?? []).length > 0 ? (
                    <div className="space-y-3 border-l-2 border-primary/20 pl-3">
                      {(opt.subFields ?? []).map((sub, si) => (
                        <FormControlEditor
                          key={sub.id}
                          control={sub}
                          depth={depth + 1}
                          pathLabel={`${control.label} / ${opt.label}`}
                          controlDomId={controlNodeId(sub.id)}
                          onFocusControl={onFocusControl}
                          onChange={(next) => {
                            const subs = [...(opt.subFields ?? [])];
                            subs[si] = next;
                            onChange(updateOptionSubFields(control, opt.value, subs));
                          }}
                          onDelete={() => {
                            onChange(
                              updateOptionSubFields(
                                control,
                                opt.value,
                                (opt.subFields ?? []).filter((_, i) => i !== si),
                              ),
                            );
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-[12px] text-muted-foreground">
                      这个选项下还没有子控件。
                    </div>
                  )}
                </div>
              </div>
            ))}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-[12px] text-destructive flex items-center gap-1"
            >
              <Trash2 size={13} /> 删除控件
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function buildTreeFromControls(fields: FormControl[], depth = 0): ControlTreeNode[] {
  return fields.map((control) => ({
    id: controlNodeId(control.id),
    label: control.label || control.key,
    meta: `${CONTROL_TYPE_LABELS[control.type]} · ${control.key}`,
    depth,
    tone: "control",
    children: (control.options ?? []).map((option, index) => ({
      id: optionNodeId(control.id, index),
      label: option.label || option.value,
      meta: `选项 · ${option.value}`,
      depth: depth + 1,
      tone: "option",
      children: option.subFields ? buildTreeFromControls(option.subFields, depth + 2) : [],
    })),
  }));
}

function collectExpandableNodeIds(nodes: ControlTreeNode[]): string[] {
  return nodes.flatMap((node) => {
    const nested = node.children ? collectExpandableNodeIds(node.children) : [];
    return node.children?.length ? [node.id, ...nested] : nested;
  });
}

function TreeNodeItem({
  node,
  expandedIds,
  onToggle,
  onSelect,
  activeId,
}: {
  node: ControlTreeNode;
  expandedIds: Set<string>;
  onToggle: (nodeId: string) => void;
  onSelect: (node: ControlTreeNode) => void;
  activeId: string | null;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = hasChildren ? expandedIds.has(node.id) : false;
  const isOption = node.tone === "option";
  const isActive = activeId === node.id;

  return (
    <div className="space-y-1">
      <div
        className={`group flex items-start gap-2 rounded-xl border px-2 py-2 transition-colors ${
          isOption
            ? isActive
              ? "border-sky-500/40 bg-sky-500/10"
              : "border-sky-500/15 bg-sky-500/5 hover:border-sky-500/30 hover:bg-sky-500/10"
            : isActive
              ? "border-primary/40 bg-primary/10"
              : "border-primary/15 bg-primary/5 hover:border-primary/30 hover:bg-primary/10"
        }`}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors ${
            hasChildren ? "hover:bg-background/80 hover:text-foreground" : "cursor-default opacity-40"
          }`}
          aria-label={isExpanded ? "收起节点" : "展开节点"}
        >
          {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="h-2 w-2 rounded-full bg-current" />}
        </button>

        <button
          type="button"
          onClick={() => onSelect(node)}
          className="min-w-0 flex-1 text-left"
        >
          <div
            className={`truncate ${
              isOption ? "text-[12px] font-medium text-slate-700" : "text-[12px] font-semibold text-foreground"
            }`}
          >
            {node.label}
          </div>
          <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{node.meta}</div>
        </button>
      </div>

      {hasChildren && isExpanded ? (
        <div className="ml-4 border-l border-border/70 pl-3">
          <div className="space-y-1.5">
            {node.children?.map((child) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onSelect={onSelect}
                activeId={activeId}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FormControlListEditor({
  fields,
  onChange,
  onFocusControl,
}: {
  fields: FormControl[];
  onChange: (fields: FormControl[]) => void;
  onFocusControl?: (control: FormControl) => void;
}) {
  const tree = buildTreeFromControls(fields);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    const nextExpandableIds = collectExpandableNodeIds(tree);
    setExpandedIds((prev) => {
      const merged = new Set(prev);
      nextExpandableIds.forEach((id) => merged.add(id));
      Array.from(merged).forEach((id) => {
        if (!nextExpandableIds.includes(id)) merged.delete(id);
      });
      return merged;
    });
  }, [fields]);

  const toggleNode = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-3 text-[12px] leading-5 text-muted-foreground">
        从上到下就是前台用户看到的控件顺序。带“选项配置”的控件，可以在某个选项下面继续挂子控件，形成条件式层级。
      </div>
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border/80 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-foreground">控件结构</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  点击左侧节点，可快速定位到右侧对应配置项。
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  className="rounded-md border border-border px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  onClick={() => setExpandedIds(new Set(collectExpandableNodeIds(tree)))}
                >
                  展开
                </button>
                <button
                  type="button"
                  className="rounded-md border border-border px-2 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  onClick={() => setExpandedIds(new Set())}
                >
                  收起
                </button>
              </div>
            </div>
          </div>
          <div className="h-[720px] min-h-0 overflow-y-auto overscroll-contain px-3 py-3">
            {tree.length > 0 ? (
              <div className="space-y-2">
                {tree.map((node) => (
                  <TreeNodeItem
                    key={node.id}
                    node={node}
                    expandedIds={expandedIds}
                    activeId={activeNodeId}
                    onToggle={toggleNode}
                    onSelect={(selectedNode) => {
                      setActiveNodeId(selectedNode.id);
                      const target = document.getElementById(selectedNode.id);
                      target?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="px-3 py-6 text-[12px] text-muted-foreground">还没有控件结构</div>
            )}
          </div>
        </div>

        <div className="h-[720px] min-h-0 overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-3">
            {fields.map((f, i) => (
              <FormControlEditor
                key={f.id}
                control={f}
                controlDomId={controlNodeId(f.id)}
                onFocusControl={onFocusControl}
                onChange={(next) => onChange(fields.map((x, j) => (j === i ? next : x)))}
                onDelete={() => onChange(fields.filter((_, j) => j !== i))}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                onChange([
                  ...fields,
                  createControl({
                    key: `field_${fields.length}`,
                    label: "新参数",
                    type: "text",
                    defaultValue: "",
                  }),
                ])
              }
              className="flex items-center gap-1 text-[13px] text-primary"
            >
              <Plus size={14} /> 添加控件
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
