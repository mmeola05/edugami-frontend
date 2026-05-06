<template>
  <q-dialog
    v-model="show"
    :persistent="persistent"
    :maximized="maximized"
    backdrop-filter="blur(10px) brightness(60%)"
  >
    <q-card
      class="app-dialog"
      :class="{ 'app-dialog--wide': wide, 'app-dialog--maximized': maximized }"
    >
      <div class="app-dialog__header">
        <div class="app-dialog__title-row">
          <div class="app-dialog__icon">
            <q-icon :name="icon" color="white" size="26px" />
          </div>
          <div class="app-dialog__copy">
            <h2>{{ title }}</h2>
            <span v-if="subtitle">{{ subtitle }}</span>
          </div>
        </div>
        <q-btn icon="close" flat round dense color="white" @click="show = false" />
      </div>

      <div class="app-dialog__body">
        <slot />
      </div>

      <div v-if="$slots.actions" class="app-dialog__footer">
        <slot name="actions" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "edit_note",
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  wide: {
    type: Boolean,
    default: false,
  },
  maximized: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<style scoped lang="scss">
.app-dialog {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 95vw;
  overflow: hidden;
  width: 620px;
}

.app-dialog--wide {
  width: 820px;
}

.app-dialog--maximized {
  border-radius: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100vh;
  max-height: 100vh;
  max-width: 100vw;
  width: 100vw;
}

.app-dialog__header {
  align-items: center;
  background: var(--gradient-primary);
  color: #f7fbff;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding: var(--space-6);
  position: relative;

  &::after {
    background: linear-gradient(135deg, rgba(247, 251, 255, 0.14), transparent 44%);
    content: "";
    inset: 0;
    pointer-events: none;
    position: absolute;
  }
}

.app-dialog__title-row {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  min-width: 0;
  position: relative;
  z-index: 1;
}

.app-dialog__icon {
  align-items: center;
  background: rgba(247, 251, 255, 0.16);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(247, 251, 255, 0.18);
  border-radius: var(--radius-lg);
  display: flex;
  flex: 0 0 auto;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.app-dialog__copy {
  display: grid;
  gap: var(--space-1);
  min-width: 0;

  h2 {
    color: #f7fbff;
    display: -webkit-box;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-height: var(--line-height-tight);
    margin: 0;
    overflow: hidden;
  }

  span {
    color: rgba(247, 251, 255, 0.78);
    display: -webkit-box;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
}

.app-dialog__body {
  overflow: auto;
  padding: var(--space-6);
}

.app-dialog__footer {
  align-items: center;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding: var(--space-4) var(--space-6);
}

@media (max-width: 640px) {
  .app-dialog {
    border-radius: var(--radius-xl);
    max-height: calc(100vh - 24px);
    width: calc(100vw - 24px);
  }

  .app-dialog--maximized {
    border-radius: 0;
    max-height: 100vh;
    width: 100vw;
  }

  .app-dialog__header,
  .app-dialog__body,
  .app-dialog__footer {
    padding: var(--space-4);
  }

  .app-dialog__footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .app-dialog__footer :deep(.q-btn) {
    width: 100%;
  }

  .app-dialog__icon {
    height: 44px;
    width: 44px;
  }

  .app-dialog__copy h2 {
    font-size: var(--font-size-base);
  }
}
</style>
