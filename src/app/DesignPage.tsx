import { useEffect, useState, type ReactNode } from "react";
import imgHifiCard from "@/imports/home-hifi.png";
import imgViralCard from "@/imports/home-viral.png";
import { PatternExtractPage } from "./PatternExtractPage";
import { CutoutPage } from "./CutoutPage";
import { ProductSetPage } from "./ProductSetPage";
import { VectorPage } from "./VectorPage";
import { CrackImagePage } from "./CrackImagePage";
import { InfringementFilterPage } from "./InfringementFilterPage";
import { TextToImagePage } from "./TextToImagePage";
import { TitleExtractPage } from "./TitleExtractPage";
import {
  isFavoriteFeature,
  toggleFavoriteFeature,
  useFavoriteFeatureIds,
  type FavoriteFeatureId,
} from "./favoriteFeatures";

type DesignCard = {
  id: FavoriteFeatureId;
  title: string;
  desc: string;
  preview: ReactNode;
  onClick?: () => void;
};

function PatternCropPreview() {
  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-lime-100 to-emerald-200 p-2 flex items-center justify-center gap-2">
      <div className="w-14 h-14 rounded-md bg-white/70 border border-white/80" />
      <div className="text-emerald-600 text-xl">→</div>
      <div className="w-14 h-14 rounded-md bg-lime-300/80 border border-lime-400/50" />
    </div>
  );
}

function TextToImagePreview() {
  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-violet-100 to-purple-200 p-2.5 flex flex-col gap-2">
      <div className="rounded-md bg-white/80 px-2 py-1 text-[10px] text-violet-700 truncate">
        万圣节 南瓜 吸血鬼
      </div>
      <div className="grid grid-cols-3 gap-1 flex-1">
        {[
          "https://images.unsplash.com/photo-1509555190665-477ef7b7e931?w=80&h=80&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1576086213369-fa02a840d2d4?w=80&h=80&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1509245858460-894736427208?w=80&h=80&fit=crop&auto=format",
        ].map((src) => (
          <img key={src} src={src} alt="" className="w-full h-full rounded object-cover" />
        ))}
      </div>
    </div>
  );
}

function ProductSetPreview() {
  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-pink-50 to-rose-100 p-2 flex items-center justify-center gap-2">
      <div className="w-12 h-12 rounded-md bg-white border border-pink-200 overflow-hidden shrink-0">
        <img
          src="https://images.unsplash.com/photo-1542362567-b07e54358753?w=80&h=80&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-pink-400 text-sm shrink-0">→</span>
      <div className="w-14 h-[72px] rounded-md bg-white border border-pink-200 overflow-hidden shrink-0">
        <img
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=120&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

function TitleExtractPreview() {
  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-amber-50 to-yellow-100 p-2 flex flex-col gap-1.5">
      <div className="flex-1 rounded-md bg-white border border-amber-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=120&h=80&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="rounded bg-white/90 border border-amber-200/80 px-1.5 py-1 text-[8px] leading-tight text-muted-foreground line-clamp-2">
        Women&apos;s T-shirts Duck With Wine And Chocolates 100%
      </div>
    </div>
  );
}

function VectorPreview() {
  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-sky-50 to-cyan-100 p-2 flex flex-col items-center justify-center gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-7 h-7 rounded bg-white/90 border border-sky-200 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=40&h=40&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        ))}
      </div>
      <span className="text-sky-400 text-sm">↓</span>
      <div className="w-[72px] h-[72px] rounded-lg bg-white border border-sky-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=120&h=120&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

function InfringementPreview() {
  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-sky-50 to-blue-100 p-2 flex items-center gap-2">
      <div className="flex-1 h-full min-w-0 rounded-md bg-white border border-sky-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=140&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 h-full min-w-0 rounded-md bg-white border border-sky-200 p-2 flex flex-col gap-1.5">
        <div className="h-2 rounded bg-sky-100" />
        <div className="h-2 rounded bg-sky-100 w-4/5" />
        <div className="flex-1 rounded bg-sky-50 border border-sky-100 mt-0.5" />
        <div className="flex gap-1">
          <div className="h-4 flex-1 rounded bg-emerald-100" />
          <div className="h-4 flex-1 rounded bg-amber-100" />
        </div>
      </div>
    </div>
  );
}

