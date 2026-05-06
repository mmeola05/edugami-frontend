import { boot } from "quasar/wrappers";
import { notifyError } from "src/utils/utils";
import { reportFrontendError } from "src/utils/frontendErrorReporter";

export default boot(({ app }) => {
  app.config.errorHandler = (error, instance, info) => {
    notifyError("Se produjo un error no controlado en la interfaz.");
    reportFrontendError({
      severity: "error",
      message: error?.message || "Vue render error",
      stack: error?.stack || null,
      component: info || instance?.$options?.name || null,
      routePath: window.location.pathname
    });
    console.error(error);
  };

  window.addEventListener("error", (event) => {
    const targetIsResource =
      event?.target
      && event.target !== window
      && typeof event.target?.tagName === "string";

    reportFrontendError({
      severity: "error",
      message: targetIsResource
        ? `Fallo cargando recurso ${event.target?.tagName}`
        : event.error?.message || event.message || "Window error",
      stack: event.error?.stack || null,
      component: targetIsResource ? event.target?.currentSrc || event.target?.src || event.target?.href || "resource" : "window.error",
      routePath: window.location.pathname
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    notifyError("Se capturo una promesa rechazada no controlada.");
    reportFrontendError({
      severity: "error",
      message: event.reason?.message || String(event.reason || "Unhandled promise rejection"),
      stack: event.reason?.stack || null,
      component: "unhandledrejection",
      routePath: window.location.pathname
    });
  });
});
