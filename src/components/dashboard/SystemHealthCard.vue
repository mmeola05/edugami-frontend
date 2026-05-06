<template>
  <q-card class="card-saas health-card-premium">
    <q-card-section class="card-header">
      <div class="header-copy">
        <span class="card-title">Salud del Sistema</span>
        <span class="text-page-subtitle">{{ getStatusLabel }}</span>
      </div>
      <div :class="`status-pill bg-soft-${getStatusColor}`">
        <div :class="`pulse-dot bg-${getStatusColor}`"></div>
        <span :class="`status-label text-${getStatusColor}`">{{
          statusShortLabel
        }}</span>
      </div>
    </q-card-section>

    <q-separator opacity="0.1" />

    <q-card-section class="metric-shell">
      <div v-if="loading" class="loading-skeleton">
        <div class="skeleton-group">
          <q-skeleton type="text" width="100px" height="16px" />
          <q-skeleton type="rect" width="100%" height="8px" />
        </div>
        <div class="skeleton-group">
          <q-skeleton type="text" width="100px" height="16px" />
          <q-skeleton type="rect" width="100%" height="8px" />
        </div>
        <div class="skeleton-sub-grid">
          <q-skeleton type="rect" width="100%" height="60px" />
          <q-skeleton type="rect" width="100%" height="60px" />
        </div>
      </div>

      <div v-else class="metric-shell">
        <div class="metric-group">
          <div class="metric-heading">
            <div class="metric-label">
              <div class="metric-icon-small bg-soft-primary">
                <q-icon name="memory" color="primary" size="14px" />
              </div>
              <span>CPU LOAD</span>
            </div>
            <span class="metric-value">{{ metrics.cpu }}%</span>
          </div>
          <div class="custom-progress-track">
            <div
              class="custom-progress-fill gradient-primary"
              :style="{ width: `${metrics.cpu}%` }"
            ></div>
          </div>
        </div>

        <div class="metric-group">
          <div class="metric-heading">
            <div class="metric-label">
              <div class="metric-icon-small bg-soft-info">
                <q-icon name="storage" color="info" size="14px" />
              </div>
              <span>MEMORY RAM</span>
            </div>
            <span class="metric-value">{{ metrics.ram }}%</span>
          </div>
          <div class="custom-progress-track">
            <div
              class="custom-progress-fill"
              :class="
                metrics.ram > 80 ? 'gradient-negative' : 'gradient-primary'
              "
              :style="{ width: `${metrics.ram}%` }"
            ></div>
          </div>
        </div>

        <div class="sub-metric-grid">
          <div class="sub-metric-card">
            <span>UPTIME</span>
            <strong>{{ metrics.uptime }}</strong>
          </div>
          <div class="sub-metric-card">
            <span>LATENCIA DB</span>
            <strong :class="`text-${getPingColor}`"
              >{{ metrics.latency }}ms</strong
            >
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  metrics: {
    type: Object,
    default: () => ({ cpu: 0, ram: 0, uptime: "0d 0h", latency: 0 }),
  },
  loading: Boolean,
});

const getStatusColor = computed(() => {
  if (props.metrics.cpu > 80 || props.metrics.ram > 90) return "negative";
  if (props.metrics.cpu > 60 || props.metrics.ram > 75) return "warning";
  return "positive";
});

const getStatusLabel = computed(() => {
  if (props.metrics.cpu > 80 || props.metrics.ram > 90)
    return "Analisis: CRITICO";
  if (props.metrics.cpu > 60 || props.metrics.ram > 75) return "Analisis: ALTO";
  return "Analisis: OPTIMO";
});

const statusShortLabel = computed(
  () => getStatusLabel.value.split(":")[1]?.trim() || getStatusLabel.value,
);

const getPingColor = computed(() => {
  if (props.metrics.latency > 100) return "negative";
  if (props.metrics.latency > 30) return "warning";
  return "positive";
});
</script>

<style scoped lang="scss">
.card-header {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-5);
}

.header-copy {
  display: grid;
  gap: var(--space-1);
}

.card-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
}

.status-pill {
  align-items: center;
  border-radius: var(--radius-full);
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}

.status-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.pulse-dot {
  animation: pulse 2s var(--ease-in-out) infinite;
  border-radius: var(--radius-full);
  height: 6px;
  width: 6px;
}

.metric-shell {
  display: grid;
  gap: var(--space-6);
  padding: var(--space-6);
}

.metric-group {
  display: grid;
  gap: var(--space-3);
}

.metric-heading,
.metric-label {
  align-items: center;
  display: flex;
}

.metric-heading {
  justify-content: space-between;
}

.metric-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
}

.metric-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
}

.custom-progress-track {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  height: 8px;
  overflow: hidden;
}

.custom-progress-fill {
  border-radius: var(--radius-full);
  height: 100%;
  transition: width var(--duration-slow) var(--ease-out);
}

.metric-icon-small {
  align-items: center;
  border-radius: var(--radius-md);
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.sub-metric-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sub-metric-card {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-extrabold);
  }
}

.loading-skeleton {
  display: grid;
  gap: var(--space-6);
}

.skeleton-group {
  display: grid;
  gap: var(--space-3);
}

.skeleton-sub-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.loading-skeleton {
  display: grid;
  gap: var(--space-6);
}

.skeleton-group {
  display: grid;
  gap: var(--space-3);
}

.skeleton-sub-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
