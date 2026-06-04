import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, PenTool, Trash2, Video, X } from "lucide-react";
import type { WorkflowStepDraft } from "../admin/api/workflowMappers";
import type { WorkflowStepOptionGroupDto } from "../admin/api/aiWorkflowTemplateApi";
import type { FormValue } from "../shared/sceneFormSchema";
import { applyOptionChange } from "../shared/sceneFormSchema";
import { DynamicFormFields } from "./components/DynamicFormFields";
import { Switch } from "./components/ui/switch";
import { WORKFLOW_DESIGN_ADD_ITEMS, WORKFLOW_VIDEO_ADD_ITEMS } from "./workflowBuilderAddMenu";
import {
  WorkflowNodeConfigPanel,
  type WorkflowNodeConfigMap,
} from "./workflowNodeConfigPanels";
import {
  applyStepConfigsToNodeConfigs,
  applyWorkflowStepsToNodeConfigs,
  deletePipelineNode,
  getPipelineNodeIndexes,
  movePipelineNode,
  nodeConfigsToStepConfigs,
  nodesToWorkflowSteps,
  pickFallbackSelectedNodeId,
  pipelineStepsFromNodes,
  stepsToNodes,
  workflowStepsToNodes,
  type WorkflowBuilderNode,
} from "./workflowBuilderUtils";

export type { WorkflowBuilderNode } from "./workflowBuilderUtils";

export type WorkflowBuilderSavePayload = {
  steps?: string[];
  stepConfigs?: Record<string, Record<string, unknown>>;
  workflowSteps?: WorkflowStepDraft[];
};

function Connector() {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div className="w-px h-5 bg-border/70" />
      <div
        className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-primary/80"
        aria-hidden
      />
    </div>
  );
}

function ManualReviewToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pt-2 border-t border-border/60">
      <div>
        <div className="text-[13px] font-medium text-foreground">人工审核</div>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          该节点任务结束后，进行人工审核与验收
        </p>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

