<template>
  <q-page class="page-shell-premium rbac-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">Roles y permisos</h1>
        <p class="text-page-subtitle">
          RBAC interno para ROOT y SUPPORT, agrupado por modulo.
        </p>
      </div>

      <div class="header-actions">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          :loading="loading"
          @click="loadRbac"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn
          v-if="canManageRbac"
          unelevated
          color="primary"
          icon="add"
          label="Nuevo rol"
          no-caps
          @click="openCreate"
        />
      </div>
    </div>

    <q-banner v-if="error" class="bg-negative text-white">{{ error }}</q-banner>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="metric-card q-pa-md">
        <div class="row items-center justify-between">
          <div :class="`icon-tile bg-soft-${stat.color}`">
            <q-icon :name="stat.icon" :color="stat.color" size="20px" />
          </div>
          <div class="column items-end">
            <span class="text-mini-label text-grey-6">{{ stat.label }}</span>
            <span class="metric-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rbac-grid">
      <q-card class="card-saas">
        <q-card-section class="card-heading">
          <span class="section-title">Roles</span>
          <q-badge color="primary" :label="`${roles.length} roles`" />
        </q-card-section>

        <q-separator opacity="0.1" />

        <q-list v-if="roles.length" separator>
          <q-item
            v-for="role in roles"
            :key="role.role_id"
            clickable
            :active="selectedRoleId === role.role_id"
            active-class="active-role"
            @click="selectRole(role.role_id)"
          >
            <q-item-section avatar>
              <div
                :class="`icon-tile bg-soft-${role.is_protected ? 'warning' : 'primary'}`"
              >
                <q-icon
                  :name="role.is_protected ? 'lock' : 'badge'"
                  :color="role.is_protected ? 'warning' : 'primary'"
                  size="18px"
                />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="font-bold">{{ role.name }}</q-item-label>
              <q-item-label caption>{{ role.code }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="role.status === 'active' ? 'positive' : 'warning'"
                :label="role.status"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-else class="empty-state compact-empty">
          <q-icon name="badge" size="40px" />
          <span>No hay roles creados.</span>
        </q-card-section>
      </q-card>

      <q-card class="card-saas">
        <q-card-section class="card-heading">
          <div>
            <span class="section-title">{{
              selectedRole?.name || "Selecciona un rol"
            }}</span>
            <p v-if="selectedRole" class="text-page-subtitle">
              {{ selectedRole.code }}
            </p>
          </div>
          <q-btn
            v-if="selectedRole && canManageRbac"
            flat
            round
            dense
            icon="edit"
            color="primary"
            @click="openEdit(selectedRole)"
          >
            <q-tooltip>Editar rol</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator opacity="0.1" />

        <q-card-section v-if="!selectedRole" class="empty-state">
          <q-icon name="admin_panel_settings" size="48px" />
          <span>Elige un rol para revisar sus permisos.</span>
        </q-card-section>

        <q-card-section v-else class="permissions-panel">
          <div class="role-summary">
            <div>
              <span>Seleccionados</span>
              <strong>{{ selectedPermissionCodes.length }}</strong>
            </div>
            <div>
              <span>Disponibles</span>
              <strong>{{ filteredPermissions.length }}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{{ selectedRole.status }}</strong>
            </div>
          </div>

          <q-banner v-if="selectedRole.is_protected" class="protected-banner">
            <q-icon name="lock" />
            Rol protegido: revisa cambios con cuidado porque puede afectar al
            acceso administrativo.
          </q-banner>

          <div class="permission-toolbar">
            <q-input
              v-model="permissionSearch"
              dense
              outlined
              label="Buscar permiso"
              class="permission-search"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-tabs
              v-model="permissionScopeFilter"
              dense
              no-caps
              active-color="primary"
              indicator-color="primary"
            >
              <q-tab name="ALL" label="Todos" />
              <q-tab name="ROOT" label="ROOT" />
              <q-tab name="SUPPORT" label="SUPPORT" />
            </q-tabs>
          </div>

          <div class="permission-groups">
            <section
              v-for="group in groupedPermissions"
              :key="group.key"
              class="permission-group"
            >
              <div class="permission-group-heading">
                <div class="permission-heading-main">
                  <div
                    :class="`icon-tile bg-soft-${group.scope === 'SUPPORT' ? 'info' : 'primary'}`"
                  >
                    <q-icon
                      name="extension"
                      :color="group.scope === 'SUPPORT' ? 'info' : 'primary'"
                      size="18px"
                    />
                  </div>
                  <div>
                    <strong>{{ group.label }}</strong>
                    <span
                      >{{ group.scope }} / {{ group.items.length }} permisos /
                      {{ selectedInGroup(group) }} activos</span
                    >
                  </div>
                </div>

                <div v-if="canManageRbac" class="group-actions">
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="select_all"
                    label="Todos"
                    @click="selectGroup(group)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="remove_done"
                    label="Ninguno"
                    @click="clearGroup(group)"
                  />
                </div>
              </div>

              <div class="permission-list">
                <q-checkbox
                  v-for="permission in group.items"
                  :key="permission.code"
                  v-model="selectedPermissionCodes"
                  :val="permission.code"
                  color="primary"
                  :disable="!canManageRbac"
                >
                  <template v-slot:default>
                    <div class="permission-copy">
                      <strong>{{ permission.code }}</strong>
                      <span>{{
                        permission.description ||
                        permission.action ||
                        "Sin descripcion"
                      }}</span>
                    </div>
                  </template>
                </q-checkbox>
              </div>
            </section>

            <div
              v-if="groupedPermissions.length === 0"
              class="empty-state compact-empty"
            >
              <q-icon name="manage_search" size="40px" />
              <span>No hay permisos con ese filtro.</span>
            </div>
          </div>

          <div class="panel-actions">
            <q-btn
              v-if="canManageRbac"
              unelevated
              color="primary"
              icon="save"
              label="Guardar permisos"
              no-caps
              :loading="savingPermissions"
              @click="savePermissions"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <app-dialog
      v-model="dialogOpen"
      :title="isEditing ? 'Editar rol' : 'Nuevo rol'"
      subtitle="Define el rol y su estado operativo."
      :icon="isEditing ? 'edit' : 'add_moderator'"
    >
        <div class="form-grid">
          <q-input
            v-model="form.code"
            outlined
            dense
            label="Code"
            :disable="isEditing && selectedRole?.is_protected"
          />
          <q-input v-model="form.name" outlined dense label="Nombre" />
          <q-select
            v-model="form.status"
            outlined
            dense
            label="Estado"
            :options="statusOptions"
            emit-value
            map-options
          />
        </div>

      <template #actions>
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Guardar"
            no-caps
            :loading="savingRole"
            @click="saveRole"
          />
      </template>
    </app-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getRbacOverview, getRole } from "src/utils/api/get";
