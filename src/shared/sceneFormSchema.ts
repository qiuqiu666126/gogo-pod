/**
 * 场景表单配置 — 由「场景预设」管理
 * AI 功能配置只管 model_id / 密钥；表单与提示词在此定义
 */

export type SceneFeatureType =
  | "pattern-extract"
  | "cutout"
  | "crack"
  | "text2img"
  | "vector"
  | "infringement"
  | "product-set"
  | "video";

export const CONTROL_TYPE_LABELS = {
  radio: "单选",
  select: "下拉",
  slider: "滑条",
  checkbox: "勾选",
  "multi-checkbox": "多选",
  text: "单行文本",
  textarea: "多行文本",
  "number-buttons": "数字按钮",
} as const;

export type ControlType = keyof typeof CONTROL_TYPE_LABELS;
export type FormValue = string | number | boolean | string[];

export type FormControlOption = {
  value: string;
  label: string;
  promptFragment?: string;
  thumbnailUrl?: string;
  previewText?: string;
  previewDescription?: string;
  subFields?: FormControl[];
};

export type FormControl = {
  id: string;
  key: string;
  label: string;
  type: ControlType;
  defaultValue: FormValue;
  required?: boolean;
  helpText?: string;
  layout?: "inline" | "block" | "group";
  uiVariant?: "default" | "card";
  sortOrder: number;
  enabled: boolean;
  placeholder?: string;
  options?: FormControlOption[];
  slider?: {
    min: number;
    max: number;
    step: number;
    displayFormat?: "number" | "label";
    valueLabels?: Record<string, string>;
  };
  promptFragment?: string;
};

export type PresetKind = "scene-form" | "creative";

export type SceneFormPreset = {
  id: string;
  featureType: SceneFeatureType;
  presetKind: PresetKind;
  sceneKey: string;
  sceneLabel: string;
  label: string;
  presetKey: string;
  promptTemplate: string;
  formFields: FormControl[];
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};

const STORAGE_KEY = "pod_scene_form_presets";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createControlId() {
  return uid("ctl");
}

export function createPresetId() {
  return uid("preset");
}

export function createControl(
  partial: Omit<FormControl, "id" | "sortOrder" | "enabled"> & {
    id?: string;
    sortOrder?: number;
    enabled?: boolean;
  },
): FormControl {
  return {
    id: partial.id ?? createControlId(),
    sortOrder: partial.sortOrder ?? 0,
    enabled: partial.enabled ?? true,
    ...partial,
  };
}

function commonTailFields(startOrder: number): FormControl[] {
  return [
    createControl({
      key: "shape",
      label: "形状",
      type: "radio",
      layout: "inline",
      defaultValue: "default",
      options: [
        { value: "default", label: "默认" },
        { value: "circle", label: "圆形" },
      ],
      sortOrder: startOrder,
    }),
    createControl({
      key: "ratio",
      label: "尺寸比例",
      type: "select",
      defaultValue: "原图比例",
      options: [
        { value: "原图比例", label: "原图比例" },
        { value: "1:1", label: "1:1" },
        { value: "2:3", label: "2:3" },
      ],
      sortOrder: startOrder + 1,
    }),
    createControl({
      key: "count",
      label: "出图数量",
      type: "number-buttons",
      defaultValue: 2,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "4", label: "4" },
        { value: "6", label: "6" },
        { value: "8", label: "8" },
      ],
      promptFragment: "出图数量：{{value}}",
      sortOrder: startOrder + 2,
    }),
  ];
}

function textModeSubFields(): FormControl[] {
  return [
    createControl({
      key: "refStrength",
      label: "原图参考强度",
      type: "slider",
      layout: "group",
      defaultValue: 0.5,
      slider: { min: 0, max: 1, step: 0.1, displayFormat: "number" },
      promptFragment: "原图参考强度：{{value}}",
      sortOrder: 0,
    }),
    createControl({
      key: "creativeStrength",
      label: "创意发散强度",
      type: "slider",
      layout: "group",
      defaultValue: 0.1,
      slider: {
        min: 0,
        max: 1,
        step: 0.1,
        displayFormat: "label",
        valueLabels: { "0.1": "低", "0.5": "中", "1": "高" },
      },
      promptFragment: "创意发散强度：{{value}}",
      sortOrder: 1,
    }),
    createControl({
      key: "bgColor",
      label: "指定背景色",
      type: "radio",
      layout: "inline",
      defaultValue: "随机",
      options: [
        { value: "随机", label: "随机", promptFragment: "背景色随机" },
        { value: "黑色", label: "黑色", promptFragment: "纯黑背景" },
        { value: "白色", label: "白色", promptFragment: "纯白背景" },
      ],
      sortOrder: 2,
    }),
    ...commonTailFields(3),
  ];
}

