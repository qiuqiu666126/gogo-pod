import { adminHttp } from "./adminApi";

export type DictionaryOption = {
  label: string;
  value: string;
  code?: string;
  color?: string;
};

export async function getAllDictionaries(): Promise<Record<string, DictionaryOption[]>> {
  return adminHttp.get<Record<string, DictionaryOption[]>>(
    "/admin/data_center/getAllDictionary",
    { fallbackMessage: "获取数据字典失败" },
  );
}

export async function getDictionaryByCode(
  typeCode: string,
): Promise<DictionaryOption[]> {
  const all = await getAllDictionaries();
  return all[typeCode] ?? [];
}
