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

/** 获取可编排的处理节点（不含「添加素材」）在 nodes 中的下标 */
export function getPipelineNodeIndexes(nodes: WorkflowBuilderNode[]): number[] {
  return nodes.flatMap((node, index) => (node.isMaterial ? [] : [index]));
}

export function movePipelineNode(
  nodes: WorkflowBuilderNode[],
  nodeId: string,
  direction: "up" | "down",
): WorkflowBuilderNode[] {
  const currentIndex = nodes.findIndex((node) => node.id === nodeId);
  if (currentIndex < 0 || nodes[currentIndex]?.isMaterial) {
    return nodes;
  }

  const pipelineIndexes = getPipelineNodeIndexes(nodes);
  const position = pipelineIndexes.indexOf(currentIndex);
  if (position < 0) {
    return nodes;
  }

  const targetPosition = direction === "up" ? position - 1 : position + 1;
  const targetIndex = pipelineIndexes[targetPosition];
  if (targetIndex === undefined) {
    return nodes;
  }

  const next = [...nodes];
  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
  return next;
}

export function deletePipelineNode(nodes: WorkflowBuilderNode[], nodeId: string): WorkflowBuilderNode[] {
  const target = nodes.find((node) => node.id === nodeId);
  if (!target || target.isMaterial) {
    return nodes;
  }
  return nodes.filter((node) => node.id !== nodeId);
}

export function pickFallbackSelectedNodeId(
  nodes: WorkflowBuilderNode[],
  removedNodeId: string,
  previousSelectedId: string | null,
): string | null {
  if (previousSelectedId !== removedNodeId) {
    return previousSelectedId;
  }

  const pipelineIndexes = getPipelineNodeIndexes(nodes);
  const removedIndex = nodes.findIndex((node) => node.id === removedNodeId);
  if (removedIndex < 0) {
    return nodes.find((node) => !node.isMaterial)?.id ?? nodes[0]?.id ?? null;
  }

  const position = pipelineIndexes.indexOf(removedIndex);
  const fallbackIndex =
    pipelineIndexes[position] ??
    pipelineIndexes[position - 1] ??
    pipelineIndexes[0] ??
    nodes.findIndex((node) => node.isMaterial);

  return fallbackIndex >= 0 ? nodes[fallbackIndex]?.id ?? null : null;
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