function artModeSubFields(): FormControl[] {
  return [
    createControl({
      key: "refStrength",
      label: "原图参考强度",
      type: "slider",
      layout: "group",
      defaultValue: 1,
      slider: {
        min: 0,
        max: 1,
        step: 0.1,
        displayFormat: "label",
        valueLabels: { "1": "高", "0.5": "中", "0": "低" },
      },
      promptFragment: "原图参考强度：{{value}}",
      sortOrder: 0,
    }),
    createControl({
      key: "onlyPatternPart",
      label: "仅裂变素材中的图案部分",
      type: "checkbox",
      defaultValue: true,
      promptFragment: "仅裂变图案：{{value}}",
      sortOrder: 1,
    }),
    createControl({
      key: "productType",
      label: "商品类型",
      type: "select",
      defaultValue: "自动检测",
      options: [
        { value: "自动检测", label: "自动检测" },
        { value: "手机壳", label: "手机壳" },
        { value: "挂钟", label: "挂钟" },
      ],
      promptFragment: "商品类型：{{value}}",
      sortOrder: 2,
    }),
    ...commonTailFields(3),
  ];
}

function hotModeSubFields(): FormControl[] {
  return [
    createControl({
      key: "hotVariant",
      label: "裂变内容",
      type: "radio",
      layout: "inline",
      defaultValue: "爆改",
      options: [
        { value: "主体", label: "改主体", promptFragment: "裂变主体" },
        { value: "姿势", label: "改姿势", promptFragment: "裂变姿势" },
        { value: "背景", label: "改背景", promptFragment: "裂变背景" },
        { value: "爆改", label: "✨爆改✨", promptFragment: "爆改模式" },
      ],
      sortOrder: 0,
    }),
    ...commonTailFields(1),
  ];
}

function generalModeSubFields(): FormControl[] {
  return [
    createControl({
      key: "refStrength",
      label: "原图参考强度",
      type: "slider",
      layout: "group",
      defaultValue: 0.5,
      slider: { min: 0, max: 1, step: 0.1, displayFormat: "number" },
      promptFragment: "原图参考强度：{{value}}",
      sortOrder: 0,
    }),
    createControl({
      key: "onlyPatternPart",
      label: "仅裂变素材中的图案部分",
      type: "checkbox",
      defaultValue: true,
      sortOrder: 1,
    }),
    createControl({
      key: "productType",
      label: "商品类型",
      type: "select",
      defaultValue: "自动检测",
      options: [
        { value: "自动检测", label: "自动检测" },
        { value: "手机壳", label: "手机壳" },
      ],
      sortOrder: 2,
    }),
    ...commonTailFields(3),
  ];
}

function buildIronStyleOptions(): FormControlOption[] {
  return [
    {
      value: "夸张罗马充",
      label: "夸张罗马充",
      previewText: "鹰",
      previewDescription: "适合动物主体和夸张对称轮廓",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=320&h=180&fit=crop&auto=format",
      promptFragment: "图形风格：夸张罗马充",
    },
    {
      value: "低多边形",
      label: "低多边形",
      previewText: "鸟",
      previewDescription: "几何切面感强，适合年轻化图案",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?w=320&h=180&fit=crop&auto=format",
      promptFragment: "图形风格：低多边形",
    },
    {
      value: "极简线条",
      label: "极简线条",
      previewText: "鹿",
      previewDescription: "线稿识别度高，适合金属切割表现",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=320&h=180&fit=crop&auto=format",
      promptFragment: "图形风格：极简线条",
    },
    {
      value: "负空间",
      label: "负空间",
      previewText: "雪",
      previewDescription: "适合文字与图形结合的留白表达",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=320&h=180&fit=crop&auto=format",
      promptFragment: "图形风格：负空间",
    },
    {
      value: "炫彩法琅",
      label: "炫彩法琅",
      previewText: "彩",
      previewDescription: "高饱和装饰风，适合礼品挂饰",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=320&h=180&fit=crop&auto=format",
      promptFragment: "图形风格：炫彩法琅",
    },
  ];
}

function buildIronSceneFormFields(): FormControl[] {
  return [
    createControl({
      key: "ironStyle",
      label: "图形风格",
      type: "radio",
      layout: "block",
      uiVariant: "card",
      defaultValue: "夸张罗马充",
      options: buildIronStyleOptions(),
      sortOrder: 0,
    }),
    createControl({
      key: "ironDimension",
      label: "变化维度",
      type: "radio",
      layout: "inline",
      defaultValue: "参考主体",
      options: [
        { value: "参考主体", label: "参考主体", promptFragment: "变化维度：参考主体" },
        { value: "裂变主体", label: "裂变主体", promptFragment: "变化维度：裂变主体" },
      ],
      sortOrder: 1,
    }),
    createControl({
      key: "count",
      label: "出图数量",
      type: "number-buttons",
      defaultValue: 2,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "4", label: "4" },
      ],
      promptFragment: "出图数量：{{value}}",
      sortOrder: 2,
    }),
  ];
}

