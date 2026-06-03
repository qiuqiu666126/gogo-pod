import { getFrontendSession } from "../shared/frontendUsers";

/** 未登录时的回退操作人 */
export const DEFAULT_OPERATOR = "小明";

/** 当前登录用户展示名（任务、工作流操作人） */
export function getCurrentOperator(): string {
  return getFrontendSession()?.displayName ?? DEFAULT_OPERATOR;
}
