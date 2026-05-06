import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getTenantAccess, getTenantMe } from "src/utils/api/get";
import {
  tenantLogin as apiTenantLogin,
  tenantLogout as apiTenantLogout,
  tenantSwitchContext as apiTenantSwitchContext,
} from "src/utils/api/post";
import { getRefreshToken, removeTokens, saveTokens } from "src/utils/authUtil";

export const useTenantSessionStore = defineStore("tenantSession", () => {
  const user = ref(null);
  const activeContext = ref(null);
  const contexts = ref([]);
  const access = ref({ permissions: [], modules: [] });
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value && activeContext.value));
  const hasMultipleContexts = computed(() => contexts.value.length > 1);
  const permissions = computed(() => access.value.permissions || []);
  const modules = computed(() => access.value.modules || []);
  const permissionCodes = computed(() => new Set(permissions.value));
  const moduleKeys = computed(
    () =>
      new Set(
        modules.value
          .map((item) => item?.module_key || item?.moduleKey || item?.key || item)
          .filter(Boolean),
      ),
  );

  function applySession(payload) {
    const data = payload || {};
    if (data.accessToken && data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken, "tenant");
    }
    user.value = data.user || null;
    activeContext.value = data.activeContext || null;
    contexts.value = data.contexts || [];
    access.value = {
      permissions: data.activeContext?.permissions || data.permissions || [],
      modules: data.activeContext?.modules || data.modules || [],
    };
  }

  async function login(email, password, context = {}) {
    loading.value = true;
    try {
      const res = await apiTenantLogin(email, password, context);
      applySession(res.data.data);
      return res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function restore() {
    loading.value = true;
    try {
      const [meRes, accessRes] = await Promise.all([getTenantMe(), getTenantAccess()]);
      const me = meRes.data.data || {};
      const accessData = accessRes.data.data || {};
      user.value = me.user || null;
      activeContext.value = me.activeContext || accessData.activeContext || null;
      contexts.value = me.contexts || accessData.contexts || [];
      access.value = {
        permissions: accessData.permissions || activeContext.value?.permissions || [],
        modules: accessData.modules || activeContext.value?.modules || [],
      };
      return user.value;
    } catch (error) {
      clear();
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function switchContext(context) {
    loading.value = true;
    try {
      const res = await apiTenantSwitchContext(context);
      applySession(res.data.data);
      return res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await apiTenantLogout(refreshToken);
    } finally {
      clear();
    }
  }

  function clear() {
    user.value = null;
    activeContext.value = null;
    contexts.value = [];
    access.value = { permissions: [], modules: [] };
    removeTokens();
  }

  function hasPermission(permissionCode) {
    return permissionCodes.value.has(permissionCode) || permissionCodes.value.has("*");
  }

  function hasModule(moduleKey) {
    return moduleKeys.value.has(moduleKey);
  }

  function hasRole(roleCode) {
    return (activeContext.value?.roles || []).some((role) => role.code === roleCode);
  }

  return {
    user,
    activeContext,
    contexts,
    access,
    permissions,
    modules,
    loading,
    isAuthenticated,
    hasMultipleContexts,
    login,
    applySession,
    restore,
    switchContext,
    logout,
    hasPermission,
    hasModule,
    hasRole,
  };
});
