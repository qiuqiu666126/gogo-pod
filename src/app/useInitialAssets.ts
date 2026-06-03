import { useEffect, useState } from "react";
import type { UploadedAsset } from "./api/uploadApi";

/** 弹窗打开时用外部传入的素材初始化（如工作流选中图带入） */
export function useInitialAssets(open: boolean, initialAssets?: UploadedAsset[]) {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);

  useEffect(() => {
    if (open) {
      setAssets(initialAssets?.length ? [...initialAssets] : []);
    }
  }, [open, initialAssets]);

  return [assets, setAssets] as const;
}
