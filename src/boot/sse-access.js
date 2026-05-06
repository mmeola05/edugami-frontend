import { boot } from 'quasar/wrappers';
import { useUserStore } from 'src/stores/userStore';
import { connectRootSse } from 'src/boot/sse';
import { notifyWarning } from 'src/utils/utils';

const ACCESS_EVENTS = new Set([
  'access_policy_changed',
  'platform_module_updated',
  'platform_role_permissions_updated',
  'platform_account_rbac_updated',
  'tenant_access_policy_changed'
]);

const routeModules = {
  dashboard: 'ROOT_DASHBOARD',
  tenants: 'TENANTS',
  'tenant-detail': 'TENANTS',
  'platform-accounts': 'PLATFORM_ACCOUNTS',
  alerts: 'ALERTS',
  services: 'SERVICES',
  metrics: 'METRICS',
  audit: 'AUDIT',
  rbac: 'RBAC',
  modules: 'GLOBAL_MODULES'
};

const moduleRoutes = [
  ['ROOT_DASHBOARD', '/root/dashboard'],
  ['TENANTS', '/root/tenants'],
  ['PLATFORM_ACCOUNTS', '/root/platform-accounts'],
  ['ALERTS', '/root/alerts'],
  ['SERVICES', '/root/services'],
  ['METRICS', '/root/metrics'],
  ['AUDIT', '/root/audit'],
  ['RBAC', '/root/rbac'],
  ['GLOBAL_MODULES', '/root/modules']
];

function firstAllowedPath(userStore) {
  return moduleRoutes.find(([moduleKey]) => userStore.hasModule(moduleKey))?.[1] || '/root/no-access';
}

export default boot(({ router }) => {
  const userStore = useUserStore();
  connectRootSse(async (event) => {
    if (!userStore.isAuthenticated) return;
    if (!ACCESS_EVENTS.has(event?.type)) return;
    try {
      await userStore.fetchAccess();
      const currentRouteName = router.currentRoute.value.name;
      const currentModule = routeModules[currentRouteName];
      if (currentModule && !userStore.hasModule(currentModule)) {
        notifyWarning('Tu acceso a este modulo ha cambiado. Te hemos movido a una zona permitida.', 'Acceso actualizado');
        const target = firstAllowedPath(userStore);
        if (router.currentRoute.value.fullPath !== target) {
          await router.replace(target);
        }
      }
    } catch (error) {
      console.warn('Access refresh failed after realtime event', error);
    }
  });
});
