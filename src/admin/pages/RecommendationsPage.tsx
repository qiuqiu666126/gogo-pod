import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { AdminShell } from "../components/AdminShell";
import { Card, Btn, Field, inputCls, textareaCls } from "../components/ui";
import { useAdminStore } from "../store";
import {
  RecommendCase,
  getRecommendCaseList,
  createRecommendCase,
  updateRecommendCase,
  deleteRecommendCase,
} from "../api/recommendCaseApi";

export function RecommendationsPage() {
  const { adminAuth } = useAdminStore();
  const token = adminAuth?.accessToken ?? "";

  const [items, setItems] = useState<RecommendCase[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadItems = async (keyword?: string, cancelled = false) => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getRecommendCaseList(token, keyword ? { keyword } : undefined);
      if (!cancelled) {
        setItems(data);
      }
    } catch (err: any) {
      console.error(err);
      if (!cancelled) {
        alert(err.message || "获取推荐案例列表失败");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    const delayDebounceFn = setTimeout(() => {
      void loadItems(searchQuery, cancelled);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, token]);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setDraft({ ...item });
  };

  const handleCreate = () => {
    const newItem = {
      id: Date.now(), // 临时 ID，用于 key 属性
      title: "新推荐案例",
      desc: "描述推荐玩法及效果",
      tag: "推荐",
      tagColor: "text-violet-400 bg-violet-400/10",
      img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=240&fit=crop&auto=format",
      videoUrl: "",
      sort: 0,
    };
    setEditingId(newItem.id);
    setDraft(newItem);
  };

  const handleSave = async () => {
    if (!draft || !token) return;

    if (!draft.title?.trim() || !draft.desc?.trim() || !draft.tag?.trim() || !draft.tagColor?.trim() || !draft.img?.trim()) {
      alert("请填写所有必填字段（标题、描述、标签文字、样式、封面图）");
      return;
    }

    if (!draft.img.startsWith("http://") && !draft.img.startsWith("https://")) {
      alert("封面图 URL 必须是合法的 HTTP/HTTPS 链接");
      return;
    }

    try {
      const isNew = !items.some((i: RecommendCase) => i.id === draft.id);
      let savedItem: RecommendCase;
      if (isNew) {
        savedItem = await createRecommendCase({
          title: draft.title,
          desc: draft.desc,
          tag: draft.tag,
          tagColor: draft.tagColor,
          img: draft.img,
          videoUrl: draft.videoUrl || "",
          sort: draft.sort || 0,
        }, token);
        setItems([...items, savedItem]);
      } else {
        savedItem = await updateRecommendCase(draft.id, {
          title: draft.title,
          desc: draft.desc,
          tag: draft.tag,
          tagColor: draft.tagColor,
          img: draft.img,
          videoUrl: draft.videoUrl || "",
          sort: draft.sort || 0,
        }, token);
        setItems(items.map((i: RecommendCase) => (i.id === draft.id ? savedItem : i)));
      }
      setEditingId(null);
      setDraft(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "保存推荐案例失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("确定要删除该推荐案例吗？")) return;
    try {
      await deleteRecommendCase(id, token);
      setItems(items.filter((i: RecommendCase) => i.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "删除推荐案例失败");
    }
  };

  return (
    <AdminShell title="推荐案例配置" subtitle="配置前台首页“推荐玩法 / 案例”模块内容">
      <div className="flex h-full min-h-0 overflow-hidden">
        {/* Left: List */}
        <div className="w-[360px] shrink-0 border-r border-border bg-muted/20 flex flex-col h-full">
          <div className="p-4 border-b border-border space-y-3">
            <Btn className="w-full flex items-center justify-center gap-1.5" onClick={handleCreate}>
              <Plus size={14} /> 新建案例
            </Btn>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="搜索案例标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-[13px]">
                加载中...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-[13px]">
                暂无推荐案例
              </div>
            ) : (
              items.map((item: RecommendCase) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    editingId === item.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                  onClick={() => handleEdit(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-[13px] text-foreground">{item.title}</div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <button
                        className="p-1 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1 truncate">{item.desc}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    {item.videoUrl && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">有视频</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 bg-card overflow-y-auto p-6">
          {editingId && draft ? (
            <div className="max-w-[600px] space-y-6">
              <Card title="案例基本信息">
                <div className="space-y-4">
                  <Field label="标题">
                    <input
                      className={inputCls}
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    />
                  </Field>
                  <Field label="描述">
                    <input
                      className={inputCls}
                      value={draft.desc}
                      onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="标签文字">
                      <input
                        className={inputCls}
                        value={draft.tag}
                        onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                      />
                    </Field>
                    <Field label="标签样式 (Tailwind class)">
                      <input
                        className={inputCls}
                        value={draft.tagColor}
                        onChange={(e) => setDraft({ ...draft, tagColor: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="排序权重 (数字越小越靠前)">
                    <input
                      type="number"
                      className={inputCls}
                      value={draft.sort ?? 0}
                      onChange={(e) => setDraft({ ...draft, sort: parseInt(e.target.value) || 0 })}
                    />
                  </Field>
                </div>
              </Card>
              
              <Card title="媒体配置">
                <div className="space-y-4">
                  <Field label="封面图 URL">
                    <input
                      className={inputCls}
                      value={draft.img}
                      onChange={(e) => setDraft({ ...draft, img: e.target.value })}
                    />
                    {draft.img && (
                      <div className="mt-2 h-32 w-48 rounded overflow-hidden border border-border bg-muted">
                        <img src={draft.img} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </Field>
                  <Field label="视频播放 URL (B站 iframe 链接)">
                    <input
                      className={inputCls}
                      value={draft.videoUrl}
                      onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
                      placeholder="//player.bilibili.com/player.html?bvid=..."
                    />
                  </Field>
                </div>
              </Card>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Btn variant="secondary" onClick={() => { setEditingId(null); setDraft(null); }}>
                  取消
                </Btn>
                <Btn onClick={handleSave}>
                  保存配置
                </Btn>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-[13px]">
              请在左侧选择一个案例进行编辑，或新建案例
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
