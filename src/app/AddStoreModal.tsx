import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { HelpCircle, X } from "lucide-react";

const fieldSelectClass =
  "w-full h-10 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const fieldInputClass =
  "w-full h-10 rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60";

export function AddStoreModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [platform, setPlatform] = useState("temu");
  const [group, setGroup] = useState("");
  const [storeName, setStoreName] = useState("");
  const [token, setToken] = useState("");

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(520px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新增店铺</Dialog.Title>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-2">所属平台</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={fieldSelectClass}
              >
                <option value="temu">Temu</option>
                <option value="amazon">Amazon</option>
                <option value="shein">Shein</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-2">店铺分组</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className={`${fieldSelectClass} ${!group ? "text-muted-foreground" : ""}`}
              >
                <option value="">请选择店铺分组</option>
                <option value="default">默认分组</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-foreground mb-2">店铺名称</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="请输入店铺名称"
                className={fieldInputClass}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-foreground mb-2">
                token
                <HelpCircle size={14} className="text-muted-foreground" />
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="请输入token"
                rows={5}
                className="w-full rounded-md border border-border bg-input-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/80">
            <button
              onClick={onClose}
              className="h-9 px-5 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:bg-muted/40 transition-colors"
            >
              取消
            </button>
            <button className="h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
              提交
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
