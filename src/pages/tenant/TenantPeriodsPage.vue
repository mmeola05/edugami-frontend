<template>
  <q-page class="page-shell-premium periods-page">
    <section class="tenant-page-head periods-hero">
      <div class="hero-copy">
        <div class="tenant-section-kicker hero-kicker">
          <q-icon name="event_note" size="18px" />
          {{ t("tenant.layout.nav_periods") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.periods.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.periods.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions hero-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search period-search"
          :placeholder="t('tenant.modules.search_placeholder')"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>

        <q-btn
          v-if="canCreate"
          color="primary"
          icon="add"
          :label="t('tenant.modules.periods.create')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="periods-overview">
      <article class="active-period-panel">
        <div class="panel-icon">
          <q-icon name="event_available" size="26px" />
        </div>
        <div>
          <span class="panel-label">{{ t("tenant.modules.periods.current") }}</span>
          <strong>{{ activePeriod?.name || "-" }}</strong>
          <p>{{ activePeriod?.dateRange || t("tenant.modules.periods.empty_text") }}</p>
        </div>
        <q-badge v-if="activePeriod" color="positive" text-color="white">
          {{ statusLabel(activePeriod.status) }}
        </q-badge>
      </article>

      <div class="period-metrics">
        <div v-for="metric in metrics" :key="metric.label" class="metric-pill">
          <q-icon :name="metric.icon" size="18px" />
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
      </div>
    </section>

    <section class="tenant-workspace-card period-workspace">
      <div class="period-toolbar">
        <q-tabs
          v-model="statusFilter"
          dense
          inline-label
          active-color="primary"
          indicator-color="primary"
          class="period-tabs"
        >
          <q-tab name="all" icon="view_agenda" :label="t('common.all')" />
          <q-tab name="active" icon="play_circle" :label="statusLabel('active')" />
          <q-tab name="planned" icon="schedule" :label="statusLabel('planned')" />
          <q-tab name="closed" icon="lock" :label="statusLabel('closed')" />
        </q-tabs>
      </div>

      <div v-if="loading" class="loading-state">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredPeriods.length" class="period-list">
        <article
          v-for="period in filteredPeriods"
          :key="period.id"
          class="period-row"
          :class="{ 'is-active': period.status === 'active' }"
        >
          <div class="period-marker">
            <q-icon :name="periodIcon(period.periodType)" size="20px" />
          </div>

          <div class="period-main">
            <div class="period-title-line">
              <div>
                <h2>{{ period.name }}</h2>
                <p>{{ period.code }}</p>
              </div>
              <div class="period-badges">
                <q-badge :color="statusColor(period.status)" text-color="white">
                  {{ statusLabel(period.status) }}
                </q-badge>
                <q-badge v-if="period.isDefault" color="primary" text-color="white">
                  {{ t("tenant.modules.periods.default") }}
                </q-badge>
              </div>
            </div>

            <div class="period-details">
              <span>
                <q-icon name="category" size="16px" />
                {{ periodTypeLabel(period.periodType) }}
              </span>
              <span>
                <q-icon name="date_range" size="16px" />
                {{ period.dateRange }}
              </span>
            </div>
          </div>

          <div class="period-actions">
            <q-btn
              v-if="canUpdate"
              flat
              round
              icon="edit"
              @click="openEdit(period)"
            >
              <q-tooltip>{{ t("common.edit") }}</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <q-icon name="event_busy" size="42px" color="primary" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.periods.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.periods.empty_text") }}</span>
      </div>
    </section>

    <q-drawer
      v-model="editorOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer editor-drawer"
    >
      <aside class="tenant-editor-shell editor-shell">
        <div class="tenant-editor-head editor-head">
          <div class="tenant-editor-icon editor-icon">
            <q-icon name="event_note" size="24px" />
          </div>
          <div>
            <h2>{{ editingPeriod ? t("common.edit") : t("tenant.modules.periods.create") }}</h2>
            <p>{{ t("tenant.modules.periods.create_subtitle") }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="tenant-editor-form period-form editor-form" @submit.prevent="submitPeriod">
          <q-input
            v-model="form.name"
            :label="t('tenant.modules.fields.name')"
            outlined
            dense
            :rules="[(value) => Boolean(value) || t('common.required')]"
          />
          <q-input
            v-model="form.code"
            :label="t('tenant.modules.fields.code')"
            outlined
            dense
            :rules="[(value) => Boolean(value) || t('common.required')]"
          />
          <q-select
            v-model="form.periodType"
            :options="periodTypeOptions"
            :label="t('tenant.modules.fields.period_type')"
            emit-value
            map-options
            outlined
            dense
          />
          <q-select
            v-model="form.status"
            :options="periodStatusOptions"
            :label="t('tenant.modules.fields.status')"
            emit-value
            map-options
            outlined
            dense
          />
          <AppDateField
            v-model="form.startsAt"
            :label="t('tenant.modules.fields.starts_at')"
          />
          <AppDateField
            v-model="form.endsAt"
            :label="t('tenant.modules.fields.ends_at')"
          />
          <q-toggle
            v-model="form.isDefault"
            color="primary"
            :label="t('tenant.modules.periods.default')"
          />
        </q-form>

        <div class="tenant-editor-actions editor-actions">
          <q-btn flat :label="t('common.cancel')" no-caps @click="editorOpen = false" />
          <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated @click="submitPeriod" />
        </div>
      </aside>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import AppDateField from "src/components/common/AppDateField.vue";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { getTenantPeriods } from "src/utils/api/get";
import { createTenantPeriod } from "src/utils/api/post";
import { updateTenantPeriod } from "src/utils/api/patch";

const { t, locale } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const editorOpen = ref(false);
const editingPeriod = ref(null);
const searchQuery = ref("");
const statusFilter = ref("all");
const periods = ref([]);

const form = reactive({
  name: "",
  code: "",
  periodType: "school_year",
  startsAt: "",
  endsAt: "",
  status: "planned",
  isDefault: false,
});

const periodTypeOptions = computed(() => [
  { label: t("tenant.modules.period_types.school_year"), value: "school_year" },
  { label: t("tenant.modules.period_types.term"), value: "term" },
  { label: t("tenant.modules.period_types.evaluation"), value: "evaluation" },
  { label: t("tenant.modules.period_types.custom"), value: "custom" },
]);

const periodStatusOptions = computed(() => [
  { label: statusLabel("planned"), value: "planned" },
  { label: statusLabel("active"), value: "active" },
  { label: statusLabel("closed"), value: "closed" },
  { label: statusLabel("archived"), value: "archived" },
]);

const canCreate = computed(() => tenantSession.hasPermission("periods.create"));
const canUpdate = computed(() => tenantSession.hasPermission("periods.update"));

const activePeriod = computed(() =>
  periods.value.find((period) => period.status === "active") ||
  periods.value.find((period) => period.isDefault) ||
  null,
);

const metrics = computed(() => [
  { label: t("tenant.modules.stats_total"), value: periods.value.length, icon: "event_note" },
  { label: t("tenant.modules.periods.school_years"), value: periods.value.filter((period) => period.periodType === "school_year").length, icon: "calendar_month" },
  { label: t("tenant.modules.periods.evaluations"), value: periods.value.filter((period) => ["term", "evaluation"].includes(period.periodType)).length, icon: "timeline" },
]);

const filteredPeriods = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  return periods.value.filter((period) => {
    const matchesStatus = statusFilter.value === "all" || period.status === statusFilter.value;
    const matchesSearch = !needle || `${period.name} ${period.code} ${period.periodTypeLabel} ${period.status}`.toLowerCase().includes(needle);
    return matchesStatus && matchesSearch;
  });
});

function normalizePeriod(item) {
  const startsAt = item.starts_at?.slice(0, 10) || "";
  const endsAt = item.ends_at?.slice(0, 10) || "";
  return {
    id: item.period_id,
    name: item.name,
    code: item.code,
    periodType: item.period_type,
    periodTypeLabel: periodTypeLabel(item.period_type),
    startsAt,
    endsAt,
    dateRange: formatDateRange(startsAt, endsAt),
    status: item.status,
    isDefault: Boolean(item.is_default),
  };
}

function periodTypeLabel(value) {
  return periodTypeOptions.value.find((item) => item.value === value)?.label || value || "-";
}

function statusLabel(status) {
  const labels = {
    active: t("common.active"),
    planned: t("tenant.modules.status.planned"),
    closed: t("tenant.modules.status.closed"),
    archived: t("tenant.modules.status.archived"),
  };
  return labels[status] || status || "-";
}

function statusColor(status) {
  if (status === "active") return "positive";
  if (status === "planned") return "info";
  if (["closed", "archived"].includes(status)) return "grey";
  return "grey";
}

function periodIcon(type) {
  const icons = {
    school_year: "calendar_month",
    term: "timeline",
    evaluation: "fact_check",
    custom: "event",
  };
  return icons[type] || "event";
}

function formatDateRange(start, end) {
  if (!start && !end) return "-";
  const formatter = new Intl.DateTimeFormat(locale.value, { day: "2-digit", month: "short", year: "numeric" });
  const format = (value) => value ? formatter.format(new Date(`${value}T00:00:00`)) : "-";
  return `${format(start)} - ${format(end)}`;
}

function resetForm() {
  form.name = "";
  form.code = "";
  form.periodType = "school_year";
  form.startsAt = "";
  form.endsAt = "";
  form.status = "planned";
  form.isDefault = false;
}

function openCreate() {
  editingPeriod.value = null;
  resetForm();
  editorOpen.value = true;
}

function openEdit(period) {
  editingPeriod.value = period;
  form.name = period.name;
  form.code = period.code;
  form.periodType = period.periodType;
  form.startsAt = period.startsAt;
  form.endsAt = period.endsAt;
  form.status = period.status;
  form.isDefault = period.isDefault;
  editorOpen.value = true;
}

function payload() {
  return {
    name: form.name,
    code: form.code,
    periodType: form.periodType,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    status: form.status,
    isDefault: form.isDefault,
  };
}

async function loadPeriods() {
  loading.value = true;
  try {
    const res = await getTenantPeriods();
    periods.value = (res.data.data || []).map(normalizePeriod);
  } finally {
    loading.value = false;
  }
}

async function submitPeriod() {
  saving.value = true;
  try {
    if (editingPeriod.value) {
      await updateTenantPeriod(editingPeriod.value.id, payload());
    } else {
      await createTenantPeriod(payload());
    }
    editorOpen.value = false;
    await loadPeriods();
  } finally {
    saving.value = false;
  }
}

onMounted(loadPeriods);
</script>

<style scoped lang="scss">
.periods-page {
  display: grid;
  gap: var(--space-5);
}

.periods-hero {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr auto;
}

.hero-copy {
  display: grid;
  gap: var(--space-2);
}

.hero-kicker {
  align-items: center;
  color: var(--color-primary);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  gap: var(--space-2);
  text-transform: uppercase;
}

.hero-actions {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.period-search {
  min-width: min(340px, 40vw);

  :deep(.q-field__control) {
    background: var(--color-surface-strong);
    border-radius: var(--radius-full);
  }
}

.periods-overview {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(0, 1fr) auto;
}

.active-period-panel {
  align-items: center;
  background: var(--gradient-primary);
  border-radius: var(--tenant-radius-lg);
  box-shadow: var(--shadow-glow);
  color: #fff;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: auto 1fr auto;
  min-height: 104px;
  padding: var(--space-5);

  strong {
    display: block;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
    margin-top: var(--space-1);
  }

  p {
    color: rgba(255, 255, 255, 0.76);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
}

.panel-icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.16);
  border-radius: var(--tenant-radius-sm);
  display: flex;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.panel-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  text-transform: uppercase;
}

.period-metrics {
  display: grid;
  gap: var(--space-3);
  min-width: 230px;
}

.metric-pill {
  align-items: center;
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto 1fr auto;
  min-height: 38px;
  padding: 0 var(--space-3);

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
  }
}

