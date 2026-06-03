import { cn } from "./components/ui/utils";
import type { UploadedAsset } from "./api/uploadApi";
import { MySpacePickerModal } from "./MySpacePickerModal";
import { useState } from "react";

const defaultClassName =
  "h-9 px-7 rounded-md border border-border bg-background text-[13px] text-foreground hover:border-primary/50 transition-colors";

export function SelectFromMySpaceButton({
  className,
  onPick,
}: {
  className?: string;
  onPick?: (assets: UploadedAsset[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(defaultClassName, className)}
      >
        从我的空间选取
      </button>
      <MySpacePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onPick={(assets) => onPick?.(assets)}
      />
    </>
  );
}
