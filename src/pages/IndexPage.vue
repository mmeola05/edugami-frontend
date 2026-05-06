<template>
  <q-page class="page-shell-premium dashboard-page">
    <div class="dashboard-header animate-slide-down">
      <div>
        <div class="header-title-group">
          <h1 class="text-page-title">{{ $t("dashboard.title") }}</h1>
          <realtime-status-badge :status="realtimeStatus" />
        </div>
        <p class="text-page-subtitle">
          {{ $t("dashboard.subtitle") }}
        </p>
      </div>

      <div class="header-actions">
        <quick-actions-bar @refresh="refreshDashboard" />
      </div>
    </div>

    <transition
      enter-active-class="animate-slide-down"
      leave-active-class="animate-slide-up"
    >
      <div v-if="error" class="error-banner animate-slide-up">
        <q-icon name="error_outline" size="md" />
        <span>{{ error }}</span>
        <q-btn flat size="sm" :label="$t('dashboard.retry')" @click="loadInitialData" />
      </div>
    </transition>

    <section class="ops-command-card card-saas">
      <div class="ops-score" :class="`is-${healthState.color}`">
        <div class="score-ring">
          <span>{{ healthScore }}</span>
          <small>/100</small>
        </div>
        <div>
          <div class="score-title">
            <q-icon :name="healthState.icon" :color="healthState.color" size="20px" />
            <span>{{ healthState.label }}</span>
          </div>
          <p>
            Lectura combinada de carga, memoria, alertas activas, SLA y estado
            de servicios.
          </p>
        </div>
      </div>

      <div class="command-metrics">
        <button
          v-for="card in commandCards"
          :key="card.label"
          class="command-chip"
          :disabled="!card.enabled"
          @click="goTo(card.to)"
        >
          <div :class="`icon-tile bg-soft-${card.color}`">
            <q-icon :name="card.icon" :color="card.color" size="19px" />
          </div>
          <div>
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </div>
        </button>
      </div>

      <div class="ops-quick-links">
        <q-btn
          v-if="userStore.hasModule('ALERTS')"
          outline
          color="warning"
          icon="manage_search"
          label="Revisar alertas"
          no-caps
          to="/root/alerts"
        />
        <q-btn
          v-if="userStore.hasModule('AUDIT')"
          outline
          color="info"
          icon="difference"
          label="Auditoria"
          no-caps
          to="/root/audit"
        />
        <q-btn
          v-if="userStore.hasModule('SERVICES')"
          outline
          color="primary"
          icon="hub"
          label="Servicios"
          no-caps
          to="/root/services"
        />
      </div>
    </section>

    <div class="dashboard-row dashboard-kpis">
      <stat-card
        v-for="kpi in kpiCards"
        :key="kpi.id"
        :label="kpi.label"
        :value="kpi.value"
        :icon="kpi.icon"
        :color="kpi.color"
        :trend="kpi.trend"
        :reverse-trend="kpi.reverseTrend"
        :subtitle="kpi.subtitle"
        class="kpi-card animate-slide-up"
      />
    </div>

    <div class="dashboard-row">
      <div class="card-column">
        <transition
          enter-active-class="animate-slide-left"
          leave-active-class="animate-slide-right"
        >
          <alerts-preview-card
            :alerts="data.alerts"
            :loading="loading"
            @resolve="handleResolveAlert"
          />
        </transition>
      </div>
      <div class="card-column">
        <transition
          enter-active-class="animate-slide-right"
          leave-active-class="animate-slide-left"
        >
          <system-health-card :metrics="data.metrics" :loading="loading" />
        </transition>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="card-column">
        <transition
          enter-active-class="animate-slide-up"
          leave-active-class="animate-slide-down"
        >
          <recent-activity-card
            :activities="data.activities"
            :loading="loading"
          />
        </transition>
      </div>
      <div class="card-column">
        <transition
          enter-active-class="animate-slide-up"
          leave-active-class="animate-slide-down"
        >
          <services-preview-card
            :services="data.services"
            :loading="loading"
            @restart="handleRestartService"
          />
        </transition>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import StatCard from "components/dashboard/StatCard.vue";
