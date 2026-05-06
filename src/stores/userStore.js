import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAccess, getMe } from 'src/utils/api/get';
import { login as apiLogin, logout as apiLogout } from 'src/utils/api/post';
import { saveTokens, removeTokens, getRefreshToken } from 'src/utils/authUtil';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const access = ref({ permissions: [], modules: [] });
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'ROOT');
  const permissions = computed(() => access.value.permissions || []);
  const modules = computed(() => access.value.modules || []);
  const moduleKeys = computed(() => new Set(modules.value.map((item) => item.module_key)));
  const permissionCodes = computed(() => new Set(permissions.value));

  function hasModule(moduleKey) {
    return moduleKeys.value.has(moduleKey);
  }

  function hasPermission(permissionCode) {
    return permissionCodes.value.has(permissionCode) || permissionCodes.value.has("*");
  }

  async function fetchUser() {
    try {
      loading.value = true;
      const res = await getMe();
      user.value = res.data.data;
      await fetchAccess();
      return user.value;
    } catch (err) {
      user.value = null;
      access.value = { permissions: [], modules: [] };
      removeTokens();
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAccess() {
    if (!user.value) {
      access.value = { permissions: [], modules: [] };
      return access.value;
    }
    const res = await getAccess();
    access.value = res.data.data || { permissions: [], modules: [] };
    return access.value;
  }

  async function login(email, password) {
    try {
      loading.value = true;
      const res = await apiLogin(email, password);
      const { accessToken, refreshToken, account } = res.data.data;
      saveTokens(accessToken, refreshToken, "platform");
      user.value = account;
      await fetchAccess();
      return account;
    } finally {
      loading.value = false;
    }
  }

  async function applyPlatformSession(payload) {
    const { accessToken, refreshToken, account } = payload;
    saveTokens(accessToken, refreshToken, "platform");
    user.value = account;
    await fetchAccess();
    return account;
  }

  async function logout() {
    try {
      const rt = getRefreshToken();
      if (rt) await apiLogout(rt);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      access.value = { permissions: [], modules: [] };
      localStorage.removeItem('edugami_preview_mainlayout');
      removeTokens();
    }
  }

  function previewLogin() {
    user.value = {
      id: 'preview-root',
      email: 'preview@edugami.local',
      role: 'ROOT',
      name: 'Preview Root'
    };
    access.value = {
      permissions: ["*"],
      modules: [
        { module_key: "ROOT_DASHBOARD" },
        { module_key: "TENANTS" },
        { module_key: "PLATFORM_ACCOUNTS" },
        { module_key: "ALERTS" },
        { module_key: "SERVICES" },
        { module_key: "METRICS" },
        { module_key: "AUDIT" },
        { module_key: "RBAC" },
        { module_key: "GLOBAL_MODULES" }
      ]
    };
    localStorage.setItem('edugami_preview_mainlayout', '1');
    return user.value;
  }

  return {
    user,
    access,
    permissions,
    modules,
    loading,
    isAuthenticated,
    isAdmin,
    hasModule,
    hasPermission,
    fetchUser,
    fetchAccess,
    login,
    applyPlatformSession,
    logout,
    previewLogin
  };
});
