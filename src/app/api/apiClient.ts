import { createHttpClient, http } from "../../shared/http";

export const appHttp = createHttpClient({
  headers: async () => {
    const { ensureFrontendAccessToken } = await import("../auth/useFrontendSession");
    const token = await ensureFrontendAccessToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  },
});

export {
  ApiError,
  createHttpClient,
  getApiBase,
  http,
  isApiEnabled,
  type HttpClientDefaults,
  type HttpQuery,
  type HttpRequestOptions,
} from "../../shared/http";

/** 兼容旧调用；新代码优先使用 http.get/post/put/delete */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return http.request<T>(path, init);
}