import AlertsPreviewCard from "components/dashboard/AlertsPreviewCard.vue";
import SystemHealthCard from "components/dashboard/SystemHealthCard.vue";
import RecentActivityCard from "components/dashboard/RecentActivityCard.vue";
import ServicesPreviewCard from "components/dashboard/ServicesPreviewCard.vue";
import RealtimeStatusBadge from "components/dashboard/RealtimeStatusBadge.vue";
import QuickActionsBar from "components/dashboard/QuickActionsBar.vue";
import {
  getAlerts,
  getAlertsReport,
  getDashboardOverview,
  getMetricsOverview,
  getServices,
} from "src/utils/api/get";
import { resolveAlert, restartService } from "src/utils/api/post";
import { useConfirmDialog } from "src/composables/useConfirmDialog";
import { useUserStore } from "src/stores/userStore";
import { notifyError, notifySuccess } from "src/utils/utils";

const loading = ref(true);
const error = ref(null);
const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const { confirmAction } = useConfirmDialog();
const realtimeStatus = ref("disconnected");

const data = ref({
  kpis: {
    tenantsActive: 0,
    platformAccountsActive: 0,
    openCriticalAlerts: 0,
  },
  alerts: [],
  metrics: {
    cpu: 0,
    ram: 0,
    uptime: "0d 0h",
    latency: 0,
  },
  activities: [],
  report: {},
  services: [],
});

const activeServices = computed(() =>
  data.value.services.filter((service) =>
    ["up", "online", "operational"].includes(String(service.status).toLowerCase()),
  ).length,
);

const degradedServices = computed(() =>
  data.value.services.filter((service) =>
    ["degraded", "warning", "pending"].includes(String(service.status).toLowerCase()),
  ).length,
);

const downServices = computed(() =>
  data.value.services.filter((service) =>
    ["down", "offline", "error", "unknown"].includes(String(service.status).toLowerCase()),
  ).length,
);

const activeAlertCount = computed(
  () => {
    const summary = data.value.report.summary;
    if (!summary) return data.value.alerts.length;
    return (
      Number(summary.pending || 0) +
      Number(summary.investigating || 0) +
      Number(summary.mitigated || 0)
    );
  },
);

const overdueAlertCount = computed(
  () => data.value.report.summary?.overdue_active ?? data.value.alerts.filter((alert) => alert.isOverdue).length,
);

const healthScore = computed(() => {
  const cpuPenalty = Math.min(30, Math.round((data.value.metrics.cpu || 0) * 0.22));
  const ramPenalty = Math.min(30, Math.round((data.value.metrics.ram || 0) * 0.2));
  const alertPenalty = Math.min(25, activeAlertCount.value * 4 + overdueAlertCount.value * 5);
  const servicePenalty = Math.min(25, degradedServices.value * 8 + downServices.value * 12);
  return Math.max(0, 100 - cpuPenalty - ramPenalty - alertPenalty - servicePenalty);
});

const healthState = computed(() => {
  if (healthScore.value >= 85) return { color: "positive", label: "Estable", icon: "verified" };
  if (healthScore.value >= 65) return { color: "warning", label: "Atencion", icon: "warning" };
  return { color: "negative", label: "Critico", icon: "report" };
});

const commandCards = computed(() => [
  {
    label: "Alertas activas",
    value: activeAlertCount.value,
    icon: "notification_important",
    color: activeAlertCount.value ? "warning" : "positive",
    to: "/root/alerts",
    enabled: userStore.hasModule("ALERTS"),
  },
  {
    label: "Servicios sanos",
    value: `${activeServices.value}/${data.value.services.length || 0}`,
    icon: "hub",
    color: downServices.value ? "negative" : degradedServices.value ? "warning" : "positive",
    to: "/root/services",
    enabled: userStore.hasModule("SERVICES"),
  },
  {
    label: "SLA vencidos",
    value: overdueAlertCount.value,
    icon: "timer_off",
    color: overdueAlertCount.value ? "negative" : "positive",
    to: "/root/alerts",
    enabled: userStore.hasModule("ALERTS"),
  },
]);

