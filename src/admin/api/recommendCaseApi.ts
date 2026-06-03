import { http } from "../../shared/http";

export type RecommendCase = {
  id: number;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  img: string;
  videoUrl: string;
  sort: number;
};

export type BackendRecommendCase = {
  id: number;
  title: string;
  desc: string;
  tag: string;
  tag_color: string;
  img: string;
  video_url: string;
  sort: number;
};

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

function unwrapResponse<T>(res: ApiResponse<T> | T, fallbackMessage: string): T {
  if (res && typeof res === "object" && "code" in res && "data" in res) {
    if (res.code !== 200) {
      throw new Error(res.message || fallbackMessage);
    }
    return res.data;
  }
  return res as T;
}

export function mapFromBackend(item: BackendRecommendCase): RecommendCase {
  return {
    id: item.id,
    title: item.title,
    desc: item.desc,
    tag: item.tag,
    tagColor: item.tag_color,
    img: item.img,
    videoUrl: item.video_url || "",
    sort: item.sort || 0,
  };
}

export function mapToBackend(item: Partial<RecommendCase>): Partial<BackendRecommendCase> {
  const result: Partial<BackendRecommendCase> = {};
  if (item.id !== undefined) result.id = item.id;
  if (item.title !== undefined) result.title = item.title;
  if (item.desc !== undefined) result.desc = item.desc;
  if (item.tag !== undefined) result.tag = item.tag;
  if (item.tagColor !== undefined) result.tag_color = item.tagColor;
  if (item.img !== undefined) result.img = item.img;
  if (item.videoUrl !== undefined) result.video_url = item.videoUrl || null;
  if (item.sort !== undefined) result.sort = item.sort;
  return result;
}

export async function getRecommendCaseList(
  accessToken: string,
  query?: { keyword?: string }
): Promise<RecommendCase[]> {
  const res = await http.get<ApiResponse<BackendRecommendCase[]>>(
    "/admin/recommend-case/list",
    {
      headers: authHeaders(accessToken),
      query,
    }
  );
  const data = unwrapResponse(res, "获取推荐案例列表失败");
  return data.map(mapFromBackend);
}

export async function createRecommendCase(
  item: Omit<RecommendCase, "id">,
  accessToken: string
): Promise<RecommendCase> {
  const payload = mapToBackend(item);
  const res = await http.post<ApiResponse<BackendRecommendCase>>(
    "/admin/recommend-case/store",
    payload,
    { headers: authHeaders(accessToken) }
  );
  const data = unwrapResponse(res, "创建推荐案例失败");
  return mapFromBackend(data);
}

export async function updateRecommendCase(
  id: number,
  item: Partial<RecommendCase>,
  accessToken: string
): Promise<RecommendCase> {
  const payload = mapToBackend(item);
  const res = await http.put<ApiResponse<BackendRecommendCase>>(
    `/admin/recommend-case/${id}`,
    payload,
    { headers: authHeaders(accessToken) }
  );
  const data = unwrapResponse(res, "修改推荐案例失败");
  return mapFromBackend(data);
}

export async function deleteRecommendCase(
  id: number,
  accessToken: string
): Promise<void> {
  const res = await http.delete<ApiResponse<unknown>>(
    `/admin/recommend-case/${id}`,
    { headers: authHeaders(accessToken) }
  );
  unwrapResponse(res, "删除推荐案例失败");
}
