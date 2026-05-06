<template>
  <q-page class="page-shell-premium">
    <!-- Header: Identity & Global Actions -->
    <div class="row items-center justify-between q-mb-xl animate-fade-in">
      <div class="column">
        <h1 class="text-page-title q-ma-none">{{ $t("tenants.title") }}</h1>
        <div class="row items-center q-gutter-x-sm q-mt-xs">
          <div class="status-dot-pulse bg-primary"></div>
          <p class="text-page-subtitle q-ma-none">
            {{ $t("tenants.subtitle") }}
          </p>
        </div>
      </div>
      <div class="row q-gutter-x-sm">
        <!-- Export removed as requested -->
        <q-btn
          unelevated
          color="primary"
          icon="add"
          :label="$t('tenants.new_btn')"
          @click="openCreateModal"
          class="btn-premium shadow-lg q-px-xl"
          no-caps
        />
      </div>
    </div>

    <!-- Quick Stats Bar (Compact & Glass) -->
    <div class="row q-col-gutter-md q-mb-xl animate-fade-in">
      <div
        v-for="stat in statList"
        :key="stat.label"
        class="col-12 col-sm-6 col-md-3"
      >
        <div class="metric-card q-pa-md">
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
    </div>

    <!-- Main Section: Integrated View -->
    <q-card class="card-saas no-shadow animate-slide-up overflow-hidden">
      <!-- Advanced Toolbar -->
      <div
        class="row items-center q-px-xl q-py-lg border-bottom bg-saas-toolbar"
      >
        <q-tabs
          v-model="filters.status"
          dense
          no-caps
          inline-label
          class="saas-tabs-modern"
          active-color="primary"
          indicator-color="primary"
          @update:model-value="fetchTenants"
        >
          <q-tab :name="null" :label="$t('tenants.ecosystem')" />
          <q-tab name="active" :label="$t('tenants.status_active')" />
          <q-tab name="suspended" :label="$t('tenants.status_suspended')" />
        </q-tabs>

        <q-separator vertical inset class="q-mx-xl" v-if="$q.screen.gt.sm" />

        <div class="col-grow row items-center q-gutter-x-lg">
          <q-input
            v-model="filters.search"
            :placeholder="$t('tenants.search_placeholder')"
            borderless
            dense
            class="saas-search-input-premium col-grow"
            @update:model-value="debouncedFetch"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="20px" color="primary" />
            </template>
          </q-input>

          <q-select
            v-model="filters.type"
            :options="typeOptions"
            borderless
            dense
            emit-value
            map-options
            class="saas-select-premium"
            @update:model-value="fetchTenants"
          >
            <template v-slot:prepend>
              <q-icon name="category" size="18px" color="grey-6" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Table: Action icons directly visible -->
      <q-table
        :rows="tenants"
        :columns="columns"
        row-key="tenant_id"
        :loading="loading"
        flat
        class="table-premium"
        :rows-per-page-options="[0]"
        hide-pagination
      >
        <!-- Name Column -->
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div
              class="row items-center no-wrap cursor-pointer"
              @click="viewDetail(props.row)"
            >
              <div
                :class="`avatar-tile bg-soft-${getTypeColor(props.row.tenant_type)} text-weight-bold`"
              >
                {{ props.row.name.charAt(0).toUpperCase() }}
              </div>
              <div class="column q-ml-md">
                <span class="tenant-name">{{ props.row.name }}</span>
                <span class="text-meta-mono text-grey-5">{{
                  props.row.slug
                }}</span>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Status Column -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props" align="center">
            <div :class="`status-pill bg-soft-${getStatusColor(props.value)}`">
              <div
                :class="`status-pill__dot bg-${getStatusColor(props.value)}`"
              ></div>
              <span
                :class="`text-weight-bold text-${getStatusColor(props.value)}`"
                >{{ props.value.toUpperCase() }}</span
              >
            </div>
          </q-td>
        </template>

        <!-- Actions -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <div class="row items-center justify-end q-gutter-x-md">
              <q-btn
                flat
                round
                dense
                icon="settings"
                color="primary"
                size="sm"
                @click="viewDetail(props.row)"
                class="btn-icon-subtle"
                ><q-tooltip>{{ $t("tenants.manage") }}</q-tooltip></q-btn
              >
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="grey-7"
                size="sm"
                @click="editTenant(props.row)"
                class="btn-icon-subtle"
                ><q-tooltip>{{ $t("tenants.edit") }}</q-tooltip></q-btn
              >
              <q-btn
                flat
                round
                dense
                :icon="props.row.status === 'active' ? 'block' : 'check_circle'"
                :color="props.row.status === 'active' ? 'negative' : 'positive'"
                size="sm"
                @click="toggleStatus(props.row)"
                class="btn-icon-subtle"
                ><q-tooltip>{{
                  props.row.status === "active" ? $t("tenants.suspend") : $t("tenants.activate")
                }}</q-tooltip></q-btn
              >
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Create/Edit Modal Componentized -->
    <tenant-dialog
      v-model="showCreateModal"
      :is-editing="isEditing"
      :form="form"
      :type-options="typeOptionsRaw"
      :timezone-options="timezoneOptions"
      :saving="saving"
      @save="saveTenant"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { date } from "quasar";
