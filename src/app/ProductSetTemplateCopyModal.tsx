import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PRODUCT_SET_CATEGORY_TABS, type ProductSetCategory } from "./productSetTemplateStore";

const fieldSelectClass =
  "h-11 w-full rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none focus:border-primary/60";

const fieldInputClass =
  "h-11 w-full rounded-md border border-border bg-input-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60";

export function ProductSetTemplateCopyModal({
  open,
  defaultName,
  defaultCategory = "推荐",
  onClose,
  onConfirm,
}: {
  open: boolean;
  defaultName: string;
  defaultCategory?: ProductSetCategory;
  onClose: () => void;
  onConfirm: (name: string, category: ProductSetCategory) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState<ProductSetCategory>(defaultCategory);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setCategory(defaultCategory);
    }
  }, [open, defaultName, defaultCategory]);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
            <Dialog.Title className="text-[16px] font-semibold text-foreground">创建副本</Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="grid grid-cols-[76px_1fr] items-center gap-3">
              <label className="text-[13px] font-medium text-foreground">模板名称</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldInputClass}
              />
            </div>
            <div className="grid grid-cols-[76px_1fr] items-center gap-3">
              <label className="text-[13px] font-medium text-foreground">模板分组</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductSetCategory)}
                className={fieldSelectClass}
              >
                {PRODUCT_SET_CATEGORY_TABS.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/80 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-border px-7 text-[14px] hover:bg-muted/40"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => onConfirm(name.trim(), category)}
              className="h-10 rounded-md bg-primary px-7 text-[14px] font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              确定
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
