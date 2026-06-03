import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronRight, X } from "lucide-react";
import type { UploadedAsset } from "./api/uploadApi";
import { TaskMaterialUploadSection } from "./TaskMaterialUploadSection";
import { showTaskError } from "./taskToast";
import {
  WORKFLOW_CATEGORY_TABS,
  getWorkflowTemplates,
  type WorkflowCategory,
  type WorkflowTemplate,
  type WorkflowTemplateSource,
  useWorkflowTemplateVersion,
} from "./workflowTemplateStore";

const SOURCE_TABS: { id: WorkflowTemplateSource; label: string }[] = [
  { id: "team", label: "团队" },
  { id: "official", label: "官方" },
  { id: "mine", label: "我的" },
];

function TemplateSteps({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((step, si) => (
        <span key={`${step}-${si}`} className="flex items-center gap-1">
          <span className="text-[12px] text-muted-foreground">{step}</span>
          {si < steps.length - 1 && <ChevronRight size={11} className="text-muted-foreground/50 shrink-0" />}
        </span>
      ))}
    </div>
  );
}

export function WorkflowNewTaskModal({
  open,
  onClose,
  initialTemplate,
  initialCategory = "服饰",
  onSubmit,
  onGoCreateWorkflow,
}: {
  open: boolean;
  onClose: () => void;
  initialTemplate?: WorkflowTemplate | null;
  initialCategory?: WorkflowCategory;
  onSubmit: (input: {
    template: WorkflowTemplate;
    assets: UploadedAsset[];
    remark: string;
  }) => void;
  onGoCreateWorkflow?: () => void;
}) {
  useWorkflowTemplateVersion();
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [remark, setRemark] = useState("");
  const [source, setSource] = useState<WorkflowTemplateSource>("official");
  const [category, setCategory] = useState<WorkflowCategory>(initialCategory);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const templates = useMemo(
    () => getWorkflowTemplates(source, category),
    [source, category],
  );

  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (!open) {
      setAssets([]);
      setRemark("");
      return;
    }
    if (initialTemplate) {
      for (const src of SOURCE_TABS.map((t) => t.id)) {
        for (const cat of WORKFLOW_CATEGORY_TABS) {
          if (getWorkflowTemplates(src, cat).some((t) => t.id === initialTemplate.id)) {
            setSource(src);
            setCategory(cat);
            setSelectedId(initialTemplate.id);
            return;
          }
        }
      }
      setCategory(initialCategory);
      setSelectedId(initialTemplate.id);
    }
  }, [open, initialTemplate, initialCategory]);

  useEffect(() => {
    if (!open) return;
    if (initialTemplate && templates.some((t) => t.id === initialTemplate.id)) {
      setSelectedId(initialTemplate.id);
      return;
    }
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    } else if (selectedId && !templates.some((t) => t.id === selectedId)) {
      setSelectedId(templates[0]?.id ?? null);
    }
  }, [source, category, templates, open, initialTemplate, selectedId]);

  const handleSubmit = () => {
    if (assets.length === 0) {
      showTaskError("请先上传图片素材");
      return;
    }
    if (!selectedTemplate) {
      showTaskError("请选择工作流模板");
      return;
    }
    onSubmit({ template: selectedTemplate, assets, remark });
    onClose();
  };

  const sourceLabel = source === "official" ? "官方" : source === "team" ? "团队" : "我的";

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex w-[min(960px,96vw)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl"
          style={{ fontFamily: "'Inter', 'Noto Sans SC', sans-serif" }}
        >
          <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 shrink-0">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新建工作流任务</Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-none">
            <TaskMaterialUploadSection assets={assets} onAssetsChange={setAssets} maxFiles={1000} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-medium text-foreground">选择流程</div>
                {onGoCreateWorkflow && (
                  <button
                    type="button"
                    onClick={onGoCreateWorkflow}
                    className="text-[12px] text-primary hover:text-primary/80"
                  >
                    去创建工作流
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {SOURCE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSource(tab.id)}
                    className={`h-8 px-3 rounded-full border text-[12px] font-medium transition-colors ${
                      source === tab.id
                        ? "bg-muted text-foreground border-border"
                        : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
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
                    className={`h-8 px-3 rounded-full border text-[12px] font-medium transition-colors ${
                      category === tab
                        ? "bg-muted text-foreground border-border"
                        : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((tpl) => {
                  const active = selectedId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedId(tpl.id)}
                      className={`relative text-left p-4 rounded-xl border transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(242,100,25,0.35)]"
                          : "border-border bg-card hover:border-primary/35"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-2 pr-6">
                        <span className="text-[11px] font-semibold text-primary border border-primary/40 px-1.5 py-0.5 rounded">
                          {sourceLabel}
                        </span>
                        <span className="text-[14px] font-semibold text-foreground">{tpl.name}</span>
                      </div>
                      <TemplateSteps steps={tpl.steps} />
                    </button>
                  );
                })}
                {templates.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
                    当前分类暂无模板
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/80 px-5 py-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                const text = window.prompt("任务备注", remark);
                if (text !== null) setRemark(text);
              }}
              className="h-9 px-4 rounded-md border border-border text-[13px] text-foreground hover:bg-muted/40"
            >
              任务备注
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-6 rounded-md border border-border text-[13px] text-foreground hover:bg-muted/40"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="h-9 px-8 rounded-md bg-primary text-[13px] font-medium text-white hover:bg-primary/90 shadow-[0_0_16px_rgba(242,100,25,0.3)]"
              >
                提交
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
