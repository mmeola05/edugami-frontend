<template>
  <div class="realtime-status-container" :class="status">
    <div class="glow-indicator"></div>
    <span class="status-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: String,
});

const label = computed(() => {
  if (props.status === "connected") return "LIVE";
  if (props.status === "connecting") return "SYNC";
  return "OFFLINE";
});
</script>

<style scoped lang="scss">
.realtime-status-container {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  display: flex;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  transition: var(--transition-color);

  &.connected {
    background: rgba(16, 169, 118, 0.12);
    border-color: rgba(16, 169, 118, 0.24);

    .glow-indicator {
      background: var(--color-success);
      box-shadow: 0 0 10px rgba(16, 169, 118, 0.8);
    }

    .status-label {
      color: var(--color-success);
    }
  }

  &.connecting {
    background: rgba(217, 144, 20, 0.14);
    border-color: rgba(217, 144, 20, 0.24);

    .glow-indicator {
      animation: blink 1s var(--ease-in-out) infinite;
      background: var(--color-warning);
    }

    .status-label {
      color: var(--color-warning);
    }
  }

  &.disconnected {
    background: rgba(223, 70, 70, 0.12);
    border-color: rgba(223, 70, 70, 0.24);

    .glow-indicator {
      background: var(--color-error);
    }

    .status-label {
      color: var(--color-error);
    }
  }
}

.glow-indicator {
  border-radius: var(--radius-full);
  height: 6px;
  width: 6px;
}

.status-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.36;
  }
}
</style>