import { getTenants } from "src/utils/api/get";
import { createTenant } from "src/utils/api/post";
import { updateTenant } from "src/utils/api/patch";
import { notifySuccess, notifyError, notifyInfo } from "src/utils/utils";
import { realtimeService } from "src/utils/realtime";

// Components
import TenantDialog from "components/tenants/TenantDialog.vue";

const router = useRouter();
const { t } = useI18n();
const tenants = ref([]);
const loading = ref(false);
const saving = ref(false);
const showCreateModal = ref(false);
const isEditing = ref(false);

const filters = reactive({ search: "", status: null, type: null });

const statList = computed(() => [
  {
    label: t("tenants.ecosystem"),
    value: tenants.value.length,
    icon: "public",
    color: "primary",
  },
  {
    label: t("tenants.active_nodes"),
    value: tenants.value.filter((t) => t.status === "active").length,
    icon: "hub",
    color: "positive",
  },
  {
    label: t("tenants.waiting_nodes"),
    value: tenants.value.filter((t) => t.status === "suspended").length,
    icon: "pause_circle",
    color: "warning",
  },
  {
    label: t("tenants.new_24h"),
    value: 1,
    icon: "auto_awesome",
    color: "info",
  },
]);

const form = reactive({
  id: null,
  name: "",
  slug: "",
  tenantType: "SCHOOL",
  timezone: "Europe/Madrid",
});

const typeOptionsRaw = computed(() => [
  { label: t("tenants.type_school"), value: "SCHOOL" },
  { label: t("tenants.type_academy"), value: "ACADEMY" },
  { label: t("tenants.type_business"), value: "BUSINESS" },
]);

const typeOptions = computed(() => [
  { label: t("tenants.all_types"), value: null },
  ...typeOptionsRaw.value,
]);

const timezoneOptions = computed(() => [
  { label: t("tenants.tz_madrid"), value: "Europe/Madrid" },
  { label: t("tenants.tz_london"), value: "Europe/London" },
  { label: t("tenants.tz_newyork"), value: "America/New_York" },
]);

const columns = computed(() => [
  {
    name: "name",
    label: t("tenants.table_name"),
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "tenantType",
    label: t("tenants.table_type"),
    align: "center",
    field: "tenant_type",
    sortable: true,
  },
  {
    name: "status",
    label: t("tenants.table_status"),
    align: "center",
    field: "status",
    sortable: true,
  },
  {
    name: "createdAt",
    label: t("tenants.table_created"),
    align: "center",
    field: "created_at",
    format: (val) => date.formatDate(val, "DD/MM/YYYY"),
    sortable: true,
  },
  { name: "actions", label: t("tenants.table_actions"), align: "right" },
]);

let debounceTimer = null;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchTenants(), 400);
}

async function fetchTenants() {
  try {
    loading.value = true;
    const res = await getTenants({
      search: filters.search,
      status: filters.status,
      type: filters.type,
    });
    tenants.value = res.data.data || [];
  } catch (err) {
    notifyError(t("tenants.sync_error"));
  } finally {
    loading.value = false;
  }
}

function viewDetail(tenant) {
  router.push({
    name: "tenant-detail",
    params: { tenantId: tenant.tenant_id },
  });
}

function openCreateModal() {
  resetForm();
  isEditing.value = false;
  showCreateModal.value = true;
}

function editTenant(tenant) {
  isEditing.value = true;
  form.id = tenant.tenant_id;
  form.name = tenant.name;
  form.slug = tenant.slug;
  form.tenantType = tenant.tenant_type;
  form.timezone = tenant.timezone;
  showCreateModal.value = true;
}

async function saveTenant() {
  try {
    saving.value = true;
    if (isEditing.value) {
      await updateTenant(form.id, form);
      notifySuccess(t("tenants.update_success"));
    } else {
      await createTenant(form);
      notifySuccess(t("tenants.create_success"));
    }
    showCreateModal.value = false;
    await fetchTenants();
  } catch (err) {
    notifyError(t("tenants.save_error"));
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(tenant) {
  try {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    await updateTenant(tenant.tenant_id, { status: newStatus });
    notifySuccess(t("tenants.status_update", { status: newStatus }));
    await fetchTenants();
  } catch (err) {
    notifyError(t("tenants.status_error"));
  }
}

function resetForm() {
  form.id = null;
  form.name = "";
  form.slug = "";
  form.tenantType = "SCHOOL";
  form.timezone = "Europe/Madrid";
}

function getStatusColor(status) {
  switch (status) {
    case "active":
      return "positive";
    case "suspended":
      return "warning";
    default:
      return "grey-7";
  }
}

function getTypeColor(type) {
  switch (type) {
    case "SCHOOL":
      return "primary";
    case "ACADEMY":
      return "info";
    case "BUSINESS":
      return "warning";
    default:
      return "grey-7";
  }
}

onMounted(() => {
  fetchTenants();
  realtimeService.on("tenant_created", fetchTenants);
  realtimeService.on("tenant_suspended", fetchTenants);
  realtimeService.on("tenant_updated", fetchTenants);
});
</script>

<style scoped lang="scss">
.tenant-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-extrabold);
}
</style>