export function DesignPage({
  onOpenPattern,
  onOpenCrack,
  onOpenText2img,
  productSetEntryKey = 0,
  featureEntry,
}: {
  onOpenPattern?: () => void;
  onOpenCrack?: () => void;
  onOpenText2img?: () => void;
  productSetEntryKey?: number;
  featureEntry?: { id: FavoriteFeatureId; key: number } | null;
}) {
  const [showProductSet, setShowProductSet] = useState(false);
  const [showPatternExtract, setShowPatternExtract] = useState(false);
  const [showCutout, setShowCutout] = useState(false);
  const [showVector, setShowVector] = useState(false);
  const [showCrack, setShowCrack] = useState(false);
  const [showInfringement, setShowInfringement] = useState(false);
  const [showTextToImage, setShowTextToImage] = useState(false);
  const [showTitleExtract, setShowTitleExtract] = useState(false);
  const favoriteIds = useFavoriteFeatureIds();

  useEffect(() => {
    if (productSetEntryKey > 0) {
      setShowProductSet(true);
      setShowPatternExtract(false);
      setShowCutout(false);
      setShowVector(false);
      setShowCrack(false);
      setShowInfringement(false);
      setShowTextToImage(false);
      setShowTitleExtract(false);
    }
  }, [productSetEntryKey]);

  useEffect(() => {
    if (!featureEntry || featureEntry.key <= 0) return;
    setShowProductSet(featureEntry.id === "product-set");
    setShowPatternExtract(featureEntry.id === "pattern-extract");
    setShowCutout(featureEntry.id === "cutout");
    setShowVector(featureEntry.id === "vector");
    setShowCrack(featureEntry.id === "crack");
    setShowInfringement(featureEntry.id === "infringement");
    setShowTextToImage(featureEntry.id === "text2img");
    setShowTitleExtract(featureEntry.id === "title-extract");
  }, [featureEntry]);

  if (showTitleExtract) {
    return <TitleExtractPage onBack={() => setShowTitleExtract(false)} />;
  }

  if (showPatternExtract) {
    return <PatternExtractPage onBack={() => setShowPatternExtract(false)} />;
  }

  if (showProductSet) {
    return <ProductSetPage onBack={() => setShowProductSet(false)} />;
  }

  if (showCutout) {
    return <CutoutPage onBack={() => setShowCutout(false)} />;
  }

  if (showTextToImage) {
    return <TextToImagePage onBack={() => setShowTextToImage(false)} />;
  }

  if (showInfringement) {
    return <InfringementFilterPage onBack={() => setShowInfringement(false)} />;
  }

  if (showCrack) {
    return <CrackImagePage onBack={() => setShowCrack(false)} />;
  }

  if (showVector) {
    return <VectorPage onBack={() => setShowVector(false)} />;
  }

  const sections: { title: string; cards: DesignCard[] }[] = [
    {
      title: "印花提取",
      cards: [
        {
          id: "cutout",
          title: "一键抠图",
          desc: "智能识别主体，一键去除背景",
          preview: <PatternCropPreview />,
          onClick: () => setShowCutout(true),
        },
        {
          id: "pattern-extract",
          title: "印花图提取",
          desc: "不惧模糊遮挡透视，独家支持多比例提取",
          preview: (
            <div className="h-full w-full rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 p-2">
              <img src={imgViralCard} alt="" className="w-full h-full object-contain" />
            </div>
          ),
          onClick: () => setShowPatternExtract(true),
        },
      ],
    },
    {
      title: "印花设计",
      cards: [
        {
          id: "crack",
          title: "图裂变",
          desc: "识别图案卖点裂变图案",
          preview: (
            <div className="h-full w-full rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 p-2">
              <img src={imgHifiCard} alt="" className="w-full h-full object-contain" />
            </div>
          ),
          onClick: () => setShowCrack(true),
        },
        {
          id: "text2img",
          title: "文生图",
          desc: "更灵活自主的图案生成",
          preview: <TextToImagePreview />,
          onClick: () => setShowTextToImage(true),
        },
      ],
    },
    {
      title: "套图&标题",
      cards: [
        {
          id: "product-set",
          title: "商品套图",
          desc: "印花批量套商品图",
          preview: <ProductSetPreview />,
          onClick: () => setShowProductSet(true),
        },
        {
          id: "title-extract",
          title: "标题提取",
          desc: "生成商品标题",
          preview: <TitleExtractPreview />,
          onClick: () => setShowTitleExtract(true),
        },
      ],
    },
    {
      title: "图案处理",
      cards: [
        {
          id: "vector",
          title: "转矢量图",
          desc: "批量转矢量",
          preview: <VectorPreview />,
          onClick: () => setShowVector(true),
        },
      ],
    },
    {
      title: "侵权检测",
      cards: [
        {
          id: "infringement",
          title: "侵权风险过滤",
          desc: "结合TRO案件与艺术家版权库，深度检索报告",
          preview: <InfringementPreview />,
          onClick: () => setShowInfringement(true),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto px-8 py-7 scrollbar-none">
      <div className="space-y-8 max-w-[1100px]">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[14px] font-semibold text-foreground mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {section.cards.map((card) => (
                <div
                  key={card.id}
                  className="group relative h-[136px] rounded-xl border border-border bg-card hover:border-primary/35 hover:shadow-md transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={card.onClick}
                    className="flex h-full w-full items-stretch overflow-hidden rounded-xl text-left"
                  >
                    <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
                      <div className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </div>
                      <div className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{card.desc}</div>
                    </div>
                    <div className="w-[min(42%,220px)] shrink-0 self-stretch p-2.5">
                      <div className="h-full">{card.preview}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavoriteFeature(card.id);
                    }}
                    className="absolute right-3 top-3 rounded-md border border-primary/30 bg-white/95 px-2.5 py-1 text-[12px] font-medium text-primary opacity-0 shadow-sm transition-opacity hover:bg-primary hover:text-white group-hover:opacity-100"
                  >
                    {favoriteIds.includes(card.id) || isFavoriteFeature(card.id) ? "取消设置" : "设置为常用"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
