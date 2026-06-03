import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { WorkflowBuilderModal } from "../../app/WorkflowBuilderModal";
import {
  createWorkflowTemplate,
  deleteWorkflowTemplate,
  getWorkflowStepOptions,
  getWorkflowStepSchema,
  getWorkflowTemplateDetail,
  getWorkflowTemplateMeta,
  listWorkflowTemplates,
  updateWorkflowTemplate,
  type WorkflowCategoryOption,
  type WorkflowStepOptionGroupDto,
  type WorkflowTemplateSummaryDto,
} from "../api/aiWorkflowTemplateApi";
import {
  buildWorkflowTemplateSavePayload,
  mapWorkflowDetailToDraft,
  mergeNodeConfigWithDefaults,
  stepDisplayName,
  type WorkflowStepDraft,
  type WorkflowTemplateDraft,
} from "../api/workflowMappers";
import { AdminShell } from "../components/AdminShell";
import { Badge, Btn, Card, Field, inputCls } from "../components/ui";

export function WorkflowTemplatesAdminPage() {
  const [categories, setCategories] = useState<WorkflowCategoryOption[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplateSummaryDto[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<WorkflowTemplateDraft | null>(null);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const [stepOptionGroups, setStepOptionGroups] = useState<WorkflowStepOptionGroupDto[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meta, listRes] = await Promise.all([
        getWorkflowTemplateMeta(),
        listWorkflowTemplates(
          {
            category_code: categoryFilter || undefined,
            keyword: search.trim() || undefined,
          },
        ),
      ]);
      setCategories(meta.categories);
      setTemplates(listRes.list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载工作流模版失败");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filtered = useMemo(
    () => [...templates].sort((a, b) => a.sortOrder - b.sortOrder),
    [templates],
  );

  const loadStepOptions = useCallback(async () => {
    const res = await getWorkflowStepOptions();
    setStepOptionGroups(res.groups);
  }, []);

  const resolvePreset = useCallback(
    async (scenePresetId: number): Promise<WorkflowStepDraft> => {
      const schema = await getWorkflowStepSchema(scenePresetId);
      return {
        scenePresetId: schema.scenePresetId,
        featureCode: schema.featureCode,
        featureName: schema.featureName,
        presetLabel: schema.label,
        formFields: schema.formFields,
        nodeConfig: mergeNodeConfigWithDefaults(schema.formFields, schema.defaultConfig),
        manualReview: false,
      };
    },
    [],
  );

  const openNew = () => {
    const categoryCode = categoryFilter || categories[0]?.code || "apparel";
    setEditing({
      name: "",
      categoryCode,
      enabled: true,
      sortOrder: filtered.length,
      workflowSteps: [],
    });
    void loadStepOptions();
  };

  const openEdit = async (row: WorkflowTemplateSummaryDto) => {
    setLoadingDetail(true);
    setError("");
    try {
      const [detail] = await Promise.all([
        getWorkflowTemplateDetail(row.id),
        loadStepOptions(),
      ]);
      setEditing(mapWorkflowDetailToDraft(detail));
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载模版详情失败");
    } finally {
      setLoadingDetail(false);
    }
  };

  const save = async () => {
    if (!editing || !editing.name.trim()) return;
    if (editing.workflowSteps.length === 0) {
      setError("请至少配置一个工作流步骤");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = buildWorkflowTemplateSavePayload(editing);
      if (editing.id) {
        await updateWorkflowTemplate(editing.id, payload);
      } else {
        await createWorkflowTemplate(payload);
      }
      setEditing(null);
      setWorkflowBuilderOpen(false);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存工作流模版失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: WorkflowTemplateSummaryDto) => {
    if (!confirm(`删除官方模版「${row.name}」？`)) return;
    setError("");
    try {
      await deleteWorkflowTemplate(row.id);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除工作流模版失败");
    }
  };

  return (
    <AdminShell
      title="工作流模版"
      subtitle="配置用户端「工作流模板管理」官方 Tab 展示的模板（名称、品类、节点步骤）"
    >
      <div className="p-6 space-y-4 max-w-[1100px]">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className={`${inputCls} w-auto min-w-[120px]`}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">全部品类</option>
              {categories.map((tab) => (
                <option key={tab.code} value={tab.code}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className={`${inputCls} pl-8 w-[220px]`}
                placeholder="搜索名称或步骤…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium">品类</th>
                <th className="text-left px-4 py-3 font-medium">步骤</th>
                <th className="text-left px-4 py-3 font-medium">排序</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.categoryLabel}</td>
                  <td className="px-4 py-3 max-w-md text-muted-foreground truncate">
                    {row.stepSummary}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Badge tone={row.enabled ? "success" : "default"}>
                      {row.enabled ? "启用" : "停用"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-primary text-[12px] font-medium disabled:opacity-50"
                      disabled={loadingDetail}
                      onClick={() => void openEdit(row)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-destructive text-[12px] font-medium"
                      onClick={() => void handleDelete(row)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-[13px]">暂无模版</p>
          )}
          {loading && (
            <p className="text-center py-12 text-muted-foreground text-[13px]">加载中…</p>
          )}
        </Card>
        <p className="text-[12px] text-muted-foreground">
          编辑模版时点击「配置工作流」进入可视化编排。每个步骤绑定一条场景预设，右侧参数面板读取该预设的控件配置。
        </p>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-border font-semibold">
              {editing.id ? "编辑官方模版" : "新建官方模版"}
            </div>
            <div className="p-5 space-y-4">
              <Field label="模版名称">
                <input
                  className={inputCls}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>
              <Field label="品类">
                <select
                  className={inputCls}
                  value={editing.categoryCode}
                  onChange={(e) => setEditing({ ...editing, categoryCode: e.target.value })}
                >
                  {categories.map((tab) => (
                    <option key={tab.code} value={tab.code}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="工作流步骤">
                <button
                  type="button"
                  onClick={() => {
                    void loadStepOptions();
                    setWorkflowBuilderOpen(true);
                  }}
                  className={`w-full min-h-[88px] rounded-lg border px-4 py-3 text-left transition-colors ${
                    editing.workflowSteps.length > 0
                      ? "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                      : "border-dashed border-border bg-muted/20 hover:border-primary/50"
                  }`}
                >
                  {editing.workflowSteps.length > 0 ? (
                    <>
                      <div className="text-[12px] text-muted-foreground mb-2">已配置节点（点击修改）</div>
                      <div className="flex flex-wrap items-center gap-1 text-[13px] text-foreground">
                        <span className="text-muted-foreground">添加素材</span>
                        {editing.workflowSteps.map((step, i) => (
                          <span key={`${step.scenePresetId}-${i}`} className="flex items-center gap-1">
                            <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
                            <span>{stepDisplayName(step)}</span>
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">
                      点击配置工作流节点与各节点参数
                    </span>
                  )}
                </button>
              </Field>
              <Field label="排序（数字越小越靠前）">
                <input
                  type="number"
                  className={inputCls}
                  value={editing.sortOrder}
                  onChange={(e) =>
                    setEditing({ ...editing, sortOrder: Number(e.target.value) || 0 })
                  }
                />
              </Field>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={editing.enabled}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                />
                在用户端官方 Tab 展示
              </label>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <Btn
                variant="secondary"
                onClick={() => {
                  setWorkflowBuilderOpen(false);
                  setEditing(null);
                }}
              >
                取消
              </Btn>
              <Btn onClick={() => void save()} disabled={saving}>
                {saving ? "保存中…" : "保存"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <WorkflowBuilderModal
          open={workflowBuilderOpen}
          mode="preset"
          templateName={editing.name || "未命名模版"}
          initialWorkflowSteps={editing.workflowSteps}
          stepOptionGroups={stepOptionGroups}
          onResolvePreset={resolvePreset}
          onClose={() => setWorkflowBuilderOpen(false)}
          onConfirm={({ workflowSteps }) => {
            if (workflowSteps) {
              setEditing({ ...editing, workflowSteps });
            }
            setWorkflowBuilderOpen(false);
          }}
        />
      )}
    </AdminShell>
  );
}