const kpiCards = computed(() => [
  {
    id: "tenants",
    label: t("dashboard.tenants_label"),
    value: data.value.kpis.tenantsActive,
    icon: "business_center",
    color: "primary",
    trend: 8,
    subtitle: t("dashboard.tenants_subtitle"),
  },
  {
    id: "accounts",
    label: t("dashboard.accounts_label"),
    value: data.value.kpis.platformAccountsActive,
    icon: "shield",
    color: "info",
    trend: 2,
    subtitle: t("dashboard.accounts_subtitle"),
  },
  {
    id: "alerts",
    label: t("dashboard.alerts_label"),
    value: data.value.kpis.openCriticalAlerts,
    icon: "emergency",
    color: data.value.kpis.openCriticalAlerts > 0 ? "negative" : "positive",
    trend: data.value.kpis.openCriticalAlerts > 0 ? 15 : -25,
    reverseTrend: true,
    subtitle:
      data.value.kpis.openCriticalAlerts > 0
        ? t("dashboard.alerts_requires_review")
        : t("dashboard.alerts_stable"),
  },
  {
    id: "uptime",
    label: t("dashboard.uptime_label"),
    value: "99.99%",
    icon: "auto_graph",
    color: "positive",
    trend: 0.01,
    subtitle: t("dashboard.uptime_subtitle"),
  },
]);

onMounted(() => {
  loadInitialData();
});

function loadInitialData() {
  loading.value = true;
  error.value = null;
  realtimeStatus.value = "connecting";

  return Promise.all([
    getDashboardOverview(),
    getAlerts({ status: "ACTIVE" }),
    getAlertsReport(),
    getMetricsOverview(),
    getServices(),
  ])
    .then(([dashboardRes, alertsRes, reportRes, metricsRes, servicesRes]) => {
      const dashboard = dashboardRes?.data?.data || {};
      const metrics = metricsRes?.data?.data || {};
      const memoryUsed = metrics.server?.memoryUsedMb || 0;
      const memoryTotal = metrics.server?.memoryTotalMb || 0;

      data.value.kpis = dashboard.kpis || data.value.kpis;
      data.value.alerts = (alertsRes?.data?.data || [])
        .slice(0, 5)
        .map((alert) => ({
          id: alert.alert_id,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          status: alert.status,
          isOverdue: alert.is_overdue,
          createdAt: alert.last_seen_at || alert.created_at,
        }));
      data.value.report = reportRes?.data?.data || {};
      data.value.metrics = {
        cpu: Math.min(100, Math.round((metrics.server?.cpuLoad1m || 0) * 100)),
        ram: memoryTotal ? Math.round((memoryUsed / memoryTotal) * 100) : 0,
        uptime: formatUptime(metrics.server?.uptimeSec || 0),
        latency: metrics.db?.pingMs || 0,
      };
      data.value.services = (
        servicesRes?.data?.data ||
        dashboard.services ||
        []
      ).map((service) => ({
        key: service.service_key || service.key,
        status: service.status || "unknown",
      }));
      data.value.activities = data.value.alerts.map((alert) => ({
        id: `alert-${alert.id}`,
        message: alert.title,
        type: "alert",
        createdAt: alert.createdAt,
      }));
      realtimeStatus.value = "connected";
    })
    .catch(() => {
      error.value = t("dashboard.load_error");
      realtimeStatus.value = "disconnected";
    })
    .finally(() => {
      loading.value = false;
    });
}

