import { TaskDetailBatchBar } from "./TaskDetailBatchBar";
import type { DesignFeatureId } from "./designFeatureActions";

export function WorkflowSelectionToolbar({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearSelection,
  onSaveToProductLibrary,
  onDiscard,
  onRecover,
  onOpenFeature,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onSaveToProductLibrary?: () => void;
  onDiscard?: () => void;
  onRecover?: () => void;
  onOpenFeature: (featureId: DesignFeatureId) => void;
}) {
  return (
    <TaskDetailBatchBar
      selectedCount={selectedCount}
      totalSelectable={totalSelectable}
      onSelectAll={onSelectAll}
      onClearSelection={onClearSelection}
      onSaveToProductLibrary={onSaveToProductLibrary}
      onDownload={() => {}}
      onDiscard={onDiscard}
      onRecover={onRecover}
      onTag={() => {}}
      onOpenFeature={onOpenFeature}
    />
  );
}
