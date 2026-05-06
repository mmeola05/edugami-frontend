import api from "./index";
import { notifyError, notifyErrorBack } from "src/utils/utils";
import { LocalStorage } from "quasar";

const devMode = process.env.DEV;

let ip = devMode
  ? process.env.VITE_API_IP || "localhost"
  : process.env.VITE_API_IP_PROD || "localhost";
let port = devMode
  ? process.env.VITE_API_PORT || "7002"
  : process.env.VITE_API_PORT_PROD || "7002";

if (LocalStorage.getItem("ip")) ip = LocalStorage.getItem("ip");
if (LocalStorage.getItem("port")) port = LocalStorage.getItem("port");

const baseRoute = `http://${ip}:${port}/api/v1`;

function deleteRequest(url) {
  return api
    .delete(`${baseRoute}/${url}`)
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

export const deleteRole = (roleId) =>
  deleteRequest(`root/rbac/roles/${roleId}`);
export const revokeRole = (accountId, roleId) =>
  deleteRequest(`root/rbac/accounts/${accountId}/roles/${roleId}`);