export function buildCrackSceneFormFields(): FormControl[] {
  return [
    createControl({
      key: "mode",
      label: "模式选择",
      type: "radio",
      layout: "inline",
      defaultValue: "art",
      options: [
        { value: "art", label: "艺术设计", promptFragment: "模式：艺术设计", subFields: artModeSubFields() },
        { value: "text", label: "文字强化", promptFragment: "模式：文字强化", subFields: textModeSubFields() },
        { value: "hot", label: "爆款二创", promptFragment: "模式：爆款二创", subFields: hotModeSubFields() },
        { value: "general", label: "通用", promptFragment: "模式：通用", subFields: generalModeSubFields() },
      ],
      sortOrder: 0,
    }),
  ];
}

function ratioSelectField(key = "ratio", sortOrder = 0): FormControl {
  return createControl({
    key,
    label: "尺寸比例",
    type: "select",
    defaultValue: "1:1",
    options: [
      { value: "1:1", label: "1:1" },
      { value: "2:3", label: "2:3" },
      { value: "3:2", label: "3:2" },
      { value: "9:16", label: "9:16" },
      { value: "16:9", label: "16:9" },
    ],
    promptFragment: "尺寸比例：{{value}}",
    sortOrder,
  });
}

export function buildPatternExtractFormFields(): FormControl[] {
  return [
    createControl({
      key: "mode",
      label: "模式选择",
      type: "radio",
      layout: "inline",
      defaultValue: "pro",
      options: [
        { value: "pro", label: "专项提取", promptFragment: "模式：专项提取" },
        { value: "all", label: "全能提取", promptFragment: "模式：全能提取" },
      ],
      sortOrder: 0,
    }),
    createControl({
      key: "transparentBg",
      label: "透明底图",
      type: "checkbox",
      defaultValue: true,
      promptFragment: "透明底图：{{value}}",
      sortOrder: 1,
    }),
    createControl({
      key: "resolution",
      label: "分辨率",
      type: "radio",
      layout: "inline",
      defaultValue: "1k",
      options: [
        { value: "1k", label: "标清(1k)", promptFragment: "分辨率：标清" },
        { value: "4k", label: "超清(4k)", promptFragment: "分辨率：超清" },
      ],
      sortOrder: 2,
    }),
    ratioSelectField("ratio", 3),
  ];
}

export function buildCutoutFormFields(): FormControl[] {
  return [
    createControl({
      key: "cutoutMode",
      label: "抠图模式",
      type: "radio",
      layout: "inline",
      defaultValue: "background",
      options: [
        { value: "background", label: "去背景", promptFragment: "抠图模式：去背景" },
        { value: "head", label: "抠头", promptFragment: "抠图模式：抠头" },
      ],
      sortOrder: 0,
    }),
    createControl({
      key: "edgeProcessing",
      label: "边缘处理",
      type: "checkbox",
      defaultValue: false,
      helpText: "自动裁剪掉印花边缘空白的区域",
      promptFragment: "边缘处理：{{value}}",
      sortOrder: 1,
    }),
  ];
}

export function buildText2ImgFormFields(): FormControl[] {
  return [
    createControl({
      key: "mode",
      label: "模式选择",
      type: "radio",
      layout: "inline",
      defaultValue: "art",
      options: [
        { value: "art", label: "艺术设计", promptFragment: "模式：艺术设计" },
        { value: "text", label: "文字强化", promptFragment: "模式：文字强化" },
        { value: "ip", label: "IP增强", promptFragment: "模式：IP增强" },
        { value: "tile", label: "四方连续图", promptFragment: "模式：四方连续图" },
      ],
      sortOrder: 0,
    }),
    ratioSelectField("ratio", 1),
    createControl({
      key: "count",
      label: "出图数量",
      type: "number-buttons",
      defaultValue: 2,
      options: [
        { value: "2", label: "2" },
        { value: "4", label: "4" },
      ],
      promptFragment: "出图数量：{{value}}",
      sortOrder: 2,
    }),
  ];
}

export function buildVectorFormFields(): FormControl[] {
  return [
    createControl({
      key: "imageStyle",
      label: "原图风格",
      type: "radio",
      layout: "inline",
      defaultValue: "normal",
      options: [
        { value: "normal", label: "常规", promptFragment: "原图风格：常规" },
        { value: "bw", label: "黑白", promptFragment: "原图风格：黑白" },
      ],
      sortOrder: 0,
    }),
  ];
}

export function buildInfringementFormFields(): FormControl[] {
  return [
    createControl({
      key: "mode",
      label: "模式选择",
      type: "radio",
      layout: "block",
      defaultValue: "deep",
      options: [
        { value: "deep", label: "深度过滤", promptFragment: "模式：深度过滤" },
        { value: "basic", label: "基础过滤", promptFragment: "模式：基础过滤" },
      ],
      sortOrder: 0,
    }),
  ];
}

