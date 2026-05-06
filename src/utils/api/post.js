import axios from "../axiosConfig";
import { notifyError, notifyWarning, notifyErrorBack } from "src/utils/utils";
import { LocalStorage } from "quasar";
import { removeTokens } from "src/utils/authUtil";

const devMode = process.env.DEV;
let ip = devMode
  ? process.env.VITE_API_IP || "localhost"
  : process.env.VITE_API_IP_PROD || "localhost";
let port = devMode
  ? process.env.VITE_API_PORT || "7002"
  : process.env.VITE_API_PORT_PROD || "7002";

if (LocalStorage.getItem("ip")) ip = LocalStorage.getItem("ip");
if (LocalStorage.getItem("port")) port = LocalStorage.getItem("port");

let baseUrl = `http://${ip}:${port}/api/v1`;

function closeSession() {
  removeTokens();
  window.location.href = "/auth/login";
}

function post(endpoint, data) {
  return axios
    .post(`${baseUrl}/${endpoint}`, data)
    .then((res) => {
      const { data } = res;
      if (data.error && data.error.ok === false) {
        if (data.error.code === 54321) notifyErrorBack(data.error.message);
        else notifyError(data.error.message);
        return res;
      } else {
        if (data.tokenError) closeSession();
        return res;
      }
    })
    .catch((error) => {
      if (error.code !== "ECONNABORTED") {
        const msg = error.response?.data?.error?.message || "defaultError";
        notifyError(msg);
        throw error;
      }
    });
}

// Auth
export const login = (email, password) =>
  post("auth/login/root", { email, password });
export const unifiedLogin = (email, password) =>
  post("auth/login", { email, password });
export const tenantLogin = (email, password, context = {}) =>
  post("auth/login/tenant", {
    email,
    password,
    tenantId: context.tenantId || null,
    tenantSlug: context.tenantSlug || null,
  });
export const refresh = (refreshToken) => post("auth/refresh", { refreshToken });
export const logout = (refreshToken) => post("auth/logout", { refreshToken });
export const tenantRefresh = (refreshToken) =>
  post("auth/tenant/refresh", { refreshToken });
export const tenantLogout = (refreshToken) =>
  post("auth/tenant/logout", { refreshToken });
export const tenantSwitchContext = (context = {}) =>
  post("auth/tenant/context", {
    tenantId: context.tenantId || null,
    tenantSlug: context.tenantSlug || null,
  });
export const requestRecovery = (email) =>
  post("auth/password-recovery/request", { email });
export const resetPassword = (token, newPassword) =>
  post("auth/password-recovery/reset", { token, newPassword });

// Tenants
export const createTenant = (data) => post("root/tenants", data);
export const suspendTenant = (id) => post(`root/tenants/${id}/suspend`);
export const createTenantUser = (tenantId, data) => post(`root/tenants/${tenantId}/users`, data);
export const createTenantAdminUser = (data) => post("tenant/admin/users", data);
export const createTenantPeriod = (data) => post("tenant/periods", data);
export const createTenantClass = (data) => post("tenant/classes", data);
export const createTenantCourse = (data) => post("tenant/courses", data);
export const createTenantStudent = (data) => post("tenant/students", data);
export const createTenantEnrollment = (data) => post("tenant/enrollments", data);
export const createTenantTeacherAssignment = (data) => post("tenant/teacher-assignments", data);
export const moveTenantStudentToClass = (studentId, data) =>
  post(`tenant/students/${studentId}/move-class`, data);
export const assignTenantStudentSubjects = (studentId, data) =>
  post(`tenant/students/${studentId}/subjects`, data);
export const assignTenantTeacher = (data) =>
  post("tenant/teacher-assignments/assign", data);
export const linkTenantGuardian = (studentId, data) =>
  post(`tenant/students/${studentId}/guardians`, data);
export const createPlatformAccount = (data) => post("root/platform-accounts", data);
export const createRole = (data) => post("root/rbac/roles", data);
export const assignRole = (accountId, roleId) =>
  post(`root/rbac/accounts/${accountId}/roles`, { roleId });

// Alerts
export const resolveAlert = (id, resolutionNote = "") =>
  post(`root/alerts/${id}/resolve`, { resolutionNote });
export const reopenAlert = (id, note = "") =>
  post(`root/alerts/${id}/reopen`, { note });
export const updateAlertStatus = (id, status, note = "") =>
  post(`root/alerts/${id}/status`, { status, note });
export const addAlertNote = (id, body, noteType = "investigation") =>
  post(`root/alerts/${id}/notes`, { body, noteType, isInternal: true });
export const assignAlert = (id, assignedPlatformAccountId = null, slaDueAt = null, note = "") =>
  post(`root/alerts/${id}/assign`, { assignedPlatformAccountId, slaDueAt, note });

// Services
export const restartService = (key) => post(`root/services/${key}/restart`);
