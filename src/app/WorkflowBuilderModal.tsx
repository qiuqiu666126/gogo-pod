import { ArrowLeft } from "lucide-react";
import {
  WorkflowBuilderEditor,
  type WorkflowBuilderSavePayload,
} from "./WorkflowBuilderEditor";

export function WorkflowBuilderModal({
  open,
  templateName,
  initialSteps,
  initialStepConfigs,
  onClose,
  onConfirm,
}: {
  open: boolean;
  templateName: string;
  initialSteps: string[];
  initialStepConfigs?: Record<string, Record<string, unknown>>;
  onClose: () => void;
  onConfirm: (payload: WorkflowBuilderSavePayload) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <WorkflowBuilderEditor
        key={`${templateName}-${initialSteps.join("|")}`}
        className="h-full"
        initialSteps={initialSteps}
        initialStepConfigs={initialStepConfigs}
        templateName={templateName}
        showTemplateNameField={false}
        headerTitle="配置工作流"
        saveLabel="完成配置"
        headerLeft={
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-[13px] text-foreground/90 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            返回
          </button>
        }
        onSave={onConfirm}
      />
    </div>
  );
}
