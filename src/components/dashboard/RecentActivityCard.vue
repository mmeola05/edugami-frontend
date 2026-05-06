<template>
  <q-card
    class="card-saas activity-card-premium"
    :class="{ 'is-loading': loading }"
  >
    <q-card-section class="card-header">
      <div class="header-copy">
        <span class="card-title">Actividad Reciente</span>
        <span class="text-page-subtitle">Flujo de eventos globales</span>
      </div>
    </q-card-section>

    <q-separator opacity="0.1" />

    <q-card-section class="activity-body">
      <div v-if="loading" class="timeline-luxury">
        <div v-for="n in 4" :key="n" class="timeline-item">
          <div class="timeline-marker">
            <q-skeleton type="circle" size="12px" />
            <div class="marker-line"></div>
          </div>

          <div class="timeline-content">
            <div class="activity-row">
              <q-skeleton type="text" width="200px" height="16px" />
              <q-skeleton type="text" width="60px" height="12px" />
            </div>
            <div class="activity-type-row">
              <q-skeleton type="circle" size="12px" />
              <q-skeleton type="text" width="80px" height="12px" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activities.length === 0" class="empty-activity">
        <q-icon name="history" size="40px" />
        <span>Esperando eventos...</span>
      </div>

      <div v-else class="timeline-luxury">
        <div
          v-for="(act, index) in activities"
          :key="act.id"
          class="timeline-item"
        >
          <div class="timeline-marker">
            <div :class="`marker-dot bg-${getColor(act.type)}`"></div>
            <div
              v-if="index !== activities.length - 1"
              class="marker-line"
            ></div>
          </div>

          <div class="timeline-content">
            <div class="activity-row">
              <span class="activity-message">{{ act.message }}</span>
              <span class="activity-date">{{ formatTime(act.createdAt) }}</span>
            </div>
            <div class="activity-type-row">
              <q-icon
                :name="getIcon(act.type)"
                size="12px"
                :color="getColor(act.type)"
              />
              <span>{{ act.type.replace("_", " ") }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { date } from "quasar";

defineProps({
  activities: { type: Array, default: () => [] },
  loading: Boolean,
});

function getIcon(type) {
  switch (type) {
    case "tenant_created":
      return "add_business";
    case "tenant_suspended":
      return "block";
    case "login":
      return "login";
    case "alert_resolved":
      return "check_circle";
    case "service_restart":
      return "refresh";
    case "error":
      return "error";
    default:
      return "event";
  }
}

function getColor(type) {
  switch (type) {
    case "tenant_created":
      return "positive";
    case "tenant_suspended":
      return "negative";
    case "login":
      return "primary";
    case "alert_resolved":
      return "positive";
    case "service_restart":
      return "warning";
    case "error":
      return "negative";
    default:
      return "grey-7";
  }
}

function formatTime(val) {
  return date.formatDate(new Date(val), "HH:mm");
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

.activity-body {
  padding: var(--space-6);
}

.empty-activity {
  align-items: center;
  color: var(--color-text-tertiary);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-8);

  span {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
  }
}

.timeline-luxury {
  display: grid;
  gap: var(--space-1);
}

.timeline-item {
  display: flex;
  gap: var(--space-4);
}

.timeline-marker {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 12px;
}

.marker-dot {
  border: 2px solid var(--color-surface-strong);
  border-radius: var(--radius-full);
  box-shadow: 0 0 0 2px currentColor;
  height: 12px;
  width: 12px;
  z-index: 1;
}

.marker-line {
  background: var(--color-border-subtle);
  flex-grow: 1;
  margin: var(--space-1) 0;
  width: 2px;
}

.timeline-content {
  flex-grow: 1;
  padding-bottom: var(--space-5);
}

.activity-row {
  align-items: baseline;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
}

.activity-message {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-normal);
}

.activity-date {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.activity-type-row {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  margin-top: var(--space-1);
}
</style>