function strokeSubFields(): FormControl[] {
  return [
    createControl({
      key: "strokeMode",
      label: "描边方式",
      type: "radio",
      layout: "inline",
      defaultValue: "smart",
      options: [
        { value: "smart", label: "智能描边", promptFragment: "智能描边" },
        {
          value: "force",
          label: "强制描边",
          promptFragment: "强制描边",
          subFields: [
            createControl({
              key: "strokeColor",
              label: "颜色",
              type: "radio",
              layout: "inline",
              defaultValue: "black",
              options: [
                { value: "black", label: "黑色" },
                { value: "white", label: "白色" },
              ],
              sortOrder: 0,
            }),
          ],
        },
      ],
      sortOrder: 0,
    }),
    createControl({
      key: "strokeWidth",
      label: "描边粗细",
      type: "text",
      defaultValue: "2",
      placeholder: "px",
      promptFragment: "描边粗细：{{value}}px",
      sortOrder: 1,
    }),
  ];
}

export function buildProductSetFormFields(): FormControl[] {
  return [
    createControl({
      key: "duplicateCheck",
      label: "印花查重校验",
      type: "checkbox",
      defaultValue: false,
      promptFragment: "印花查重：{{value}}",
      sortOrder: 0,
    }),
    createControl({
      key: "edgeProcessing",
      label: "边缘处理",
      type: "checkbox",
      defaultValue: true,
      helpText: "自动裁剪掉印花边缘空白的区域",
      promptFragment: "边缘处理：{{value}}",
      sortOrder: 1,
    }),
    createControl({
      key: "strokeEnabled",
      label: "描边",
      type: "checkbox",
      defaultValue: true,
      promptFragment: "描边：{{value}}",
      sortOrder: 2,
      options: [{ value: "true", label: "开启", subFields: strokeSubFields() }],
    }),
    createControl({
      key: "smartInvert",
      label: "智能反转",
      type: "checkbox",
      defaultValue: true,
      promptFragment: "智能反转：{{value}}",
      sortOrder: 3,
    }),
    createControl({
      key: "compressEnabled",
      label: "压缩图片",
      type: "checkbox",
      defaultValue: true,
      sortOrder: 4,
      options: [
        {
          value: "true",
          label: "开启",
          subFields: [
            createControl({
              key: "compressSize",
              label: "文件大小小于",
              type: "text",
              defaultValue: "1.5",
              sortOrder: 0,
            }),
            createControl({
              key: "compressUnit",
              label: "单位",
              type: "select",
              defaultValue: "mb",
              options: [
                { value: "mb", label: "mb" },
                { value: "kb", label: "kb" },
              ],
              sortOrder: 1,
            }),
          ],
        },
      ],
    }),
    createControl({
      key: "fileFormat",
      label: "文件格式",
      type: "select",
      defaultValue: "JPEG",
      options: [
        { value: "JPEG", label: "JPEG" },
        { value: "PNG", label: "PNG" },
        { value: "WEBP", label: "WEBP" },
      ],
      promptFragment: "文件格式：{{value}}",
      sortOrder: 5,
    }),
  ];
}

function videoPresetSubFields(
  options: {
    value: string;
    label: string;
    prompt: string;
    thumbnailUrl?: string;
    previewDescription?: string;
  }[],
): FormControl[] {
  return [
    createControl({
      key: "effectPreset",
      label: "效果预设",
      type: "radio",
      layout: "block",
      uiVariant: "card",
      defaultValue: options[0]?.value ?? "",
      options: options.map((o) => ({
        value: o.value,
        label: o.label,
        promptFragment: o.prompt,
        thumbnailUrl: o.thumbnailUrl,
        previewDescription: o.previewDescription,
      })),
      sortOrder: 0,
    }),
  ];
}

