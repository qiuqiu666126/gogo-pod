import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import {
  getAdminUserList,
  getAdminUserStats,
  type AdminUserStatsResponse,
  type FrontUserInfo,
} from "../api/userApi";
import { AdminShell } from "../components/AdminShell";
import { Badge, Btn, Card, inputCls } from "../components/ui";
import { getAdminAccessToken } from "../store";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<number, { label: string; tone: "success" | "default" | "danger" }> = {
  1: { label: "正常", tone: "success" },
  2: { label: "已停用", tone: "danger" },
};

function formatStatus(status: number) {
  return STATUS_MAP[status] ?? { label: `状态 ${status}`, tone: "default" as const };
}

function displayName(user: FrontUserInfo) {
  return user.nickname || user.username || "-";
}

function contactText(user: FrontUserInfo) {
  if (!user.phone && !user.email) return "-";
  return (
    <>
      <div>{user.phone || "-"}</div>
      <div className="text-[11px]">{user.email || "-"}</div>
    </>
  );
}

function roleText(user: FrontUserInfo) {
  if (user.role?.name) return user.role.name;
  const names = user.roles?.map((role) => role.name).filter(Boolean) ?? [];
  return names.length ? names.join("、") : "-";
}

function statValue(stats: AdminUserStatsResponse, keys: Array<keyof AdminUserStatsResponse>) {
  for (const key of keys) {
    const value = stats[key];
    if (typeof value === "number") return value;
  }
  return 0;
}

export function UsersPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<FrontUserInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AdminUserStatsResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, total);
  const normalCount = useMemo(
    () => statValue(stats, ["normal", "active", "enabled"]) || users.filter((u) => u.status === 1).length,
    [stats, users],
  );
  const disabledCount = useMemo(
    () => statValue(stats, ["disabled", "stopped"]) || users.filter((u) => u.status === 2).length,
    [stats, users],
  );
  const statsTotal = statValue(stats, ["total"]) || total;

  useEffect(() => {
    const token = getAdminAccessToken();
    if (!token) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    const params = {
      page,
      page_size: PAGE_SIZE,
      keyword: keyword.trim(),
      status: status === "" ? undefined : status,
    };

    void Promise.all([
      getAdminUserList(params, token),
      getAdminUserStats(params, token).catch(() => ({})),
    ])
      .then(([res, nextStats]) => {
        if (cancelled) return;
        setUsers(res.list ?? []);
        setTotal(res.total ?? 0);
        setStats(nextStats);
      })
      .catch((err) => {
        if (cancelled) return;
        setUsers([]);
        setTotal(0);
        setStats({});
        setError(err instanceof Error ? err.message : "获取用户账号列表失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, page, status]);

  return (
    <AdminShell
      title="用户账号管理"
      subtitle="接口分页获取后台用户账号，切换筛选或页码会重新请求列表"
    >
      <div className="p-6 space-y-4 max-w-[1100px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className={`${inputCls} pl-8 w-[240px]`}
                placeholder="搜索账号、姓名、邮箱..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className={`${inputCls} w-auto`}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value ? Number(e.target.value) : "");
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="1">正常</option>
              <option value="2">已停用</option>
            </select>
          </div>
          <Btn disabled title="待接入创建用户接口">
            <span className="flex items-center gap-1.5">
              <UserPlus size={16} />
              开设账号
            </span>
          </Btn>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="!py-3 !px-4">
            <p className="text-[12px] text-muted-foreground">账号总数</p>
            <p className="text-xl font-semibold mt-0.5">{statsTotal}</p>
          </Card>
          <Card className="!py-3 !px-4">
            <p className="text-[12px] text-muted-foreground">正常使用</p>
            <p className="text-xl font-semibold mt-0.5 text-emerald-600">{normalCount}</p>
          </Card>
          <Card className="!py-3 !px-4">
            <p className="text-[12px] text-muted-foreground">已停用</p>
            <p className="text-xl font-semibold mt-0.5 text-muted-foreground">
              {disabledCount}
            </p>
          </Card>
        </div>

        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">登录账号</th>
                <th className="text-left px-4 py-3 font-medium">显示名称</th>
                <th className="text-left px-4 py-3 font-medium">角色</th>
                <th className="text-left px-4 py-3 font-medium">套餐</th>
                <th className="text-left px-4 py-3 font-medium">联系方式</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">最近登录</th>
                <th className="text-left px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const st = formatStatus(user.status);
                return (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-[12px]">{user.username}</td>
                    <td className="px-4 py-3 font-medium">{displayName(user)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{roleText(user)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.plan_label || user.plan || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{contactText(user)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">
                      {user.login_time_text || user.login_time || "从未登录"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">
                      {user.created_at || "-"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        className="text-primary text-[12px] font-medium disabled:opacity-40"
                        disabled
                        title="待接入编辑用户接口"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="text-[12px] font-medium text-muted-foreground disabled:opacity-40"
                        disabled
                        title="待接入重置密码接口"
                      >
                        重置密码
                      </button>
                      <button
                        type="button"
                        className="text-[12px] font-medium disabled:opacity-40"
                        disabled
                        title="待接入启停用户接口"
                      >
                        {user.status === 1 ? "停用" : "启用"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && (
            <p className="text-center py-12 text-muted-foreground">正在加载用户账号...</p>
          )}
          {!loading && error && <p className="text-center py-12 text-destructive">{error}</p>}
          {!loading && !error && users.length === 0 && (
            <p className="text-center py-12 text-muted-foreground">暂无匹配账号</p>
          )}
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
          <span>
            共 {total} 条，当前显示 {pageStart}-{pageEnd}
          </span>
          <div className="flex items-center gap-2">
            <Btn
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Btn>
            <span>
              第 {page} / {totalPages} 页
            </span>
            <Btn
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              下一页
            </Btn>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
