<template>
  <q-page class="page-shell-premium tenant-detail-page">
    <div v-if="loadingDetail" class="column flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="64px" />
      <span class="text-caption text-grey-6 q-mt-md"
        >Cargando ecosistema del tenant...</span
      >
    </div>

    <div v-else-if="!tenant" class="column flex-center q-pa-xl">
      <q-icon name="error_outline" color="negative" size="64px" />
      <h2 class="text-h5 text-weight-bold q-mt-md">Tenant no encontrado</h2>
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Volver a la lista"
        to="/root/tenants"
        no-caps
      />
    </div>

    <div v-else class="content-grid animate-fade-in">
      <div class="tenant-header">
        <q-btn
          flat
          round
          color="primary"
          icon="arrow_back"
          to="/root/tenants"
        />
        <div>
          <div class="title-row">
            <h1 class="text-page-title q-ma-none">{{ tenant.name }}</h1>
            <div
              :class="`status-pill-sm bg-soft-${getStatusColor(tenant.status)}`"
            >
              <div
                :class="`status-pill__dot bg-${getStatusColor(tenant.status)}`"
              ></div>
              <span
                :class="`status-label text-${getStatusColor(tenant.status)}`"
                >{{ tenant.status.toUpperCase() }}</span
              >
            </div>
          </div>
          <p class="text-page-subtitle q-mt-sm">
            ID: {{ tenant.tenant_id }} | Slug: {{ tenant.slug }}
          </p>
        </div>
        <q-space />
        <q-btn
          outline
          color="negative"
          :icon="tenant.status === 'active' ? 'block' : 'check_circle'"
          :label="tenant.status === 'active' ? 'Suspender' : 'Activar'"
          class="btn-premium q-px-lg"
          no-caps
          @click="handleToggleStatus"
        />
      </div>

      <div class="stats-grid">
        <stat-card
          label="Tipo"
          :value="tenant.tenant_type"
          icon="category"
          color="info"
          subtitle="Modelo de negocio"
        />
        <stat-card
          label="Huso Horario"
          :value="tenant.timezone"
          icon="schedule"
          color="primary"
          subtitle="Reloj del sistema"
        />
        <stat-card
          label="Modulos efectivos"
          :value="enabledModulesCount"
          icon="extension"
          color="positive"
          subtitle="Funcionalidades activas"
        />
        <stat-card
          label="Creado el"
          :value="formatDate(tenant.created_at)"
          icon="event"
          color="grey-7"
          subtitle="Fecha de registro"
        />
      </div>

      <div class="main-grid">
        <q-card class="card-saas">
          <q-card-section class="card-heading">
            <div>
              <span class="section-title">Modulos del tenant</span>
              <p class="text-page-subtitle">
                Jerarquia, estado tenant y estado efectivo.
              </p>
            </div>
            <q-btn
              flat
              round
              dense
              icon="refresh"
              :loading="loadingModules"
              @click="loadModules"
            >
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
          </q-card-section>

          <q-separator opacity="0.1" />

          <q-card-section>
            <div v-if="loadingModules" class="loading-modules">
              <q-spinner-dots color="primary" size="32px" />
            </div>

            <div v-else class="tenant-module-tree">
              <article
                v-for="mod in modules"
                :key="mod.module_key"
                class="tenant-module-node root-node"
              >
                <div class="tenant-module-row">
                  <div
                    :class="`module-icon-box bg-soft-${mod.effective_enabled ? 'positive' : 'warning'}`"
                  >
                    <q-icon
                      :name="getModuleIcon(mod.module_key)"
                      :color="mod.effective_enabled ? 'positive' : 'warning'"
                      size="20px"
                    />
                  </div>
                  <div class="module-copy">
                    <strong>{{
                      mod.name || mod.module_key.replace(/_/g, " ")
                    }}</strong>
                    <span>{{ mod.module_key }}</span>
                  </div>
                  <q-space />
                  <q-badge
                    v-if="mod.disabled_reason"
                    color="warning"
                    :label="reasonLabel(mod.disabled_reason)"
                  />
                  <q-toggle
                    :model-value="mod.is_enabled"
                    color="positive"
                    @update:model-value="
                      setModuleEnabled(mod.module_key, $event)
                    "
                  />
                </div>

                <div v-if="mod.children?.length" class="tenant-children">
                  <article
                    v-for="child in mod.children"
                    :key="child.module_key"
                    class="tenant-module-node child-node"
                  >
                    <div class="tenant-module-row">
                      <div
                        :class="`module-icon-box bg-soft-${child.effective_enabled ? 'info' : 'warning'}`"
                      >
                        <q-icon
                          name="subdirectory_arrow_right"
                          :color="child.effective_enabled ? 'info' : 'warning'"
                          size="20px"
                        />
                      </div>
                      <div class="module-copy">
                        <strong>{{
                          child.name || child.module_key.replace(/_/g, " ")
                        }}</strong>
                        <span
                          >hijo de {{ mod.module_key }} -
                          {{ child.module_key }}</span
                        >
                      </div>
                      <q-space />
                      <q-badge
                        v-if="child.disabled_reason"
                        color="warning"
                        :label="reasonLabel(child.disabled_reason)"
                      />
                      <q-toggle
                        :model-value="child.is_enabled"
                        color="positive"
                        @update:model-value="
                          setModuleEnabled(child.module_key, $event)
                        "
                      />
                    </div>
                  </article>
                </div>
              </article>
            </div>
          </q-card-section>
        </q-card>

        <div class="side-column">
          <q-card class="card-saas">
            <q-card-section class="card-heading">
              <div>
                <span class="section-title">Roles tenant</span>
                <p class="text-page-subtitle">
                  Acceso por rol y permisos efectivos.
                </p>
              </div>
              <q-btn
                flat
                round
                dense
                icon="refresh"
                :loading="loadingRoles"
                @click="loadRoles"
              >
                <q-tooltip>Actualizar roles</q-tooltip>
              </q-btn>
            </q-card-section>
            <q-separator opacity="0.1" />
            <q-card-section>
              <div v-if="loadingRoles" class="empty-activity">
                <q-spinner-dots color="primary" size="32px" />
              </div>
              <div v-else class="role-stack">
                <article
                  v-for="role in tenantRoles"
                  :key="role.code"
                  class="access-card"
                >
                  <div class="access-card__head">
                    <div>
                      <strong>{{ role.name }}</strong>
                      <span>{{ role.code }}</span>
                    </div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="tune"
                      color="primary"
                      @click="openRoleDialog(role)"
                    >
                      <q-tooltip>Editar modulos y permisos</q-tooltip>
                    </q-btn>
                  </div>
                  <div class="access-metrics">
                    <q-badge
                      color="primary"
                      :label="`${role.modules.length} modulos`"
                    />
                    <q-badge
                      color="info"
                      :label="`${role.permissions.length} permisos`"
                    />
                  </div>
                  <div class="chip-row">
                    <q-chip
                      v-for="mod in role.modules.slice(0, 4)"
                      :key="mod.module_key"
                      dense
                      square
                      color="primary"
                      text-color="white"
                    >
                      {{ mod.module_key }}
                    </q-chip>
                    <q-chip
                      v-if="role.modules.length > 4"
                      dense
                      square
                      color="grey-8"
                      text-color="white"
                    >
                      +{{ role.modules.length - 4 }}
                    </q-chip>
                  </div>
                </article>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="card-saas">
            <q-card-section class="card-heading">
              <div>
                <span class="section-title">Usuarios tenant</span>
                <p class="text-page-subtitle">
                  Cuentas reales asignadas a roles.
                </p>
              </div>
              <q-btn
                round
                unelevated
                color="primary"
                icon="person_add"
                @click="openUserDialog"
              >
                <q-tooltip>Crear usuario tenant</q-tooltip>
              </q-btn>
            </q-card-section>
            <q-separator opacity="0.1" />
            <q-card-section>
              <div v-if="loadingUsers" class="empty-activity">
                <q-spinner-dots color="primary" size="32px" />
              </div>
              <div v-else-if="tenantUsers.length === 0" class="empty-activity">
                <q-icon name="group_off" size="44px" />
                <span>Aun no hay usuarios tenant</span>
              </div>
              <div v-else class="user-stack">
                <article
                  v-for="user in tenantUsers"
                  :key="user.user_id"
                  class="user-row"
                >
                  <q-avatar color="primary" text-color="white" icon="person" />
                  <div class="user-copy">
                    <strong>{{ user.display_name }}</strong>
                    <span>{{ user.email }}</span>
                    <small>{{
                      user.roles.map((role) => role.code).join(", ") ||
                      "sin roles"
                    }}</small>
                  </div>
                  <q-badge
                    :color="user.status === 'active' ? 'positive' : 'warning'"
                    :label="user.status"
                  />
                </article>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="card-saas bg-soft-primary no-border">
            <q-card-section>
              <div class="support-note">
                <q-icon name="info" color="primary" size="32px" />
                <div>
                  <strong>Regla de jerarquia</strong>
                  <p>
                    Si apagas un modulo padre, sus hijos quedan apagados de
                    forma efectiva aunque su interruptor siga activo.
                  </p>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <app-dialog
      v-model="roleDialog"
      :title="selectedRole?.name || 'Rol tenant'"
      subtitle="Edita los modulos visibles y permisos del rol."
      icon="tune"
      wide
    >
        <div class="dialog-form">
          <q-select
            v-model="roleForm.moduleKeys"
            :options="moduleOptions"
            label="Modulos visibles"
            emit-value
            map-options
            multiple
            use-chips
            outlined
          />
          <q-select
            v-model="roleForm.permissionCodes"
            :options="permissionOptions"
            label="Permisos"
            emit-value
            map-options
            multiple
            use-chips
            outlined
          />
        </div>
      <template #actions>
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn
            color="primary"
            icon="save"
            label="Guardar"
            :loading="savingRole"
            no-caps
            @click="saveRoleAccess"
          />
      </template>
    </app-dialog>

    <app-dialog
      v-model="userDialog"
      title="Nuevo usuario tenant"
      subtitle="Crea la cuenta y asigna roles iniciales."
      icon="person_add"
      wide
    >
        <div class="dialog-form">
          <q-input
            v-model="userForm.displayName"
            label="Nombre visible"
            outlined
          />
          <q-input
            v-model="userForm.email"
            label="Email"
            type="email"
            outlined
          />
          <q-input
            v-model="userForm.password"
            label="Password temporal"
            type="password"
            outlined
          />
          <q-select
            v-model="userForm.roleCodes"
            :options="roleOptions"
            label="Roles"
            emit-value
            map-options
            multiple
            use-chips
            outlined
          />
        </div>
      <template #actions>
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn
            color="primary"
            icon="person_add"
            label="Crear"
            :loading="savingUser"
            no-caps
            @click="createUser"
          />
      </template>
    </app-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { date } from "quasar";