import { createRole } from "src/utils/api/post";
import { updateRole } from "src/utils/api/patch";
import { setRolePermissions } from "src/utils/api/put";
import { useUserStore } from "src/stores/userStore";
import { notifyError, notifySuccess } from "src/utils/utils";
import AppDialog from "components/common/AppDialog.vue";
import { useConfirmDialog } from "src/composables/useConfirmDialog";

const { confirmAction } = useConfirmDialog();
const userStore = useUserStore();
const loading = ref(false);
const error = ref(null);
const overview = ref({ roles: [], permissions: [], rolePermissions: [] });
const selectedRoleId = ref(null);
const selectedRoleDetail = ref(null);
const selectedPermissionCodes = ref([]);
const permissionSearch = ref("");
const permissionScopeFilter = ref("ALL");
const savingPermissions = ref(false);
const savingRole = ref(false);
const dialogOpen = ref(false);
const isEditing = ref(false);
const canManageRbac = computed(() => userStore.hasPermission("rbac.manage"));
const criticalRootPermissions = new Set([
  "dashboard.read",
  "rbac.read",
  "rbac.manage",
  "platform_modules.read",
  "platform_modules.manage",
]);

const form = reactive({
  roleId: null,
  code: "",
  name: "",
  status: "active",
});

const statusOptions = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
];

const roles = computed(() => overview.value.roles || []);
const permissions = computed(() => overview.value.permissions || []);
const selectedRole = computed(
  () =>
    roles.value.find((role) => role.role_id === selectedRoleId.value) || null,
);

