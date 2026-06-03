import type { FormControl } from "../../shared/sceneFormSchema";
import { adminHttp } from "./adminApi";

export type WorkflowStepSummaryDto = {
  featureCode: string;
  featureName: string;
  presetLabel: string;
};

export type WorkflowStepDetailDto = {
  id?: number;
  sortOrder?: number;
  featureCode: string;
  featureName: string;
  scenePresetId: number;
  presetUuid?: string;
  presetLabel?: string;
  sceneKey?: string;
  sceneLabel?: string;
  formFields?: FormControl[];
  nodeConfig?: Record<string, unknown>;
  manualReview?: boolean;
};

export type WorkflowTemplateSummaryDto = {
  id: number;
  templateUuid: string;
  name: string;
  categoryCode: string;
  categoryLabel: string;
  enabled: boolean;
  sortOrder: number;
  stepSummary: string;
  steps: WorkflowStepSummaryDto[];
  updatedAt: string;
};

export type WorkflowTemplateDetailDto = Omit<WorkflowTemplateSummaryDto, "steps"> & {
  steps: WorkflowStepDetailDto[];
  created_at?: string;
};

export type WorkflowTemplateListDto = {
  list: WorkflowTemplateSummaryDto[];
  total: number;
};

export type WorkflowCategoryOption = {
  code: string;
  label: string;
  value: string;
};

export type WorkflowTemplateMetaDto = {
  categories: WorkflowCategoryOption[];
  features: Array<{ value: string; label: string; code: string; enabled: boolean }>;
};

export type WorkflowStepOptionPresetDto = {
  id: number;
  presetUuid: string;
  label: string;
  sceneKey: string;
  sceneLabel: string;
  featureCode: string;
  featureName: string;
  enabled: boolean;
};

export type WorkflowStepOptionGroupDto = {
  featureCode: string;
  featureName: string;
  presets: WorkflowStepOptionPresetDto[];
};

export type WorkflowStepOptionsDto = {
  groups: WorkflowStepOptionGroupDto[];
};

export type WorkflowStepSchemaDto = {
  featureCode: string;
  featureName: string;
  scenePresetId: number;
  presetUuid: string;
  label: string;
  sceneKey: string;
  sceneLabel: string;
  formFields: FormControl[];
  defaultConfig: Record<string, unknown>;
};

export type WorkflowStepSavePayload = {
  scenePresetId: number;
  nodeConfig?: Record<string, unknown>;
  manualReview?: boolean;
};

export type WorkflowTemplateSavePayload = {
  name: string;
  categoryCode: string;
  enabled?: boolean;
  sortOrder?: number;
  steps: WorkflowStepSavePayload[];
};

export type WorkflowTemplateListParams = {
  category_code?: string;
  enabled?: number;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export async function listWorkflowTemplates(
  params: WorkflowTemplateListParams,
): Promise<WorkflowTemplateListDto> {
  return adminHttp.get<WorkflowTemplateListDto>(
    "/admin/ai-workflow-template/list",
    {
      fallbackMessage: "获取工作流模版列表失败",
      query: {
        category_code: params.category_code,
        enabled: params.enabled,
        keyword: params.keyword?.trim() || undefined,
        page: params.page,
        page_size: params.page_size,
      },
    },
  );
}

export async function getWorkflowTemplateMeta(): Promise<WorkflowTemplateMetaDto> {
  return adminHttp.get<WorkflowTemplateMetaDto>(
    "/admin/ai-workflow-template/meta",
    { fallbackMessage: "获取工作流元数据失败" },
  );
}

export async function getWorkflowStepOptions(
  featureCode?: string,
): Promise<WorkflowStepOptionsDto> {
  return adminHttp.get<WorkflowStepOptionsDto>(
    "/admin/ai-workflow-template/step-options",
    {
      fallbackMessage: "获取可选工作流步骤失败",
      query: { feature_code: featureCode },
    },
  );
}

export async function getWorkflowStepSchema(
  scenePresetId: number,
): Promise<WorkflowStepSchemaDto> {
  return adminHttp.get<WorkflowStepSchemaDto>(
    `/admin/ai-workflow-template/step-schema/${scenePresetId}`,
    { fallbackMessage: "获取节点控件配置失败" },
  );
}

export async function getWorkflowTemplateDetail(
  id: number,
): Promise<WorkflowTemplateDetailDto> {
  return adminHttp.get<WorkflowTemplateDetailDto>(
    `/admin/ai-workflow-template/${id}`,
    { fallbackMessage: "获取工作流模版详情失败" },
  );
}

export async function createWorkflowTemplate(
  payload: WorkflowTemplateSavePayload,
): Promise<WorkflowTemplateDetailDto> {
  return adminHttp.post<WorkflowTemplateDetailDto>(
    "/admin/ai-workflow-template",
    payload,
    { fallbackMessage: "创建工作流模版失败" },
  );
}

export async function updateWorkflowTemplate(
  id: number,
  payload: WorkflowTemplateSavePayload,
): Promise<WorkflowTemplateDetailDto> {
  return adminHttp.put<WorkflowTemplateDetailDto>(
    `/admin/ai-workflow-template/${id}`,
    payload,
    { fallbackMessage: "保存工作流模版失败" },
  );
}

export async function deleteWorkflowTemplate(id: number): Promise<void> {
  await adminHttp.delete<unknown>(
    `/admin/ai-workflow-template/${id}`,
    { fallbackMessage: "删除工作流模版失败" },
  );
}