import {
  getTenant,
  getTenantEffectiveModules,
  getTenantRoles,
  getTenantUsers,
} from "src/utils/api/get";
import { updateTenant } from "src/utils/api/patch";
import { createTenantUser } from "src/utils/api/post";
import { setTenantModules, setTenantRoleAccess } from "src/utils/api/put";
import { notifyError, notifyInfo, notifySuccess } from "src/utils/utils";
import StatCard from "components/dashboard/StatCard.vue";
import AppDialog from "components/common/AppDialog.vue";

const route = useRoute();
const tenantId = route.params.tenantId;

const loadingDetail = ref(true);
const loadingModules = ref(true);
const loadingRoles = ref(true);
const loadingUsers = ref(true);
const savingRole = ref(false);
const savingUser = ref(false);
const tenant = ref(null);
const modules = ref([]);
const tenantRoles = ref([]);
const tenantUsers = ref([]);
const roleDialog = ref(false);
const userDialog = ref(false);
const selectedRole = ref(null);
const roleForm = ref({ moduleKeys: [], permissionCodes: [] });
const userForm = ref({
  displayName: "",
  email: "",
  password: "",
  roleCodes: ["TENANT_ADMIN"],
});

const flattenedModules = computed(() => {
  const result = [];
  for (const module of modules.value) {
    result.push(module);
    result.push(...(module.children || []));
  }
  return result;
});

