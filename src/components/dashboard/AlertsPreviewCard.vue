<template>
  <q-card
    class="card-saas alerts-card-premium"
    :class="{ 'is-loading': loading }"
  >
    <q-card-section class="card-header">
      <div class="header-copy">
        <span class="card-title">Eventos & Alertas</span>
        <span class="text-page-subtitle">Control de incidencias criticas</span>
      </div>
      <q-btn
        flat
        round
        dense
        icon="tune"
        class="header-action"
        to="/root/alerts"
      >
        <q-tooltip>Ver alertas</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-separator opacity="0.1" />

    <q-card-section class="content-section">
      <div v-if="loading" class="loading-skeleton">
        <div class="skeleton-alert" v-for="i in 4" :key="i">
          <q-skeleton type="circle" size="44px" />
          <div class="skeleton-content">
            <q-skeleton
              type="text"
              width="120px"
              height="16px"
              class="q-mb-sm"
            />
            <q-skeleton type="text" width="200px" height="12px" />
          </div>
          <div class="skeleton-side">
            <q-skeleton
              type="text"
              width="40px"
              height="12px"
              class="q-mb-xs"
            />
            <q-skeleton type="circle" size="24px" />
          </div>
        </div>
      </div>

      <div v-else-if="alerts.length === 0" class="empty-state-luxury">
        <div class="luxury-icon-circle bg-soft-positive">
          <q-icon name="verified_user" color="positive" size="40px" />
        </div>
        <div class="empty-title">Operacion Limpia</div>
        <div class="empty-copy">
          No hay incidencias reportadas en las ultimas horas. El sistema opera
          en condiciones nominales.
        </div>
      </div>

      <div v-else>
        <q-list separator class="alert-list">
          <q-item
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-luxury-item"
          >
            <q-item-section avatar>
              <div
                :class="`severity-box bg-soft-${getSeverityColor(alert.severity)}`"
              >
                <q-icon
                  :name="getSeverityIcon(alert.severity)"
                  :color="getSeverityColor(alert.severity)"
                  size="20px"
                />
              </div>
            </q-item-section>

            <q-item-section>
              <div class="alert-title-row">
                <span class="alert-title">{{ alert.title }}</span>
                <q-badge
                  rounded
                  :color="getSeverityColor(alert.severity)"
                  class="severity-badge"
                >
                  {{ alert.severity }}
                </q-badge>
              </div>
              <q-item-label caption lines="1" class="alert-message">{{
                alert.message
              }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="alert-side">
                <span class="alert-time">{{
                  formatTime(alert.createdAt)
                }}</span>
                <q-btn
                  v-if="canManageAlerts"
                  flat
                  round
                  dense
                  color="primary"
                  icon="check_circle"
                  size="sm"
                  @click="$emit('resolve', alert.id)"
                >
                  <q-tooltip>Resolver</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";
import { date } from "quasar";
import { useUserStore } from "src/stores/userStore";

defineProps({
  alerts: { type: Array, default: () => [] },
  loading: Boolean,
});

defineEmits(["resolve"]);

const userStore = useUserStore();
const canManageAlerts = computed(() =>
  userStore.hasPermission("alerts.manage"),
);

function getSeverityColor(sev) {
  const s = String(sev).toLowerCase();
  if (s === "fatal" || s === "critical" || s === "error") return "negative";
  if (s === "warning") return "warning";
  return "info";
}

function getSeverityIcon(sev) {
  const s = String(sev).toLowerCase();
  if (s === "fatal" || s === "critical" || s === "error") return "security";
  if (s === "warning") return "warning";
  return "notifications";
}

function formatTime(val) {
  return date.formatDate(val, "HH:mm");
}
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

.card-title,
.empty-title,
.alert-title {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-extrabold);
}

.card-title {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-tight);
}

.header-action {
  color: var(--color-text-secondary);
}

.content-section {
  padding: 0;
}

.empty-state-luxury {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 300px;
  padding: var(--space-8);
  text-align: center;
}

.luxury-icon-circle {
  align-items: center;
  border: 1px solid rgba(16, 169, 118, 0.16);
  border-radius: var(--radius-xl);
  display: flex;
  height: 88px;
  justify-content: center;
  width: 88px;
}

.empty-title {
  font-size: var(--font-size-lg);
}

.empty-copy {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  max-width: 360px;
}

.alert-list {
  padding: var(--space-2) 0;
}

.alert-luxury-item {
  padding: var(--space-4) var(--space-5);
  transition:
    var(--transition-color),
    transform var(--duration-fast) var(--ease-out);

  &:hover {
    background: rgba(79, 70, 229, 0.05);
  }
}

.severity-box {
  align-items: center;
  border-radius: var(--radius-lg);
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.alert-title-row {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.alert-title {
  font-size: var(--font-size-sm);
}

.severity-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.alert-message {
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.alert-side {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.alert-time {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.loading-skeleton {
  display: grid;
  gap: var(--space-4);
}

.skeleton-alert {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
}

.skeleton-content {
  flex-grow: 1;
}

.skeleton-side {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
</style>
