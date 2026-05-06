<template>
  <q-page class="page-shell-premium services-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">{{ $t("services.title") }}</h1>
        <p class="text-page-subtitle">
          {{ $t("services.subtitle") }}
        </p>
      </div>

      <q-btn
        flat
        round
        dense
        icon="refresh"
        :loading="loading"
        @click="loadServices"
      >
        <q-tooltip>{{ $t("services.refresh") }}</q-tooltip>
      </q-btn>
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

    <q-card class="card-saas ops-note">
      <q-card-section>
        <div class="deployment-row">
          <div>
            <div class="section-title">{{ $t("services.deploy_mode_title") }}</div>
            <p class="text-page-subtitle">
              {{ $t("services.deploy_mode_desc") }}
            </p>
          </div>
          <q-badge
            :color="operationalSummary.color"
            :label="operationalSummary.label"
          />
        </div>

        <div class="deployment-grid">
          <div>
            <q-icon name="dns" color="primary" />
            <span>{{ $t("services.node_type_label") }}</span>
            <strong>{{ $t("services.node_type_value") }}</strong>
          </div>
          <div>
            <q-icon name="sync" color="info" />
            <span>{{ $t("services.control_mode_label") }}</span>
            <strong>{{ $t("services.control_mode_value") }}</strong>
          </div>
          <div>
            <q-icon name="monitor_heart" color="warning" />
            <span>{{ $t("services.metrics_label") }}</span>
            <strong>{{ $t("services.metrics_value") }}</strong>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div
      v-if="services.length === 0 && !loading"
      class="empty-services card-saas"
    >
      <div class="icon-tile bg-soft-warning empty-services-icon">
        <q-icon name="hub" color="warning" size="30px" />
      </div>
      <div>
        <div class="section-title">{{ $t("services.empty_title") }}</div>
        <p class="text-secondary q-mt-sm">
          {{ $t("services.empty_desc") }}
        </p>
      </div>
    </div>

    <div v-else class="services-grid">
      <q-card
        v-for="service in services"
        :key="service.service_key"
        class="service-card-premium animate-scale-in"
      >
        <q-card-section class="service-card-content">
          <!-- Card Header: Status & Identity -->
          <div class="service-header-row">
            <div class="service-identity">
              <div class="service-icon-wrapper" :class="`status-${statusColor(service.status)}`">
                <q-icon :name="service.service_type === 'docker' ? 'view_in_ar' : 'hub'" size="24px" />
                <div class="status-indicator-dot" :class="`bg-${statusColor(service.status)}`"></div>
              </div>
              <div class="service-titles">
                <h3 class="service-main-name">{{ service.service_name }}</h3>
                <code class="service-key-tag">{{ service.service_key }}</code>
              </div>
            </div>
            <div class="service-badge-group">
              <q-badge
                unelevated
                :color="statusColor(service.status)"
                class="status-badge-premium"
              >
                {{ service.status.toUpperCase() }}
              </q-badge>
            </div>
          </div>

          <!-- Resources Section: CPU & RAM -->
          <div class="resource-monitoring">
            <div class="resource-item">
              <div class="resource-label-row">
                <span>CPU Usage</span>
                <strong>{{ formatPercent(service.cpu_percent) }}</strong>
              </div>
              <q-linear-progress 
                :value="service.cpu_percent / 100" 
                :color="service.cpu_percent > 80 ? 'negative' : 'primary'"
                class="resource-bar"
                rounded
              />
            </div>
            <div class="resource-item">
              <div class="resource-label-row">
                <span>RAM usage</span>
                <strong>{{ formatMemory(service.memory_mb) }}</strong>
              </div>
              <q-linear-progress 
                :value="service.memory_mb / 4096" 
                :color="service.memory_mb > 3000 ? 'warning' : 'info'"
                class="resource-bar"
                rounded
              />
            </div>
          </div>

          <!-- Meta Grid: Operations -->
          <div class="ops-info-grid">
            <div class="ops-stat">
              <span class="ops-label">{{ $t("services.meta_restarts") }}</span>
              <span class="ops-value">{{ service.restarts_24h || 0 }}</span>
            </div>
            <div class="ops-stat">
              <span class="ops-label">{{ $t("services.meta_control") }}</span>
              <span class="ops-value text-capitalize">{{ service.control_mode }}</span>
            </div>
            <div class="ops-stat full-width">
              <span class="ops-label">{{ $t("services.meta_last_action") }}</span>
              <span class="ops-value">{{ lastActionLabelFixed(service) }}</span>
            </div>
          </div>

          <!-- Quick Health Checks -->
          <div class="health-checks-row">
            <div class="health-pill" :class="service.is_restartable ? 'is-ok' : 'is-disabled'">
              <q-icon :name="service.is_restartable ? 'check_circle' : 'block'" size="14px" />
              <span>Restartable</span>
            </div>
            <div class="health-pill" :class="actionStatusColor(service.last_action_status) === 'positive' ? 'is-ok' : 'is-warn'">
              <q-icon name="history" size="14px" />
              <span>Last Op: {{ service.last_action_status || 'None' }}</span>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="service-card-footer">
             <div class="timestamp-meta">
               <q-icon name="update" size="12px" />
               <span>{{ serviceStatusLine(service) }}</span>
             </div>
             <q-btn
              v-if="canRestartServices"
              unelevated
              rounded
              padding="8px 20px"
              class="btn-restart-premium"
              icon="restart_alt"
              :label="$t('services.action_restart')"
              no-caps
              :disable="!service.is_restartable"
              :loading="restartingKey === service.service_key"
              @click="restart(service.service_key)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { date } from "quasar";
