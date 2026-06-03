import { createHttpClient } from "../../shared/http";

export type FrontendLoginPayload = {
  username: string;
  password: string;
};

export type FrontendLoginData = {
  access_token: string;
  refresh_token: string;
  expire_at: number;
};

export type FrontendUserInfo = {
  id: number;
  username: string;
  user_type?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  signed?: string;
  status?: number;
  login_ip?: string;
  login_time?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  remark?: string;
  policy?: {
    policy_type: string;
    is_default: boolean;
    value: Record<string, unknown>;
  };
  role?: {
    id: number;
    code: string;
    name: string;
  } | null;
  roles?: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  plan?: string;
  plan_label?: string;
};

const passportHttp = createHttpClient({ assertSuccess: true });

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function loginFrontend(payload: FrontendLoginPayload): Promise<FrontendLoginData> {
  return passportHttp.post<FrontendLoginData>("/api/v1/login", payload, {
    fallbackMessage: "登录失败",
  });
}

export async function refreshFrontendToken(refreshToken: string): Promise<FrontendLoginData> {
  return passportHttp.post<FrontendLoginData>("/api/v1/refresh", undefined, {
    fallbackMessage: "刷新登录状态失败",
    headers: authHeaders(refreshToken),
  });
}

export async function getFrontendUserInfo(accessToken: string): Promise<FrontendUserInfo> {
  return passportHttp.get<FrontendUserInfo>("/api/v1/user/info", {
    fallbackMessage: "获取用户信息失败",
    headers: authHeaders(accessToken),
  });
}

export async function logoutFrontend(accessToken: string): Promise<void> {
  await passportHttp.post<unknown>("/api/v1/logout", undefined, {
    fallbackMessage: "退出登录失败",
    headers: authHeaders(accessToken),
  });
}
