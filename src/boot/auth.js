import { boot } from 'quasar/wrappers';
import { useUserStore } from 'src/stores/userStore';
import { useTenantSessionStore } from 'src/stores/tenantSessionStore';
import { hasPlatformSession, hasTenantSession } from 'src/utils/authUtil';

const routeModules = {
  dashboard: 'ROOT_DASHBOARD',
  tenants: 'TENANTS',
  'tenant-detail': 'TENANTS',
  'platform-accounts': 'PLATFORM_ACCOUNTS',
  alerts: 'ALERTS',
  services: 'SERVICES',
  metrics: 'METRICS',
  rbac: 'RBAC',
  modules: 'GLOBAL_MODULES',
  audit: 'AUDIT'
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

export default boot(async ({ router }) => {
  const userStore = useUserStore();
  const tenantSession = useTenantSessionStore();
  const previewEnabled = process.env.DEV && localStorage.getItem('edugami_preview_mainlayout') === '1';

  if (previewEnabled) {
    userStore.previewLogin();
  } else if (hasPlatformSession()) {
    try {
      await userStore.fetchUser();
    } catch (err) {
      console.warn('Session restoration failed');
    }
  } else if (hasTenantSession()) {
    try {
      await tenantSession.restore();
    } catch (err) {
      console.warn('Tenant session restoration failed');
    }
  }

  router.beforeEach(async (to, from, next) => {
    const isAuthRequired = to.matched.some(record => record.meta.requiresAuth);
    const isTenantAuthRequired = to.matched.some(record => record.meta.requiresTenantAuth);
    const tenantModule = to.matched.find(record => record.meta.tenantModule)?.meta.tenantModule;
    const tenantRole = to.matched.find(record => record.meta.tenantRole)?.meta.tenantRole;
    const isGuestOnly = to.matched.some(record => record.meta.guestOnly);
    const isAuthenticated = userStore.isAuthenticated;
    const isTenantAuthenticated = tenantSession.isAuthenticated;

    if (isAuthRequired && !isAuthenticated) {
      next({ name: 'login' });
    } else if (isTenantAuthRequired && !isTenantAuthenticated) {
      next({ name: 'tenant-login' });
    } else if (isGuestOnly && isAuthenticated) {
      next({ path: firstAllowedPath(userStore) });
    } else if (isGuestOnly && isTenantAuthenticated) {
      next({ path: tenantSession.hasMultipleContexts ? '/auth/tenant-context' : '/tenant/dashboard' });
    } else if (isTenantAuthRequired && tenantModule && !tenantSession.hasModule(tenantModule)) {
      next({ path: '/tenant/dashboard' });
    } else if (isTenantAuthRequired && tenantRole && !tenantSession.hasRole(tenantRole)) {
      next({ path: '/tenant/dashboard' });
    } else if (isAuthRequired && routeModules[to.name] && !userStore.hasModule(routeModules[to.name])) {
      next({ path: firstAllowedPath(userStore) });
    } else {
      next();
    }
  });
});
