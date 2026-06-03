import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { WorkflowBuilderModal } from "../../app/WorkflowBuilderModal";
import { AdminShell } from "../components/AdminShell";
import { Badge, Btn, Card, Field, inputCls } from "../components/ui";
import {
  WORKFLOW_CATEGORY_TABS,
  type OfficialWorkflowTemplate,
  type WorkflowCategory,
  createOfficialWorkflowTemplateId,
  deleteOfficialWorkflowTemplate,
  getOfficialWorkflowTemplatesList,
  subscribeOfficialWorkflowTemplates,
  upsertOfficialWorkflowTemplate,
} from "../../shared/workflowTemplates";

function useOfficialWorkflowTemplates() {
  return useSyncExternalStore(
    subscribeOfficialWorkflowTemplates,
    getOfficialWorkflowTemplatesList,
    getOfficialWorkflowTemplatesList,
  );
}

export function WorkflowTemplatesAdminPage() {
  const templates = useOfficialWorkflowTemplates();
  const [categoryFilter, setCategoryFilter] = useState<WorkflowCategory | "">("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<OfficialWorkflowTemplate | null>(null);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...templates].sort((a, b) => a.sortOrder - b.sortOrder);
    if (categoryFilter) list = list.filter((t) => t.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.steps.join(" ").toLowerCase().includes(q) ||
          t.category.includes(q),
      );
    }
    return list;
  }, [templates, categoryFilter, search]);

  const openNew = () => {
    const category = (categoryFilter || "服饰") as WorkflowCategory;
    setEditing({
      id: createOfficialWorkflowTemplateId(),
      category,
      name: "",
      steps: [],
      enabled: true,
      sortOrder: filtered.length,
      updatedAt: "",
    });
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    const steps = editing.steps.map((s) => s.trim()).filter(Boolean);
    upsertOfficialWorkflowTemplate({
      ...editing,
      name: editing.name.trim(),
      steps,
      stepConfigs: editing.stepConfigs,
    });
    setEditing(null);
    setWorkflowBuilderOpen(false);
  };

  return (
    <AdminShell
      title="工作流模版"
      subtitle="配置用户端「工作流模板管理」官方 Tab 展示的模板（名称、品类、节点步骤）"
    >
      <div className="p-6 space-y-4 max-w-[1100px]">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className={`${inputCls} w-auto min-w-[120px]`}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as WorkflowCategory | "")}
            >
              <option value="">全部品类</option>
              {WORKFLOW_CATEGORY_TABS.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
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
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3 max-w-md text-muted-foreground truncate">
                    {row.steps.join(" > ")}
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
                      className="text-primary text-[12px] font-medium"
                      onClick={() => setEditing(row)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-destructive text-[12px] font-medium"
                      onClick={() => {
                        if (confirm(`删除官方模版「${row.name}」？`)) {
                          deleteOfficialWorkflowTemplate(row.id);
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
          {filtered.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-[13px]">暂无模版</p>
          )}
        </Card>
        <p className="text-[12px] text-muted-foreground">
          编辑模版时点击「配置工作流」进入可视化编排，与用户端工作流编辑器一致，可配置各节点参数。保存后刷新用户端即可看到更新（同源 localStorage）。
        </p>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-border font-semibold">
              {templates.some((t) => t.id === editing.id) ? "编辑官方模版" : "新建官方模版"}
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
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as WorkflowCategory })
                  }
                >
                  {WORKFLOW_CATEGORY_TABS.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="工作流步骤">
                <button
                  type="button"
                  onClick={() => setWorkflowBuilderOpen(true)}
                  className={`w-full min-h-[88px] rounded-lg border px-4 py-3 text-left transition-colors ${
                    editing.steps.length > 0
                      ? "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                      : "border-dashed border-border bg-muted/20 hover:border-primary/50"
                  }`}
                >
                  {editing.steps.length > 0 ? (
                    <>
                      <div className="text-[12px] text-muted-foreground mb-2">已配置节点（点击修改）</div>
                      <div className="flex flex-wrap items-center gap-1 text-[13px] text-foreground">
                        <span className="text-muted-foreground">添加素材</span>
                        {editing.steps.map((step, i) => (
                          <span key={`${step}-${i}`} className="flex items-center gap-1">
                            <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
                            <span>{step}</span>
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
              <Btn onClick={save}>保存</Btn>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <WorkflowBuilderModal
          open={workflowBuilderOpen}
          templateName={editing.name || "未命名模版"}
          initialSteps={editing.steps}
          initialStepConfigs={editing.stepConfigs}
          onClose={() => setWorkflowBuilderOpen(false)}
          onConfirm={({ steps, stepConfigs }) => {
            setEditing({ ...editing, steps, stepConfigs });
            setWorkflowBuilderOpen(false);
          }}
        />
      )}
    </AdminShell>
  );
}
