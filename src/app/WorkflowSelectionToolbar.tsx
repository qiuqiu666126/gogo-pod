import { TaskDetailBatchBar } from "./TaskDetailBatchBar";
import type { DesignFeatureId } from "./designFeatureActions";

export function WorkflowSelectionToolbar({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearSelection,
  onSaveToProductLibrary,
  onDownload,
  onDiscard,
  onRecover,
  onOpenFeature,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onSaveToProductLibrary?: () => void;
  onDownload?: () => void;
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
      onDownload={onDownload}
      onDiscard={onDiscard}
      onRecover={onRecover}
      onOpenFeature={onOpenFeature}
    />
  );
}
