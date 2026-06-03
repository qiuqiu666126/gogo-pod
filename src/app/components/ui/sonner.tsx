import { Toaster as Sonner, type ToasterProps } from "sonner";

/** 成功类提示请使用 taskToast.showSuccessNotice 系列，保持与产品稿一致的浅绿样式 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "shadow-md border",
          error: "bg-red-50 border-red-200 text-red-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
