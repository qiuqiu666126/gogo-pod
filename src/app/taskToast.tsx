import { Check } from "lucide-react";
import { toast } from "sonner";
import { FEATURE_TASK_LABELS, type FeatureTaskType } from "./featureTasks";

const TOAST_DURATION_MS = 3200;

/** 与产品稿一致的成功提示：浅绿底、绿色描边、圆形对勾 */
export function SuccessNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 px-5 py-3 min-w-[280px] max-w-[min(520px,92vw)] rounded-md border border-[#95d5a8] bg-[#e6f7ed] text-[#1a7a3f] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#22a34a] shrink-0">
        <Check size={14} className="text-white" strokeWidth={3} />
      </span>
      <span className="text-[14px] leading-snug font-medium">{message}</span>
    </div>
  );
}

function showSuccessNotice(message: string) {
  toast.custom(() => <SuccessNotice message={message} />, {
    duration: TOAST_DURATION_MS,
    position: "top-center",
  });
}

export function showTaskCreatedSuccess(type: FeatureTaskType) {
  const label = FEATURE_TASK_LABELS[type];
  showSuccessNotice(`已成功创建「${label}」任务`);
}

export function showWorkflowCreatedSuccess(templateName?: string) {
  const name = templateName?.trim();
  showSuccessNotice(
    name ? `已成功创建「${name}」工作流任务` : "已成功创建工作流任务",
  );
}

export function showSaveToProductLibrarySuccess(count: number) {
  showSuccessNotice(`已成功保存 ${count} 个商品到商品库`);
}

export function showTaskActionSuccess(message: string) {
  showSuccessNotice(message);
}

export function showTaskError(message: string) {
  toast.error(message, { position: "top-center", duration: TOAST_DURATION_MS });
}
