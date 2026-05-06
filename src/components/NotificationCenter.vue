<template>
  <div class="notification-center pointer-events-none" :class="positionClass">
    <transition-group name="notify-list" tag="div" class="notify-container">
      <article
        v-for="alert in notificationStore.alerts"
        :key="alert.id"
        class="notification-card pointer-events-all"
        :class="`notification-${alert.type}`"
        role="status"
        aria-live="polite"
        @mouseenter="notificationStore.pauseNotification(alert.id)"
        @mouseleave="notificationStore.resumeNotification(alert.id)"
        @focusin="notificationStore.pauseNotification(alert.id)"
        @focusout="notificationStore.resumeNotification(alert.id)"
      >
        <div class="notification-rail" aria-hidden="true"></div>

        <div class="notification-icon" aria-hidden="true">
          <q-icon :name="alert.icon" />
        </div>

        <div class="notification-content">
          <div class="notification-meta">
            <span class="notification-type">{{
              getTypeLabel(alert.type)
            }}</span>
            <span v-if="alert.timeout > 0" class="notification-time">{{
              getDurationLabel(alert.timeout)
            }}</span>
          </div>
          <div class="notification-title">{{ alert.title }}</div>
          <p v-if="alert.message" class="notification-body">
            {{ alert.message }}
          </p>
        </div>

        <q-btn
          flat
          round
          dense
          icon="close"
          size="sm"
          class="notification-close"
          aria-label="Cerrar notificacion"
          @click="notificationStore.removeNotification(alert.id)"
        />

        <div
          v-if="alert.timeout > 0"
          class="notification-progress"
          :style="{ '--notification-timeout': `${alert.timeout}ms` }"
          aria-hidden="true"
        >
          <span></span>
        </div>
      </article>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useNotificationStore } from "src/stores/notifications";

const notificationStore = useNotificationStore();

const positionClass = computed(() => `pos-${notificationStore.position}`);

function getTypeLabel(type) {
  switch (type) {
    case "success":
      return "OK";
    case "warning":
      return "Aviso";
    case "error":
      return "Error";
    case "fatal":
      return "Critico";
    default:
      return "Info";
  }
}

function getDurationLabel(timeout) {
  return `${Math.ceil(timeout / 1000)}s`;
}
</script>

<style scoped lang="scss">
.notification-center {
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  padding: var(--space-4);
  position: fixed;
  z-index: var(--z-notification);
}

.pos-top-right {
  align-items: flex-end;
  right: 0;
  top: 0;
}
.pos-top-left {
  align-items: flex-start;
  left: 0;
  top: 0;
}
.pos-bottom-right {
  align-items: flex-end;
  bottom: 0;
  flex-direction: column-reverse;
  right: 0;
}
.pos-bottom-left {
  align-items: flex-start;
  bottom: 0;
  flex-direction: column-reverse;
  left: 0;
}

.notify-container {
  display: grid;
  gap: var(--space-2);
  width: min(360px, calc(100vw - var(--space-8)));
}

.pointer-events-none {
  pointer-events: none;
}
.pointer-events-all {
  pointer-events: all;
}

.notification-card {
  --alert-accent: var(--color-info);
  --alert-soft: rgba(22, 140, 207, 0.14);
  --alert-halo: rgba(22, 140, 207, 0.2);

  align-items: start;
  backdrop-filter: blur(18px);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 42%),
    var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  contain: layout paint style;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: 3px 36px minmax(0, 1fr) 28px;
  min-height: 72px;
  overflow: hidden;
  padding: var(--space-3);
  position: relative;
  transform: translateZ(0);
  will-change: opacity, transform;

  &::before {
    background: radial-gradient(
      circle at 18% 0%,
      var(--alert-halo),
      transparent 42%
    );
    content: "";
    inset: 0;
    opacity: 0.72;
    pointer-events: none;
    position: absolute;
  }
}

.notification-rail {
  align-self: stretch;
  background: var(--alert-accent);
  border-radius: var(--radius-full);
  box-shadow: 0 0 14px var(--alert-halo);
  min-height: 48px;
  position: relative;
  z-index: 1;
}

.notification-icon {
  align-items: center;
  background: var(--alert-soft);
  border: 1px solid var(--alert-halo);
  border-radius: var(--radius-lg);
  color: var(--alert-accent);
  display: flex;
  font-size: var(--font-size-lg);
  height: 36px;
  justify-content: center;
  position: relative;
  width: 36px;
  z-index: 1;
}

.notification-content {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.notification-meta {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
  margin-bottom: 2px;
}

.notification-type,
.notification-time {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  text-transform: uppercase;
}

.notification-type {
  color: var(--alert-accent);
}

.notification-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  overflow-wrap: anywhere;
}

.notification-body {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  margin: 2px 0 0;
  overflow-wrap: anywhere;
}

.notification-close {
  color: var(--color-text-tertiary);
  position: relative;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
  z-index: 1;

  &:hover {
    background: var(--alert-soft);
    color: var(--alert-accent);
    transform: translate3d(0, -1px, 0);
  }
}

.notification-progress {
  background: var(--color-border-subtle);
  bottom: 0;
  height: 3px;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  z-index: 1;

  span {
    animation: notificationLife var(--notification-timeout) linear forwards;
    background: var(--alert-accent);
    display: block;
    height: 100%;
    transform-origin: left center;
    width: 100%;
  }
}

.notification-card:hover .notification-progress span,
.notification-card:focus-within .notification-progress span {
  animation-play-state: paused;
}

.notification-success {
  --alert-accent: var(--color-success);
  --alert-soft: rgba(16, 169, 118, 0.14);
  --alert-halo: rgba(16, 169, 118, 0.22);
}

.notification-warning {
  --alert-accent: var(--color-warning);
  --alert-soft: rgba(217, 144, 20, 0.14);
  --alert-halo: rgba(217, 144, 20, 0.22);
}

.notification-error {
  --alert-accent: var(--color-error);
  --alert-soft: rgba(223, 70, 70, 0.14);
  --alert-halo: rgba(223, 70, 70, 0.22);
}

.notification-fatal {
  --alert-accent: var(--color-error);
  --alert-soft: rgba(223, 70, 70, 0.18);
  --alert-halo: rgba(223, 70, 70, 0.3);
  border-color: rgba(223, 70, 70, 0.36);
}

.notification-info {
  --alert-accent: var(--color-info);
  --alert-soft: rgba(22, 140, 207, 0.14);
  --alert-halo: rgba(22, 140, 207, 0.22);
}

@keyframes notificationLife {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.notify-list-enter-active,
.notify-list-leave-active,
.notify-list-move {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.notify-list-enter-from {
  opacity: 0;
  transform: translate3d(24px, -4px, 0) scale3d(0.98, 0.98, 1);
}

.notify-list-leave-to {
  opacity: 0;
  transform: translate3d(32px, 0, 0) scale3d(0.98, 0.98, 1);
}

@media (max-width: 600px) {
  .notification-center {
    padding: var(--space-2);
  }

  .notify-container {
    width: calc(100vw - var(--space-4));
  }

  .notification-card {
    grid-template-columns: 3px 34px minmax(0, 1fr) 28px;
    min-height: 68px;
    padding: var(--space-2);
  }

  .notification-icon {
    height: 34px;
    width: 34px;
  }
}
</style>
