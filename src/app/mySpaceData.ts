export type SpaceImage = {
  id: string;
  name: string;
  src: string;
  usedCount: number;
  source: "采集" | "素材";
};

export const INITIAL_SPACE_IMAGES: SpaceImage[] = [
  {
    id: "space-1",
    name: "1T恤1-副本轮播图4.jpeg",
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=240&h=240&fit=crop&auto=format",
    usedCount: 0,
    source: "采集",
  },
  {
    id: "space-2",
    name: "1T恤1-副本轮播图3.jpeg",
    src: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=240&h=240&fit=crop&auto=format",
    usedCount: 0,
    source: "采集",
  },
  {
    id: "space-3",
    name: "1T恤1-副本轮播图2.jpeg",
    src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=240&h=240&fit=crop&auto=format",
    usedCount: 0,
    source: "素材",
  },
  {
    id: "space-4",
    name: "1T恤1-副本轮播图1.jpeg",
    src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=240&h=240&fit=crop&auto=format",
    usedCount: 1,
    source: "素材",
  },
  {
    id: "space-5",
    name: "1.png",
    src: "https://images.unsplash.com/photo-1611532736597-de2d4265f3a5?w=240&h=240&fit=crop&auto=format",
    usedCount: 1,
    source: "素材",
  },
  {
    id: "space-6",
    name: "眼镜-产品图.jpeg",
    src: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=240&h=240&fit=crop&auto=format",
    usedCount: 0,
    source: "素材",
  },
  {
    id: "space-7",
    name: "玩偶-主图.png",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&auto=format",
    usedCount: 0,
    source: "采集",
  },
  {
    id: "space-8",
    name: "印花图-super-mario.png",
    src: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=240&h=240&fit=crop&auto=format",
    usedCount: 0,
    source: "素材",
  },
];
