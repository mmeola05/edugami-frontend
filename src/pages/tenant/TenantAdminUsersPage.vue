<template>
  <q-page class="page-shell-premium tenant-admin-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">{{ t("tenant.admin.users_title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.admin.users_subtitle") }}</p>
      </div>
      <div class="header-actions">
        <q-tabs
          v-model="activeTab"
          dense
          class="access-segmented-control"
          active-color="white"
          active-bg-color="primary"
          indicator-color="transparent"
          align="center"
          narrow-indicator
        >
          <q-tab name="users" :label="t('tenant.admin.tab_users')" />
          <q-tab name="roles" :label="t('tenant.admin.tab_roles')" />
        </q-tabs>

        <q-btn
          v-if="tenantSession.hasPermission('tenant_users.manage') && activeTab === 'users'"
          color="primary"
          icon="person_add"
          :label="t('tenant.admin.new_user')"
          no-caps
          class="shadow-btn"
          @click="openCreate"
        />
      </div>
    </div>

    <q-tab-panels v-model="activeTab" animated class="bg-transparent" keep-alive>
      <q-tab-panel name="users" class="q-pa-none">
        <q-card class="card-saas users-card">
      <q-table
        :rows="users"
        :columns="columns"
        row-key="user_id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 0 }"
        :rows-per-page-options="[0]"
        hide-bottom
        class="users-table"
      >
        <template #body-cell-user="props">
          <q-td :props="props">
            <div class="user-cell">
              <div class="icon-tile bg-soft-primary user-avatar">
                <q-icon name="person" color="primary" size="18px" />
              </div>
              <div>
                <strong>{{ props.row.display_name }}</strong>
                <span>{{ props.row.email }}</span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-roles="props">
          <q-td :props="props">
            <div class="role-chips">
              <q-chip
                v-for="role in props.row.roles"
                :key="role.code"
                dense
                color="primary"
                text-color="white"
              >
                {{ role.name || role.code }}
              </q-chip>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.status === 'active' ? 'positive' : 'grey'" text-color="white">
              {{ props.row.status === "active" ? t("tenant.admin.active") : t("tenant.admin.suspended") }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              v-if="tenantSession.hasPermission('tenant_users.manage')"
              flat
              round
              dense
              icon="edit"
              @click="openEdit(props.row)"
            >
              <q-tooltip>{{ t("common.edit") }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="empty-state">
            <q-icon name="manage_accounts" size="34px" color="primary" />
            <strong>{{ t("tenant.admin.empty_title") }}</strong>
            <span>{{ t("tenant.admin.empty_text") }}</span>
          </div>
        </template>
      </q-table>
    </q-card>
      </q-tab-panel>

      <q-tab-panel name="roles" class="q-pa-none">
        <div class="roles-grid">
          <q-card 
            v-for="role in roles" 
            :key="role.code" 
            class="role-card-premium"
            :class="getRoleGradientClass(role.code)"
          >
            <div class="role-card-glass">
              <div class="role-header">
                <div class="role-icon-wrapper">
                  <q-icon :name="getRoleIcon(role.code)" size="28px" />
                </div>
                <q-btn
                  v-if="tenantSession.hasPermission('tenant_users.manage')"
                  flat
                  round
                  dense
                  icon="edit"
                  class="edit-btn"
                  @click="openEditRole(role)"
                >
                  <q-tooltip>{{ t("common.edit") }}</q-tooltip>
                </q-btn>
              </div>

              <div class="role-info">
                <h3 class="role-name">{{ role.name || role.code }}</h3>
                <span class="role-badge">{{ role.is_system ? t('tenant.admin.role_system') : t('tenant.admin.role_custom') }}</span>
              </div>
              
              <div class="role-stats-row">
                <div class="role-stat">
                  <span class="stat-value">{{ role.modules?.length || 0 }}</span>
                  <span class="stat-label">{{ t('tenant.admin.modules') }}</span>
                </div>
                <div class="stat-divider"></div>
                <div class="role-stat">
                  <span class="stat-value">{{ role.permissions?.length || 0 }}</span>
                  <span class="stat-label">{{ t('tenant.admin.permissions') }}</span>
                </div>
              </div>
            </div>
          </q-card>

          <div v-if="roles.length === 0" class="empty-state" style="grid-column: 1 / -1">
            <q-icon name="vpn_key" size="34px" color="primary" />
            <strong>{{ t("tenant.admin.roles_empty_title") }}</strong>
            <span>{{ t("tenant.admin.roles_empty_text") }}</span>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <AppDialog
      v-model="dialogOpen"
      :title="editingUser ? t('tenant.admin.edit_user') : t('tenant.admin.new_user')"
      :subtitle="t('tenant.admin.dialog_subtitle')"
      icon="manage_accounts"
      wide
    >
      <q-form class="form-grid" @submit.prevent="submitUser">
        <q-input
          v-model="form.displayName"
          :label="t('tenant.admin.display_name')"
          outlined
          dense
          :rules="[(value) => Boolean(value) || t('common.required')]"
        />
        <q-input
          v-model="form.email"
          :label="t('tenant.admin.email')"
          outlined
          dense
          :disable="Boolean(editingUser)"
          :rules="[(value) => Boolean(value) || t('common.required')]"
        />
        <q-input
          v-if="!editingUser"
          v-model="form.password"
          :label="t('tenant.admin.password')"
          type="password"
          outlined
          dense
          :rules="[(value) => Boolean(value) || t('common.required')]"
        />
        <q-select
          v-model="form.roleCodes"
          :options="roleOptions"
          :label="t('tenant.admin.roles')"
          emit-value
          map-options
          multiple
          use-chips
          outlined
          dense
        />
        <q-select
          v-model="form.status"
          :options="statusOptions"
          :label="t('tenant.admin.status')"
          emit-value
          map-options
          outlined
          dense
        />
      </q-form>

      <template #actions>
        <q-btn flat :label="t('common.cancel')" no-caps @click="dialogOpen = false" />
        <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" @click="submitUser" />
      </template>
    </AppDialog>

    <AppDialog
      v-model="roleDialogOpen"
      :title="t('tenant.admin.dialog_role_title', { role: editingRole?.name || editingRole?.code })"
      :subtitle="t('tenant.admin.dialog_role_subtitle')"
      icon="security"
      wide
    >
      <q-form class="q-col-gutter-md" @submit.prevent="submitRoleAccess">
        <div>
          <div class="text-subtitle2 q-mb-sm">{{ t('tenant.admin.modules') }}</div>
          <q-select
            v-model="roleForm.moduleKeys"
            :options="availableModuleOptions"
            emit-value
            map-options
            multiple
            use-chips
            outlined
            dense
          />
        </div>
        
        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">{{ t('tenant.admin.permissions') }}</div>
          <q-select
            v-model="roleForm.permissionCodes"
            :options="availablePermissionOptions"
            emit-value
            map-options
            multiple
            use-chips
            outlined
            dense
          />
        </div>
      </q-form>

      <template #actions>
        <q-btn flat :label="t('common.cancel')" no-caps @click="roleDialogOpen = false" />
        <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="savingRole" @click="submitRoleAccess" />
      </template>
    </AppDialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { date } from "quasar";
import { useI18n } from "vue-i18n";
import AppDialog from "src/components/common/AppDialog.vue";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { getTenantAdminRoles, getTenantAdminUsers } from "src/utils/api/get";
import { createTenantAdminUser } from "src/utils/api/post";
import { updateTenantAdminUser } from "src/utils/api/patch";
import { setTenantAdminRoleAccess } from "src/utils/api/put";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();
const users = ref([]);
const roles = ref([]);
const loading = ref(false);
const saving = ref(false);
const activeTab = ref("users");

// User Dialog
const dialogOpen = ref(false);
const editingUser = ref(null);
const form = reactive({
  email: "",
  password: "",
  displayName: "",
  status: "active",
  roleCodes: [],
});

// Role Dialog
const roleDialogOpen = ref(false);
const editingRole = ref(null);
const savingRole = ref(false);
const roleForm = reactive({
  moduleKeys: [],
  permissionCodes: [],
});

const columns = computed(() => [
  { name: "user", label: t("tenant.admin.user"), field: "display_name", align: "left" },
  { name: "roles", label: t("tenant.admin.roles"), field: "roles", align: "left" },
  { name: "status", label: t("tenant.admin.status"), field: "status", align: "left" },
  { name: "created", label: t("tenant.admin.created"), field: (row) => date.formatDate(row.created_at, "DD/MM/YYYY HH:mm"), align: "left" },
  { name: "actions", label: t("tenant.admin.actions"), field: "actions", align: "right" },
]);

const roleOptions = computed(() =>
  roles.value.map((role) => ({
    label: role.name || role.code,
    value: role.code,
  })),
);

const statusOptions = computed(() => [
  { label: t("tenant.admin.active"), value: "active" },
  { label: t("tenant.admin.suspended"), value: "suspended" },
]);

// Since Tenant Admin doesn't have an endpoint to list ALL available modules/permissions 
// natively, we can infer them from the tenantSession.access.modules / permissions or 
// hardcode them, but the best is to use tenantSession.access for now:
const availableModuleOptions = computed(() => 
  (tenantSession.access.modules || []).map(m => ({
    label: m.name || m.module_key,
    value: m.module_key
  }))
);

const availablePermissionOptions = computed(() => 
  (tenantSession.access.permissionDetails || []).map(p => ({
    label: `${p.permission_code} (${p.description})`,
    value: p.permission_code
  }))
);

function getRoleGradientClass(code) {
  if (code === 'TENANT_ADMIN') return 'gradient-pink';
  if (code === 'TEACHER') return 'gradient-cyan';
  if (code === 'STUDENT') return 'gradient-blue';
  if (code === 'GUARDIAN') return 'gradient-dark';
  return 'gradient-default';
}

function getRoleIcon(code) {
  if (code === 'TENANT_ADMIN') return 'admin_panel_settings';
  if (code === 'TEACHER') return 'school';
  if (code === 'STUDENT') return 'face';
  if (code === 'GUARDIAN') return 'family_restroom';
  return 'security';
}

function resetForm() {
  form.email = "";
  form.password = "";
  form.displayName = "";
  form.status = "active";
  form.roleCodes = [];
}

function openCreate() {
  editingUser.value = null;
  resetForm();
  dialogOpen.value = true;
}

function openEdit(user) {
  editingUser.value = user;
  form.email = user.email;
  form.password = "";
  form.displayName = user.display_name;
  form.status = user.status;
  form.roleCodes = (user.roles || []).map((role) => role.code);
  dialogOpen.value = true;
}

function openEditRole(role) {
  editingRole.value = role;
  roleForm.moduleKeys = (role.modules || []).filter(m => m.is_visible).map(m => m.module_key);
  roleForm.permissionCodes = (role.permissions || []).map(p => p.permission_code);
  roleDialogOpen.value = true;
}

async function loadData() {
  loading.value = true;
  try {
    const [usersRes, rolesRes] = await Promise.all([
      getTenantAdminUsers(),
      getTenantAdminRoles(),
    ]);
    users.value = usersRes.data.data || [];
    roles.value = rolesRes.data.data || [];
  } finally {
    loading.value = false;
  }
}

async function submitUser() {
  saving.value = true;
  try {
    const payload = {
      displayName: form.displayName,
      status: form.status,
      roleCodes: form.roleCodes,
    };
    if (editingUser.value) {
      await updateTenantAdminUser(editingUser.value.user_id, payload);
    } else {
      await createTenantAdminUser({
        ...payload,
        email: form.email,
        password: form.password,
      });
    }
    dialogOpen.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

async function submitRoleAccess() {
  savingRole.value = true;
  try {
    await setTenantAdminRoleAccess(
      editingRole.value.code, 
      roleForm.moduleKeys, 
      roleForm.permissionCodes
    );
    roleDialogOpen.value = false;
    await loadData();
    // Also restore session to reflect changes immediately if we edited our own role
    await tenantSession.restore();
  } finally {
    savingRole.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped lang="scss">
.tenant-admin-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.header-actions {
  align-items: center;
  display: flex;
  gap: var(--space-4);
}

.access-segmented-control {
  background: var(--eg-surface-soft);
  border-radius: 999px;
  padding: 4px;
  min-height: 42px;
}

.access-segmented-control :deep(.q-tab) {
  border-radius: 999px;
  min-height: 34px;
  padding: 0 var(--space-5);
  font-weight: var(--font-weight-bold);
}

.access-segmented-control :deep(.q-tab--active) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shadow-btn {
  box-shadow: 0 8px 20px rgba(36, 21, 242, 0.22);
}

.users-card {
  overflow: hidden;
}

.users-table,
.users-table :deep(.q-table__middle) {
  max-height: calc(100vh - 240px);
}

.users-table :deep(.q-table__middle) {
  overflow: auto;
}

.user-cell {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  min-width: 260px;

  strong,
  span {
    display: block;
    max-width: 420px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }
}

.user-avatar {
  flex: 0 0 auto;
  height: 42px;
  width: 42px;
}

.role-chips {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  min-width: 220px;
}

.empty-state {
  align-items: center;
  color: var(--color-text-secondary);
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  padding: var(--space-8);
  text-align: center;
  width: 100%;

  strong {
    color: var(--color-text-primary);
  }
}

.form-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.roles-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.role-card-premium {
  border-radius: var(--tenant-radius-xl);
  border: none;
  color: white;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.role-card-premium:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.gradient-pink { background: var(--tenant-pink-card); }
.gradient-cyan { background: var(--tenant-cyan-card); }
.gradient-blue { background: var(--tenant-blue-card); }
.gradient-dark { background: var(--tenant-dark-card); }
.gradient-default { background: linear-gradient(135deg, #64748f 0%, #334155 100%); }

.role-card-glass {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--space-6);
  position: relative;
  z-index: 1;
}

.role-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.role-icon-wrapper {
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white !important;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: white;
  color: #1a1a1a !important;
  transform: rotate(15deg);
}

.role-info {
  margin-bottom: var(--space-6);
}

.role-name {
  font-size: 1.4rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 var(--space-1);
}

.role-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  display: inline-block;
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  padding: 4px 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-stats-row {
  align-items: center;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  display: flex;
  margin-top: auto;
  padding: var(--space-4);
}

.role-stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  text-align: center;
}

.stat-divider {
  background: rgba(255, 255, 255, 0.2);
  height: 30px;
  width: 1px;
}

.role-stat .stat-value {
  font-size: 1.6rem;
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
  margin-bottom: 2px;
}

.role-stat .stat-label {
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  opacity: 0.8;
  text-transform: uppercase;
}

@media (max-width: 700px) {
  .page-header,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
