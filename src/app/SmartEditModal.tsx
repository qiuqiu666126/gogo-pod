import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Ban,
  Crop,
  Eraser,
  Expand,
  Minus,
  Paintbrush,
  Plus,
  Type,
  X,
} from "lucide-react";

const smartTools = [
  { id: "eraser", label: "消除笔", icon: Eraser },
  { id: "text", label: "局部改文字", icon: Type },
  { id: "expand", label: "扩图", icon: Expand },
  { id: "watermark", label: "消除水印", icon: Ban },
] as const;

const basicTools = [
  { id: "smudge", label: "涂抹", icon: Paintbrush },
  { id: "crop", label: "裁剪", icon: Crop },
] as const;

export function SmartEditModal({
  open,
  imageUrl,
  onClose,
  onSave,
}: {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (editedUrl: string) => void;
}) {
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<string>("eraser");
  const [dirty, setDirty] = useState(false);

  const handleToolSelect = (id: string) => {
    setActiveTool(id);
    setDirty(true);
  };

  const handleSave = () => {
    const editedUrl = dirty ? `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}edited=${Date.now()}` : imageUrl;
    onSave(editedUrl);
    setDirty(false);
    onClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setDirty(false);
          setZoom(100);
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
        <Dialog.Content className="fixed inset-4 z-[70] flex flex-col rounded-2xl border border-border bg-card text-foreground shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <Dialog.Title className="text-[16px] font-semibold text-foreground">智能编辑</Dialog.Title>
              <span className="text-[11px] font-medium text-emerald-500 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                限免
              </span>
            </div>
            <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <Minus size={14} />
              </button>
              <span className="text-[13px] text-foreground w-12 text-center">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-md border border-border text-[13px] text-foreground hover:bg-muted/40"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!dirty}
                onClick={handleSave}
                className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                保存，并覆盖原图
              </button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            <aside className="w-[120px] shrink-0 border-r border-border/80 py-4 px-2 overflow-y-auto">
              <div className="text-[11px] text-muted-foreground px-2 mb-2">智能</div>
              <div className="space-y-1 mb-4">
                {smartTools.map((tool) => {
                  const Icon = tool.icon;
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full flex flex-col items-center gap-1.5 py-3 rounded-lg text-[11px] transition-colors ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                      }`}
                    >
                      <Icon size={20} />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-muted-foreground px-2 mb-2">基础</div>
              <div className="space-y-1">
                {basicTools.map((tool) => {
                  const Icon = tool.icon;
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full flex flex-col items-center gap-1.5 py-3 rounded-lg text-[11px] transition-colors ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                      }`}
                    >
                      <Icon size={20} />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="flex-1 flex items-center justify-center p-8 bg-muted/30 overflow-auto">
              <div
                className="relative max-w-full max-h-full transition-transform duration-150"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <img
                  src={imageUrl}
                  alt="编辑预览"
                  className="max-h-[calc(100vh-180px)] max-w-full object-contain rounded-lg shadow-lg"
                />
                {dirty && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border border-border bg-card/95 text-[11px] text-foreground shadow-sm">
                    已选择「{[...smartTools, ...basicTools].find((t) => t.id === activeTool)?.label}」— 保存后将覆盖结果图
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 hidden"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
