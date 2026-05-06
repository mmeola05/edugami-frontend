<template>
  <q-card
    class="card-saas stat-card-premium"
    :class="{ 'is-loading': loading }"
  >
    <q-card-section class="stat-body">
      <div class="stat-content">
        <div class="stat-meta">
          <q-icon
            v-if="!loading"
            :name="icon"
            size="18px"
            :class="`text-${color}`"
          />
          <q-skeleton v-else type="QIcon" size="18px" />
          <span>{{ label }}</span>
        </div>

        <div class="stat-value-row">
          <q-skeleton v-if="loading" type="text" width="100px" />
          <span v-else class="stat-value">{{ value }}</span>
          <div
            v-if="!loading && trend !== undefined"
            :class="`trend-indicator text-${getTrendColor}`"
          >
            <q-icon
              :name="trend >= 0 ? 'arrow_upward' : 'arrow_downward'"
              size="12px"
            />
            <span>{{ Math.abs(trend) }}%</span>
          </div>
        </div>

        <div class="stat-subtitle">
          <q-skeleton v-if="loading" type="text" width="120px" />
          <span v-else>{{ subtitle || "Actualizado en vivo" }}</span>
        </div>
      </div>

      <div v-if="!loading" :class="`icon-glow-bg bg-soft-${color}`">
        <q-icon :name="icon" size="24px" :color="color" />
      </div>
      <q-skeleton v-else type="circle" size="64px" />
    </q-card-section>

    <div v-if="!loading && progress !== undefined" class="progress-footer">
      <q-linear-progress :value="progress" :color="color" size="4px" />
    </div>
    <q-linear-progress
      v-else-if="loading"
      indeterminate
      :color="color"
      size="4px"
    />
  </q-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  color: { type: String, default: "primary" },
  trend: Number,
  reverseTrend: Boolean,
  subtitle: String,
  progress: Number,
  loading: Boolean,
});

const getTrendColor = computed(() => {
  if (!props.trend) return "grey-6";
  const isPositive = props.trend > 0;
  if (props.reverseTrend) return isPositive ? "negative" : "positive";
  return isPositive ? "positive" : "negative";
});
</script>

<style scoped lang="scss">
.stat-card-premium {
  position: relative;
}

.stat-body {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-5);
}

.stat-content {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.stat-meta {
  align-items: center;
  color: var(--color-text-tertiary);
  display: flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  letter-spacing: 0;
}

.stat-value-row {
  align-items: baseline;
  display: flex;
  gap: var(--space-2);
}

.stat-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
}

.stat-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.icon-glow-bg {
  align-items: center;
  border-radius: var(--radius-lg);
  display: flex;
  flex: 0 0 48px;
  height: 48px;
  justify-content: center;
  position: relative;
  width: 48px;
}

.trend-indicator {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  display: flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
}
</style>
