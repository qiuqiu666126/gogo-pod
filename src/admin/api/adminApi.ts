export type AdminApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

/** 返回有效的 access_token（临近过期时自动 refresh） */
export async function getAdminAuthHeaders() {
  const { ensureAdminAccessToken } = await import("../store");
  const token = await ensureAdminAccessToken();
  return authHeaders(token);
}

export function assertSuccess<T>(res: AdminApiResponse<T>, fallbackMessage: string): T {
  if (res.code !== 200) {
    throw new Error(res.message || fallbackMessage);
  }
  return res.data;
}
