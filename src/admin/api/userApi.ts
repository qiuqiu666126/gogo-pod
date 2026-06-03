import { http } from "../../shared/http";

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

type MaybeWrappedResponse<T> =
  | T
  | {
      code: number;
      message: string;
      data: T;
    };

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function unwrapResponse<T>(res: MaybeWrappedResponse<T>, fallbackMessage: string): T {
  if (res && typeof res === "object" && "code" in res && "data" in res) {
    if (res.code !== 200) {
      throw new Error(res.message || fallbackMessage);
    }
    return res.data;
  }
  return res as T;
}

export async function getAdminUserList(
  params: AdminUserListParams,
  accessToken: string,
): Promise<AdminUserListResponse> {
  const res = await http.get<MaybeWrappedResponse<AdminUserListResponse>>(
    "/admin/front-user/list",
    {
      headers: authHeaders(accessToken),
      query: {
        page: params.page,
        page_size: params.page_size,
        keyword: params.keyword ?? "",
        status: params.status,
      },
    },
  );

  return unwrapResponse(res, "获取用户账号列表失败");
}

export async function getAdminUserStats(
  params: AdminUserListParams,
  accessToken: string,
): Promise<AdminUserStatsResponse> {
  const res = await http.get<MaybeWrappedResponse<AdminUserStatsResponse>>(
    "/admin/front-user/stats",
    {
      headers: authHeaders(accessToken),
      query: {
        page: params.page,
        page_size: params.page_size,
        keyword: params.keyword ?? "",
        status: params.status,
      },
    },
  );

  return unwrapResponse(res, "获取用户账号统计失败");
}

export async function createFrontUser(
  body: CreateFrontUserBody,
  accessToken: string,
): Promise<unknown> {
  const res = await http.post<MaybeWrappedResponse<unknown>>(
    "/admin/front-user",
    body,
    { headers: authHeaders(accessToken) },
  );

  return unwrapResponse(res, "创建用户失败");
}
