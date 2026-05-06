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

function patch(endpoint, data) {
  return axios
    .patch(`${baseUrl}/${endpoint}`, data)
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

export const updateTenant = (id, data) => patch(`root/tenants/${id}`, data);
export const updateTenantAdminUser = (id, data) => patch(`tenant/admin/users/${id}`, data);
export const updateTenantPeriod = (id, data) => patch(`tenant/periods/${id}`, data);
export const updateTenantClass = (id, data) => patch(`tenant/classes/${id}`, data);
export const updateTenantCourse = (id, data) => patch(`tenant/courses/${id}`, data);
export const updateTenantStudent = (id, data) => patch(`tenant/students/${id}`, data);
export const updateTenantEnrollment = (id, data) => patch(`tenant/enrollments/${id}`, data);
export const updateTenantTeacherAssignment = (id, data) => patch(`tenant/teacher-assignments/${id}`, data);
export const updateTenantSettings = (data) => patch(`tenant/settings`, data);
export const updatePlatformAccount = (id, data) =>
  patch(`root/platform-accounts/${id}`, data);
export const updateRole = (roleId, data) => patch(`root/rbac/roles/${roleId}`, data);
