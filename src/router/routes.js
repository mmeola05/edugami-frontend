const routes = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'tenant-login',
        name: 'tenant-login',
        component: () => import('pages/auth/TenantLoginPage.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'tenant-context',
        name: 'tenant-context',
        component: () => import('pages/auth/TenantContextPage.vue'),
        meta: { requiresTenantAuth: true }
      },
      {
        path: 'recovery',
        name: 'recovery',
        component: () => import('pages/auth/RecoveryPage.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('pages/auth/ResetPasswordPage.vue'),
        meta: { guestOnly: true }
      }
    ]
  },
  {
    path: '/',
    redirect: '/root/dashboard'
  },
  {
    path: '/tenant',
    component: () => import('layouts/TenantLayout.vue'),
    meta: { requiresTenantAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'tenant-dashboard',
        component: () => import('pages/tenant/TenantDashboardPage.vue')
      },
      {
        path: 'classes',
        name: 'tenant-classes',
        component: () => import('pages/tenant/TenantClassesPage.vue'),
        meta: { tenantModule: 'CLASSES' }
      },
      {
        path: 'periods',
        name: 'tenant-periods',
        component: () => import('pages/tenant/TenantPeriodsPage.vue'),
        meta: { tenantModule: 'PERIODS' }
      },
      {
        path: 'admin/users',
        name: 'tenant-admin-users',
        component: () => import('pages/tenant/TenantAdminUsersPage.vue'),
        meta: { tenantModule: 'TENANT_ADMIN' }
      },
      {
        path: 'students',
        name: 'tenant-students',
        component: () => import('pages/tenant/TenantStudentsPage.vue'),
        meta: { tenantModule: 'STUDENTS' }
      },
      {
        path: 'enrollments',
        name: 'tenant-enrollments',
        redirect: '/tenant/students',
        meta: { tenantModule: 'ENROLLMENTS' }
      },
      {
        path: 'teachers',
        name: 'tenant-teachers',
        component: () => import('pages/tenant/TenantTeachersPage.vue'),
        meta: { tenantModule: 'TEACHERS' }
      },
      {
        path: 'guardians',
        name: 'tenant-guardians',
        component: () => import('pages/tenant/TenantGuardiansPage.vue'),
        meta: { tenantModule: 'STUDENTS' } // Linked to STUDENTS access since GUARDIANS module is deprecated
      },
      {
        path: 'teacher-assignments',
        name: 'tenant-teacher-assignments',
        component: () => import('pages/tenant/TenantTeacherAssignmentsPage.vue'),
        meta: { tenantModule: 'TEACHER_ASSIGNMENTS' }
      },
      {
        path: 'courses',
        name: 'tenant-courses',
        component: () => import('pages/tenant/TenantCoursesPage.vue'),
        meta: { tenantModule: 'COURSES' }
      },
      {
        path: 'reports',
        name: 'tenant-reports',
        component: () => import('pages/tenant/TenantReportsPage.vue'),
        meta: { tenantModule: 'REPORTS' }
      },
      {
        path: 'ai-tutor',
        name: 'tenant-ai-tutor',
        component: () => import('pages/tenant/TenantAiTutorPage.vue'),
        meta: { tenantModule: 'AI_TUTOR', tenantRole: 'TEACHER' }
      },
      {
        path: 'settings',
        name: 'tenant-settings',
        component: () => import('pages/tenant/TenantSettingsPage.vue'),
        meta: { tenantModule: 'TENANT_ADMIN' }
      },
      {
        path: 'staff',
        name: 'tenant-staff',
        component: () => import('pages/tenant/TenantStaffPage.vue'),
        meta: { tenantModule: 'TENANT_ADMIN' }
      },
      {
        path: '',
        redirect: '/tenant/dashboard'
      }
    ]
  },
  {
    path: '/root',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'tenants',
        name: 'tenants',
        component: () => import('pages/root/TenantsPage.vue')
      },
      {
        path: 'tenants/:tenantId',
        name: 'tenant-detail',
        component: () => import('pages/root/TenantDetailPage.vue')
      },
      {
        path: 'platform-accounts',
        name: 'platform-accounts',
        component: () => import('pages/root/PlatformAccountsPage.vue')
      },
      {
        path: 'alerts',
        name: 'alerts',
        component: () => import('pages/root/AlertsPage.vue')
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('pages/root/ServicesPage.vue')
      },
      {
        path: 'metrics',
        name: 'metrics',
        component: () => import('pages/root/MetricsPage.vue')
      },
      {
        path: 'rbac',
        name: 'rbac',
        component: () => import('pages/root/RbacPage.vue')
      },
      {
        path: 'modules',
        name: 'modules',
        component: () => import('pages/root/ModulesPage.vue')
      },
      {
        path: 'audit',
        name: 'audit',
        component: () => import('pages/root/AuditPage.vue')
      },
      {
        path: 'no-access',
        name: 'root-no-access',
        component: () => import('pages/root/NoAccessPage.vue')
      },
      {
        path: ':catchAll(.*)*',
        name: 'root-not-found',
        component: () => import('pages/ErrorNotFound.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
