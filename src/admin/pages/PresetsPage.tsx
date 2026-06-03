import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AdminShell } from "../components/AdminShell";
import { FormControlListEditor } from "../components/FormControlEditor";
import { Badge, Btn, Card, Field, fieldInputCls, inputCls, textareaCls } from "../components/ui";
import type { FeatureType } from "../types";
import { DynamicFormFields, previewFieldDomId } from "../../app/components/DynamicFormFields";
import { CrackScenePresetPreview } from "../../app/CrackImageModal";
import { ProductSetPresetPreview } from "../../app/ProductSetTaskModal";
import { VideoTaskPresetPreview } from "../../app/VideoTaskModal";
import {
  createAiScenePreset,
  deleteAiScenePreset,
  getAiScenePresetDetail,
  updateAiScenePreset,
} from "../api/aiScenePresetApi";
import { mapAiScenePresetDetailToFormPreset } from "../api/aiMappers";
import {
  applyOptionChange,
  buildScenePrompt,
  collectDefaultValues,
  createPresetId,
  getScenePresets,
  listSceneFormPresets,
  subscribeScenePresets,
  type FormControl,
  type FormValue,
  type SceneFormPreset,
} from "../../shared/sceneFormSchema";
import { getAdminAccessToken, reloadAdminAiData, useAdminStore } from "../store";

function useScenePresets() {
  return useSyncExternalStore(subscribeScenePresets, getScenePresets, getScenePresets);
}

type PresetFormField = "featureType" | "sceneKey" | "label";
type PresetFieldErrors = Partial<Record<PresetFormField, string>>;

function validatePresetForm(editing: SceneFormPreset): PresetFieldErrors {
  const errors: PresetFieldErrors = {};
  if (!editing.featureType?.trim()) {
    errors.featureType = "请选择所属功能";
  }
  if (!editing.sceneKey.trim()) {
    errors.sceneKey = "请填写场景 key";
  }
  if (!editing.label.trim()) {
    errors.label = "请填写管理名称";
  }
  return errors;
}

function mapApiErrorToFields(message: string): PresetFieldErrors {
  const errors: PresetFieldErrors = {};
  if (/场景\s*key|scene_key|sceneKey/i.test(message)) {
    errors.sceneKey = message;
  } else if (/管理名称|\blabel\b/i.test(message)) {
    errors.label = message;
  } else if (/所属功能|feature_code|featureCode/i.test(message)) {
    errors.featureType = message;
  }
  return errors;
}

