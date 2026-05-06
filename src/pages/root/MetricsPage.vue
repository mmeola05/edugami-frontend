<template>
  <q-page class="page-shell-premium metrics-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">Metricas</h1>
        <p class="text-page-subtitle">
          Salud de sistema, base de datos y actividad historica reciente.
        </p>
      </div>

      <q-btn
        flat
        round
        dense
        icon="refresh"
        :loading="loading"
        @click="loadMetrics"
      >
        <q-tooltip>Actualizar</q-tooltip>
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

    <div class="ops-grid">
      <q-card class="card-saas health-card">
        <q-card-section>
          <div class="section-row">
            <div>
              <div class="section-title">Salud operativa</div>
              <p class="text-secondary q-mt-sm">
                Lectura rapida para saber si el servidor unico aguanta bien la
                carga actual.
              </p>
            </div>
            <q-badge :color="health.color" :label="health.label" />
          </div>

          <div class="health-score">
            <q-circular-progress
              show-value
              :value="health.score"
              size="112px"
              :thickness="0.18"
              :color="health.color"
              track-color="grey-9"
              class="health-ring"
            >
              {{ health.score }}%
            </q-circular-progress>

            <div class="health-detail">
              <div class="health-row">
                <span>Memoria</span>
                <strong>{{ memoryPercent }}%</strong>
              </div>
              <q-linear-progress
                :value="memoryPercent / 100"
                :color="memoryColor"
                rounded
                size="10px"
              />

              <div class="health-row">
                <span>DB ping</span>
                <strong>{{ overview?.db?.pingMs || 0 }}ms</strong>
              </div>
              <q-linear-progress
                :value="dbPingRatio"
                :color="dbPingColor"
                rounded
                size="10px"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="card-saas">
        <q-card-section>
          <div class="section-title">Capacidad del servidor</div>
          <div class="capacity-grid">
            <div>
              <span>CPU 1m</span>
              <strong>{{ cpuLoad1m }}</strong>
            </div>
            <div>
              <span>CPU 5m</span>
              <strong>{{ cpuLoad5m }}</strong>
            </div>
            <div>
              <span>Nucleos</span>
              <strong>{{ overview?.server?.cpuCount || 0 }}</strong>
            </div>
            <div>
              <span>Uptime</span>
              <strong>{{ uptimeLabel }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="card-saas">
        <q-card-section>
          <div class="section-title">Servicios registrados</div>
          <div class="service-status-list">
            <div
              v-for="service in overviewServices"
              :key="service.key"
              class="service-status-row"
            >
              <div
                :class="`status-dot bg-${statusColor(service.status)}`"
              ></div>
              <span>{{ service.key }}</span>
              <q-badge
                :color="statusColor(service.status)"
                :label="service.status"
              />
            </div>
            <div v-if="overviewServices.length === 0" class="soft-empty">
              <q-icon name="hub" />
              <span>No hay servicios registrados todavia.</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="card-saas">
        <q-card-section>
          <div class="section-title">Pendiente de instrumentar</div>
          <div class="future-list">
            <div v-for="item in futureSignals" :key="item.label">
              <q-icon
                :name="item.icon"
                :color="item.ready ? 'positive' : 'primary'"
                size="18px"
              />
              <span>{{ item.label }}</span>
              <q-badge
                :color="item.ready ? 'positive' : 'grey-7'"
                :label="item.ready ? 'listo' : 'pendiente'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="charts-grid">
      <q-card v-for="chart in chartCards" :key="chart.title" class="card-saas">
        <q-card-section>
          <div class="section-title">{{ chart.title }}</div>
          <div v-if="chart.points.length" class="bars">
            <div v-for="point in chart.points" :key="point.day" class="bar-row">
              <span class="text-meta-mono">{{ point.day }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill gradient-primary"
                  :style="{ width: `${barWidth(point.total, chart.max)}%` }"
                ></div>
              </div>
              <strong>{{ point.total }}</strong>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="timeline" size="28px" />
            <span>Sin actividad en los ultimos 14 dias.</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getMetricsCharts, getMetricsOverview } from "src/utils/api/get";

const loading = ref(false);
const error = ref(null);
const overview = ref(null);
const charts = ref({});

const stats = computed(() => {
  const server = overview.value?.server || {};
  const db = overview.value?.db || {};
  const counts = overview.value?.counts || {};
  return [
    {
      label: "Host",
      value: server.hostname || "-",
      icon: "dns",
      color: "primary",
    },
    {
      label: "RAM MB",
      value: `${server.memoryUsedMb || 0}/${server.memoryTotalMb || 0}`,
      icon: "memory",
      color: "info",
    },
    {
      label: "DB ping",
      value: `${db.pingMs || 0}ms`,
      icon: "storage",
      color: db.status === "up" ? "positive" : "negative",
    },
    {
      label: "Acciones 24h",
      value: counts.serviceActions24h || 0,
      icon: "restart_alt",
      color: "warning",
    },
  ];
});

const cpuLoad1m = computed(() =>
  Number(overview.value?.server?.cpuLoad1m || 0).toFixed(2),
);
const cpuLoad5m = computed(() =>
  Number(overview.value?.server?.cpuLoad5m || 0).toFixed(2),
);
const memoryPercent = computed(() => {
  const server = overview.value?.server || {};
  if (!server.memoryTotalMb) return 0;
  return Math.min(
    100,
    Math.round((server.memoryUsedMb / server.memoryTotalMb) * 100),
  );
});
const memoryColor = computed(() => {
  if (memoryPercent.value >= 90) return "negative";
  if (memoryPercent.value >= 75) return "warning";
  return "positive";
});
const dbPingRatio = computed(() =>
  Math.min(1, Number(overview.value?.db?.pingMs || 0) / 250),
);
const dbPingColor = computed(() => {
  const ping = Number(overview.value?.db?.pingMs || 0);
  if (ping >= 200) return "negative";
  if (ping >= 80) return "warning";
  return "positive";
});
const overviewServices = computed(() => overview.value?.services || []);
const health = computed(() => {
  const hasOpenAlerts = Number(overview.value?.counts?.openAlerts || 0) > 0;
  const degradedServices = overviewServices.value.some(
    (service) =>
      !["up", "online", "operational"].includes(
        String(service.status).toLowerCase(),
      ),
  );
  let score = 100;
  if (memoryPercent.value >= 90) score -= 25;
  else if (memoryPercent.value >= 75) score -= 12;
  if (Number(overview.value?.db?.pingMs || 0) >= 200) score -= 20;
  else if (Number(overview.value?.db?.pingMs || 0) >= 80) score -= 8;
  if (hasOpenAlerts) score -= 12;
  if (degradedServices) score -= 14;
  const normalized = Math.max(0, score);
  if (normalized >= 85)
    return { score: normalized, color: "positive", label: "estable" };
  if (normalized >= 65)
    return { score: normalized, color: "warning", label: "vigilar" };
  return { score: normalized, color: "negative", label: "critico" };
});
const uptimeLabel = computed(() => {
  const seconds = Number(overview.value?.server?.uptimeSec || 0);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
});

const futureSignals = [
  { label: "Salud global servidor/DB", icon: "monitor_heart", ready: true },
  { label: "CPU/RAM por proceso", icon: "memory", ready: false },
  { label: "Latencia HTTP por endpoint", icon: "speed", ready: false },
  { label: "MQTT conexiones y throughput", icon: "sensors", ready: false },
  {
    label: "PostgreSQL conexiones y queries lentas",
    icon: "storage",
    ready: false,
  },
];

const chartCards = computed(() => [
  buildChart("Alertas 14 dias", charts.value.alertsPerDay || []),
  buildChart("Logins 14 dias", charts.value.loginsPerDay || []),
  buildChart("Acciones servicios", charts.value.serviceActionsPerDay || []),
]);

async function loadMetrics() {
  loading.value = true;
  error.value = null;
  try {
    const [overviewRes, chartsRes] = await Promise.all([
      getMetricsOverview(),
      getMetricsCharts(),
    ]);
    overview.value = overviewRes.data.data;
    charts.value = chartsRes.data.data || {};
  } catch {
    error.value = "No se pudieron cargar las metricas.";
  } finally {
    loading.value = false;
  }
}

function buildChart(title, points) {
  const normalized = points.map((point) => ({
    day: point.day,
    total: Number(point.total || 0),
  }));
  return {
    title,
    points: normalized,
    max: Math.max(1, ...normalized.map((point) => point.total)),
  };
}

function barWidth(value, max) {
  return Math.max(4, Math.round((value / max) * 100));
}

function statusColor(status) {
  const s = String(status).toLowerCase();
  if (s === "up" || s === "online" || s === "operational") return "positive";
  if (s === "degraded" || s === "warning" || s === "unknown") return "warning";
  return "negative";
}

onMounted(loadMetrics);
</script>

<style scoped lang="scss">
.metrics-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.stats-grid,
.charts-grid,
.ops-grid {
  display: grid;
  gap: var(--space-5);
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.charts-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.ops-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.health-card {
  grid-row: span 2;
}

.section-row {
  align-items: flex-start;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
}

.health-score {
  align-items: center;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: auto 1fr;
  margin-top: var(--space-5);
}

.health-ring {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-extrabold);
}

.health-detail {
  display: grid;
  gap: var(--space-3);
}

.health-row {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;

  strong {
    color: var(--color-text-primary);
  }
}

.capacity-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: var(--space-5);

  div {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    display: grid;
    gap: var(--space-1);
    padding: var(--space-4);
  }

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
  }
}

