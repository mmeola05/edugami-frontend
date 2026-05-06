<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout-root">
    <q-page-container>
      <q-page class="auth-page">
        <div class="ambient-light ambient-light-primary"></div>
        <div class="ambient-light ambient-light-secondary"></div>
        <div class="ambient-light ambient-light-accent"></div>

        <div class="auth-controls">
          <q-btn
            flat
            round
            dense
            class="control-btn"
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            :aria-label="$q.dark.isActive ? 'Light mode' : 'Dark mode'"
            @click="toggleTheme"
          />
          <q-btn
            flat
            round
            dense
            icon="language"
            class="control-btn"
            aria-label="Language"
            @click="toggleLang"
          />
        </div>

        <div class="auth-container">
          <div class="auth-card">
            <section class="branding-section">
              <div class="branding-inner">
                <div class="brand-icon-wrapper">
                  <q-icon :name="brandingIcon" size="44px" />
                </div>

                <h1 class="brand-title">{{ brandingTitle }}</h1>
                <p class="brand-subtitle">{{ brandingSubtitle }}</p>

                <div class="status-indicator" :class="`status-${statusClass}`">
                  <span class="status-pulse"></span>
                  <span class="status-text">{{ statusText }}</span>
                </div>
              </div>
            </section>

            <section class="form-section">
              <router-view v-slot="{ Component }">
                <transition
                  appear
                  enter-active-class="form-enter-active"
                  leave-active-class="form-leave-active"
                  enter-from-class="form-enter-from"
                  leave-to-class="form-leave-to"
                  mode="out-in"
                >
                  <component :is="Component" :key="route.name" />
                </transition>
              </router-view>
            </section>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { APP_CONFIG } from "src/constants/assets.constants";

const $q = useQuasar();
const { locale } = useI18n();
const route = useRoute();

function toggleTheme() {
  $q.dark.toggle();
  localStorage.setItem("edugami_theme", $q.dark.isActive ? "dark" : "light");
}

function toggleLang() {
  const nextLang = locale.value === "es-ES" ? "en-US" : "es-ES";
  locale.value = nextLang;
  localStorage.setItem("edugami_lang", nextLang);
}

const brandingIcon = computed(() => {
  if (route.name === "recovery") return "security";
  if (route.name === "reset-password") return "lock_reset";
  return "auto_stories";
});

const brandingTitle = computed(() => {
  if (route.name === "recovery") return "RECOVERY";
  if (route.name === "reset-password") return "RESET";
  return "EDUGAMI";
});

const brandingSubtitle = computed(() => {
  if (route.name === "recovery") return "ACCESS CENTER";
  if (route.name === "reset-password") return "CREDENTIALS";
  return "AI SYSTEMS";
});

const statusText = computed(() => {
  if (route.name === "recovery") return "SECURE PROTOCOL ACTIVE";
  if (route.name === "reset-password") return "ENCRYPTED SESSION";
  return "SYSTEM ONLINE v2.4.0";
});

const statusClass = computed(() => {
  if (route.name === "recovery") return "warning";
  if (route.name === "reset-password") return "info";
  return "success";
});
</script>

<style scoped lang="scss">
.auth-layout-root {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.auth-page {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(79, 70, 229, 0.08), transparent 34%),
    linear-gradient(315deg, rgba(10, 166, 194, 0.08), transparent 32%),
    var(--color-bg-primary);
  display: flex;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  padding: var(--space-8);
  position: relative;
  transition: var(--transition-color);
}

body.body--dark .auth-page {
  background:
    linear-gradient(135deg, rgba(66, 213, 232, 0.1), transparent 34%),
    linear-gradient(315deg, rgba(237, 103, 174, 0.08), transparent 30%),
    var(--color-bg-primary);
}

.auth-controls {
  display: flex;
  gap: var(--space-2);
  position: fixed;
  right: var(--space-6);
  top: var(--space-6);
  z-index: var(--z-fixed);
}

.ambient-light {
  border-radius: var(--radius-full);
  filter: blur(22px);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  will-change: transform, opacity;
  z-index: 0;
}

.ambient-light-primary {
  animation: ambientLightPrimary 24s var(--ease-in-out) infinite;
  background: radial-gradient(
    circle,
    rgba(79, 70, 229, 0.34) 0%,
    rgba(10, 166, 194, 0.22) 42%,
    transparent 72%
  );
  height: 440px;
  left: 20%;
  top: 16%;
  width: 440px;
}

.ambient-light-secondary {
  animation: ambientLightSecondary 28s var(--ease-in-out) infinite;
  background: radial-gradient(
    circle,
    rgba(207, 63, 142, 0.32) 0%,
    rgba(79, 70, 229, 0.18) 44%,
    transparent 74%
  );
  height: 400px;
  right: 12%;
  top: 22%;
  width: 400px;
}

