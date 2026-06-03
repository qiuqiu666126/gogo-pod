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

export function assertSuccess<T>(res: AdminApiResponse<T>, fallbackMessage: string): T {
  if (res.code !== 200) {
    throw new Error(res.message || fallbackMessage);
  }
  return res.data;
}
