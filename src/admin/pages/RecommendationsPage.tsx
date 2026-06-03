import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { AdminShell } from "../components/AdminShell";
import { Card, Btn, Field, inputCls, textareaCls } from "../components/ui";

const INITIAL_RECOMMENDATIONS = [
  { id: 1, title: "2D印花秒变3D效果 Etsy爆款月入10w+", desc: "3D立体印花 · 爆款玩法", tag: "热门", tagColor: "text-orange-400 bg-orange-400/10", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
  { id: 2, title: "手机壳高还原度跟款", desc: "支持iPhone · 三星全系", tag: "新品", tagColor: "text-emerald-400 bg-emerald-400/10", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
  { id: 3, title: "帆布包爆款二创玩法", desc: "文艺风设计 · 多色配色", tag: "推荐", tagColor: "text-violet-400 bg-violet-400/10", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
  { id: 4, title: "儿童节印花系列", desc: "卡通风格 · 批量定制", tag: "热门", tagColor: "text-orange-400 bg-orange-400/10", img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=240&fit=crop&auto=format", videoUrl: "//player.bilibili.com/player.html?bvid=BV1LbxheoEcM&autoplay=1" },
];

export function RecommendationsPage() {
  const [items, setItems] = useState(INITIAL_RECOMMENDATIONS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<any>(null);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setDraft({ ...item });
  };

  const handleCreate = () => {
    const newItem = {
      id: Date.now(),
      title: "新推荐案例",
      desc: "",
      tag: "推荐",
      tagColor: "text-violet-400 bg-violet-400/10",
      img: "",
      videoUrl: ""
    };
    setEditingId(newItem.id);
    setDraft(newItem);
  };

  const handleSave = () => {
    if (!draft) return;
    if (items.find(i => i.id === draft.id)) {
      setItems(items.map(i => i.id === draft.id ? draft : i));
    } else {
      setItems([...items, draft]);
    }
    setEditingId(null);
    setDraft(null);
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <AdminShell title="推荐案例配置" subtitle="配置前台首页“推荐玩法 / 案例”模块内容（当前为页面原型，数据未持久化）">
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
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.map((item) => (
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
            ))}
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
