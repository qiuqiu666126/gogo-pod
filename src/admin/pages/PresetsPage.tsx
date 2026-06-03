import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AdminShell } from "../components/AdminShell";
import { FormControlListEditor } from "../components/FormControlEditor";
import { Badge, Btn, Card, Field, inputCls, textareaCls } from "../components/ui";
import { FEATURE_LABELS, ALL_FEATURE_TYPES } from "../data/initialData";
import type { FeatureType } from "../types";
import { DynamicFormFields, previewFieldDomId } from "../../app/components/DynamicFormFields";
import { CrackScenePresetPreview } from "../../app/CrackImageModal";
import { ProductSetPresetPreview } from "../../app/ProductSetTaskModal";
import { VideoTaskPresetPreview } from "../../app/VideoTaskModal";
import {
  applyOptionChange,
  buildScenePrompt,
  collectDefaultValues,
  createPresetId,
  deleteScenePreset,
  getScenePresets,
  listSceneFormPresets,
  subscribeScenePresets,
  upsertScenePreset,
  type FormControl,
  type FormValue,
  type SceneFormPreset,
} from "../../shared/sceneFormSchema";

function useScenePresets() {
  return useSyncExternalStore(subscribeScenePresets, getScenePresets, getScenePresets);
}

export function PresetsPage() {
  const allPresets = useScenePresets();
  const [filterType, setFilterType] = useState<FeatureType>("crack");
  const [editing, setEditing] = useState<SceneFormPreset | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, FormValue>>({});
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [activePreviewControlId, setActivePreviewControlId] = useState<string | null>(null);
  const previewPaneRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(
    () => listSceneFormPresets(filterType),
    [allPresets, filterType],
  );

  const openNew = () => {
    setEditing({
      id: createPresetId(),
      featureType: filterType,
      presetKind: "scene-form",
      sceneKey: "",
      sceneLabel: "",
      label: "",
      presetKey: "",
      promptTemplate: "",
      formFields: [],
      enabled: true,
      sortOrder: filtered.length,
      updatedAt: "",
    });
    setPreviewValues({});
    setPreviewCollapsed(false);
    setActivePreviewControlId(null);
  };

  const openEdit = (row: SceneFormPreset) => {
    setEditing(structuredClone(row));
    setPreviewValues(collectDefaultValues(row.formFields));
    setPreviewCollapsed(false);
    setActivePreviewControlId(null);
  };

  const save = () => {
    if (!editing) return;
    upsertScenePreset(editing);
    setEditing(null);
  };

  const promptPreview = editing ? buildScenePrompt(editing, previewValues) : "";
  const previewState = editing
    ? {
        ...collectDefaultValues(editing.formFields),
        ...previewValues,
      }
    : {};

  useEffect(() => {
    if (!activePreviewControlId || !previewPaneRef.current) return;
    const target = previewPaneRef.current.querySelector<HTMLElement>(
      `#${previewFieldDomId(activePreviewControlId)}`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activePreviewControlId, previewState, previewCollapsed, editing]);

  const revealControlInPreview = (control: FormControl) => {
    if (!editing) return;

    const nextValues = { ...previewState };

    const activatePath = (fields: FormControl[]): boolean => {
      for (const field of fields) {
        if (field.id === control.id) return true;
        for (const option of field.options ?? []) {
          if (option.subFields?.length && activatePath(option.subFields)) {
            if (field.type === "multi-checkbox") {
              const current = Array.isArray(nextValues[field.key]) ? [...(nextValues[field.key] as string[])] : [];
              if (!current.includes(option.value)) current.push(option.value);
              nextValues[field.key] = current;
            } else {
              nextValues[field.key] = option.value;
            }
            return true;
          }
        }
      }
      return false;
    };

    activatePath(editing.formFields);
    setPreviewValues(nextValues);
    setActivePreviewControlId(control.id);
  };

  return (
    <AdminShell
      title="场景预设"
      subtitle="配置每个功能、每个场景的前台表单与提示词（AI 功能配置只管模型）"
    >
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className={`${inputCls} w-auto min-w-[140px]`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FeatureType)}
            >
              {ALL_FEATURE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {FEATURE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <Btn onClick={openNew}>
            <span className="flex items-center gap-1.5">
              <Plus size={16} />
              新建场景
            </span>
          </Btn>
        </div>

        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">功能</th>
                <th className="text-left px-4 py-3 font-medium">场景</th>
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium">控件数</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">{FEATURE_LABELS[row.featureType as FeatureType]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.sceneLabel || row.sceneKey || "—"}</td>
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-md truncate">
                    {row.formFields.length} 个顶层控件
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={row.enabled ? "success" : "default"}>
                      {row.enabled ? "启用" : "停用"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-primary text-[12px] font-medium"
                      onClick={() => openEdit(row)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-destructive text-[12px] font-medium"
                      onClick={() => {
                        if (confirm(`删除「${row.label}」？`)) deleteScenePreset(row.id);
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-[13px]">暂无预设</p>
          )}
        </Card>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
              <div className="min-w-0">
                <div className="text-[16px] font-semibold text-foreground">
                  {allPresets.some((p) => p.id === editing.id) ? "编辑场景预设" : "新建场景预设"}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground truncate">
                  {FEATURE_LABELS[editing.featureType as FeatureType]} / {editing.sceneLabel || editing.sceneKey || "未命名场景"} / {editing.label || "未命名预设"}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewCollapsed((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-[12px] text-foreground hover:bg-muted/40"
                >
                  {previewCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  {previewCollapsed ? "展开预览" : "收起预览"}
                </button>
                <Btn variant="secondary" onClick={() => setEditing(null)}>
                  取消
                </Btn>
                <Btn onClick={save}>保存</Btn>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-5">
              <div className={`grid h-full gap-5 ${previewCollapsed ? "xl:grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_420px]"}`}>
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="所属功能">
                      <select
                        className={inputCls}
                        value={editing.featureType}
                        onChange={(e) =>
                          setEditing({ ...editing, featureType: e.target.value as FeatureType })
                        }
                      >
                        {ALL_FEATURE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {FEATURE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="场景 key（前台 Tab）">
                      <input
                        className={inputCls}
                        placeholder="默认 / model / 手机壳"
                        value={editing.sceneKey}
                        onChange={(e) => setEditing({ ...editing, sceneKey: e.target.value })}
                      />
                    </Field>
                    <Field label="场景显示名">
                      <input
                        className={inputCls}
                        value={editing.sceneLabel}
                        onChange={(e) => setEditing({ ...editing, sceneLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="preset_key">
                      <input
                        className={inputCls}
                        value={editing.presetKey}
                        onChange={(e) => setEditing({ ...editing, presetKey: e.target.value })}
                      />
                    </Field>
                    <Field label="管理名称">
                      <input
                        className={inputCls}
                        value={editing.label}
                        onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label="场景基础提示词">
                    <textarea
                      className={textareaCls}
                      value={editing.promptTemplate}
                      onChange={(e) => setEditing({ ...editing, promptTemplate: e.target.value })}
                    />
                  </Field>

                  <Card title="表单控件">
                    <p className="text-[12px] text-muted-foreground mb-3">
                      单选/下拉的每个选项可展开配置「子控件」，选中该选项时显示。
                    </p>
                    <FormControlListEditor
                      fields={editing.formFields}
                      onChange={(formFields) => setEditing({ ...editing, formFields })}
                      onFocusControl={revealControlInPreview}
                    />
                  </Card>

                  <label className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={editing.enabled}
                      onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                      className="accent-primary"
                    />
                    启用
                  </label>
                </div>

                {!previewCollapsed ? (
                  <div ref={previewPaneRef} className="space-y-4 overflow-y-auto pr-1">
                    <Card title="前台预览">
                      {editing.featureType === "video" ? (
                        <VideoTaskPresetPreview
                          sceneKey={editing.sceneKey}
                          fields={editing.formFields}
                          values={previewState}
                          onChange={(key, value) => {
                            setPreviewValues((prev) => {
                              const base = {
                                ...collectDefaultValues(editing.formFields),
                                ...prev,
                              };
                              return applyOptionChange(editing.formFields, base, key, value);
                          });
                        }}
                      />
                      ) : editing.featureType === "crack" ? (
                        <CrackScenePresetPreview
                          sceneKey={editing.sceneKey}
                          fields={editing.formFields}
                          values={previewState}
                          onChange={(key, value) => {
                            setPreviewValues((prev) => {
                              const base = {
                                ...collectDefaultValues(editing.formFields),
                                ...prev,
                              };
                              return applyOptionChange(editing.formFields, base, key, value);
                            });
                          }}
                        />
                      ) : editing.featureType === "product-set" ? (
                        <ProductSetPresetPreview
                          fields={editing.formFields}
                          values={previewState}
                          onChange={(key, value) => {
                            setPreviewValues((prev) => {
                              const base = {
                                ...collectDefaultValues(editing.formFields),
                                ...prev,
                              };
                              return applyOptionChange(editing.formFields, base, key, value);
                            });
                          }}
                        />
                      ) : (
                        <DynamicFormFields
                          fields={editing.formFields}
                          values={previewState}
                          onChange={(key, value) => {
                            setPreviewValues((prev) => {
                              const base = {
                                ...collectDefaultValues(editing.formFields),
                                ...prev,
                              };
                              return applyOptionChange(editing.formFields, base, key, value);
                            });
                          }}
                        />
                      )}
                    </Card>
                    <Card title="合成提示词预览">
                      <pre className="text-[12px] font-mono whitespace-pre-wrap bg-muted/40 rounded-lg p-4 min-h-[100px]">
                        {promptPreview}
                      </pre>
                    </Card>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