export function buildVideoModelFormFields(): FormControl[] {
  return [
    createControl({
      key: "firstFrameMode",
      label: "首尾帧模式",
      type: "checkbox",
      defaultValue: false,
      helpText: "启用后可用于首帧/尾帧衔接类镜头",
      promptFragment: "首尾帧模式：{{value}}",
      sortOrder: 0,
    }),
    createControl({
      key: "creativeMode",
      label: "视频创意",
      type: "radio",
      layout: "inline",
      defaultValue: "preset",
      options: [
        {
          value: "preset",
          label: "效果预设",
          subFields: videoPresetSubFields([
            {
              value: "natural",
              label: "自然动态",
              prompt: "模特轻微摆动，自然光线，整体氛围自然舒展",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=320&h=220&fit=crop&auto=format",
              previewDescription: "轻微动作，适合日常穿搭展示",
            },
            {
              value: "walk",
              label: "休闲走动",
              prompt: "模特缓慢走动，全身展示服装轮廓与垂坠感",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1529139574466-a303027c1d7b?w=320&h=220&fit=crop&auto=format",
              previewDescription: "走动镜头，突出整体版型",
            },
            {
              value: "magazine",
              label: "杂志写真",
              prompt: "杂志风格写真动作，姿态稳定，画面更有时尚感",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=320&h=220&fit=crop&auto=format",
              previewDescription: "更偏时尚大片感",
            },
            {
              value: "rotate",
              label: "转动展示",
              prompt: "模特缓慢转身，前后左右展示服装细节",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=320&h=220&fit=crop&auto=format",
              previewDescription: "适合看前后身和侧面",
            },
            {
              value: "dance",
              label: "翩翩起舞",
              prompt: "轻盈舞蹈动作，衣摆和肢体更有动态表现",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=320&h=220&fit=crop&auto=format",
              previewDescription: "动作更活泼，适合节日感主题",
            },
          ]),
        },
        { value: "custom", label: "自定义提示词", promptFragment: "自定义提示词" },
      ],
      sortOrder: 1,
    }),
    createControl({
      key: "genMode",
      label: "生成模式",
      type: "radio",
      layout: "block",
      uiVariant: "card",
      defaultValue: "standard",
      options: [
        {
          value: "standard",
          label: "标准",
          promptFragment: "生成模式：标准",
          previewDescription: "生成速度更快，创作成本更低",
        },
        {
          value: "hd",
          label: "高清",
          promptFragment: "生成模式：高清",
          previewDescription: "画面质量更好，细节更丰富",
        },
      ],
      sortOrder: 2,
    }),
    createControl({
      key: "duration",
      label: "视频时长",
      type: "radio",
      layout: "inline",
      defaultValue: "5s",
      options: [
        { value: "5s", label: "5s" },
        { value: "10s", label: "10s" },
      ],
      promptFragment: "时长：{{value}}",
      sortOrder: 3,
    }),
    createControl({
      key: "quantity",
      label: "生成数量",
      type: "number-buttons",
      defaultValue: 1,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
      ],
      promptFragment: "数量：{{value}}",
      sortOrder: 4,
    }),
  ];
}

export function buildVideoProductFormFields(): FormControl[] {
  return [
    createControl({
      key: "creativeMode",
      label: "视频创意",
      type: "radio",
      layout: "inline",
      defaultValue: "preset",
      options: [
        {
          value: "preset",
          label: "效果预设",
          subFields: videoPresetSubFields([
            {
              value: "pet",
              label: "宠物用品",
              prompt: "商品轻微晃动，可爱氛围，镜头更生活化",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=320&h=220&fit=crop&auto=format",
              previewDescription: "轻晃镜头，适合萌宠周边",
            },
            {
              value: "rug",
              label: "地垫",
              prompt: "地垫轻微起伏展示纹理，镜头缓慢推进",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=320&h=220&fit=crop&auto=format",
              previewDescription: "纹理和铺陈感更清楚",
            },
            {
              value: "blanket",
              label: "毛毯",
              prompt: "毛毯柔软飘动，表现材质和褶皱层次",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=320&h=220&fit=crop&auto=format",
              previewDescription: "强调柔软与包裹感",
            },
            {
              value: "case",
              label: "手机壳",
              prompt: "手机壳缓慢转动展示，突出背面设计与边框质感",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=220&fit=crop&auto=format",
              previewDescription: "适合展示印花和壳型",
            },
            {
              value: "tablecloth",
              label: "桌布",
              prompt: "桌布轻微飘动，边缘和垂坠感更明显",
              thumbnailUrl:
                "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=320&h=220&fit=crop&auto=format",
              previewDescription: "更适合家居布艺展示",
            },
          ]),
        },
        { value: "custom", label: "自定义提示词", promptFragment: "自定义提示词" },
      ],
      sortOrder: 0,
    }),
    createControl({
      key: "genMode",
      label: "生成模式",
      type: "radio",
      layout: "block",
      uiVariant: "card",
      defaultValue: "standard",
      options: [
        {
          value: "standard",
          label: "标准",
          promptFragment: "生成模式：标准",
          previewDescription: "生成速度更快，创作成本更低",
        },
        {
          value: "hd",
          label: "高清",
          promptFragment: "生成模式：高清",
          previewDescription: "画面质量更好，细节更丰富",
        },
      ],
      sortOrder: 1,
    }),
    createControl({
      key: "duration",
      label: "视频时长",
      type: "radio",
      layout: "inline",
      defaultValue: "5s",
      options: [
        { value: "5s", label: "5s" },
        { value: "10s", label: "10s" },
      ],
      promptFragment: "时长：{{value}}",
      sortOrder: 2,
    }),
    createControl({
      key: "quantity",
      label: "生成数量",
      type: "number-buttons",
      defaultValue: 1,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
      ],
      promptFragment: "数量：{{value}}",
      sortOrder: 3,
    }),
  ];
}

