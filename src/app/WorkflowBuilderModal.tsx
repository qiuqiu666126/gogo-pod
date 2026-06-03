import {
  WorkflowBuilderEditor,
  type WorkflowBuilderSavePayload,
} from "./WorkflowBuilderEditor";
import type { WorkflowStepDraft } from "../admin/api/workflowMappers";
import type { WorkflowStepOptionGroupDto } from "../admin/api/aiWorkflowTemplateApi";
import { ArrowLeft } from "lucide-react";

export function WorkflowBuilderModal({
  open,
  templateName,
  mode = "legacy",
  initialSteps,
  initialStepConfigs,
  initialWorkflowSteps,
  stepOptionGroups,
  onResolvePreset,
  onClose,
  onConfirm,
}: {
  open: boolean;
  templateName: string;
  mode?: "legacy" | "preset";
  initialSteps?: string[];
  initialStepConfigs?: Record<string, Record<string, unknown>>;
  initialWorkflowSteps?: WorkflowStepDraft[];
  stepOptionGroups?: WorkflowStepOptionGroupDto[];
  onResolvePreset?: (scenePresetId: number) => Promise<WorkflowStepDraft>;
  onClose: () => void;
  onConfirm: (payload: WorkflowBuilderSavePayload) => void;
}) {
  if (!open) return null;

  const builderKey = isPresetModeKey(mode, initialWorkflowSteps, initialSteps);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <WorkflowBuilderEditor
        key={builderKey}
        mode={mode}
        className="h-full"
        initialSteps={initialSteps}
        initialStepConfigs={initialStepConfigs}
        initialWorkflowSteps={initialWorkflowSteps}
        stepOptionGroups={stepOptionGroups}
        onResolvePreset={onResolvePreset}
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

function isPresetModeKey(
  mode: "legacy" | "preset",
  workflowSteps?: WorkflowStepDraft[],
  steps?: string[],
) {
  if (mode === "preset") {
    return `${workflowSteps?.map((step) => step.scenePresetId).join("|") ?? "empty"}`;
  }
  return `${steps?.join("|") ?? "empty"}`;
}
