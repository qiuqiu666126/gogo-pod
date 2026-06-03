import type { FormControl } from "../shared/sceneFormSchema";
import type { WorkflowStepDraft } from "../admin/api/workflowMappers";
import type { WorkflowNodeConfigMap } from "./workflowNodeConfigPanels";

export type WorkflowBuilderNode = {
  id: string;
  label: string;
  isMaterial?: boolean;
  scenePresetId?: number;
  featureCode?: string;
  featureName?: string;
  presetLabel?: string;
  formFields?: FormControl[];
};

export function normalizeWorkflowBuilderSteps(steps: string[]): string[] {
  const pipeline = steps.filter((s) => s !== "添加素材");
  return ["添加素材", ...pipeline];
}

export function stepsToNodes(steps: string[]): WorkflowBuilderNode[] {
  return normalizeWorkflowBuilderSteps(steps).map((label, index) => ({
    id: `node-${index}-${label}`,
    label,
    isMaterial: label === "添加素材",
  }));
}

/** 持久化用：去掉「添加素材」，仅保留处理节点名称 */
export function pipelineStepsFromNodes(nodes: WorkflowBuilderNode[]): string[] {
  return nodes.filter((n) => !n.isMaterial).map((n) => n.label);
}

export function applyStepConfigsToNodeConfigs(
  nodes: WorkflowBuilderNode[],
  stepConfigs?: Record<string, Record<string, unknown>>,
): WorkflowNodeConfigMap {
  if (!stepConfigs) return {};
  const out: WorkflowNodeConfigMap = {};
  for (const node of nodes) {
    if (node.isMaterial) continue;
    const cfg = stepConfigs[node.label];
    if (cfg) out[node.id] = { ...cfg };
  }
  return out;
}

export function nodeConfigsToStepConfigs(
  nodes: WorkflowBuilderNode[],
  nodeConfigs: WorkflowNodeConfigMap,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const node of nodes) {
    if (node.isMaterial) continue;
    const cfg = nodeConfigs[node.id];
    if (cfg && Object.keys(cfg).length > 0) out[node.label] = { ...cfg };
  }
  return out;
}

const MATERIAL_NODE: WorkflowBuilderNode = {
  id: "node-material",
  label: "添加素材",
  isMaterial: true,
};

export function workflowStepsToNodes(steps: WorkflowStepDraft[]): WorkflowBuilderNode[] {
  const pipeline = steps.map((step, index) => ({
    id: `node-${step.scenePresetId}-${index}`,
    label: step.featureName,
    scenePresetId: step.scenePresetId,
    featureCode: step.featureCode,
    featureName: step.featureName,
    presetLabel: step.presetLabel,
    formFields: step.formFields,
  }));
  return [MATERIAL_NODE, ...pipeline];
}

export function nodesToWorkflowSteps(
  nodes: WorkflowBuilderNode[],
  nodeConfigs: WorkflowNodeConfigMap,
): WorkflowStepDraft[] {
  return nodes
    .filter((node) => !node.isMaterial && node.scenePresetId)
    .map((node) => {
      const cfg = nodeConfigs[node.id] ?? {};
      const manualReview = Boolean(cfg.manualReview);
      const nodeConfig = { ...cfg };
      delete nodeConfig.manualReview;

      return {
        scenePresetId: node.scenePresetId!,
        featureCode: node.featureCode ?? "",
        featureName: node.featureName ?? node.label,
        presetLabel: node.presetLabel ?? "",
        formFields: node.formFields ?? [],
        nodeConfig,
        manualReview,
      };
    });
}

export function applyWorkflowStepsToNodeConfigs(
  nodes: WorkflowBuilderNode[],
  steps: WorkflowStepDraft[],
): WorkflowNodeConfigMap {
  const out: WorkflowNodeConfigMap = {};
  const pipelineNodes = nodes.filter((node) => !node.isMaterial);

  steps.forEach((step, index) => {
    const node = pipelineNodes[index];
    if (!node) return;
    out[node.id] = {
      ...step.nodeConfig,
      ...(step.manualReview ? { manualReview: true } : {}),
    };
  });

  return out;
}
