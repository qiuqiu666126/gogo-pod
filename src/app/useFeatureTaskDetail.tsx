import { useState } from "react";
import { FeatureTaskDetailPage } from "./FeatureTaskDetailPage";
import {
  deleteFeatureTask,
  type FeatureTaskType,
  useFeatureTasks,
} from "./featureTasks";

/** 功能详情页：任务列表 + 详情页切换 */
export function useFeatureTaskDetail(type: FeatureTaskType) {
  const { tasks, submitTask } = useFeatureTasks(type);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = detailTaskId ? tasks.find((t) => t.id === detailTaskId) : null;

  const listProps = {
    tasks,
    onViewDetail: setDetailTaskId,
    onDelete: (taskId: string) => {
      deleteFeatureTask(type, taskId);
      if (detailTaskId === taskId) setDetailTaskId(null);
    },
  };

  const DetailView =
    detailTask && detailTaskId ? (
      <FeatureTaskDetailPage
        task={detailTask}
        taskType={type}
        onBack={() => setDetailTaskId(null)}
      />
    ) : null;

  return { tasks, submitTask, listProps, DetailView, detailTaskId };
}
