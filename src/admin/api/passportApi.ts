import { createHttpClient } from "../../shared/http";

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

const passportHttp = createHttpClient({ assertSuccess: true });

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function authOptions(accessToken: string, fallbackMessage: string) {
  return {
    fallbackMessage,
    headers: authHeaders(accessToken),
  };
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AdminLoginData> {
  return passportHttp.post<AdminLoginData>("/admin/passport/login", payload, {
    fallbackMessage: "登录失败",
  });
}

export async function refreshAdminToken(refreshToken: string): Promise<AdminLoginData> {
  return passportHttp.post<AdminLoginData>(
    "/admin/passport/refresh",
    undefined,
    authOptions(refreshToken, "刷新登录状态失败"),
  );
}

export async function getAdminInfo(accessToken: string): Promise<AdminUserInfo> {
  return passportHttp.get<AdminUserInfo>(
    "/admin/passport/getInfo",
    authOptions(accessToken, "获取用户信息失败"),
  );
}

export async function logoutAdmin(accessToken: string): Promise<void> {
  await passportHttp.post<unknown>(
    "/admin/passport/logout",
    undefined,
    authOptions(accessToken, "退出登录失败"),
  );
}
