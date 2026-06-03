import type { WorkflowNodeConfigMap } from "./workflowNodeConfigPanels";

export type WorkflowBuilderNode = {
  id: string;
  label: string;
  isMaterial?: boolean;
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
