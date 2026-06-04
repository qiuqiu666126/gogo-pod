import { Check } from "lucide-react";
import { toast } from "sonner";
import { navigateToDownloadCenter, navigateToProductLibrary } from "./appNavigation";
import { FEATURE_TASK_LABELS, type FeatureTaskType } from "./featureTasks";

const TOAST_DURATION_MS = 3200;

/** 与产品稿一致的成功提示：浅绿底、绿色描边、圆形对勾 */
export function SuccessNotice({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 px-4 py-3 min-w-[280px] max-w-[min(560px,92vw)] rounded-md border border-[#95d5a8] bg-[#e6f7ed] text-[#1a7a3f] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#22a34a] shrink-0">
        <Check size={12} className="text-white" strokeWidth={3} />
      </span>
      <span className="text-[14px] leading-snug font-medium">{message}</span>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="text-[14px] font-semibold text-primary underline-offset-2 hover:underline"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function showSuccessNotice(
  message: string,
  options?: { actionLabel?: string; onAction?: () => void; duration?: number },
) {
  toast.custom((toastId) => (
    <SuccessNotice
      message={message}
      actionLabel={options?.actionLabel}
      onAction={() => {
        toast.dismiss(toastId);
        options?.onAction?.();
      }}
    />
  ), {
    duration: options?.duration ?? TOAST_DURATION_MS,
    position: "top-center",
  });
}

function showPersistentSuccessNotice(
  message: string,
  options: { actionLabel: string; onAction: () => void },
) {
  showSuccessNotice(message, {
    ...options,
    duration: 6000,
  });
}

function showBasicSuccessNotice(message: string) {
  toast.custom(() => <SuccessNotice message={message} />, {
    duration: TOAST_DURATION_MS,
    position: "top-center",
  });
}

export function showTaskCreatedSuccess(type: FeatureTaskType) {
  const label = FEATURE_TASK_LABELS[type];
  showBasicSuccessNotice(`已成功创建「${label}」任务`);
}

export function showWorkflowCreatedSuccess(templateName?: string) {
  const name = templateName?.trim();
  showBasicSuccessNotice(
    name ? `已成功创建「${name}」工作流任务` : "已成功创建工作流任务",
  );
}

export function showSaveToProductLibrarySuccess(_count: number) {
  showPersistentSuccessNotice("提交保存成功", {
    actionLabel: "点击前往商品库查看",
    onAction: navigateToProductLibrary,
  });
}

export function showDownloadStartedSuccess() {
  showPersistentSuccessNotice("已在后台进行下载", {
    actionLabel: "去下载中心查看",
    onAction: navigateToDownloadCenter,
  });
}

export function showTaskActionSuccess(message: string) {
  showBasicSuccessNotice(message);
}

export function showTaskError(message: string) {
  toast.error(message, { position: "top-center", duration: TOAST_DURATION_MS });
}
