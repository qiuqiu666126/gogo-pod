import { useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, Search, UserPlus } from "lucide-react";
import {
  createFrontUser,
  deleteFrontUser,
  getAdminUserList,
  getAdminUserStats,
  resetFrontUserPassword,
  updateFrontUser,
  updateFrontUserStatus,
  type CreateFrontUserBody,
  type AdminUserStatsResponse,
  type FrontUserInfo,
} from "../api/userApi";
import { AdminShell } from "../components/AdminShell";
import { Badge, Btn, Card, Field, inputCls } from "../components/ui";
import { getAdminAccessToken } from "../store";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<number, { label: string; tone: "success" | "default" | "danger" }> = {
  1: { label: "正常", tone: "success" },
  2: { label: "已停用", tone: "danger" },
};

const ROLE_OPTIONS = [
  { code: "FrontMember", label: "成员" },
  { code: "FrontAdmin", label: "管理员" },
  { code: "FrontViewer", label: "只读" },
];

const PLAN_OPTIONS = [
  { value: "professional", label: "专业版" },
  { value: "basic", label: "基础版" },
  { value: "trial", label: "试用版" },
];

function emptyCreateForm(): CreateFrontUserBody {
  return {
    username: "",
    nickname: "",
    password: "",
    email: "",
    phone: "",
    role_code: "FrontMember",
    plan: "professional",
    status: 1,
    remark: "",
  };
}

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

