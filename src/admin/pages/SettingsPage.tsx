import { AdminShell } from "../components/AdminShell";
import { Card, Field, inputCls } from "../components/ui";

export function SettingsPage() {
  return (
    <AdminShell title="系统设置" subtitle="全局配置（页面原型，暂未持久化）">
      <div className="p-6 max-w-[640px] space-y-4">
        <Card title="环境与安全">
          <div className="space-y-4">
            <Field label="管理后台访问 Token" hint="API 接入后用于鉴权">
              <input className={inputCls} defaultValue="pod-admin-dev" readOnly />
            </Field>
            <Field label="默认 API 超时（秒）">
              <input className={inputCls} type="number" defaultValue={120} />
            </Field>
            <Field label="任务并发上限">
              <input className={inputCls} type="number" defaultValue={10} />
            </Field>
          </div>
        </Card>

        <Card title="对象存储（规划）">
          <p className="text-[13px] text-muted-foreground">
            素材上传 presign、结果图归档将在此配置 OSS / S3 区域与 Bucket，与前台
            <code className="mx-1 px-1 bg-muted rounded text-[12px]">uploadApi</code> 对接。
          </p>
        </Card>

        <Card title="套图模板库（规划）">
          <p className="text-[13px] text-muted-foreground">
            商品套图官方模板的品类、PSD 资源、预览图管理模块，对应前台 ProductSetTaskModal Step1。
          </p>
        </Card>
      </div>
    </AdminShell>
  );
}
