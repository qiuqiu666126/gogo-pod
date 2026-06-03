import type { FormControl } from "../../shared/sceneFormSchema";
import { collectDefaultValues } from "../../shared/sceneFormSchema";
import type {
  WorkflowStepDetailDto,
  WorkflowTemplateDetailDto,
  WorkflowTemplateSavePayload,
} from "./aiWorkflowTemplateApi";

export type WorkflowStepDraft = {
  scenePresetId: number;
  featureCode: string;
  featureName: string;
  presetLabel: string;
  formFields: FormControl[];
  nodeConfig: Record<string, unknown>;
  manualReview: boolean;
};

export type WorkflowTemplateDraft = {
  id?: number;
  templateUuid?: string;
  name: string;
  categoryCode: string;
  enabled: boolean;
  sortOrder: number;
  workflowSteps: WorkflowStepDraft[];
};

export function mapWorkflowStepDetailToDraft(step: WorkflowStepDetailDto): WorkflowStepDraft {
  const formFields = step.formFields ?? [];

  return {
    scenePresetId: step.scenePresetId,
    featureCode: step.featureCode,
    featureName: step.featureName,
    presetLabel: step.presetLabel ?? step.sceneLabel ?? "",
    formFields,
    nodeConfig: { ...(step.nodeConfig ?? {}) },
    manualReview: Boolean(step.manualReview),
  };
}

export function mapWorkflowDetailToDraft(detail: WorkflowTemplateDetailDto): WorkflowTemplateDraft {
  return {
    id: detail.id,
    templateUuid: detail.templateUuid,
    name: detail.name,
    categoryCode: detail.categoryCode,
    enabled: detail.enabled,
    sortOrder: detail.sortOrder,
    workflowSteps: detail.steps.map(mapWorkflowStepDetailToDraft),
  };
}

export function buildWorkflowTemplateSavePayload(
  draft: WorkflowTemplateDraft,
): WorkflowTemplateSavePayload {
  return {
    name: draft.name.trim(),
    categoryCode: draft.categoryCode,
    enabled: draft.enabled,
    sortOrder: draft.sortOrder,
    steps: draft.workflowSteps.map((step) => ({
      scenePresetId: step.scenePresetId,
      nodeConfig: { ...step.nodeConfig },
      manualReview: step.manualReview,
    })),
  };
}

export function mergeNodeConfigWithDefaults(
  formFields: FormControl[],
  nodeConfig: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...collectDefaultValues(formFields),
    ...nodeConfig,
  };
}

export function stepDisplayName(step: Pick<WorkflowStepDraft, "featureName" | "presetLabel">) {
  return step.featureName;
}

export function workflowStepsToSummary(steps: WorkflowStepDraft[]) {
  return steps.map(stepDisplayName).join(" > ");
}
