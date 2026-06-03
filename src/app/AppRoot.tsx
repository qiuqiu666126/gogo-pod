import { useEffect } from "react";
import App from "./App";
import { FrontendLoginPage } from "./FrontendLoginPage";
import {
  ensureDevPreviewSession,
  shouldSkipFrontendLogin,
  useFrontendSession,
} from "./auth/useFrontendSession";

export default function AppRoot() {
  const session = useFrontendSession();

  useEffect(() => {
    if (shouldSkipFrontendLogin() && !session) {
      ensureDevPreviewSession();
    }
  }, [session]);

  if (!session) {
    if (shouldSkipFrontendLogin()) {
      return (
        <div className="min-h-full flex items-center justify-center text-muted-foreground text-sm">
          正在进入预览…
        </div>
      );
    }
    return <FrontendLoginPage />;
  }

  return <App />;
}
