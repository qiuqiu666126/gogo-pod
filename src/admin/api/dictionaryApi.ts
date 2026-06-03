import { http } from "../../shared/http";
import { assertSuccess, authHeaders, type AdminApiResponse } from "./adminApi";

export type DictionaryOption = {
  label: string;
  value: string;
  code?: string;
  color?: string;
};

export async function getAllDictionaries(
  accessToken: string,
): Promise<Record<string, DictionaryOption[]>> {
  const res = await http.get<AdminApiResponse<Record<string, DictionaryOption[]>>>(
    "/admin/data_center/getAllDictionary",
    { headers: authHeaders(accessToken) },
  );
  return assertSuccess(res, "获取数据字典失败");
}

export async function getDictionaryByCode(
  typeCode: string,
  accessToken: string,
): Promise<DictionaryOption[]> {
  const all = await getAllDictionaries(accessToken);
  return all[typeCode] ?? [];
}
