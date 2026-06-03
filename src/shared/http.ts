export type HttpQueryValue = string | number | boolean | null | undefined;
export type HttpQuery = URLSearchParams | Record<string, HttpQueryValue | HttpQueryValue[]>;

export type HttpResponseParser = "json" | "text" | "blob" | "arrayBuffer" | "raw" | "none";

export type HttpRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  baseUrl?: string;
  body?: unknown;
  headers?: HeadersInit;
  query?: HttpQuery;
  responseType?: HttpResponseParser;
  timeoutMs?: number;
};

export type HttpClientDefaults = {
  baseUrl?: string;
  headers?: HeadersInit;
  timeoutMs?: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
    public url?: string,
    public method?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 后台 API 根地址，如 https://api.example.com；留空则开发模式走 Vite /api 代理 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return raw?.replace(/\/$/, "") ?? "";
}

export function isApiEnabled(): boolean {
  return Boolean(getApiBase()) || import.meta.env.DEV;
}

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

function buildPath(path: string, baseUrl?: string) {
  if (isAbsoluteUrl(path)) return path;
  const base = baseUrl?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function serializeQuery(query?: HttpQuery) {
  if (!query) return "";
  if (query instanceof URLSearchParams) return query.toString();

  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value === null || value === undefined) continue;
      params.append(key, String(value));
    }
  }
  return params.toString();
}

function buildUrl(path: string, baseUrl?: string, query?: HttpQuery) {
  const url = buildPath(path, baseUrl);
  const queryString = serializeQuery(query);
  if (!queryString) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function isBodyInitLike(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  );
}

function normalizeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined;

  if (isBodyInitLike(body)) {
    if (typeof body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return JSON.stringify(body);
}

async function readResponseBody(response: Response, responseType: HttpResponseParser) {
  if (responseType === "none" || response.status === 204) return undefined;
  if (responseType === "raw") return response;
  if (responseType === "blob") return response.blob();
  if (responseType === "arrayBuffer") return response.arrayBuffer();

  const text = await response.text();
  if (!text) return undefined;
  if (responseType === "text") return text;

  const contentType = response.headers.get("Content-Type") ?? "";
  if (responseType === "json" || contentType.includes("application/json")) {
    return JSON.parse(text);
  }
  return text;
}

function createAbortSignal(input?: AbortSignal | null, timeoutMs?: number) {
  if (!timeoutMs) return { signal: input ?? undefined, cleanup: () => undefined };

  const controller = new AbortController();
  const abortFromInput = () => controller.abort(input?.reason);
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  if (input?.aborted) {
    abortFromInput();
  } else {
    input?.addEventListener("abort", abortFromInput, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timer);
      input?.removeEventListener("abort", abortFromInput);
    },
  };
}

export function createHttpClient(defaults: HttpClientDefaults = {}) {
  async function request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const {
      baseUrl,
      body,
      headers: requestHeaders,
      query,
      responseType = "json",
      timeoutMs = defaults.timeoutMs,
      ...requestInit
    } = options;

    const url = buildUrl(path, baseUrl ?? defaults.baseUrl ?? getApiBase(), query);
    const headers = new Headers(defaults.headers);
    new Headers(requestHeaders).forEach((value, key) => headers.set(key, value));

    const normalizedBody = normalizeBody(body, headers);
    const { signal, cleanup } = createAbortSignal(requestInit.signal, timeoutMs);

    try {
      const response = await fetch(url, {
        ...requestInit,
        body: normalizedBody,
        headers,
        signal,
      });
      const parsedBody = await readResponseBody(response, responseType);

      if (!response.ok) {
        throw new ApiError(
          `请求失败: ${response.status}`,
          response.status,
          parsedBody,
          url,
          requestInit.method,
        );
      }

      return parsedBody as T;
    } finally {
      cleanup();
    }
  }

  return {
    request,
    get: <T>(path: string, options?: Omit<HttpRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: Omit<HttpRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "DELETE" }),
  };
}

export const http = createHttpClient();