.future-list {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-5);

  div {
    align-items: center;
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    display: flex;
    gap: var(--space-3);
    padding: var(--space-3);
  }

  span {
    color: var(--color-text-primary);
    flex: 1;
    font-weight: var(--font-weight-bold);
  }
}

.service-status-list {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.service-status-row,
.soft-empty {
  align-items: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
}

.service-status-row span,
.soft-empty span {
  color: var(--color-text-primary);
  flex: 1;
  font-weight: var(--font-weight-bold);
}

.status-dot {
  border-radius: var(--radius-full);
  height: 10px;
  width: 10px;
}

.bars {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.bar-row {
  align-items: center;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 88px 1fr 36px;
}

.bar-track {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  height: 10px;
  overflow: hidden;
}

.bar-fill {
  border-radius: var(--radius-full);
  height: 100%;
}

.chart-empty {
  align-items: center;
  color: var(--color-text-tertiary);
  display: flex;
  gap: var(--space-3);
  min-height: 120px;
}

@media (max-width: 900px) {
  .stats-grid,
  .ops-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .capacity-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid,
  .ops-grid,
  .capacity-grid,
  .page-header {
    grid-template-columns: 1fr;
  }

  .bar-row {
    grid-template-columns: 1fr;
  }

  .health-score {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}
</style>
