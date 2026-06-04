import { Inbox } from "lucide-react";
import { useDownloadCenterRecords } from "./downloadCenterStore";

export function DownloadCenterPage() {
  const records = useDownloadCenterRecords();

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="px-6 h-14 flex items-center border-b border-border shrink-0">
        <h1 className="text-[16px] font-semibold text-foreground">下载中心</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
        <div className="rounded-xl border border-border overflow-hidden bg-card min-h-[480px]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-muted-foreground">
                  下载任务
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">
                  下载数量
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">
                  下载进度
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">状态</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">
                  创建时间
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-[120px]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`align-middle hover:bg-muted/20 ${index < records.length - 1 ? "border-b border-border/60" : ""}`}
                  >
                    <td className="px-5 py-5 font-medium text-foreground">{record.title}</td>
                    <td className="px-4 py-5 text-[12px] leading-relaxed">
                      <div className="text-foreground">总数：{record.total}</div>
                      <div className="text-emerald-600">成功：{record.success}</div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <span className="w-10 text-[13px] text-foreground">{record.progress}%</span>
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${record.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-flex rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-muted-foreground">{record.createdAt}</td>
                    <td className="px-4 py-5">
                      <span className="text-[13px] font-medium text-emerald-600">下载完成</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-32">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-3">
                        <Inbox size={28} className="opacity-40" />
                      </div>
                      <span className="text-[13px]">暂无数据</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