export function buildVideoWindFormFields(): FormControl[] {
  return [
    createControl({
      key: "windStyle",
      label: "风铃样式",
      type: "radio",
      layout: "block",
      uiVariant: "card",
      defaultValue: "flower",
      options: [
        {
          value: "flower",
          label: "花形",
          promptFragment: "风铃样式：花形",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=320&h=220&fit=crop&auto=format",
          previewDescription: "更柔和，适合春夏和节日风格",
        },
        {
          value: "heart",
          label: "爱心",
          promptFragment: "风铃样式：爱心",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=320&h=220&fit=crop&auto=format",
          previewDescription: "更适合礼赠和节庆主题",
        },
        {
          value: "tree",
          label: "圣诞树",
          promptFragment: "风铃样式：圣诞树",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=320&h=220&fit=crop&auto=format",
          previewDescription: "适合圣诞和季节性活动场景",
        },
      ],
      sortOrder: 0,
    }),
    createControl({
      key: "windBackground",
      label: "背景",
      type: "select",
      defaultValue: "0",
      options: Array.from({ length: 12 }, (_, i) => ({
        value: String(i),
        label: `背景 ${i + 1}`,
      })),
      promptFragment: "背景序号：{{value}}",
      sortOrder: 1,
    }),
    createControl({
      key: "duration",
      label: "视频时长",
      type: "radio",
      layout: "inline",
      defaultValue: "5s",
      options: [
        { value: "5s", label: "5s" },
        { value: "10s", label: "10s" },
      ],
      promptFragment: "时长：{{value}}",
      sortOrder: 2,
    }),
  ];
}

export const DEFAULT_SCENE_KEY = "默认";

function makePreset(
  id: string,
  featureType: SceneFeatureType,
  sceneKey: string,
  sceneLabel: string,
  label: string,
  promptTemplate: string,
  formFields: FormControl[],
  sortOrder: number,
): SceneFormPreset {
  return {
    id,
    featureType,
    presetKind: "scene-form",
    sceneKey,
    sceneLabel,
    label,
    presetKey: sceneKey,
    promptTemplate,
    formFields: cloneFields(formFields),
    enabled: true,
    sortOrder,
    updatedAt: "2026-05-29 12:00:00",
  };
}

export const CRACK_SCENE_KEYS = [
  "默认",
  "服装/纺织",
  "手机壳",
  "铁艺图形",
  "挂钟",
  "装饰画",
  "铁皮画",
] as const;

function cloneFields(fields: FormControl[]): FormControl[] {
  return fields.map((f) => ({
    ...f,
    id: createControlId(),
    uiVariant: f.uiVariant ?? "default",
    options: f.options?.map((o) => ({
      ...o,
      subFields: o.subFields ? cloneFields(o.subFields) : undefined,
    })),
  }));
}

export function buildInitialScenePresets(): SceneFormPreset[] {
  const ts = "2026-05-29 12:00:00";
  const crackScenes: SceneFormPreset[] = CRACK_SCENE_KEYS.map((key, i) => ({
    id: `crack-scene-${i}`,
    featureType: "crack",
    presetKind: "scene-form",
    sceneKey: key,
    sceneLabel: key,
    label: `图裂变 · ${key}`,
    presetKey: key,
    promptTemplate: `图裂变场景「${key}」：根据参考图创意裂变，保持主体识别度。`,
    formFields: cloneFields(key === "铁艺图形" ? buildIronSceneFormFields() : buildCrackSceneFormFields()),
    enabled: true,
    sortOrder: i,
    updatedAt: ts,
  }));

  return [
    ...crackScenes,
    makePreset(
      "pattern-extract-default",
      "pattern-extract",
      DEFAULT_SCENE_KEY,
      DEFAULT_SCENE_KEY,
      "印花图提取 · 默认",
      "从商品图中提取印花图案，保持图案清晰可复用。",
      buildPatternExtractFormFields(),
      0,
    ),
    makePreset(
      "cutout-default",
      "cutout",
      DEFAULT_SCENE_KEY,
      DEFAULT_SCENE_KEY,
      "一键抠图 · 默认",
      "智能抠图，输出透明或纯色背景素材。",
      buildCutoutFormFields(),
      0,
    ),
    makePreset(
      "text2img-default",
      "text2img",
      DEFAULT_SCENE_KEY,
      DEFAULT_SCENE_KEY,
      "文生图 · 默认",
      "根据提示词生成设计稿，支持多模式与批量出图。",
      buildText2ImgFormFields(),
      0,
    ),
    makePreset(
      "vector-default",
      "vector",
      DEFAULT_SCENE_KEY,
      DEFAULT_SCENE_KEY,
      "转矢量图 · 默认",
      "将位图转换为可编辑矢量格式。",
      buildVectorFormFields(),
      0,
    ),
    makePreset(
      "infringement-default",
      "infringement",
      DEFAULT_SCENE_KEY,
      DEFAULT_SCENE_KEY,
      "侵权风险过滤 · 默认",
      "识别印花元素并比对商标与 IP 数据库。",
      buildInfringementFormFields(),
      0,
    ),
    makePreset(
      "product-set-print",
      "product-set",
      "印花处理",
      "印花处理",
      "商品套图 · 印花处理",
      "套图生成时的印花预处理与输出参数。",
      buildProductSetFormFields(),
      0,
    ),
    makePreset(
      "video-model",
      "video",
      "model",
      "模特动作",
      "视频生成 · 模特动作",
      "模特上身图动态展示，突出服装细节与动作。",
      buildVideoModelFormFields(),
      0,
    ),
    makePreset(
      "video-product",
      "video",
      "product",
      "商品律动",
      "视频生成 · 商品律动",
      "商品静物轻微律动，适合电商主图视频。",
      buildVideoProductFormFields(),
      1,
    ),
    makePreset(
      "video-wind",
      "video",
      "wind",
      "风铃转动",
      "视频生成 · 风铃转动",
      "风铃装饰品类转动展示效果。",
      buildVideoWindFormFields(),
      2,
    ),
  ];
}