const enabledModulesCount = computed(
  () => flattenedModules.value.filter((m) => m.effective_enabled).length,
);

const moduleOptions = computed(() =>
  flattenedModules.value.map((mod) => ({
    label: `${mod.name || mod.module_key} (${mod.module_key})`,
    value: mod.module_key,
  })),
);

const permissionOptions = computed(() => {
  const permissions = new Map();
  for (const role of tenantRoles.value) {
    for (const permission of role.permissions || []) {
      permissions.set(permission.permission_code, {
        label: `${permission.permission_code} - ${permission.module_key}`,
        value: permission.permission_code,
      });
    }
  }
  return [...permissions.values()].sort((a, b) =>
    a.value.localeCompare(b.value),
  );
});

const roleOptions = computed(() =>
  tenantRoles.value.map((role) => ({
    label: `${role.name} (${role.code})`,
    value: role.code,
  })),
);

async function loadTenantData() {
  try {
    loadingDetail.value = true;
    const res = await getTenant(tenantId);
    tenant.value = res.data.data;
  } catch {
    notifyError("Fallo al cargar el tenant");
  } finally {
    loadingDetail.value = false;
  }
}

async function loadModules() {
  try {
    loadingModules.value = true;
    const res = await getTenantEffectiveModules(tenantId);
    modules.value = res.data.data.modules || [];
  } catch {
    notifyError("Fallo al cargar modulos");
  } finally {
    loadingModules.value = false;
  }
}

