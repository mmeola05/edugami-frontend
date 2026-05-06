<template>
  <div class="quick-actions">
    <q-btn
      flat
      round
      dense
      icon="refresh"
      class="action-icon"
      @click="$emit('refresh')"
    >
      <q-tooltip>Sincronizar ahora</q-tooltip>
    </q-btn>

    <q-btn
      v-if="canCreateTenant"
      unelevated
      no-caps
      color="primary"
      icon="add"
      label="Nuevo tenant"
      to="/root/tenants"
      class="btn-premium action-primary"
    />

    <q-btn
      v-if="canSeeAlerts"
      outline
      no-caps
      icon="notifications"
      label="Alertas"
      to="/root/alerts"
      class="action-outline"
    />

    <q-btn
      v-if="canSeeModules"
      flat
      round
      dense
      icon="settings"
      class="action-icon"
      to="/root/modules"
    >
      <q-tooltip>Configuracion Root</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "src/stores/userStore";

defineEmits(["refresh"]);

const userStore = useUserStore();
const canCreateTenant = computed(() =>
  userStore.hasPermission("tenants.manage"),
);
const canSeeAlerts = computed(() => userStore.hasModule("ALERTS"));
const canSeeModules = computed(() => userStore.hasModule("GLOBAL_MODULES"));
</script>

<style scoped lang="scss">
.quick-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.action-icon,
.action-outline {
  color: var(--color-text-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
  }
}

.action-primary,
.action-outline {
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
}

.action-outline {
  border-color: var(--color-border-default) !important;
}
</style>
