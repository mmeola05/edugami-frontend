import { boot } from "quasar/wrappers";
import * as Sentry from "@sentry/vue";
import { redactValue } from "src/utils/observability";

export default boot(({ app }) => {
  const enabled = import.meta.env.VITE_SENTRY_ENABLED === "true";
  const dsn = import.meta.env.VITE_SENTRY_DSN || "";

  if (!enabled || !dsn) return;

  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "local",
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0),
    sendDefaultPii: false,
    beforeSend(event) {
      return redactValue(event);
    }
  });
});
