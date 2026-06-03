import { http } from "../../shared/http";

export type AdminLoginPayload = {
  username: string;
  password: string;
};

export type AdminLoginData = {
  access_token: string;
  refresh_token: string;
  expire_at: number;
};

export type AdminUserInfo = {
  id: number;
  username: string;
  user_type: string;
  nickname: string;
  phone: string;
  email: string;
  avatar: string;
  signed: string;
  status: number;
  login_ip: string;
  login_time: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  remark: string;
  policy: {
    policy_type: string;
    is_default: boolean;
    value: Record<string, unknown>;
  };
};

type AdminApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

function assertSuccess<T>(res: AdminApiResponse<T>, fallbackMessage: string) {
  if (res.code !== 200) {
    throw new Error(res.message || fallbackMessage);
  }
  return res.data;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AdminLoginData> {
  const res = await http.post<AdminApiResponse<AdminLoginData>>(
    "/admin/passport/login",
    payload,
  );

  return assertSuccess(res, "登录失败");
}

export async function refreshAdminToken(refreshToken: string): Promise<AdminLoginData> {
  const res = await http.post<AdminApiResponse<AdminLoginData>>(
    "/admin/passport/refresh",
    undefined,
    { headers: authHeaders(refreshToken) },
  );

  return assertSuccess(res, "刷新登录状态失败");
}

export async function getAdminInfo(accessToken: string): Promise<AdminUserInfo> {
  const res = await http.get<AdminApiResponse<AdminUserInfo>>(
    "/admin/passport/getInfo",
    { headers: authHeaders(accessToken) },
  );

  return assertSuccess(res, "获取用户信息失败");
}

export async function logoutAdmin(accessToken: string): Promise<void> {
  const res = await http.post<AdminApiResponse<unknown>>(
    "/admin/passport/logout",
    undefined,
    { headers: authHeaders(accessToken) },
  );

  assertSuccess(res, "退出登录失败");
}
