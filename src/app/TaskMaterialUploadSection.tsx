import type { UploadedAsset } from "./api/uploadApi";
import { AssetUploadZone } from "./AssetUploadZone";
import { SelectFromMySpaceButton } from "./SelectFromMySpaceButton";

export function TaskMaterialUploadSection({
  assets,
  onAssetsChange,
  maxFiles = 100,
}: {
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
  maxFiles?: number;
}) {
  return (
    <div>
      <div className="text-[13px] font-medium text-foreground mb-2">添加素材</div>
      <AssetUploadZone assets={assets} onAssetsChange={onAssetsChange} maxFiles={maxFiles} />
      <div className="flex items-center justify-center gap-3 mt-3">
        <SelectFromMySpaceButton
          onPick={(picked) => onAssetsChange([...assets, ...picked])}
          className="bg-transparent"
        />
      </div>
    </div>
  );
}
