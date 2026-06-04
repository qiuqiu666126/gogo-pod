import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUp,
  Box,
  ChevronDown,
  Minus,
  Plus,
  Square,
} from "lucide-react";

export function RecreateModal({
  open,
  imageUrl,
  onClose,
}: {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(100);
  const [prompt, setPrompt] = useState("");

  const handleClose = () => {
    setZoom(100);
    setPrompt("");
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Dialog.Content className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-background text-foreground">
          <div className="relative flex h-[68px] shrink-0 items-center justify-center border-b border-border bg-card">
            <Dialog.Title className="sr-only">再次创作</Dialog.Title>
            <div className="flex items-center overflow-hidden rounded-md border border-border bg-muted/50">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(50, value - 10))}
                className="flex h-8 w-8 items-center justify-center border-r border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="缩小"
              >
                <Minus size={16} />
              </button>
              <span className="h-8 min-w-16 px-3 text-center text-[15px] font-semibold leading-8">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(200, value + 10))}
                className="flex h-8 w-8 items-center justify-center border-l border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="放大"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="h-9 rounded-md border border-border bg-background px-5 text-[14px] text-foreground hover:bg-muted/50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!prompt.trim()}
                className="h-9 rounded-md bg-muted px-5 text-[14px] text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                保存，并覆盖原图
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/30 p-5">
              <div
                className="flex max-h-full max-w-full items-center justify-center transition-transform duration-150"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <img
                  src={imageUrl}
                  alt="再次创作预览"
                  className="max-h-[calc(100vh-300px)] max-w-[min(520px,80vw)] object-contain"
                />
              </div>
            </div>

            <div className="shrink-0 bg-white px-5 pb-4 pt-3 text-foreground">
              <div className="relative rounded-3xl border border-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="请输入文字描述你想生成的图片"
                  className="min-h-[88px] w-full resize-none rounded-3xl border-0 bg-transparent px-4 py-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-2 px-4 pb-4">
                  <button
                    type="button"
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 text-[13px] text-sky-600 hover:bg-sky-100"
                  >
                    图片生成
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[13px] text-foreground hover:bg-muted/40"
                  >
                    <Box size={15} className="text-muted-foreground" />
                    图片5.0 Lite
                  </button>
                  <button
                    type="button"
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[13px] text-foreground hover:bg-muted/40"
                  >
                    <Square size={15} className="text-muted-foreground" />
                    1:1
                  </button>
                  <button
                    type="button"
                    className="flex h-9 items-center rounded-lg border border-border bg-white px-3 text-[13px] text-foreground hover:bg-muted/40"
                  >
                    高清 2K
                  </button>
                  <button
                    type="button"
                    disabled={!prompt.trim()}
                    className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
                    aria-label="生成"
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
