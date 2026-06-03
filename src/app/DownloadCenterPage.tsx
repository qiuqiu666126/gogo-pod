import { Inbox } from "lucide-react";

export function DownloadCenterPage() {
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
