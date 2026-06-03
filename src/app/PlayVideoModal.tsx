import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function PlayVideoModal({
  open,
  videoUrl,
  onClose,
}: {
  open: boolean;
  videoUrl: string;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(1000px,90vw)] aspect-video -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        >
          <div className="absolute top-0 right-0 z-10 p-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {videoUrl && (
            <iframe
              src={videoUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