import { getServices } from "src/utils/api/get";
import { restartService } from "src/utils/api/post";
import { useUserStore } from "src/stores/userStore";
import { notifyError, notifySuccess } from "src/utils/utils";
import { useI18n } from "vue-i18n";
import { useConfirmDialog } from "src/composables/useConfirmDialog";

const { confirmAction } = useConfirmDialog();
const userStore = useUserStore();
const { t } = useI18n();
const loading = ref(false);
const error = ref(null);
const services = ref([]);
const restartingKey = ref(null);
const canRestartServices = computed(() =>
  userStore.hasPermission("services.command"),
);

const stats = computed(() => [
  {
    label: t("services.stat_services"),
    value: services.value.length,
    icon: "hub",
    color: "primary",
  },
  {
    label: t("services.stat_up"),
    value: services.value.filter((item) => item.status === "up").length,
    icon: "check_circle",
    color: "positive",
  },
  {
    label: t("services.stat_degraded"),
    value: services.value.filter(
      (item) => item.status === "degraded" || item.status === "unknown",
    ).length,
    icon: "warning",
    color: "warning",
  },
  {
    label: t("services.stat_restarts"),
    value: services.value.reduce(
      (sum, item) => sum + Number(item.restarts_24h || 0),
      0,
    ),
    icon: "restart_alt",
    color: "info",
  },
]);

const operationalSummary = computed(() => {
  if (services.value.length === 0)
    return { color: "warning", label: t("services.status_no_catalog") };
  const down = services.value.some((item) =>
    ["down", "offline", "error", "failed"].includes(
      String(item.status).toLowerCase(),
    ),
  );
  const degraded = services.value.some((item) =>
    ["degraded", "warning", "unknown"].includes(
      String(item.status).toLowerCase(),
    ),
  );
  if (down) return { color: "negative", label: t("services.status_incidence") };
  if (degraded) return { color: "warning", label: t("services.status_degraded") };
  return { color: "positive", label: t("services.status_up") };
});

async function loadServices() {
  loading.value = true;
  error.value = null;
  try {
    const res = await getServices();
    services.value = res.data.data || [];
  } catch {
    error.value = t("services.load_error");
  } finally {
    loading.value = false;
  }
}

async function restart(serviceKey) {
  if (!canRestartServices.value) return;
  const confirmed = await confirmRestart(serviceKey);
  if (!confirmed) return;

  restartingKey.value = serviceKey;
  try {
    await restartService(serviceKey);
    notifySuccess(t("services.notify_restart_success"));
    await loadServices();
  } catch {
    notifyError(t("services.notify_restart_error"));
  } finally {
    restartingKey.value = null;
  }
}

function confirmRestart(serviceKey) {
  const service = services.value.find((item) => item.service_key === serviceKey);
  return confirmAction({
    title: t("services.confirm_restart_title"),
    message: t("services.confirm_restart_msg", { name: service?.service_name || serviceKey }),
    okLabel: t("services.action_restart"),
    color: "negative",
    icon: "restart_alt",
  });
}

function statusColor(status) {
  if (status === "up" || status === "online" || status === "operational")
    return "positive";
  if (status === "degraded" || status === "warning" || status === "unknown")
    return "warning";
  return "negative";
}

