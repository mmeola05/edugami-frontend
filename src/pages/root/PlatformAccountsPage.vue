<template>
  <q-page class="page-shell-premium accounts-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">Cuentas de plataforma</h1>
        <p class="text-page-subtitle">Gestion de accesos ROOT y SUPPORT.</p>
      </div>

      <div class="header-actions">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          :loading="loading"
          @click="loadAccounts"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn
          v-if="canManageAccounts"
          unelevated
          color="primary"
          icon="person_add"
          label="Nueva cuenta"
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

    <q-card class="card-saas">
      <q-table
        :rows="accounts"
        :columns="columns"
        :loading="loading"
        row-key="platform_account_id"
        flat
        class="table-premium"
        :rows-per-page-options="[0]"
        hide-pagination
      >
        <template v-slot:no-data>
          <div class="table-empty-state">
            <div class="icon-tile bg-soft-info table-empty-icon">
              <q-icon name="manage_accounts" color="info" size="28px" />
            </div>
            <div>
              <div class="font-bold">Todavia no hay cuentas para listar</div>
              <div class="text-secondary text-sm">
                Crea la primera cuenta SUPPORT cuando quieras delegar acceso
                operativo sin dar permisos ROOT.
              </div>
            </div>
          </div>
        </template>

        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <div class="account-cell">
              <div
                :class="`icon-tile bg-soft-${props.row.role === 'ROOT' ? 'primary' : 'info'}`"
              >
                <q-icon
                  :name="
                    props.row.role === 'ROOT'
                      ? 'admin_panel_settings'
                      : 'support_agent'
                  "
                  :color="props.row.role === 'ROOT' ? 'primary' : 'info'"
                  size="18px"
                />
              </div>
              <div>
                <div class="font-bold">{{ props.row.email }}</div>
                <div class="text-meta-mono">
                  {{ props.row.platform_account_id }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-role="props">
          <q-td :props="props" align="center">
            <q-badge
              :color="props.value === 'ROOT' ? 'primary' : 'info'"
              :label="props.value"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" align="center">
            <q-badge
              :color="props.value === 'active' ? 'positive' : 'warning'"
              :label="props.value"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              v-if="canManageAccounts"
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="openEdit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <div class="ops-grid">
      <q-card class="card-saas account-insight">
        <q-card-section>
          <div class="section-title">Control de accesos</div>
          <p class="text-secondary q-mt-sm">
            Las cuentas ROOT administran plataforma completa. Las SUPPORT deben
            quedar para soporte operativo con permisos limitados desde RBAC.
          </p>
          <div class="insight-list">
            <div class="insight-row">
              <q-icon name="admin_panel_settings" color="primary" />
              <span>{{ statsByRole.root }} cuentas ROOT activas</span>
            </div>
            <div class="insight-row">
              <q-icon name="support_agent" color="info" />
              <span>{{ statsByRole.support }} cuentas SUPPORT activas</span>
            </div>
            <div class="insight-row">
              <q-icon name="block" color="warning" />
              <span>{{ statsByRole.suspended }} cuentas suspendidas</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <app-dialog
      v-model="dialogOpen"
      :title="isEditing ? 'Editar cuenta' : 'Nueva cuenta'"
      subtitle="Gestiona el acceso ROOT y SUPPORT de plataforma."
      :icon="isEditing ? 'manage_accounts' : 'person_add'"
    >
        <div class="form-grid">
          <q-input
            v-model="form.email"
            outlined
            dense
            label="Email"
            :disable="isEditing"
          />
          <q-input
            v-if="!isEditing"
            v-model="form.password"
            outlined
            dense
            type="password"
            label="Password inicial"
          />
          <q-select
            v-model="form.role"
            outlined
            dense
            label="Rol"
            :options="roleOptions"
            emit-value
            map-options
          />
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
            :loading="saving"
            @click="saveAccount"
          />
      </template>
    </app-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { date } from "quasar";
import { useUserStore } from "src/stores/userStore";
import { getPlatformAccounts } from "src/utils/api/get";
import { createPlatformAccount } from "src/utils/api/post";
import { updatePlatformAccount } from "src/utils/api/patch";
import { notifyError, notifySuccess } from "src/utils/utils";
import AppDialog from "components/common/AppDialog.vue";

const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const accounts = ref([]);
const dialogOpen = ref(false);
const isEditing = ref(false);

const form = reactive({
  id: null,
  email: "",
  password: "",
  role: "SUPPORT",
  status: "active",
});

const roleOptions = [
  { label: "ROOT", value: "ROOT" },
  { label: "SUPPORT", value: "SUPPORT" },
];

const statusOptions = [
  { label: "Activa", value: "active" },
  { label: "Suspendida", value: "suspended" },
];

const baseColumns = [
  {
    name: "email",
    label: "Cuenta",
    field: "email",
    align: "left",
    sortable: true,
  },
  {
    name: "role",
    label: "Rol",
    field: "role",
    align: "center",
    sortable: true,
  },
  {
    name: "status",
    label: "Estado",
    field: "status",
    align: "center",
    sortable: true,
  },
  {
    name: "created_at",
    label: "Creada",
    field: "created_at",
    align: "center",
    format: (val) => date.formatDate(val, "DD/MM/YYYY"),
    sortable: true,
  },
  { name: "actions", label: "Acciones", align: "right" },
];

const canManageAccounts = computed(() =>
  userStore.hasPermission("platform_accounts.manage"),
);
const columns = computed(() =>
  canManageAccounts.value
    ? baseColumns
    : baseColumns.filter((column) => column.name !== "actions"),
);

const stats = computed(() => [
  {
    label: "Total",
    value: accounts.value.length,
    icon: "manage_accounts",
    color: "primary",
  },
  {
    label: "ROOT",
    value: accounts.value.filter((item) => item.role === "ROOT").length,
    icon: "admin_panel_settings",
    color: "info",
  },
  {
    label: "SUPPORT",
    value: accounts.value.filter((item) => item.role === "SUPPORT").length,
    icon: "support_agent",
    color: "warning",
  },
  {
    label: "Activas",
    value: accounts.value.filter((item) => item.status === "active").length,
    icon: "verified_user",
    color: "positive",
  },
]);

const statsByRole = computed(() => ({
  root: accounts.value.filter(
    (item) => item.role === "ROOT" && item.status === "active",
  ).length,
  support: accounts.value.filter(
    (item) => item.role === "SUPPORT" && item.status === "active",
  ).length,
  suspended: accounts.value.filter((item) => item.status !== "active").length,
}));

async function loadAccounts() {
  loading.value = true;
  error.value = null;
  try {
    const res = await getPlatformAccounts();
    accounts.value = res.data.data || [];
  } catch {
    error.value = "No se pudieron cargar las cuentas.";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.id = null;
  form.email = "";
  form.password = "";
  form.role = "SUPPORT";
  form.status = "active";
}

function openCreate() {
  resetForm();
  isEditing.value = false;
  dialogOpen.value = true;
}

function openEdit(account) {
  form.id = account.platform_account_id;
  form.email = account.email;
  form.password = "";
  form.role = account.role;
  form.status = account.status;
  isEditing.value = true;
  dialogOpen.value = true;
}

async function saveAccount() {
  saving.value = true;
  try {
    if (isEditing.value) {
      await updatePlatformAccount(form.id, {
        role: form.role,
        status: form.status,
      });
      notifySuccess("Cuenta actualizada");
    } else {
      await createPlatformAccount({
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status,
      });
      notifySuccess("Cuenta creada");
    }
    dialogOpen.value = false;
    await loadAccounts();
  } catch {
    notifyError("No se pudo guardar la cuenta");
  } finally {
    saving.value = false;
  }
}

onMounted(loadAccounts);
</script>

<style scoped lang="scss">
.accounts-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.header-actions,
.account-cell {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.stats-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.ops-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.account-insight {
  min-height: 0;
}

.insight-list {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.insight-row {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
}

.table-empty-state {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  min-height: 180px;
  padding: var(--space-8);
  width: 100%;
}

.table-empty-icon {
  flex: 0 0 auto;
  height: 56px;
  width: 56px;
}

.form-grid {
  display: grid;
  gap: var(--space-4);
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid,
  .page-header {
    grid-template-columns: 1fr;
  }
}
</style>