const stats = computed(() => [
  {
    label: "Roles",
    value: roles.value.length,
    icon: "admin_panel_settings",
    color: "primary",
  },
  {
    label: "Protegidos",
    value: roles.value.filter((item) => item.is_protected).length,
    icon: "lock",
    color: "warning",
  },
  {
    label: "Permisos",
    value: permissions.value.length,
    icon: "key",
    color: "info",
  },
  {
    label: "Modulos",
    value: new Set(permissions.value.map((item) => item.module_key)).size,
    icon: "extension",
    color: "positive",
  },
]);

const filteredPermissions = computed(() => {
  const needle = permissionSearch.value.trim().toLowerCase();
  return permissions.value.filter((permission) => {
    const scopeOk =
      permissionScopeFilter.value === "ALL" ||
      permission.scope === permissionScopeFilter.value;
    const textOk =
      !needle ||
      permission.code.toLowerCase().includes(needle) ||
      String(permission.description || "")
        .toLowerCase()
        .includes(needle) ||
      String(permission.module_name || "")
        .toLowerCase()
        .includes(needle);
    return scopeOk && textOk;
  });
});

const groupedPermissions = computed(() => {
  const groups = new Map();
  for (const permission of filteredPermissions.value) {
    const key = permission.module_key || "SIN_MODULO";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: permission.module_name || key,
        scope: permission.scope || "LEGACY",
        items: [],
      });
    }
    groups.get(key).items.push(permission);
  }
  return Array.from(groups.values());
});

async function loadRbac() {
  loading.value = true;
  error.value = null;
  try {
    const res = await getRbacOverview();
    overview.value = res.data.data || {
      roles: [],
      permissions: [],
      rolePermissions: [],
    };
    if (!selectedRoleId.value && roles.value.length > 0) {
      await selectRole(roles.value[0].role_id);
    } else if (selectedRoleId.value) {
      await selectRole(selectedRoleId.value);
    }
  } catch {
    error.value = "No se pudo cargar RBAC.";
  } finally {
    loading.value = false;
  }
}

async function selectRole(roleId) {
  selectedRoleId.value = roleId;
  const res = await getRole(roleId);
  selectedRoleDetail.value = res.data.data;
  selectedPermissionCodes.value = (
    selectedRoleDetail.value.permissions || []
  ).map((permission) => permission.code);
}

function resetForm() {
  form.roleId = null;
  form.code = "";
  form.name = "";
  form.status = "active";
}

function openCreate() {
  if (!canManageRbac.value) return;
  resetForm();
  isEditing.value = false;
  dialogOpen.value = true;
}

function openEdit(role) {
  if (!canManageRbac.value) return;
  form.roleId = role.role_id;
  form.code = role.code;
  form.name = role.name;
  form.status = role.status;
  isEditing.value = true;
  dialogOpen.value = true;
}

async function saveRole() {
  if (!canManageRbac.value) return;
  const confirmed = await confirmRoleSave();
  if (!confirmed) return;

  savingRole.value = true;
  try {
    if (isEditing.value) {
      await updateRole(form.roleId, {
        code: form.code,
        name: form.name,
        status: form.status,
      });
      notifySuccess("Rol actualizado");
    } else {
      await createRole({
        code: form.code,
        name: form.name,
        status: form.status,
      });
      notifySuccess("Rol creado");
    }
    dialogOpen.value = false;
    await loadRbac();
  } catch {
    notifyError("No se pudo guardar el rol");
  } finally {
    savingRole.value = false;
  }
}

async function savePermissions() {
  if (!selectedRoleId.value) return;
  if (!canManageRbac.value) return;
  const confirmed = await confirmPermissionSave();
  if (!confirmed) return;

  savingPermissions.value = true;
  try {
    await setRolePermissions(
      selectedRoleId.value,
      selectedPermissionCodes.value,
    );
    notifySuccess("Permisos actualizados");
    await selectRole(selectedRoleId.value);
  } catch {
    notifyError("No se pudieron guardar los permisos");
  } finally {
    savingPermissions.value = false;
  }
}