function LegacyAddNodeMenu({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (label: string) => void;
}) {
  const menuId = useId();

  if (!open) return null;

  return (
    <div
      id={menuId}
      role="menu"
      className="absolute left-1/2 top-full z-30 mt-2 w-[min(280px,90vw)] -translate-x-1/2 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-muted/30">
        <span className="text-[12px] font-medium text-muted-foreground">添加节点</span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="关闭"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-[min(360px,50vh)] overflow-y-auto py-1">
        <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wide">
          <PenTool size={12} />
          作图
        </div>
        {WORKFLOW_DESIGN_ADD_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => onPick(item.label)}
            className="w-full text-left px-4 py-2 text-[13px] text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {item.label}
          </button>
        ))}

        <div className="px-3 pt-3 pb-1 flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wide border-t border-border/60 mt-1">
          <Video size={12} />
          视频
        </div>
        {WORKFLOW_VIDEO_ADD_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => onPick(item.label)}
            className="w-full text-left px-4 py-2 text-[13px] text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PresetAddNodeMenu({
  open,
  onClose,
  groups,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  groups: WorkflowStepOptionGroupDto[];
  onPick: (presetId: number) => void;
}) {
  const menuId = useId();

  if (!open) return null;

  return (
    <div
      id={menuId}
      role="menu"
      className="absolute left-1/2 top-full z-30 mt-2 w-[min(320px,92vw)] -translate-x-1/2 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-muted/30">
        <span className="text-[12px] font-medium text-muted-foreground">选择场景预设</span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="关闭"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-[min(420px,56vh)] overflow-y-auto py-1">
        {groups.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-muted-foreground text-center">
            暂无可用场景预设，请先在「场景预设」中配置
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.featureCode} className="py-1">
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-primary uppercase tracking-wide">
                {group.featureName}
              </div>
              {group.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="menuitem"
                  onClick={() => onPick(preset.id)}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors"
                >
                  <div className="text-[13px] font-medium text-foreground">{preset.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {preset.sceneLabel || preset.sceneKey}
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function WorkflowBuilderEditor({
  mode = "legacy",
  initialSteps,
  initialStepConfigs,
  initialWorkflowSteps,
  stepOptionGroups = [],
  onResolvePreset,
  templateName,
  onTemplateNameChange,
  showTemplateNameField = true,
  headerLeft,
  headerTitle = "编辑工作流模板",
  saveLabel = "保存模板",
  onSave,
  className = "h-full min-h-0",
}: {
  mode?: "legacy" | "preset";
  initialSteps?: string[];
  initialStepConfigs?: Record<string, Record<string, unknown>>;
  initialWorkflowSteps?: WorkflowStepDraft[];
  stepOptionGroups?: WorkflowStepOptionGroupDto[];
  onResolvePreset?: (scenePresetId: number) => Promise<WorkflowStepDraft>;
  templateName?: string;
  onTemplateNameChange?: (name: string) => void;
  showTemplateNameField?: boolean;
  headerLeft?: ReactNode;
  headerTitle?: string;
  saveLabel?: string;
  onSave?: (payload: WorkflowBuilderSavePayload) => void;
  className?: string;
}) {
  const isPresetMode = mode === "preset";
  const initialNodes = isPresetMode
    ? workflowStepsToNodes(initialWorkflowSteps ?? [])
    : stepsToNodes(initialSteps ?? []);

  const [nodes, setNodes] = useState<WorkflowBuilderNode[]>(() => initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const lastStep = [...initialNodes].reverse().find((n) => !n.isMaterial);
    return lastStep?.id ?? initialNodes[0]?.id ?? null;
  });
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [nodeConfigs, setNodeConfigs] = useState<WorkflowNodeConfigMap>(() =>
    isPresetMode
      ? applyWorkflowStepsToNodeConfigs(initialNodes, initialWorkflowSteps ?? [])
      : applyStepConfigsToNodeConfigs(initialNodes, initialStepConfigs),
  );
  const [addingPreset, setAddingPreset] = useState(false);
  const addMenuWrapRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const pipelineIndexes = useMemo(() => getPipelineNodeIndexes(nodes), [nodes]);

  const patchNodeConfig = (nodeId: string, patch: Record<string, unknown>) => {
    setNodeConfigs((prev) => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? {}), ...patch },
    }));
  };

  const manualReview = selectedNode ? Boolean(nodeConfigs[selectedNode.id]?.manualReview) : false;

  const setManualReview = (v: boolean) => {
    if (!selectedNode) return;
    patchNodeConfig(selectedNode.id, { manualReview: v });
  };

  useEffect(() => {
    if (!addMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (addMenuWrapRef.current && !addMenuWrapRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [addMenuOpen]);

  const addLegacyNode = (label: string) => {
    const id = `node-${crypto.randomUUID()}`;
    setNodes((prev) => [...prev, { id, label }]);
    setSelectedId(id);
    setAddMenuOpen(false);
  };

  const addPresetNode = async (scenePresetId: number) => {
    if (!onResolvePreset) return;
    setAddingPreset(true);
    try {
      const step = await onResolvePreset(scenePresetId);
      const id = `node-${scenePresetId}-${crypto.randomUUID()}`;
      setNodes((prev) => [
        ...prev,
        {
          id,
          label: step.featureName,
          scenePresetId: step.scenePresetId,
          featureCode: step.featureCode,
          featureName: step.featureName,
          presetLabel: step.presetLabel,
          formFields: step.formFields,
        },
      ]);
      setNodeConfigs((prev) => ({
        ...prev,
        [id]: {
          ...step.nodeConfig,
          ...(step.manualReview ? { manualReview: true } : {}),
        },
      }));
      setSelectedId(id);
      setAddMenuOpen(false);
    } finally {
      setAddingPreset(false);
    }
  };

  const handleSave = () => {
    if (isPresetMode) {
      onSave?.({ workflowSteps: nodesToWorkflowSteps(nodes, nodeConfigs) });
      return;
    }
    onSave?.({
      steps: pipelineStepsFromNodes(nodes),
      stepConfigs: nodeConfigsToStepConfigs(nodes, nodeConfigs),
    });
  };

  const configTitle = selectedNode
    ? selectedNode.isMaterial
      ? "添加素材"
      : isPresetMode && selectedNode.presetLabel
        ? `配置${selectedNode.featureName} · ${selectedNode.presetLabel}`
        : `配置${selectedNode.label}参数`
    : "节点配置";

  const selectedValues = selectedNode
    ? (nodeConfigs[selectedNode.id] ?? {})
    : {};

  const handleDynamicFieldChange = (key: string, value: FormValue) => {
    if (!selectedNode?.formFields?.length) return;
    setNodeConfigs((prev) => {
      const current = prev[selectedNode.id] ?? {};
      return {
        ...prev,
        [selectedNode.id]: applyOptionChange(selectedNode.formFields!, current, key, value),
      };
    });
  };

  const moveNode = (nodeId: string, direction: "up" | "down") => {
    setNodes((prev) => movePipelineNode(prev, nodeId, direction));
  };

  const removeNode = (nodeId: string) => {
    setSelectedId(pickFallbackSelectedNodeId(nodes, nodeId, selectedId));
    setNodes(deletePipelineNode(nodes, nodeId));
    setNodeConfigs((prev) => {
      if (!(nodeId in prev)) return prev;
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });
  };

  const getNodeOrderState = (nodeId: string) => {
    const index = nodes.findIndex((node) => node.id === nodeId);
    const position = pipelineIndexes.indexOf(index);
    return {
      canMoveUp: position > 0,
      canMoveDown: position >= 0 && position < pipelineIndexes.length - 1,
    };
  };

  return (
    <div className={`flex flex-col bg-background text-foreground ${className}`}>
      <div className="flex items-center justify-between h-12 px-4 border-b border-border bg-secondary shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {headerLeft}
          {!headerLeft && (
            <span className="text-[13px] font-medium text-foreground/90">{headerTitle}</span>
          )}
        </div>
        {showTemplateNameField && onTemplateNameChange ? (
          <input
            value={templateName ?? ""}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            placeholder="请输入模板名称"
            className="flex-1 max-w-[min(360px,40vw)] h-8 px-3 rounded-md border border-transparent bg-transparent text-[13px] font-medium text-foreground text-center outline-none hover:border-border focus:border-primary/50 focus:bg-input-background/40 transition-colors"
          />
        ) : (
          <span className="flex-1 text-center text-[13px] font-medium text-foreground truncate px-2">
            {templateName || headerTitle}
          </span>
        )}
        {onSave && (
          <button
            type="button"
            onClick={handleSave}
            disabled={addingPreset}
            className="h-8 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-[0_0_16px_rgba(242,100,25,0.25)] shrink-0 disabled:opacity-60"
          >
            {saveLabel}
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div
          className="relative flex-1 overflow-auto"
          style={{
            backgroundColor: "#f6f7f9",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.35) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="min-h-full flex justify-center py-10 px-4">
            <div className="flex flex-col items-center">
              <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[12px] font-medium shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                开始
              </div>

              {nodes.map((node) => {
                const { canMoveUp, canMoveDown } = getNodeOrderState(node.id);

                return (
                <div key={node.id} className="flex flex-col items-center w-full">
                  <Connector />
                  <div className="flex items-start gap-1.5">
                    {!node.isMaterial && (
                      <div className="flex flex-col gap-0.5 pt-2 shrink-0">
                        <button
                          type="button"
                          aria-label="上移节点"
                          disabled={!canMoveUp}
                          onClick={() => moveNode(node.id, "up")}
                          className="w-6 h-6 rounded-md border border-border/70 bg-secondary/80 text-muted-foreground flex items-center justify-center hover:border-primary/40 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label="下移节点"
                          disabled={!canMoveDown}
                          onClick={() => moveNode(node.id, "down")}
                          className="w-6 h-6 rounded-md border border-border/70 bg-secondary/80 text-muted-foreground flex items-center justify-center hover:border-primary/40 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    )}
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => setSelectedId(node.id)}
                        className={`relative w-[148px] rounded-lg text-left transition-all ${
                          node.isMaterial
                            ? "h-[52px] border border-dashed px-3 flex items-center justify-center"
                            : "min-h-[58px] border px-3 py-2.5"
                        } ${
                          selectedId === node.id
                            ? "border-primary bg-secondary shadow-[0_0_0_1px_rgba(242,100,25,0.5),0_8px_24px_rgba(242,100,25,0.12)]"
                            : "border-border bg-secondary/90 hover:border-primary/35"
                        }`}
                      >
                        <div
                          className={`text-[13px] font-medium ${
                            node.isMaterial ? "text-center text-muted-foreground w-full" : "text-foreground"
                          }`}
                        >
                          {node.label}
                        </div>
                        {!node.isMaterial && (
                          <div className="mt-1 flex items-center text-[11px] text-muted-foreground">
                            配置参数
                            <ChevronRight size={12} className="ml-0.5 text-primary/80" />
                          </div>
                        )}
                      </button>
                      {!node.isMaterial && (
                        <button
                          type="button"
                          aria-label="删除节点"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeNode(node.id);
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border border-border bg-card text-muted-foreground shadow-sm flex items-center justify-center hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-opacity ${
                            selectedId === node.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}

              <Connector />
              <div ref={addMenuWrapRef} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setAddMenuOpen((v) => !v)}
                  disabled={addingPreset}
                  aria-expanded={addMenuOpen}
                  aria-haspopup="menu"
                  className={`w-7 h-7 rounded-full border text-[16px] leading-none flex items-center justify-center transition-colors ${
                    addMenuOpen
                      ? "border-primary bg-primary text-white shadow-[0_0_16px_rgba(242,100,25,0.4)]"
                      : "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
                  } disabled:opacity-60`}
                >
                  +
                </button>
                {isPresetMode ? (
                  <PresetAddNodeMenu
                    open={addMenuOpen}
                    onClose={() => setAddMenuOpen(false)}
                    groups={stepOptionGroups}
                    onPick={(presetId) => void addPresetNode(presetId)}
                  />
                ) : (
                  <LegacyAddNodeMenu
                    open={addMenuOpen}
                    onClose={() => setAddMenuOpen(false)}
                    onPick={addLegacyNode}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-[min(420px,42vw)] shrink-0 border-l border-border bg-card flex flex-col min-h-0">
          <div className="px-5 py-4 border-b border-border shrink-0">
            <h2 className="text-[15px] font-semibold text-foreground">{configTitle}</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-none">
            {selectedNode ? (
              selectedNode.isMaterial ? (
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  工作流起始节点。用户创建任务时在此步骤上传或选择素材，后续节点将基于素材依次执行。
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-end gap-2 pb-1 border-b border-border/60">
                    <button
                      type="button"
                      aria-label="上移节点"
                      disabled={!getNodeOrderState(selectedNode.id).canMoveUp}
                      onClick={() => moveNode(selectedNode.id, "up")}
                      className="h-7 px-2 rounded-md border border-border text-[12px] text-foreground hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      aria-label="下移节点"
                      disabled={!getNodeOrderState(selectedNode.id).canMoveDown}
                      onClick={() => moveNode(selectedNode.id, "down")}
                      className="h-7 px-2 rounded-md border border-border text-[12px] text-foreground hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      下移
                    </button>
                    <button
                      type="button"
                      aria-label="删除节点"
                      onClick={() => removeNode(selectedNode.id)}
                      className="h-7 px-2 rounded-md border border-destructive/30 text-[12px] text-destructive hover:bg-destructive/5"
                    >
                      删除
                    </button>
                  </div>
                  {isPresetMode && selectedNode.formFields?.length ? (
                    <>
                      <DynamicFormFields
                        fields={selectedNode.formFields}
                        values={selectedValues as Record<string, FormValue>}
                        onChange={handleDynamicFieldChange}
                      />
                      <ManualReviewToggle enabled={manualReview} onChange={setManualReview} />
                    </>
                  ) : (
                    <WorkflowNodeConfigPanel
                      key={selectedNode.id}
                      nodeLabel={selectedNode.label}
                      isMaterial={selectedNode.isMaterial}
                      config={nodeConfigs[selectedNode.id] ?? {}}
                      onConfigChange={(patch) => patchNodeConfig(selectedNode.id, patch)}
                      manualReview={manualReview}
                      onManualReviewChange={setManualReview}
                    />
                  )}
                </div>
              )
            ) : (
              <p className="text-[13px] text-muted-foreground">点击左侧节点查看并编辑参数</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
