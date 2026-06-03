import { useMemo, useState } from "react";
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import {
  WORKFLOW_CATEGORY_TABS,
  getWorkflowTemplates,
  type WorkflowCategory,
  type WorkflowTemplate,
  type WorkflowTemplateSource,
  useWorkflowTemplateVersion,
} from "./workflowTemplateStore";
import { WorkflowTemplateCopyModal } from "./WorkflowTemplateCopyModal";

const SOURCE_TABS: { id: WorkflowTemplateSource; label: string }[] = [
  { id: "official", label: "官方" },
  { id: "team", label: "团队" },
  { id: "mine", label: "我的" },
];

function TemplateCard({
  template,
  sourceLabel,
  menuOpen,
  onToggleMenu,
  onView,
  onNewTask,
  onCreateCopy,
  onDuplicateAsNewTemplate,
}: {
  template: WorkflowTemplate;
  sourceLabel: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onView: () => void;
  onNewTask: () => void;
  onCreateCopy: () => void;
  onDuplicateAsNewTemplate?: () => void;
}) {
  return (
    <div className="relative group rounded-xl border border-border bg-card p-4 hover:border-primary/35 transition-colors">
      <button
        type="button"
        onClick={onToggleMenu}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="更多操作"
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            aria-label="关闭菜单"
            onClick={onToggleMenu}
          />
          <div className="absolute top-10 right-3 z-30 min-w-[120px] rounded-lg border border-border bg-card py-1 shadow-xl">
            <button
              type="button"
              onClick={() => {
                onToggleMenu();
                onView();
              }}
              className="w-full text-left px-4 py-2 text-[13px] text-foreground hover:bg-muted/60"
            >
              查看
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleMenu();
                onNewTask();
              }}
              className="w-full text-left px-4 py-2 text-[13px] text-foreground hover:bg-muted/60"
            >
              新建任务
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleMenu();
                onCreateCopy();
              }}
              className="w-full text-left px-4 py-2 text-[13px] text-foreground hover:bg-muted/60"
            >
              创建副本
            </button>
            {onDuplicateAsNewTemplate && (
              <button
                type="button"
                onClick={() => {
                  onToggleMenu();
                  onDuplicateAsNewTemplate();
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-foreground hover:bg-muted/60"
              >
                以此新建模版
              </button>
            )}
          </div>
        </>
      )}

      <div className="flex items-center gap-2 mb-2 pr-8">
        <span className="text-[11px] font-semibold text-primary border border-primary/40 px-1.5 py-0.5 rounded">
          {sourceLabel}
        </span>
        <span className="text-[14px] font-semibold text-foreground">{template.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {template.steps.map((step, si) => (
          <span key={`${template.id}-${step}-${si}`} className="flex items-center gap-1">
            <span className="text-[12px] text-muted-foreground">{step}</span>
            {si < template.steps.length - 1 && (
              <ChevronRight size={11} className="text-muted-foreground/50 shrink-0" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WorkflowTemplatesPage({
  onBack,
  onAddTemplate,
  onViewTemplate,
  onNewTask,
  onDuplicateAsNewTemplate,
}: {
  onBack?: () => void;
  onAddTemplate: () => void;
  onViewTemplate: (template: WorkflowTemplate, category: WorkflowCategory) => void;
  onNewTask: (template: WorkflowTemplate, category: WorkflowCategory) => void;
  onDuplicateAsNewTemplate?: (template: WorkflowTemplate) => void;
}) {
  useWorkflowTemplateVersion();
  const [source, setSource] = useState<WorkflowTemplateSource>("official");
  const [category, setCategory] = useState<WorkflowCategory>("服饰");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copyTemplate, setCopyTemplate] = useState<WorkflowTemplate | null>(null);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  const templates = useMemo(
    () => getWorkflowTemplates(source, category),
    [source, category],
  );

  const sourceLabel = source === "official" ? "官方" : source === "team" ? "团队" : "我的";

  const openCopy = (template: WorkflowTemplate) => {
    setCopyTemplate(template);
    setCopyModalOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              返回
            </button>
          )}
          <h1 className="text-[16px] font-semibold text-foreground">工作流模板</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 px-5 rounded-md border border-primary text-primary text-[13px] font-medium hover:bg-primary/5 transition-colors"
          >
            查询
          </button>
          <button
            type="button"
            onClick={onAddTemplate}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            新增模板
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border shrink-0 overflow-x-auto scrollbar-none">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSource(tab.id)}
            className={`h-8 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
              source === tab.id
                ? "bg-muted text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {WORKFLOW_CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setCategory(tab)}
            className={`h-8 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
              category === tab
                ? "bg-muted text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              sourceLabel={sourceLabel}
              menuOpen={openMenuId === template.id}
              onToggleMenu={() =>
                setOpenMenuId((id) => (id === template.id ? null : template.id))
              }
              onView={() => onViewTemplate(template, category)}
              onNewTask={() => onNewTask(template, category)}
              onCreateCopy={() => openCopy(template)}
              onDuplicateAsNewTemplate={
                onDuplicateAsNewTemplate
                  ? () => onDuplicateAsNewTemplate(template)
                  : undefined
              }
            />
          ))}
          {templates.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border px-4 py-16 text-center">
              <p className="text-[14px] font-medium text-foreground">当前分类暂无模板</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                可通过「创建副本」将官方模板保存到我的模版
              </p>
            </div>
          )}
        </div>
      </div>

      <WorkflowTemplateCopyModal
        open={copyModalOpen}
        template={copyTemplate}
        defaultCategory={category}
        onClose={() => {
          setCopyModalOpen(false);
          setCopyTemplate(null);
        }}
        onCopied={() => setSource("mine")}
      />
    </div>
  );
}
