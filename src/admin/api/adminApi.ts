import {
  createHttpClient,
  type ApiResponseEnvelope,
} from "../../shared/http";

export type AdminApiResponse<T> = ApiResponseEnvelope<T>;

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

export const adminHttp = createHttpClient({
  assertSuccess: true,
  headers: getAdminAuthHeaders,
});