async function loadRoles() {
  try {
    loadingRoles.value = true;
    const res = await getTenantRoles(tenantId);
    tenantRoles.value = res.data.data || [];
  } catch {
    notifyError("Fallo al cargar roles tenant");
  } finally {
    loadingRoles.value = false;
  }
}

async function loadUsers() {
  try {
    loadingUsers.value = true;
    const res = await getTenantUsers(tenantId);
    tenantUsers.value = res.data.data || [];
  } catch {
    notifyError("Fallo al cargar usuarios tenant");
  } finally {
    loadingUsers.value = false;
  }
}

async function updateModules() {
  try {
    notifyInfo("Actualizando configuracion de modulos...");
    const payload = flattenedModules.value.map((m) => ({
      moduleKey: m.module_key,
      isEnabled: m.is_enabled,
    }));
    await setTenantModules(tenantId, payload);
    await loadModules();
    notifySuccess("Modulos actualizados correctamente");
  } catch {
    notifyError("Error al guardar modulos");
  }
}

async function setModuleEnabled(moduleKey, enabled) {
  const target = flattenedModules.value.find((m) => m.module_key === moduleKey);
  if (!target) return;
  target.is_enabled = enabled;
  await updateModules();
}

async function handleToggleStatus() {
  try {
    const newStatus = tenant.value.status === "active" ? "suspended" : "active";
    await updateTenant(tenantId, { status: newStatus });
    tenant.value.status = newStatus;
    notifySuccess(
      `Tenant ${newStatus === "active" ? "activado" : "suspendido"}`,
    );
  } catch {
    notifyError("Error al cambiar estado");
  }
}

function openRoleDialog(role) {
  selectedRole.value = role;
  roleForm.value = {
    moduleKeys: role.modules.map((item) => item.module_key),
    permissionCodes: role.permissions.map((item) => item.permission_code),
  };
  roleDialog.value = true;
}

