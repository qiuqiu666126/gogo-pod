import { adminHttp } from "./adminApi";

export type AdminUserListParams = {
  page: number;
  page_size: number;
  keyword?: string;
  status?: number;
};

export type FrontUserRole = {
  id: number;
  code: string;
  name: string;
};

export type FrontUserInfo = {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  plan: string;
  plan_label: string;
  status: number;
  login_time: string;
  login_time_text: string;
  remark: string;
  role: FrontUserRole | null;
  roles: FrontUserRole[];
  created_at: string;
  updated_at: string;
};

export type AdminUserListResponse = {
  total: number;
  list: FrontUserInfo[];
};

export type AdminUserStatsResponse = Partial<{
  total: number;
  normal: number;
  active: number;
  enabled: number;
  disabled: number;
  stopped: number;
}>;

export type CreateFrontUserBody = {
  username: string;
  nickname: string;
  password: string;
  email: string;
  phone: string;
  role_code: string;
  plan: string;
  status: number;
  remark: string;
};

export async function getAdminUserList(
  params: AdminUserListParams,
): Promise<AdminUserListResponse> {
  return adminHttp.get<AdminUserListResponse>("/admin/front-user/list", {
    fallbackMessage: "获取用户账号列表失败",
    query: {
      page: params.page,
      page_size: params.page_size,
      keyword: params.keyword ?? "",
      status: params.status,
    },
  });
}

export async function getAdminUserStats(
  params: AdminUserListParams,
): Promise<AdminUserStatsResponse> {
  return adminHttp.get<AdminUserStatsResponse>("/admin/front-user/stats", {
    fallbackMessage: "获取用户账号统计失败",
    query: {
      page: params.page,
      page_size: params.page_size,
      keyword: params.keyword ?? "",
      status: params.status,
    },
  });
}

export async function createFrontUser(
  body: CreateFrontUserBody,
): Promise<unknown> {
  return adminHttp.post<unknown>("/admin/front-user", body, {
    fallbackMessage: "创建用户失败",
  });
}
