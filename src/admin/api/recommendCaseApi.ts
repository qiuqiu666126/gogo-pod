import { adminHttp } from "./adminApi";

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
  query?: { keyword?: string }
): Promise<RecommendCase[]> {
  const data = await adminHttp.get<BackendRecommendCase[]>(
    "/admin/recommend-case/list",
    {
      fallbackMessage: "获取推荐案例列表失败",
      query,
    }
  );
  return data.map(mapFromBackend);
}

export async function createRecommendCase(
  item: Omit<RecommendCase, "id">
): Promise<RecommendCase> {
  const payload = mapToBackend(item);
  const data = await adminHttp.post<BackendRecommendCase>(
    "/admin/recommend-case/store",
    payload,
    { fallbackMessage: "创建推荐案例失败" }
  );
  return mapFromBackend(data);
}

export async function updateRecommendCase(
  id: number,
  item: Partial<RecommendCase>
): Promise<RecommendCase> {
  const payload = mapToBackend(item);
  const data = await adminHttp.put<BackendRecommendCase>(
    `/admin/recommend-case/${id}`,
    payload,
    { fallbackMessage: "修改推荐案例失败" }
  );
  return mapFromBackend(data);
}

export async function deleteRecommendCase(
  id: number
): Promise<void> {
  await adminHttp.delete<unknown>(
    `/admin/recommend-case/${id}`,
    { fallbackMessage: "删除推荐案例失败" }
  );
}