async function saveRoleAccess() {
  if (!selectedRole.value) return;
  try {
    savingRole.value = true;
    await setTenantRoleAccess(
      tenantId,
      selectedRole.value.code,
      roleForm.value.moduleKeys,
      roleForm.value.permissionCodes,
    );
    await loadRoles();
    roleDialog.value = false;
    notifySuccess("Acceso del rol actualizado");
  } catch {
    notifyError("Error al actualizar el rol tenant");
  } finally {
    savingRole.value = false;
  }
}

function openUserDialog() {
  userForm.value = {
    displayName: "",
    email: "",
    password: "",
    roleCodes: ["TENANT_ADMIN"],
  };
  userDialog.value = true;
}

async function createUser() {
  try {
    savingUser.value = true;
    await createTenantUser(tenantId, userForm.value);
    await loadUsers();
    userDialog.value = false;
    notifySuccess("Usuario tenant creado");
  } catch {
    notifyError("Error al crear usuario tenant");
  } finally {
    savingUser.value = false;
  }
}

function getStatusColor(status) {
  if (status === "active") return "positive";
  if (status === "suspended") return "warning";
  return "grey-7";
}

function formatDate(val) {
  return date.formatDate(val, "DD MMM YYYY");
}

function getModuleIcon(key) {
  if (key.includes("ACADEMIC")) return "school";
  if (key.includes("AI")) return "psychology";
  if (key.includes("ANALYTICS")) return "analytics";
  if (key.includes("REPORT")) return "summarize";
  if (key.includes("COURSE")) return "menu_book";
  if (key.includes("STUDENT")) return "groups";
  return "extension";
}

function reasonLabel(reason) {
  const labels = {
    GLOBAL_DISABLED: "apagado global",
    PARENT_GLOBAL_DISABLED: "padre global apagado",
    PARENT_TENANT_DISABLED: "padre tenant apagado",
    TENANT_DISABLED: "apagado tenant",
  };
  return labels[reason] || reason;
}

onMounted(() => {
  loadTenantData();
  loadModules();
  loadRoles();
  loadUsers();
});
</script>

<style scoped lang="scss">
.tenant-detail-page,
.content-grid,
.main-grid,
.side-column,
.role-stack,
.user-stack,
.dialog-form,
.tenant-module-tree,
.tenant-children {
  display: grid;
  gap: var(--space-6);
}

.tenant-header,
.title-row,
.card-heading,
.support-note {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.stats-grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.main-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.card-heading {
  justify-content: space-between;
}

.loading-modules,
.empty-activity {
  display: grid;
  min-height: 220px;
  place-items: center;
  text-align: center;
}

.empty-activity {
  color: var(--color-text-tertiary);
  gap: var(--space-3);
}

.access-card,
.user-row {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.access-card {
  background: var(--color-surface-strong);
  display: grid;
  gap: var(--space-3);
}

.access-card__head,
.access-metrics,
.chip-row,
.user-row {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.access-card__head {
  justify-content: space-between;

  div {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--color-text-tertiary);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
  }
}

.chip-row {
  flex-wrap: wrap;
}

.user-row {
  background: var(--color-bg-secondary);
}

.user-copy {
  display: grid;
  flex: 1;
  gap: var(--space-1);
  min-width: 0;

  strong,
  span,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span,
  small {
    color: var(--color-text-tertiary);
  }
}

.dialog-form {
  gap: var(--space-4);
}

.tenant-module-node {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.root-node {
  background: var(--color-surface-strong);
}

.child-node {
  background: var(--color-bg-secondary);
  margin-left: var(--space-6);
}

.tenant-module-row {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.module-icon-box {
  align-items: center;
  border-radius: var(--radius-lg);
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.module-copy {
  display: grid;
  gap: var(--space-1);
  min-width: 0;

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--color-text-tertiary);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
  }
}

.tenant-children {
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.support-note {
  align-items: flex-start;

  strong {
    color: var(--color-primary);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    color: var(--color-text-secondary);
    margin-top: var(--space-1);
  }
}

@media (max-width: 1000px) {
  .main-grid,
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .main-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tenant-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .child-node {
    margin-left: 0;
  }

  .tenant-module-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
