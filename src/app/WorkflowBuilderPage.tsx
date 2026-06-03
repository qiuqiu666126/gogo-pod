import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { WorkflowBuilderEditor } from "./WorkflowBuilderEditor";
import { normalizeWorkflowBuilderSteps } from "./workflowBuilderUtils";

export { normalizeWorkflowBuilderSteps } from "./workflowBuilderUtils";

export function WorkflowBuilderPage({
  initialTemplateName,
  initialSteps = ["添加素材"],
  initialStepConfigs,
  onBack,
}: {
  initialTemplateName: string;
  initialSteps?: string[];
  initialStepConfigs?: Record<string, Record<string, unknown>>;
  onBack: () => void;
}) {
  const [templateName, setTemplateName] = useState(initialTemplateName);

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col">
      <WorkflowBuilderEditor
        className="flex-1 min-h-0"
        initialSteps={initialSteps}
        initialStepConfigs={initialStepConfigs}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        headerLeft={
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-foreground/90 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            编辑工作流模板
          </button>
        }
        onSave={() => {
          /* 用户端保存模板逻辑可在此扩展 */
        }}
      />
    </div>
  );
}
