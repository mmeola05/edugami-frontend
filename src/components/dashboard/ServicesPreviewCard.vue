<template>
  <q-card
    class="card-saas services-card-premium"
    :class="{ 'is-loading': loading }"
  >
    <q-card-section class="card-header">
      <div class="header-copy">
        <span class="card-title">Servicios & Micro-nodos</span>
        <span class="text-page-subtitle"
          >Control de ejecucion en tiempo real</span
        >
      </div>
    </q-card-section>

    <q-separator opacity="0.1" />

    <q-card-section class="services-body">
      <div v-if="loading" class="loading-skeleton">
        <div class="skeleton-service" v-for="i in 4" :key="i">
          <div class="skeleton-heading">
            <q-skeleton type="circle" size="8px" />
            <q-skeleton type="text" width="100px" height="16px" />
            <q-skeleton type="circle" size="14px" />
          </div>
          <div class="skeleton-footer">
            <q-skeleton type="text" width="80px" height="12px" />
            <div class="skeleton-actions">
              <q-skeleton type="circle" size="24px" />
              <q-skeleton type="circle" size="24px" />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="services-grid">
        <div
          v-for="service in services"
          :key="service.key"
          class="service-saas-item"
          :class="{ 'is-restarting': service.status === 'restarting' }"
        >
          <div class="service-heading">
            <div v-if="service.status === 'restarting'">
              <q-spinner-dots color="primary" size="14px" />
            </div>
            <div
              v-else
              :class="`status-dot-glow bg-${getStatusColor(service.status)}`"
            ></div>

            <span class="service-name">{{ service.key }}</span>
            <q-space />
            <q-icon
              :name="getStatusIcon(service.status)"
              :color="getStatusColor(service.status)"
              size="14px"
            />
          </div>

          <div class="service-footer">
            <span class="service-status">{{
              service.status.toUpperCase()
            }}</span>
            <div class="service-actions">
              <q-btn
                v-if="canCommandServices"
                flat
                round
                dense
                icon="refresh"
                size="sm"
                class="service-action"
                :loading="service.status === 'restarting'"
                @click="$emit('restart', service.key)"
              />
              <q-btn
                flat
                round
                dense
                icon="insights"
                size="sm"
                class="service-action"
                to="/root/metrics"
              >
                <q-tooltip>Ver metricas</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "src/stores/userStore";

defineProps({
  services: { type: Array, default: () => [] },
  loading: Boolean,
});

defineEmits(["restart", "logs"]);

const userStore = useUserStore();
const canCommandServices = computed(() =>
  userStore.hasPermission("services.command"),
);

function getStatusColor(status) {
  const s = String(status).toLowerCase();
  if (s === "online" || s === "operational" || s === "up") return "positive";
  if (s === "degraded" || s === "warning" || s === "pending") return "warning";
  if (s === "restarting") return "primary";
  return "negative";
}

function getStatusIcon(status) {
  const s = String(status).toLowerCase();
  if (s === "online" || s === "operational" || s === "up")
    return "check_circle";
  if (s === "degraded" || s === "warning" || s === "pending")
    return "error_outline";
  if (s === "restarting") return "autorenew";
  return "block";
}
</script>

<style scoped lang="scss">
.card-header {
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

.services-body {
  padding: var(--space-5);
}

.services-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.service-saas-item {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  transition:
    var(--transition-color),
    transform var(--duration-fast) var(--ease-out);

  &:hover {
    background: var(--color-surface-strong);
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-sm);
    transform: translate3d(0, -2px, 0);
  }
}

.service-heading,
.service-footer {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.service-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
}

.service-status {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.service-actions {
  display: flex;
  gap: var(--space-1);
  margin-left: auto;
}

.service-action {
  color: var(--color-text-secondary);
}

.status-dot-glow {
  border-radius: var(--radius-full);
  height: 8px;
  position: relative;
  width: 8px;

  &::after {
    animation: pulse 2s var(--ease-in-out) infinite;
    background: inherit;
    border-radius: var(--radius-full);
    content: "";
    inset: -2px;
    opacity: 0.4;
    position: absolute;
  }
}

.loading-skeleton {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.skeleton-service {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
}

.skeleton-heading {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.skeleton-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.skeleton-actions {
  display: flex;
  gap: var(--space-1);
}

@media (max-width: 600px) {
  .services-grid {
    grid-template-columns: 1fr;
  }

  .loading-skeleton {
    grid-template-columns: 1fr;
  }
}
</style>
