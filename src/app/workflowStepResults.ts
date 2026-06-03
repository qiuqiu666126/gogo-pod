import type { WorkflowTask } from "./workflowTasks";

const DEMO_SOURCE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=800&fit=crop&auto=format";

const DEMO_RESULT = new URL("./assets/task-demo/result-pattern.png", import.meta.url).href;

const DEMO_MOCKUP =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&auto=format";

export type WorkflowGeneratedImage = {
  id: string;
  url: string;
  discarded?: boolean;
};

export type WorkflowStepResult =
  | {
      stepName: string;
      kind: "image";
      imageUrl: string;
      sourceUrl?: string;
    }
  | {
      stepName: string;
      kind: "product-set";
      sourceImageUrl: string;
      generatedImages: WorkflowGeneratedImage[];
    }
  | {
      stepName: string;
      kind: "title";
      productImageUrl: string;
      title: string;
    };

const DEFAULT_TITLE =
  "White T-Shirt Super Mario Character Print Casual Wear for Men and Women Gaming Fans Streetwear Style";

function isTitleStep(name: string) {
  return name === "标题提取";
}

function isProductSetStep(name: string) {
  return name === "商品套图";
}

const MOCKUP_GENERATED_URLS = [
  "https://images.unsplash.com/photo-1618354691373-d8519e0a5a96?w=400&h=520&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=520&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1622445275463-8781766c2ab8?w=400&h=520&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=520&fit=crop&auto=format",
];

/** 为工作流任务生成各步骤的 Mock 结果（对接后台后改为 API 返回） */
export function buildWorkflowStepResults(task: WorkflowTask): WorkflowStepResult[] {
  return task.steps.map((stepName, index) => {
    if (isTitleStep(stepName)) {
      return {
        stepName,
        kind: "title",
        productImageUrl: task.preview || DEMO_MOCKUP,
        title: DEFAULT_TITLE,
      };
    }

    if (isProductSetStep(stepName)) {
      return {
        stepName,
        kind: "product-set",
        sourceImageUrl: DEMO_RESULT,
        generatedImages: MOCKUP_GENERATED_URLS.map((url, i) => ({
          id: `gen-${i}`,
          url,
        })),
      };
    }

    return {
      stepName,
      kind: "image",
      imageUrl: index === 0 ? DEMO_SOURCE : DEMO_RESULT,
      sourceUrl: index > 0 ? DEMO_SOURCE : undefined,
    };
  });
}
