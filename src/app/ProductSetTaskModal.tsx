import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { UploadedAsset } from "./api/uploadApi";
import { assetsToSubmitInput, type SubmitFeatureTaskInput } from "./featureTasks";
import { TaskMaterialUploadSection } from "./TaskMaterialUploadSection";
import { DynamicFormFields } from "./components/DynamicFormFields";
import { HoverImagePreview } from "./components/HoverImagePreview";
import { useSceneFormState } from "./hooks/useSceneFormState";
import type { FormControl, FormValue } from "../shared/sceneFormSchema";
import { findProductSetTemplate } from "./productSetTemplateStore";

const categoryTabs = ["推荐", "服饰", "铁皮画", "家用纺织", "挂钟", "装饰画", "手机壳", "亚克力", "其他"];

const templates = [
  { id: 1, name: "男士黑色T恤白底", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=240&h=240&fit=crop&auto=format" },
  { id: 2, name: "母亲节拼图挂件", img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=240&h=240&fit=crop&auto=format" },
  { id: 3, name: "花瓶", img: "https://images.unsplash.com/photo-1578746354269-28215ffad412?w=240&h=240&fit=crop&auto=format" },
  { id: 4, name: "母亲节贺卡", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=240&h=240&fit=crop&auto=format" },
  { id: 5, name: "陶瓷挂牌", img: "https://images.unsplash.com/photo-1610701596007-11502805a51d?w=240&h=240&fit=crop&auto=format" },
  { id: 6, name: "母亲节亚克力小夜灯", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=240&h=240&fit=crop&auto=format" },
  { id: 7, name: "化妆包", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=240&h=240&fit=crop&auto=format" },
  { id: 8, name: "邮箱套", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=240&h=240&fit=crop&auto=format" },
];

function Step2Content({
  assets,
  onAssetsChange,
  preset,
  formFields,
  formValues,
  onFormChange,
}: {
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
  preset: { formFields: FormControl[] } | null | undefined;
  formFields: FormControl[];
  formValues: Record<string, FormValue>;
  onFormChange: (key: string, value: FormValue) => void;
}) {
  return (
    <div className="px-5 py-4 overflow-y-auto max-h-[calc(92vh-220px)] space-y-5">
      <div>
        <SectionTitle>添加素材</SectionTitle>
        <TaskMaterialUploadSection assets={assets} onAssetsChange={onAssetsChange} />
      </div>

      <div className="pt-1 border-t border-border/60">
        <SectionTitle>印花处理</SectionTitle>
        {preset ? (
          <DynamicFormFields fields={formFields} values={formValues} onChange={onFormChange} />
        ) : (
          <p className="text-[13px] text-muted-foreground">请在管理后台配置「商品套图 · 印花处理」场景预设</p>
        )}
      </div>
    </div>
  );
}

export function ProductSetPresetPreview({
  fields,
  values,
  onChange,
}: {
  fields: FormControl[];
  values: Record<string, FormValue>;
  onChange: (key: string, value: FormValue) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle>添加素材</SectionTitle>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
          <div className="rounded-xl border border-dashed border-border/70 bg-muted px-6 py-7 text-center">
            <div className="inline-flex h-9 items-center rounded-md border border-border bg-background px-7 text-[13px] text-foreground">
              上传图片
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground">将文件拖放到此处，不超过 100 张</div>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <div className="h-9 rounded-md border border-border bg-background px-7 text-[13px] leading-9 text-foreground">
              从我的空间选取
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 pt-1">
        <SectionTitle>印花处理</SectionTitle>
        <DynamicFormFields fields={fields} values={values} onChange={onChange} />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="text-[13px] font-medium text-foreground mb-3">{children}</div>;
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-6 px-5 py-3 border-b border-border/80">
      <div className={`flex items-center gap-2 ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold ${
            step === 1 ? "bg-primary text-white" : "border border-border font-medium"
          }`}
        >
          1
        </span>
        <span className={`text-[13px] ${step === 1 ? "font-medium text-primary" : ""}`}>模板选择</span>
      </div>
      <div className={`flex items-center gap-2 ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold ${
            step === 2 ? "bg-primary text-white" : "border border-border font-medium"
          }`}
        >
          2
        </span>
        <span className={`text-[13px] ${step === 2 ? "font-medium text-primary" : ""}`}>印花选择</span>
      </div>
    </div>
  );
}

function Step1Content({
  category,
  setCategory,
  selected,
  toggleTemplate,
}: {
  category: string;
  setCategory: (v: string) => void;
  selected: number[];
  toggleTemplate: (id: number) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-1 px-5 pt-3 pb-0 overflow-x-auto scrollbar-none border-b border-border/80">
        {categoryTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              category === tab
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 overflow-y-auto max-h-[calc(92vh-220px)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleTemplate(item.id)}
                className={`relative text-left rounded-xl border transition-colors ${
                  checked ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/35"
                }`}
              >
                <div className="relative flex gap-1 p-2 bg-muted/30">
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="absolute top-2 left-2 z-10 accent-primary rounded"
                    aria-label={`选择${item.name}`}
                  />
                  <div className="flex flex-col gap-1 w-10 shrink-0 pt-5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-8 rounded border border-border/60 bg-muted">
                        <HoverImagePreview
                          src={item.img}
                          alt={`${item.name}缩略图${i + 1}`}
                          previewClassName="w-[360px] max-w-[min(360px,78vw)]"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0 aspect-square rounded-lg border border-border/60 bg-muted">
                    <HoverImagePreview src={item.img} alt={item.name} />
                  </div>
                </div>
                <div className="px-3 py-2.5 border-t border-border/60">
                  <span className="text-[10px] font-semibold text-primary border border-primary/30 px-1.5 py-0.5 rounded mr-1.5">
                    官方
                  </span>
                  <span className="text-[12px] text-foreground">{item.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function ProductSetTaskModal({
  open,
  onClose,
  onSubmit,
  initialAssets,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (input: SubmitFeatureTaskInput) => void;
  initialAssets?: UploadedAsset[];
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState("推荐");
  const [selected, setSelected] = useState<number[]>([]);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const { preset, formValues, handleChange, submitParams } = useSceneFormState(
    "product-set",
    "印花处理",
    open && step === 2,
  );

  useEffect(() => {
    if (open) {
      if (initialAssets?.length) {
        setAssets([...initialAssets]);
        setStep(2);
      }
    } else {
      setStep(1);
      setCategory("推荐");
      setSelected([]);
      setAssets([]);
    }
  }, [open, initialAssets]);

  const toggleTemplate = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(960px,96vw)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ fontFamily: "'Inter','Noto Sans SC',sans-serif" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80">
            <Dialog.Title className="text-[18px] font-semibold text-foreground">新建商品套图任务</Dialog.Title>
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <StepIndicator step={step} />

          {step === 1 ? (
            <Step1Content
              category={category}
              setCategory={setCategory}
              selected={selected}
              toggleTemplate={toggleTemplate}
            />
          ) : (
            <Step2Content
              assets={assets}
              onAssetsChange={setAssets}
              preset={preset}
              formFields={preset?.formFields ?? []}
              formValues={formValues}
              onFormChange={handleChange}
            />
          )}

          <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border/80">
            {step === 2 ? (
              <span />
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="h-9 px-5 rounded-md border border-border bg-transparent text-[13px] text-foreground hover:bg-muted/40 transition-colors"
              >
                取消
              </button>
              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  className="h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={() => {
                    onSubmit?.(
                      assetsToSubmitInput(assets, {
                        params: [
                          { label: "模板数", value: String(selected.length) },
                          { label: "分类", value: category },
                          ...selected.flatMap((id, index) => {
                            const template = findProductSetTemplate(String(id));
                            if (!template) return [];
                            return [
                              { label: `模板${index + 1}名称`, value: template.name },
                              { label: `模板${index + 1}套图图片数`, value: String(template.images.length) },
                              {
                                label: `模板${index + 1}区域印花图数`,
                                value: String(
                                  template.images.reduce(
                                    (count, image) =>
                                      count +
                                      image.placements.filter((placement) => (placement.printImageUrl ?? "").trim()).length,
                                    0,
                                  ),
                                ),
                              },
                              {
                                label: `模板${index + 1}套图图片配置`,
                                value: JSON.stringify(template.images),
                              },
                            ];
                          }),
                          ...submitParams(),
                        ],
                        templateConfigs: selected
                          .map((id) => findProductSetTemplate(String(id)))
                          .filter((template): template is NonNullable<typeof template> => Boolean(template))
                          .map((template) => ({
                            templateId: template.id,
                            templateName: template.name,
                            category: template.category,
                            images: template.images,
                            promptTemplate: template.promptTemplate,
                          })),
                      }),
                    );
                    handleClose();
                  }}
                  className="h-9 px-5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
                >
                  提交
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