let presets: SceneFormPreset[] = loadFromStorage();
const listeners = new Set<() => void>();

function normalizeOption(option: FormControlOption): FormControlOption {
  return {
    ...option,
    thumbnailUrl: option.thumbnailUrl || undefined,
    previewText: option.previewText || undefined,
    previewDescription: option.previewDescription || undefined,
    subFields: option.subFields?.map(normalizeControl),
  };
}

function normalizeControl(control: FormControl): FormControl {
  return {
    ...control,
    uiVariant: control.uiVariant ?? "default",
    options: control.options?.map(normalizeOption),
  };
}

function normalizePreset(preset: SceneFormPreset): SceneFormPreset {
  return {
    ...preset,
    formFields: preset.formFields.map(normalizeControl),
  };
}

function loadFromStorage(): SceneFormPreset[] {
  const initial = buildInitialScenePresets();
  if (typeof localStorage === "undefined") return initial;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const stored = (JSON.parse(raw) as SceneFormPreset[]).map(normalizePreset);
    const storedIds = new Set(stored.map((p) => p.id));
    const missing = initial.filter((p) => !storedIds.has(p.id)).map(normalizePreset);
    if (missing.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return stored;
    }
    const merged = [...stored, ...missing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return initial;
  }
}

function persist() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }
  listeners.forEach((l) => l());
}

