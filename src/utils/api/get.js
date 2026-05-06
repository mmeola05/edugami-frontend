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

if (LocalStorage.getItem("ip")) {
  ip = LocalStorage.getItem("ip");
}

if (LocalStorage.getItem("port")) {
  port = LocalStorage.getItem("port");
}

let baseUrl = `http://${ip}:${port}/api/v1`;

function closeSession() {
  removeTokens();
  window.location.href = "/auth/login";
}

function get(endpoint, params) {
  return axios
    .get(`${baseUrl}/${endpoint}`, { params })
    .then((res) => {
      const { data } = res;
      if (data.error && data.error.ok === false) {
        if (data.error.code === 54321) {
          notifyErrorBack(data.error.message);
        } else {
          notifyError(data.error.message);
        }
        return res;
      } else {
        if (data.tokenError) {
          closeSession();
        }
        return res;
      }
    })
    .catch((error) => {
      if (error.code !== "ECONNABORTED") {
        notifyError(error.message);
        throw error;
      }
    });
}

// EduGami Endpoints
export const getMe = () => get("auth/me");
export const getAccess = () => get("auth/access");
export const getTenantMe = () => get("auth/tenant/me");
export const getTenantAccess = () => get("auth/tenant/access");
export const getTenantOverview = () => get("tenant/overview");
export const getTenantReportsDashboard = () => get("tenant/reports/dashboard");
export const getTenantPeriods = () => get("tenant/periods");
export const getTenantClasses = () => get("tenant/classes");
export const getTenantCourses = () => get("tenant/courses");
export const getTenantStudents = () => get("tenant/students");
export const getTenantEnrollments = () => get("tenant/enrollments");
export const getTenantTeachers = () => get("tenant/teachers");
export const getTenantTeacherAssignments = () => get("tenant/teacher-assignments");
export const getTenantAcademicHistory = (params) => get("tenant/academic-history", params);
export const getTenantGuardians = () => get("tenant/guardians");
export const getTenantAdminUsers = () => get("tenant/admin/users");
export const getTenantAdminRoles = () => get("tenant/admin/roles");
export const getTenantSettings = () => get("tenant/settings");
export const getDashboardOverview = () => get("root/dashboard");
export const getTenants = (params) => get("root/tenants", params);
export const getTenant = (id) => get(`root/tenants/${id}`);
export const getTenantModules = (id) => get(`root/tenants/${id}/modules`);
export const getTenantEffectiveModules = (id) => get(`root/tenants/${id}/modules/effective`);
export const getTenantRoles = (id) => get(`root/tenants/${id}/roles`);
export const getTenantUsers = (id) => get(`root/tenants/${id}/users`);
export const getTenantUserEffectiveAccess = (tenantId, userId) =>
  get(`root/tenants/${tenantId}/users/${userId}/effective-access`);
export const getAlerts = (params) => get("root/alerts", params);
export const getAlertsReport = () => get("root/alerts/report");
export const getAlertDetail = (id) => get(`root/alerts/${id}`);
export const getMetricsOverview = () => get("root/metrics/overview");
export const getMetricsCharts = () => get("root/metrics/charts");
export const getServices = () => get("root/services");
export const getPlatformModules = () => get("root/modules");
export const getPlatformAccounts = () => get("root/platform-accounts");
export const getPlatformAccount = (id) => get(`root/platform-accounts/${id}`);
export const getRbacOverview = () => get("root/rbac");
export const getRole = (roleId) => get(`root/rbac/roles/${roleId}`);
export const getAccountRbac = (accountId) => get(`root/rbac/accounts/${accountId}`);
export const getAuditEvents = (params) => get("root/audit", params);