export function PresetsPage() {
  const { configs, scenePresetsLoading, scenePresetsError } = useAdminStore();
  const allPresets = useScenePresets();
  const [filterType, setFilterType] = useState<FeatureType>("crack");
  const [editing, setEditing] = useState<SceneFormPreset | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, FormValue>>({});
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [activePreviewControlId, setActivePreviewControlId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<PresetFieldErrors>({});
  const previewPaneRef = useRef<HTMLDivElement | null>(null);

  const featureOptions = useMemo(
    () => configs.map((item) => ({ code: item.featureType, label: item.label })),
    [configs],
  );

  const featureLabel = (code: FeatureType) =>
    configs.find((item) => item.featureType === code)?.label ?? code;

  useEffect(() => {
    if (featureOptions.length === 0) return;
    if (!featureOptions.some((item) => item.code === filterType)) {
      setFilterType(featureOptions[0].code);
    }
  }, [featureOptions, filterType]);

  const filtered = useMemo(
    () => listSceneFormPresets(filterType),
    [allPresets, filterType],
  );

  const openNew = () => {
    setFormError("");
    setFieldErrors({});
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

  const openEdit = async (row: SceneFormPreset) => {
    setError("");
    setFormError("");
    setFieldErrors({});
    setLoadingDetail(true);
    try {
      const token = getAdminAccessToken();
      if (row.dbId && token) {
        const detail = await getAiScenePresetDetail(row.dbId, token);
        const full = mapAiScenePresetDetailToFormPreset(detail);
        setEditing(structuredClone(full));
        setPreviewValues(collectDefaultValues(full.formFields));
      } else {
        setEditing(structuredClone(row));
        setPreviewValues(collectDefaultValues(row.formFields));
      }
      setPreviewCollapsed(false);
      setActivePreviewControlId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载场景预设失败");
    } finally {
      setLoadingDetail(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    const token = getAdminAccessToken();
    if (!token) {
      setFormError("未登录");
      return;
    }

    const validationErrors = validatePresetForm(editing);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError("请完善必填项后再保存");
      return;
    }

    setSaving(true);
    setFormError("");
    setFieldErrors({});
    try {
      const payload = {
        id: editing.id,
        featureCode: editing.featureType,
        presetKind: editing.presetKind,
        sceneKey: editing.sceneKey,
        sceneLabel: editing.sceneLabel,
        label: editing.label,
        presetKey: editing.presetKey || editing.sceneKey,
        promptTemplate: editing.promptTemplate,
        formFields: editing.formFields,
        enabled: editing.enabled,
        sortOrder: editing.sortOrder,
      };

      if (editing.dbId) {
        await updateAiScenePreset(editing.dbId, payload);
      } else {
        await createAiScenePreset(payload);
      }

      await reloadAdminAiData();
      setEditing(null);
      setFormError("");
      setFieldErrors({});
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存场景预设失败";
      const apiFieldErrors = mapApiErrorToFields(message);
      setFieldErrors(apiFieldErrors);
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const removePreset = async (row: SceneFormPreset) => {
    if (!confirm(`删除「${row.label}」？`)) return;
    if (!row.dbId) {
      setError("缺少后端 ID，无法删除");
      return;
    }

    setError("");
    try {
      await deleteAiScenePreset(row.dbId);
      await reloadAdminAiData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除场景预设失败");
    }
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
        {(!editing && (scenePresetsError || error)) && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error || scenePresetsError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className={`${inputCls} w-auto min-w-[140px]`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FeatureType)}
              disabled={featureOptions.length === 0}
            >
              {featureOptions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
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
                  <td className="px-4 py-3">{featureLabel(row.featureType as FeatureType)}</td>
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
                      onClick={() => void openEdit(row)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-destructive text-[12px] font-medium"
                      onClick={() => void removePreset(row)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {scenePresetsLoading ? (
            <p className="text-center py-12 text-muted-foreground text-[13px]">加载中…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-[13px]">暂无预设</p>
          ) : null}
        </Card>
      </div>

      {loadingDetail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 text-[13px] text-foreground">
          加载预设详情…
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
              <div className="min-w-0">
                <div className="text-[16px] font-semibold text-foreground">
                  {allPresets.some((p) => p.id === editing.id) ? "编辑场景预设" : "新建场景预设"}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground truncate">
                  {featureLabel(editing.featureType as FeatureType)} / {editing.sceneLabel || editing.sceneKey || "未命名场景"} / {editing.label || "未命名预设"}
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
                <Btn
                  variant="secondary"
                  onClick={() => {
                    setEditing(null);
                    setFormError("");
                    setFieldErrors({});
                  }}
                >
                  取消
                </Btn>
                <Btn onClick={() => void save()} disabled={saving}>
                  {saving ? "保存中…" : "保存"}
                </Btn>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-5">
              {formError && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
                  {formError}
                </div>
              )}

              <div className={`grid h-full gap-5 ${previewCollapsed ? "xl:grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_420px]"}`}>
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="所属功能" required error={fieldErrors.featureType}>
                      <select
                        className={fieldInputCls(Boolean(fieldErrors.featureType))}
                        value={editing.featureType}
                        onChange={(e) => {
                          const featureType = e.target.value as FeatureType;
                          setEditing({ ...editing, featureType });
                          setFieldErrors((prev) => {
                            if (!prev.featureType) return prev;
                            const next = { ...prev };
                            delete next.featureType;
                            return next;
                          });
                        }}
                      >
                        {featureOptions.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="场景 key（前台 Tab）"
                      required
                      hint="前台场景 Tab 的唯一标识，如：默认、model、手机壳"
                      error={fieldErrors.sceneKey}
                    >
                      <input
                        className={fieldInputCls(Boolean(fieldErrors.sceneKey))}
                        placeholder="默认 / model / 手机壳"
                        value={editing.sceneKey}
                        onChange={(e) => {
                          setEditing({ ...editing, sceneKey: e.target.value });
                          setFieldErrors((prev) => {
                            if (!prev.sceneKey) return prev;
                            const next = { ...prev };
                            delete next.sceneKey;
                            return next;
                          });
                        }}
                      />
                    </Field>
                    <Field label="场景显示名" hint="前台 Tab 展示名称，留空则与场景 key 相同">
                      <input
                        className={inputCls}
                        placeholder="可与场景 key 相同"
                        value={editing.sceneLabel}
                        onChange={(e) => setEditing({ ...editing, sceneLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="preset_key" hint="可选，留空则默认使用场景 key">
                      <input
                        className={inputCls}
                        placeholder="留空则使用场景 key"
                        value={editing.presetKey}
                        onChange={(e) => setEditing({ ...editing, presetKey: e.target.value })}
                      />
                    </Field>
                    <Field label="管理名称" required error={fieldErrors.label}>
                      <input
                        className={fieldInputCls(Boolean(fieldErrors.label))}
                        placeholder="后台列表中显示的名称"
                        value={editing.label}
                        onChange={(e) => {
                          setEditing({ ...editing, label: e.target.value });
                          setFieldErrors((prev) => {
                            if (!prev.label) return prev;
                            const next = { ...prev };
                            delete next.label;
                            return next;
                          });
                        }}
                      />
                    </Field>
                  </div>

                  <Field label="场景基础提示词" hint="可选，作为该场景提示词的基础片段">
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