function userToForm(user: FrontUserInfo): CreateFrontUserBody {
  return {
    username: user.username ?? "",
    nickname: user.nickname ?? "",
    password: "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role_code: user.role?.code ?? user.roles?.[0]?.code ?? "FrontMember",
    plan: user.plan || "professional",
    status: user.status || 1,
    remark: user.remark ?? "",
  };
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
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FrontUserInfo | null>(null);
  const [createForm, setCreateForm] = useState<CreateFrontUserBody>(emptyCreateForm);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [resetUser, setResetUser] = useState<FrontUserInfo | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

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

  const reloadList = () => setReloadKey((key) => key + 1);

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
      getAdminUserList(params),
      getAdminUserStats(params).catch(() => ({})),
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
  }, [keyword, page, reloadKey, status]);

  const openCreateModal = () => {
    setEditingUser(null);
    setCreateForm(emptyCreateForm());
    setCreateError("");
    setModalOpen(true);
  };

  const openEditModal = (user: FrontUserInfo) => {
    setEditingUser(user);
    setCreateForm(userToForm(user));
    setCreateError("");
    setModalOpen(true);
  };

  const openResetPasswordModal = (user: FrontUserInfo) => {
    setResetUser(user);
    setResetPassword("");
    setResetPasswordConfirm("");
    setResetError("");
  };

  const submitUser = async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setCreateError("登录状态已失效，请重新登录");
      return;
    }
    if (!createForm.username.trim()) {
      setCreateError("请填写登录账号");
      return;
    }
    if (!createForm.nickname.trim()) {
      setCreateError("请填写昵称");
      return;
    }
    if (!editingUser && (!createForm.password || createForm.password.length < 6)) {
      setCreateError("密码至少 6 位");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      const body = {
        username: createForm.username.trim(),
        nickname: createForm.nickname.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        role_code: createForm.role_code,
        plan: createForm.plan,
        status: createForm.status,
        remark: createForm.remark.trim(),
      };

      if (editingUser) {
        await updateFrontUser(editingUser.id, body);
      } else {
        await createFrontUser({
          ...body,
          password: createForm.password,
        });
      }
      setModalOpen(false);
      if (!editingUser) setPage(1);
      reloadList();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : editingUser ? "编辑用户失败" : "创建用户失败",
      );
    } finally {
      setCreating(false);
    }
  };

  const submitResetPassword = async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setResetError("登录状态已失效，请重新登录");
      return;
    }
    if (!resetUser) return;
    if (resetPassword.length < 6) {
      setResetError("密码至少 6 位");
      return;
    }
    if (resetPassword !== resetPasswordConfirm) {
      setResetError("两次输入的密码不一致");
      return;
    }

    setResetting(true);
    setResetError("");
    try {
      await resetFrontUserPassword(resetUser.id, {
        password: resetPassword,
        password_confirmation: resetPasswordConfirm,
      });
      setResetUser(null);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "重置用户密码失败");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async (user: FrontUserInfo) => {
    const token = getAdminAccessToken();
    if (!token) {
      setError("登录状态已失效，请重新登录");
      return;
    }
    if (!confirm(`确定删除账号「${displayName(user)}」？`)) return;

    setActionUserId(user.id);
    setError("");
    try {
      await deleteFrontUser(user.id);
      reloadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除用户失败");
    } finally {
      setActionUserId(null);
    }
  };

  const handleToggleStatus = async (user: FrontUserInfo) => {
    const token = getAdminAccessToken();
    if (!token) {
      setError("登录状态已失效，请重新登录");
      return;
    }

    setActionUserId(user.id);
    setError("");
    try {
      await updateFrontUserStatus(user.id, user.status === 1 ? 2 : 1);
      reloadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新用户状态失败");
    } finally {
      setActionUserId(null);
    }
  };

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
          <Btn onClick={openCreateModal}>
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
                        disabled={actionUserId === user.id}
                        onClick={() => openEditModal(user)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="text-[12px] font-medium disabled:opacity-40"
                        disabled={actionUserId === user.id || resetting}
                        onClick={() => openResetPasswordModal(user)}
                      >
                        重置密码
                      </button>
                      <button
                        type="button"
                        className="text-[12px] font-medium disabled:opacity-40"
                        disabled={actionUserId === user.id}
                        onClick={() => void handleToggleStatus(user)}
                      >
                        {actionUserId === user.id
                          ? "处理中"
                          : user.status === 1
                            ? "停用"
                            : "启用"}
                      </button>
                      <button
                        type="button"
                        className="text-destructive text-[12px] font-medium disabled:opacity-40"
                        disabled={actionUserId === user.id}
                        onClick={() => void handleDeleteUser(user)}
                      >
                        删除
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-border font-semibold flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              {editingUser ? "编辑前台用户" : "开设前台用户"}
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="登录账号">
                  <input
                    className={inputCls}
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, username: e.target.value })
                    }
                  />
                </Field>
                <Field label="昵称">
                  <input
                    className={inputCls}
                    value={createForm.nickname}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, nickname: e.target.value })
                    }
                  />
                </Field>
              </div>
              {!editingUser && (
                <Field label="登录密码">
                  <input
                    type="password"
                    className={inputCls}
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                  />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="邮箱">
                  <input
                    className={inputCls}
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </Field>
                <Field label="手机">
                  <input
                    className={inputCls}
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="角色">
                  <select
                    className={inputCls}
                    value={createForm.role_code}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role_code: e.target.value })
                    }
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.code} value={role.code}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="套餐">
                  <select
                    className={inputCls}
                    value={createForm.plan}
                    onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                  >
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="状态">
                  <select
                    className={inputCls}
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, status: Number(e.target.value) })
                    }
                  >
                    <option value={1}>正常</option>
                    <option value={2}>停用</option>
                  </select>
                </Field>
              </div>
              <Field label="备注">
                <input
                  className={inputCls}
                  value={createForm.remark}
                  onChange={(e) => setCreateForm({ ...createForm, remark: e.target.value })}
                />
              </Field>
              {createError && <p className="text-[13px] text-destructive">{createError}</p>}
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <Btn
                variant="secondary"
                disabled={creating}
                onClick={() => setModalOpen(false)}
              >
                取消
              </Btn>
              <Btn disabled={creating} onClick={() => void submitUser()}>
                {creating ? (editingUser ? "保存中..." : "创建中...") : "保存"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl">
            <div className="px-5 py-4 border-b border-border font-semibold flex items-center gap-2">
              <KeyRound size={18} className="text-primary" />
              重置密码
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[13px] text-muted-foreground">
                正在为账号「{displayName(resetUser)}」重置登录密码。
              </p>
              <Field label="新密码">
                <input
                  type="password"
                  className={inputCls}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </Field>
              <Field label="确认密码">
                <input
                  type="password"
                  className={inputCls}
                  value={resetPasswordConfirm}
                  onChange={(e) => setResetPasswordConfirm(e.target.value)}
                />
              </Field>
              {resetError && <p className="text-[13px] text-destructive">{resetError}</p>}
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <Btn
                variant="secondary"
                disabled={resetting}
                onClick={() => setResetUser(null)}
              >
                取消
              </Btn>
              <Btn disabled={resetting} onClick={() => void submitResetPassword()}>
                {resetting ? "提交中..." : "确认重置"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
