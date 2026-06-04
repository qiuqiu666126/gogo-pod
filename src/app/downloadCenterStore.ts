import { useSyncExternalStore } from "react";

export type DownloadCenterRecord = {
  id: string;
  title: string;
  total: number;
  success: number;
  progress: number;
  status: "已完成" | "下载中" | "失败";
  createdAt: string;
};

const records: DownloadCenterRecord[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function formatDateTime(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

function formatShortDateTime(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(date.getMonth() + 1)}${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

export function addDownloadRecord(input: { title?: string; count: number }) {
  const now = new Date();
  const count = Math.max(1, input.count);
  const record: DownloadCenterRecord = {
    id: `download-${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    title: input.title ?? `图裂变-批量下载-${formatShortDateTime(now)}`,
    total: count,
    success: count,
    progress: 100,
    status: "已完成",
    createdAt: formatDateTime(now),
  };
  records.unshift(record);
  emit();
  return record;
}

export function useDownloadCenterRecords() {
  return useSyncExternalStore(subscribe, () => records, () => records);
}