function confirmRoleSave() {
  if (!isEditing.value || !selectedRole.value?.is_protected) {
    return Promise.resolve(true);
  }

  const changedStatus = form.status !== selectedRole.value.status;
  const changedCode = form.code !== selectedRole.value.code;
  if (!changedStatus && !changedCode) return Promise.resolve(true);

  return confirmCriticalAction({
    title: "Confirmar cambio de rol protegido",
    message:
      "Este rol forma parte del acceso administrativo principal. Cambiar su codigo o estado puede afectar a usuarios ROOT o SUPPORT.",
    okLabel: "Guardar cambio",
  });
}

function confirmPermissionSave() {
  if (!selectedRole.value) return Promise.resolve(true);
  const before = new Set(
    (selectedRoleDetail.value?.permissions || []).map((permission) => permission.code),
  );
  const after = new Set(selectedPermissionCodes.value);
  const removedCritical = [...criticalRootPermissions].filter(
    (code) => before.has(code) && !after.has(code),
  );

  if (!selectedRole.value.is_protected && removedCritical.length === 0) {
    return Promise.resolve(true);
  }

  const criticalText = removedCritical.length
    ? ` Permisos criticos retirados: ${removedCritical.join(", ")}.`
    : "";

  return confirmCriticalAction({
    title: "Confirmar cambio de permisos",
    message: `Vas a modificar permisos de un rol sensible.${criticalText} El backend impedira dejar sin administracion al ultimo ROOT efectivo.`,
    okLabel: "Guardar permisos",
  });
}

function confirmCriticalAction({ title, message, okLabel }) {
  return confirmAction({
    title,
    message,
    okLabel,
    color: "negative",
    icon: "security",
  });
}

function selectedInGroup(group) {
  const selected = new Set(selectedPermissionCodes.value);
  return group.items.filter((permission) => selected.has(permission.code))
    .length;
}

function selectGroup(group) {
  const next = new Set(selectedPermissionCodes.value);
  group.items.forEach((permission) => next.add(permission.code));
  selectedPermissionCodes.value = [...next];
}

function clearGroup(group) {
  const remove = new Set(group.items.map((permission) => permission.code));
  selectedPermissionCodes.value = selectedPermissionCodes.value.filter(
    (code) => !remove.has(code),
  );
}

onMounted(loadRbac);
</script>

<style scoped lang="scss">
.rbac-page,
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
  gap: var(--space-3);
}

.stats-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.rbac-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(280px, 0.75fr) minmax(0, 1.6fr);
}

.card-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.active-role {
  background: rgba(79, 70, 229, 0.09);
  color: var(--color-primary);
}

.empty-state {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  justify-content: center;
  min-height: 280px;
}

.compact-empty {
  min-height: 180px;
}

.permissions-panel {
  display: grid;
  gap: var(--space-5);
}

.role-summary {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  div {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3);
  }

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
  }
}

.protected-banner {
  align-items: center;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: var(--color-text-primary);
  display: flex;
  gap: var(--space-3);
}

.permission-toolbar {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
}

.permission-search {
  min-width: 280px;
}

.permission-groups {
  display: grid;
  gap: var(--space-4);
  max-height: 560px;
  overflow: auto;
  padding-right: var(--space-2);
}

.permission-group {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
}

.permission-group-heading {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
}

.permission-heading-main {
  align-items: center;
  display: flex;
  gap: var(--space-3);

  strong {
    color: var(--color-text-primary);
    display: block;
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }
}

.group-actions {
  display: flex;
  gap: var(--space-1);
}

.permission-list {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.permission-copy {
  display: grid;
  gap: 2px;

  strong {
    color: var(--color-text-primary);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
  }

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
}

.dialog-card {
  min-width: min(520px, 92vw);
}

.form-grid {
  display: grid;
  gap: var(--space-4);
}

@media (max-width: 1000px) {
  .rbac-grid,
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .permission-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .permission-search {
    min-width: 0;
    width: 100%;
  }
}

@media (max-width: 700px) {
  .rbac-grid,
  .stats-grid,
  .role-summary,
  .page-header {
    grid-template-columns: 1fr;
  }

  .permission-group-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