.period-workspace {
  overflow: hidden;
}

.period-toolbar {
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  min-height: 54px;
  padding: 0 var(--space-4);
}

.period-tabs {
  color: var(--color-text-secondary);
}

.period-list {
  display: grid;
}

.period-row {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: auto 1fr auto;
  min-height: 84px;
  padding: var(--space-4);
  position: relative;
  transition: var(--transition-fast);

  & + & {
    border-top: 1px solid var(--color-border-subtle);
  }

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 4%, transparent);
  }

  &.is-active {
    background: color-mix(in srgb, var(--color-primary) 7%, transparent);
  }
}

.period-marker {
  align-items: center;
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-strong));
  border-radius: var(--tenant-radius-sm);
  color: var(--color-primary);
  display: flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.period-main {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.period-title-line {
  align-items: flex-start;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;

  h2 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    margin-top: var(--space-1);
  }
}

.period-badges,
.period-details {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.period-details span {
  align-items: center;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: var(--font-size-xs);
  gap: var(--space-1);
}

.period-actions {
  align-items: center;
  display: flex;
}

.loading-state,
.empty-state {
  align-items: center;
  color: var(--color-text-secondary);
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  min-height: 220px;
  padding: var(--space-6);
  text-align: center;

  strong {
    color: var(--color-text-primary);
  }
}

.period-form {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .periods-hero,
  .periods-overview {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .period-search {
    min-width: 0;
    width: 100%;
  }

  .period-metrics {
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .periods-hero,
  .active-period-panel,
  .period-row,
  .period-form {
    grid-template-columns: 1fr;
  }

  .period-title-line {
    display: grid;
  }
}
</style>
