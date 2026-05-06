import { LocalStorage } from "quasar";
import { getToken } from "src/utils/authUtil";
import { createRequestContext } from "src/utils/observability";

const recentErrors = new Map();

function apiBaseUrl() {
  const devMode = process.env.DEV;
  let ip = devMode
    ? process.env.VITE_API_IP || "localhost"
    : process.env.VITE_API_IP_PROD || "localhost";
  let port = devMode
    ? process.env.VITE_API_PORT || "7002"
    : process.env.VITE_API_PORT_PROD || "7002";

  if (LocalStorage.getItem("ip")) ip = LocalStorage.getItem("ip");
  if (LocalStorage.getItem("port")) port = LocalStorage.getItem("port");

  return `http://${ip}:${port}/api/v1`;
}

export async function reportFrontendError(payload) {
  const token = getToken();
  if (!token) return;

  const key = `${payload.routePath || "unknown"}:${payload.message || "unknown"}`;
  const last = recentErrors.get(key) || 0;
  if (Date.now() - last < 15000) return;
  recentErrors.set(key, Date.now());

  const { requestId, correlationId } = createRequestContext();

  await fetch(`${apiBaseUrl()}/root/alerts/frontend-error`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-request-id": requestId,
      "x-correlation-id": correlationId,
    },
    body: JSON.stringify({
      severity: payload.severity || "error",
      message: payload.message || "Frontend runtime error",
      stack: payload.stack || null,
      component: payload.component || null,
      routePath: payload.routePath || window.location.pathname,
      requestId,
      correlationId
    }),
  }).catch(() => null);
}