function refreshDashboard() {
  loadInitialData();
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

async function handleResolveAlert(alertId) {
  const confirmed = await confirmAction({
    title: "Resolver alerta",
    message: "Vas a marcar esta alerta como resuelta desde el dashboard. Podras reabrirla desde el centro de alertas si hace falta.",
    okLabel: "Resolver",
    cancelLabel: "Cancelar",
    color: "positive",
    icon: "check_circle",
  });
  if (!confirmed) return;

  try {
    await resolveAlert(alertId);
    notifySuccess("Alerta resuelta");
    await loadInitialData();
  } catch {
    notifyError(t("dashboard.resolve_error"));
  }
}

async function handleRestartService(serviceKey) {
  const confirmed = await confirmAction({
    title: "Reiniciar servicio",
    message: `Vas a solicitar el reinicio de ${serviceKey}. Si el ops-agent esta en modo real, ejecutara la accion en el entorno local.`,
    okLabel: "Reiniciar",
    cancelLabel: "Cancelar",
    color: "warning",
    icon: "restart_alt",
  });
  if (!confirmed) return;

  const service = data.value.services.find((item) => item.key === serviceKey);
  if (service) service.status = "restarting";

  try {
    await restartService(serviceKey);
    notifySuccess("Reinicio solicitado");
    await loadInitialData();
  } catch {
    notifyError(t("dashboard.restart_error"));
    loading.value = false;
  }
}

function goTo(path) {
  router.push(path);
}
</script>

<style scoped lang="scss">
.dashboard-page {
  min-height: 100vh;
}

.dashboard-header {
  align-items: flex-start;
  display: flex;
  gap: var(--space-6);
  justify-content: space-between;
  margin-bottom: var(--space-8);

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: column;
  }
}

.header-title-group {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
}

.header-actions {
  display: flex;
  flex-shrink: 0;
}

.error-banner {
  align-items: center;
  background-color: rgba(223, 70, 70, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
  color: var(--color-error);
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding: var(--space-4);

  q-btn {
    margin-left: auto;
  }
}

.ops-command-card {
  align-items: center;
  display: grid;
  gap: var(--space-5);
  grid-template-columns: minmax(260px, 0.9fr) minmax(360px, 1.3fr) auto;
  margin-bottom: var(--space-6);
  padding: var(--space-5);
}

.ops-score {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  min-width: 0;

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
}

.score-ring {
  align-items: baseline;
  background:
    linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(16, 169, 118, 0.1)),
    var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  display: flex;
  flex: 0 0 auto;
  height: 86px;
  justify-content: center;
  padding-top: 24px;
  width: 86px;

  span {
    color: var(--color-text-primary);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-extrabold);
    line-height: 1;
  }

  small {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }
}

.ops-score.is-positive .score-ring {
  box-shadow: 0 18px 40px rgba(16, 169, 118, 0.14);
}

.ops-score.is-warning .score-ring {
  box-shadow: 0 18px 40px rgba(217, 144, 20, 0.16);
}

.ops-score.is-negative .score-ring {
  box-shadow: 0 18px 40px rgba(223, 70, 70, 0.16);
}

.score-title {
  align-items: center;
  color: var(--color-text-primary);
  display: flex;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  gap: var(--space-2);
}

.command-metrics {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.command-chip {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-3);
  text-align: left;
  transition: var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--color-border-default);
    transform: translate3d(0, -2px, 0);
  }

  &:disabled {
    cursor: default;
    opacity: 0.55;
  }

  div:last-child {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
  }
}

.ops-quick-links {
  align-items: stretch;
  display: grid;
  gap: var(--space-2);
  justify-content: end;
}

.dashboard-kpis {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin-bottom: var(--space-8);
}

.kpi-card {
  animation-fill-mode: both;

  &:nth-child(1) {
    animation-delay: 0ms;
  }
  &:nth-child(2) {
    animation-delay: 50ms;
  }
  &:nth-child(3) {
    animation-delay: 100ms;
  }
  &:nth-child(4) {
    animation-delay: 150ms;
  }
}

.dashboard-row {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: var(--space-8);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

  .card-column {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .ops-command-card {
    grid-template-columns: 1fr;
  }

  .ops-quick-links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    justify-content: stretch;
  }
}

@media (max-width: 700px) {
  .header-title-group {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-2);
  }

  .header-actions,
  .header-actions :deep(.quick-actions) {
    width: 100%;
  }

  .ops-score {
    align-items: flex-start;
  }

  .command-metrics,
  .ops-quick-links {
    grid-template-columns: 1fr;
  }
}
</style>
