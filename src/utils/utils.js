import { useNotificationStore } from "src/stores/notifications";

export const rules = {
  required: [(val) => !!val || "Field is required"],
  email: [(val) => /.+@.+\..+/.test(val) || "Invalid email format"],
  minLength: (len) => [
    (val) => (val && val.length >= len) || `Min ${len} characters`,
  ],
};

// Helper function to get the notification store
function getNotificationStore() {
  return useNotificationStore();
}

export function notifySuccess(msg, title = null) {
  getNotificationStore().addNotification({
    type: "success",
    message: msg,
    title,
  });
}

export function notifyError(msg, title = null) {
  getNotificationStore().addNotification({
    type: "error",
    message: msg,
    title,
  });
}

export function notifyWarning(msg, title = null) {
  getNotificationStore().addNotification({
    type: "warning",
    message: msg,
    title,
  });
}

export function notifyInfo(msg, title = null) {
  getNotificationStore().addNotification({ type: "info", message: msg, title });
}

export function notifyServer(msg) {
  getNotificationStore().addNotification({
    type: "fatal",
    message: msg,
    title: "Error de Servidor",
  });
}

export function notifyErrorBack(msg) {
  notifyServer(msg);
}

export const utils = {
  rules,
  notifySuccess,
  notifyWarning,
  notifyError,
  notifyInfo,
  notifyServer,
  notifyErrorBack,
};