export function subscribeScenePresets(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getScenePresets(): SceneFormPreset[] {
  return presets;
}

export function listSceneFormPresets(featureType?: SceneFeatureType): SceneFormPreset[] {
  let list = presets.filter((p) => p.presetKind === "scene-form");
  if (featureType) list = list.filter((p) => p.featureType === featureType);
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSceneFormPreset(
  featureType: SceneFeatureType,
  sceneKey: string,
): SceneFormPreset | undefined {
  return presets.find(
    (p) =>
      p.presetKind === "scene-form" &&
      p.featureType === featureType &&
      p.sceneKey === sceneKey &&
      p.enabled,
  );
}

export function upsertScenePreset(preset: SceneFormPreset) {
  const idx = presets.findIndex((p) => p.id === preset.id);
  const row = normalizePreset({ ...preset, updatedAt: new Date().toLocaleString() });
  if (idx >= 0) presets = presets.map((p, i) => (i === idx ? row : p));
  else presets = [...presets, row];
  persist();
}

export function deleteScenePreset(id: string) {
  presets = presets.filter((p) => p.id !== id);
  persist();
}

export function collectVisibleControls(
  fields: FormControl[],
  values: Record<string, FormValue>,
): FormControl[] {
  const out: FormControl[] = [];
  const sorted = fields.filter((f) => f.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  for (const field of sorted) {
    out.push(field);
    const selected = values[field.key] ?? field.defaultValue;
    if (Array.isArray(selected)) {
      for (const selectedValue of selected) {
        const opt = field.options?.find((o) => o.value === String(selectedValue));
        if (opt?.subFields?.length) {
          out.push(...collectVisibleControls(opt.subFields, values));
        }
      }
      continue;
    }
    const opt = field.options?.find((o) => o.value === String(selected));
    if (opt?.subFields?.length) {
      out.push(...collectVisibleControls(opt.subFields, values));
    }
  }
  return out;
}

export function collectDefaultValues(fields: FormControl[]): Record<string, FormValue> {
  const out: Record<string, FormValue> = {};
  function walk(list: FormControl[]) {
    for (const f of list.filter((x) => x.enabled)) {
      out[f.key] = f.defaultValue;
      const defaultValue = f.defaultValue;
      if (Array.isArray(defaultValue)) {
        for (const selectedValue of defaultValue) {
          const opt = f.options?.find((o) => o.value === String(selectedValue));
          if (opt?.subFields) walk(opt.subFields);
        }
        continue;
      }
      const opt = f.options?.find((o) => o.value === String(defaultValue));
      if (opt?.subFields) walk(opt.subFields);
    }
  }
  walk(fields);
  return out;
}

export function applyOptionChange(
  fields: FormControl[],
  values: Record<string, FormValue>,
  changedKey: string,
  newValue: FormValue,
): Record<string, FormValue> {
  const next = { ...values, [changedKey]: newValue };

  function findField(list: FormControl[]): FormControl | undefined {
    for (const f of list) {
      if (f.key === changedKey) return f;
      for (const o of f.options ?? []) {
        if (o.subFields) {
          const found = findField(o.subFields);
          if (found) return found;
        }
      }
    }
    return undefined;
  }

  const field = findField(fields);
  if (field?.options) {
    for (const opt of field.options) {
      if (opt.subFields) {
        for (const k of Object.keys(collectDefaultValues(opt.subFields))) {
          delete next[k];
        }
      }
    }
    if (Array.isArray(newValue)) {
      for (const selectedValue of newValue) {
        const selected = field.options.find((o) => o.value === String(selectedValue));
        if (selected?.subFields) {
          Object.assign(next, collectDefaultValues(selected.subFields));
        }
      }
      return next;
    }
    const selected = field.options.find((o) => o.value === String(newValue));
    if (selected?.subFields) {
      Object.assign(next, collectDefaultValues(selected.subFields));
    }
  }
  return next;
}

export function renderPromptFragment(template: string, value: FormValue): string {
  const rendered = Array.isArray(value) ? value.join("、") : String(value);
  return template.replace(/\{\{value\}\}/g, rendered);
}

function getSelectedOptions(field: FormControl, value: FormValue): FormControlOption[] {
  if (!field.options?.length) return [];
  if (Array.isArray(value)) {
    return value
      .map((selectedValue) => field.options?.find((option) => option.value === String(selectedValue)))
      .filter((option): option is FormControlOption => Boolean(option));
  }
  const selected = field.options.find((option) => option.value === String(value));
  return selected ? [selected] : [];
}

function describeValue(field: FormControl, value: FormValue): string {
  if (Array.isArray(value)) {
    if (!value.length) return "未选择";
    const labels = getSelectedOptions(field, value).map((option) => option.label);
    return (labels.length ? labels : value).join("、");
  }
  if (field.type === "checkbox") {
    return value ? "是" : "否";
  }
  const option = getSelectedOptions(field, value)[0];
  return option?.label ?? String(value);
}

export function buildScenePrompt(
  preset: SceneFormPreset,
  values: Record<string, FormValue>,
): string {
  const sections: string[] = [];
  const basePrompt = preset.promptTemplate.trim();
  if (basePrompt) {
    sections.push(`基础要求：\n${basePrompt}`);
  }

  const fieldLines: string[] = [];
  const visible = collectVisibleControls(preset.formFields, values);
  for (const field of visible) {
    const val = values[field.key] ?? field.defaultValue;
    const selectionSummary = describeValue(field, val);
    const optionPrompts = getSelectedOptions(field, val)
      .map((option) => option.promptFragment?.trim())
      .filter(Boolean) as string[];

    const details: string[] = [`用户选择：${selectionSummary}`];
    if (field.promptFragment?.trim()) {
      details.push(`控件要求：${renderPromptFragment(field.promptFragment.trim(), val)}`);
    }
    if (optionPrompts.length) {
      details.push(
        optionPrompts.length === 1
          ? `选项要求：${optionPrompts[0]}`
          : `选项要求：${optionPrompts.join("；")}`,
      );
    }
    if (details.length > 1 || selectionSummary !== "未选择") {
      fieldLines.push(`- ${field.label}\n  ${details.join("\n  ")}`);
    }
  }

  if (fieldLines.length) {
    sections.push(`参数细化：\n${fieldLines.join("\n")}`);
  }

  sections.push("生成原则：\n- 优先满足基础要求，再依次落实各控件与选项要求。\n- 若字段要求与选项要求同时存在，请将两者合并理解，不要遗漏。");

  return sections.join("\n\n");
}

export function flattenFieldsForParams(
  fields: FormControl[],
  values: Record<string, FormValue>,
): { label: string; value: string }[] {
  return collectVisibleControls(fields, values).map((f) => ({
    label: f.label,
    value: Array.isArray(values[f.key] ?? f.defaultValue)
      ? (values[f.key] ?? f.defaultValue as string[]).join("、")
      : String(values[f.key] ?? f.defaultValue),
  }));
}
