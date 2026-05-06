import { LocalStorage } from "quasar";

const TOKEN_KEY = "edugami_access_token";
const REFRESH_KEY = "edugami_refresh_token";
const SESSION_SCOPE_KEY = "edugami_session_scope";

export const saveTokens = (access, refresh, scope = "platform") => {
  LocalStorage.set(TOKEN_KEY, access);
  LocalStorage.set(REFRESH_KEY, refresh);
  LocalStorage.set(SESSION_SCOPE_KEY, scope);
};

export const getToken = () => LocalStorage.getItem(TOKEN_KEY);
export const getAccessToken = getToken;
export const getRefreshToken = () => LocalStorage.getItem(REFRESH_KEY);
export const getSessionScope = () => LocalStorage.getItem(SESSION_SCOPE_KEY);

export const removeTokens = () => {
  LocalStorage.remove(TOKEN_KEY);
  LocalStorage.remove(REFRESH_KEY);
  LocalStorage.remove(SESSION_SCOPE_KEY);
};

export const hasSession = () => !!getToken();
export const hasTenantSession = () => hasSession() && getSessionScope() === "tenant";
export const hasPlatformSession = () =>
  hasSession() && (!getSessionScope() || getSessionScope() === "platform");
