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

function put(endpoint, data) {
  return axios
    .put(`${baseUrl}/${endpoint}`, data)
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
        notifyError("defaultError");
        throw error;
      }
    });
}

export const updateTenantModules = (tenantId, data) =>
  put(`root/tenants/${tenantId}/modules`, data);
export const setTenantModules = (tenantId, modules) =>
  put(`root/tenants/${tenantId}/modules`, { modules });
export const setTenantUserRoles = (tenantId, userId, roleCodes) =>
  put(`root/tenants/${tenantId}/users/${userId}/roles`, { roleCodes });
export const setTenantRoleAccess = (tenantId, roleCode, moduleKeys, permissionCodes) =>
  put(`root/tenants/${tenantId}/roles/${roleCode}/access`, { moduleKeys, permissionCodes });
export const updatePlatformModule = (data) => put("root/modules", data);
export const setRolePermissions = (roleId, permissionCodes) =>
  put(`root/rbac/roles/${roleId}/permissions`, { permissionCodes });
export const setDirectPermissions = (accountId, permissionCodes) =>
  put(`root/rbac/accounts/${accountId}/permissions`, { permissionCodes });
export const setTenantAdminRoleAccess = (roleCode, moduleKeys, permissionCodes) =>
  put(`tenant/admin/roles/${roleCode}/access`, { moduleKeys, permissionCodes });