function actionStatusColor(status) {
  if (status === "success" || status === "completed" || status === "accepted")
    return "positive";
  if (status === "failed" || status === "error") return "negative";
  if (status === "pending" || status === "running") return "warning";
  return "grey-7";
}

function lastActionLabel(service) {
  if (!service.last_action_type) return t("services.no_actions");
  return `${service.last_action_type}${service.last_action_at ? ` · ${formatDate(service.last_action_at)}` : ""}`;
}

function formatDate(value) {
  if (!value) return "-";
  return date.formatDate(value, "DD/MM HH:mm");
}

function formatPercent(value) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
}

function formatMemory(value) {
  return typeof value === "number" ? `${value} MB` : "-";
}

function lastActionLabelFixed(service) {
  if (!service.last_action_type) return t("services.no_actions");
  return `${service.last_action_type}${service.last_action_at ? ` - ${formatDate(service.last_action_at)}` : ""}`;
}

function serviceStatusLine(service) {
  const checkedAt = service.last_check_at
    ? t("services.probe_label", { date: formatDate(service.last_check_at) })
    : t("services.updated_label", { date: formatDate(service.updated_at) });
  return service.pid ? `${checkedAt} - PID ${service.pid}` : checkedAt;
}

onMounted(loadServices);
</script>

<style scoped lang="scss">
.services-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.services-grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.stats-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.service-card-premium {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: var(--transition-move);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-xl);
    transform: translateY(-4px);
  }
}

.service-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5) !important;
}

.service-header-row {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
}

.service-identity {
  align-items: center;
  display: flex;
  gap: var(--space-4);
}

.service-icon-wrapper {
  align-items: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  display: flex;
  height: 52px;
  justify-content: center;
  position: relative;
  width: 52px;

  .q-icon {
    color: var(--color-text-secondary);
  }

  &.status-positive {
    background: rgba(16, 169, 118, 0.08);
    .q-icon { color: var(--color-success); }
  }
  &.status-warning {
    background: rgba(217, 144, 20, 0.08);
    .q-icon { color: var(--color-warning); }
  }
  &.status-negative {
    background: rgba(223, 70, 70, 0.08);
    .q-icon { color: var(--color-error); }
  }
}

.status-indicator-dot {
  border: 2px solid var(--color-surface-strong);
  border-radius: var(--radius-full);
  bottom: -2px;
  height: 14px;
  position: absolute;
  right: -2px;
  width: 14px;
}

.service-titles {
  display: flex;
  flex-direction: column;
}

.service-main-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 800;
  margin: 0;
}

.service-key-tag {
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
  font-size: 11px;
}

.status-badge-premium {
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 4px 10px;
}

.resource-monitoring {
  display: grid;
  gap: var(--space-4);
}

.resource-label-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-1);

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: 600;
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 800;
  }
}

.resource-bar {
  background: var(--color-bg-secondary);
  height: 8px !important;
}

.ops-info-grid {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(2, 1fr);
}

.ops-stat {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  padding: var(--space-3) var(--space-4);

  &.full-width {
    grid-column: span 2;
  }
}

.ops-label {
  color: var(--color-text-tertiary);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.ops-value {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 700;
  margin-top: 2px;
}

.health-checks-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.health-pill {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  display: flex;
  gap: var(--space-2);
  padding: 4px 12px;

  span {
    font-size: 11px;
    font-weight: 700;
  }

  &.is-ok {
    background: rgba(16, 169, 118, 0.05);
    border-color: rgba(16, 169, 118, 0.2);
    color: var(--color-success);
  }

  &.is-warn {
    background: rgba(217, 144, 20, 0.05);
    border-color: rgba(217, 144, 20, 0.2);
    color: var(--color-warning);
  }

  &.is-disabled {
    opacity: 0.6;
  }
}

.service-card-footer {
  align-items: center;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-4);
}

.timestamp-meta {
  align-items: center;
  color: var(--color-text-tertiary);
  display: flex;
  gap: var(--space-2);
  font-size: 11px;
}

.btn-restart-premium {
  font-weight: 800 !important;
  letter-spacing: -0.01em;
}

.empty-services {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  padding: var(--space-8);
}

.empty-services-icon {
  flex: 0 0 auto;
  height: 64px;
  width: 64px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .page-header,
  .stats-grid,
  .service-meta,
  .deployment-grid {
    grid-template-columns: 1fr;
  }

  .service-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .deployment-row,
  .empty-services {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