.ambient-light-accent {
  animation: ambientLightAccent 32s var(--ease-in-out) infinite;
  background: radial-gradient(
    circle,
    rgba(16, 169, 118, 0.24) 0%,
    rgba(66, 213, 232, 0.24) 46%,
    transparent 76%
  );
  bottom: 10%;
  height: 380px;
  left: 38%;
  width: 380px;
}

.control-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
    transform: translate3d(0, -2px, 0);
  }
}

.auth-container {
  max-width: 980px;
  position: relative;
  width: 100%;
  z-index: 2;
}

.auth-card {
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
  min-height: 560px;
  overflow: hidden;
  transition:
    var(--transition-move),
    border-color var(--duration-base) var(--ease-out);

  &:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-xl), var(--shadow-glow);
  }
}

.branding-section {
  align-items: center;
  background:
    linear-gradient(145deg, rgba(79, 70, 229, 0.84), rgba(10, 166, 194, 0.64)),
    linear-gradient(135deg, rgba(79, 70, 229, 0.07), transparent 34%),
    linear-gradient(315deg, rgba(207, 63, 142, 0.06), transparent 30%);
  color: #f7fbff;
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding: var(--space-12);
  position: relative;
  text-align: center;

  &::after {
    background:
      linear-gradient(135deg, rgba(247, 251, 255, 0.12), transparent 40%),
      linear-gradient(315deg, rgba(7, 17, 31, 0.28), transparent 52%);
    content: "";
    inset: 0;
    opacity: 0.72;
    pointer-events: none;
    position: absolute;
  }
}

.branding-inner {
  position: relative;
  z-index: 1;
}

.brand-icon-wrapper {
  filter: drop-shadow(0 14px 24px rgba(7, 17, 31, 0.24));
  margin-bottom: var(--space-6);
}

.brand-title {
  color: #f7fbff;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0;
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-2);
}

.brand-subtitle {
  color: rgba(247, 251, 255, 0.82);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
  margin-bottom: var(--space-8);
}

.status-indicator {
  align-items: center;
  color: rgba(247, 251, 255, 0.86);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  letter-spacing: 0;

  &.status-success .status-pulse {
    background: var(--color-success);
    box-shadow: 0 0 12px rgba(16, 169, 118, 0.72);
  }

  &.status-warning .status-pulse {
    background: var(--color-warning);
    box-shadow: 0 0 12px rgba(217, 144, 20, 0.72);
  }

  &.status-info .status-pulse {
    background: var(--color-info);
    box-shadow: 0 0 12px rgba(22, 140, 207, 0.72);
  }
}

.status-pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
  border-radius: var(--radius-full);
  display: inline-block;
  height: 8px;
  width: 8px;
}

.form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-12);
}

.form-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.form-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.form-enter-from {
  opacity: 0;
  transform: translate3d(14px, 0, 0);
}

.form-leave-to {
  opacity: 0;
  transform: translate3d(-10px, 0, 0);
}

@keyframes ambientLightPrimary {
  0%,
  100% {
    opacity: 0.08;
    transform: translate3d(-18px, 10px, 0) scale3d(0.92, 0.92, 1);
  }

  24%,
  58% {
    opacity: 0.72;
  }

  72% {
    opacity: 0.34;
    transform: translate3d(52px, -24px, 0) scale3d(1.12, 1.12, 1);
  }
}

@keyframes ambientLightSecondary {
  0%,
  18%,
  100% {
    opacity: 0.06;
    transform: translate3d(20px, -12px, 0) scale3d(0.9, 0.9, 1);
  }

  42%,
  70% {
    opacity: 0.64;
  }

  82% {
    opacity: 0.28;
    transform: translate3d(-54px, 26px, 0) scale3d(1.12, 1.12, 1);
  }
}

@keyframes ambientLightAccent {
  0%,
  34%,
  100% {
    opacity: 0.05;
    transform: translate3d(0, 24px, 0) scale3d(0.94, 0.94, 1);
  }

  56%,
  78% {
    opacity: 0.56;
  }

  90% {
    opacity: 0.24;
    transform: translate3d(-42px, -34px, 0) scale3d(1.12, 1.12, 1);
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding: var(--space-4);
  }

  .auth-controls {
    right: var(--space-4);
    top: var(--space-4);
  }

  .auth-card {
    grid-template-columns: 1fr;
  }

  .branding-section {
    min-height: 220px;
    padding: var(--space-8);
  }

  .form-section {
    padding: var(--space-8);
  }

  .brand-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
