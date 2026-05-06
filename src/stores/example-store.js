import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  // State
  const user = ref(undefined);
  const tenantId = ref(null);
  const role = ref(null); // STUDENT, TEACHER, ADMIN, ROOT
  const token = ref(null);
  const modules = ref([]); // Array of authorized module identifier strings (e.g. ['classes', 'library'])
  const unreadNotifications = ref(0);

  // Getters
  const getUser = computed(() => user.value);
  const getTenantId = computed(() => tenantId.value);
  const getRole = computed(() => role.value);
  const isAuthenticated = computed(() => !!token.value);
  const getModules = computed(() => modules.value);

  // Actions
  function setUser(
    userData,
    userRole,
    userTenantId,
    userToken,
    userModules = [],
  ) {
    user.value = userData;
    role.value = userRole;
    tenantId.value = userTenantId;
    token.value = userToken;
    modules.value = userModules;
  }

  function setTenantId(id) {
    tenantId.value = id;
  }

  function setUnreadCount(count) {
    unreadNotifications.value = count;
  }

  function decrementUnreadCount(amount = 1) {
    unreadNotifications.value = Math.max(0, unreadNotifications.value - amount);
  }

  async function fetchAndSetModules() {
    if (!tenantId.value) return;
    try {
      const { api } = await import("boot/axios"); // Lazy import to avoid cycle
      const res = await api.get(`/tenants/${tenantId.value}/modules`);
      const allModules = res.data;

      // Filter only active ones
      const activeCodes = allModules
        .filter((m) => m.is_active)
        .map((m) => m.code);

      modules.value = activeCodes;
    } catch (err) {
      console.error("Error fetching tenant modules", err);
    }
  }

  function updateModulesFromMqtt(payload) {
    if (!payload || !payload.modules) return;

    // Payload contains the full list of modules from service
    const activeCodes = payload.modules
      .filter((m) => m.is_active)
      .map((m) => m.code);

    modules.value = activeCodes;
    console.log("🔄 Modules sync via MQTT complete", activeCodes);
    return {
      source: payload.source,
      reason: payload.reason,
    };
  }

  function logout() {
    user.value = undefined;
    role.value = null;
    token.value = null;
    modules.value = [];
  }

  return {
    user,
    tenantId,
    role,
    token,
    modules, // Export state
    unreadNotifications,
    getUser,
    getTenantId,
    getRole,
    isAuthenticated,
    getModules,
    setUser,
    setTenantId,
    setUnreadCount,
    decrementUnreadCount,
    logout,
    fetchAndSetModules,
    updateModulesFromMqtt,
  };
});
