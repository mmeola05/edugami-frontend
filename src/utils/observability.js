import * as Sentry from "@sentry/vue";

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "password",
  "newpassword",
  "token",
  "refresh_token",
  "refreshtoken",
  "access_token",
  "email",
  "actor_email",
  "x-ops-shared-token"
]);

let currentCorrelationId = null;

function createId() {
  return crypto.randomUUID();
}

function redactString(value) {
  return value.replace(EMAIL_PATTERN, "***@***");
}

export function redactValue(value) {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, current]) => {
      if (SENSITIVE_KEYS.has(String(key).toLowerCase())) {
        return [key, "***"];
      }
      return [key, redactValue(current)];
    })
  );
}

export function createRequestContext() {
  const requestId = createId();
  currentCorrelationId = currentCorrelationId || createId();

  return {
    requestId,
    correlationId: currentCorrelationId
  };
}

export function syncCorrelationFromResponse(response) {
  const responseCorrelationId =
    response?.headers?.["x-correlation-id"] ||
    response?.data?.error?.correlationId ||
    response?.data?.correlationId;

  if (responseCorrelationId) {
    currentCorrelationId = responseCorrelationId;
  }
}

export function captureApiError(error) {
  if (!error) return;

  const requestId =
    error.response?.headers?.["x-request-id"] ||
    error.response?.data?.error?.requestId ||
    error.config?.headers?.["x-request-id"] ||
    null;
  const correlationId =
    error.response?.headers?.["x-correlation-id"] ||
    error.response?.data?.error?.correlationId ||
    error.config?.headers?.["x-correlation-id"] ||
    currentCorrelationId ||
    null;
  const sentryEventId =
    error.response?.headers?.["x-sentry-event-id"] ||
    error.response?.data?.error?.sentryEventId ||
    null;

  Sentry.withScope((scope) => {
    if (requestId) scope.setTag("request_id", requestId);
    if (correlationId) scope.setTag("correlation_id", correlationId);
    if (sentryEventId) scope.setTag("backend_sentry_event_id", sentryEventId);
    scope.setContext("api_error", redactValue({
      method: error.config?.method,
      url: error.config?.url,
      status: error.response?.status || null,
      code: error.code || null,
      response: error.response?.data || null
    }));
    Sentry.captureException(error);
  });
}
