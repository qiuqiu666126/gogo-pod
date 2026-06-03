type NavigateHandler = () => void;

let navigateToMySpaceHandler: NavigateHandler | null = null;
let navigateToWorkflowListHandler: NavigateHandler | null = null;
let navigateToTaskCenterHandler: NavigateHandler | null = null;

export function registerNavigateToMySpace(handler: NavigateHandler) {
  navigateToMySpaceHandler = handler;
  return () => {
    if (navigateToMySpaceHandler === handler) {
      navigateToMySpaceHandler = null;
    }
  };
}

export function navigateToMySpace(options?: { onBeforeNavigate?: () => void }) {
  options?.onBeforeNavigate?.();
  navigateToMySpaceHandler?.();
}

export function registerNavigateToWorkflowList(handler: NavigateHandler) {
  navigateToWorkflowListHandler = handler;
  return () => {
    if (navigateToWorkflowListHandler === handler) {
      navigateToWorkflowListHandler = null;
    }
  };
}

export function navigateToWorkflowList() {
  navigateToWorkflowListHandler?.();
}

export function registerNavigateToTaskCenter(handler: NavigateHandler) {
  navigateToTaskCenterHandler = handler;
  return () => {
    if (navigateToTaskCenterHandler === handler) {
      navigateToTaskCenterHandler = null;
    }
  };
}

export function navigateToTaskCenter() {
  navigateToTaskCenterHandler?.();
}
