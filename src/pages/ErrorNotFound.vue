<template>
  <q-page class="not-found-page">
    <section class="not-found-shell" aria-labelledby="not-found-title">
      <div class="not-found-copy">
        <div class="status-pill">
          <q-icon name="travel_explore" />
          <span>{{ t("not_found.status") }}</span>
        </div>

        <p class="error-kicker">{{ t("not_found.code") }}</p>
        <h1 id="not-found-title">{{ t("not_found.title") }}</h1>
        <p class="not-found-description">
          {{ t("not_found.description") }}
        </p>

        <div class="route-preview" :aria-label="t('not_found.route_label')">
          <q-icon name="link_off" />
          <span>{{ currentPath }}</span>
        </div>

        <div class="not-found-actions">
          <q-btn
            unelevated
            no-caps
            icon="dashboard"
            :label="t('not_found.dashboard_btn')"
            class="btn-premium"
            to="/root/dashboard"
          />
          <q-btn
            flat
            no-caps
            icon="arrow_back"
            :label="t('not_found.back_btn')"
            class="btn-ghost"
            @click="goBack"
          />
        </div>
      </div>

      <div class="not-found-visual" aria-hidden="true">
        <div class="module-panel">
          <div class="module-header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="module-stage">
            <div class="module-orbit orbit-a"></div>
            <div class="module-orbit orbit-b"></div>
            <div class="module-core">
              <q-icon name="extension_off" />
              <span>404</span>
            </div>
            <span class="connector connector-a"></span>
            <span class="connector connector-b"></span>
            <span class="connector connector-c"></span>
            <span class="signal-pulse pulse-a"></span>
            <span class="signal-pulse pulse-b"></span>
            <span class="port port-a"></span>
            <span class="port port-b"></span>
            <span class="port port-c"></span>
            <span class="port port-d"></span>
          </div>
          <div class="module-footer">
            <span>{{ t("not_found.scan_label") }}</span>
            <strong>{{ t("not_found.no_match") }}</strong>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const currentPath = computed(() => route.fullPath || "/");

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push("/root/dashboard");
}
</script>

<style scoped lang="scss">
.not-found-page {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(79, 70, 229, 0.08), transparent 34%),
    linear-gradient(315deg, rgba(22, 140, 207, 0.07), transparent 32%),
    var(--color-bg-primary);
  color: var(--color-text-primary);
  display: flex;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  padding: var(--space-8);
  position: relative;
}

.not-found-page::before {
  background-image:
    linear-gradient(rgba(127, 139, 168, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(127, 139, 168, 0.12) 1px, transparent 1px);
  background-size: 44px 44px;
  content: "";
  inset: 0;
  mask-image: radial-gradient(circle at center, black, transparent 72%);
  opacity: 0.34;
  pointer-events: none;
  position: absolute;
  transform: translate3d(0, 0, 0);
}

.not-found-page::after {
  animation: ambientSweep 9s var(--ease-in-out) infinite alternate;
  background:
    radial-gradient(
      circle at 28% 42%,
      rgba(79, 70, 229, 0.18),
      transparent 28%
    ),
    radial-gradient(
      circle at 72% 50%,
      rgba(66, 213, 232, 0.12),
      transparent 30%
    );
  content: "";
  inset: -12%;
  opacity: 0.68;
  pointer-events: none;
  position: absolute;
  transform: translate3d(0, 0, 0);
}

.not-found-shell {
  align-items: center;
  display: grid;
  gap: var(--space-10);
  grid-template-columns: minmax(0, 1fr) 420px;
  max-width: 1080px;
  position: relative;
  width: 100%;
  z-index: 1;
}

.not-found-copy {
  max-width: 560px;
}

.status-pill {
  align-items: center;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  line-height: 1;
  margin-bottom: var(--space-5);
  padding: var(--space-2) var(--space-3);
  text-transform: uppercase;
}

.status-pill .q-icon {
  color: var(--color-primary);
  font-size: var(--font-size-base);
}

.error-kicker {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
}

h1 {
  color: var(--color-text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  max-width: 560px;
}

.not-found-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  margin-top: var(--space-4);
  max-width: 520px;
}

.route-preview {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  display: flex;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  margin-top: var(--space-5);
  max-width: 520px;
  min-height: 44px;
  overflow: hidden;
  padding: 0 var(--space-4);
}

.route-preview .q-icon {
  color: var(--color-error);
  flex: 0 0 auto;
}

.route-preview span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.not-found-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.btn-ghost {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
  min-height: 42px;
  padding-inline: var(--space-4);
  transition: var(--transition-fast);

  &:hover {
    background: var(--color-surface-muted);
    color: var(--color-text-primary);
    transform: translate3d(0, -1px, 0);
  }
}

.not-found-visual {
  display: flex;
  justify-content: flex-end;
}

.module-panel {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 38%),
    var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  min-height: 360px;
  overflow: hidden;
  position: relative;
  width: min(100%, 420px);
}

.module-header,
.module-footer {
  align-items: center;
  display: flex;
  height: 52px;
  padding: 0 var(--space-5);
  position: relative;
  z-index: 1;
}

.module-header {
  border-bottom: 1px solid var(--color-border-subtle);
  gap: var(--space-2);
}

.module-header span {
  background: var(--color-border-default);
  border-radius: var(--radius-full);
  height: 8px;
  width: 8px;
}

.module-stage {
  background-image:
    linear-gradient(rgba(127, 139, 168, 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(127, 139, 168, 0.14) 1px, transparent 1px);
  background-size: 36px 36px;
  height: 256px;
  overflow: hidden;
  position: relative;
}

.module-stage::before {
  animation: stageGlow 5.5s var(--ease-in-out) infinite;
  background:
    radial-gradient(circle at center, rgba(79, 70, 229, 0.22), transparent 42%),
    radial-gradient(circle at center, rgba(223, 70, 70, 0.14), transparent 58%);
  content: "";
  inset: 0;
  opacity: 0.9;
  position: absolute;
}

.module-core {
  align-items: center;
  animation: moduleFloat 4.8s var(--ease-in-out) infinite;
  background:
    linear-gradient(135deg, rgba(79, 70, 229, 0.22), rgba(223, 70, 70, 0.12)),
    var(--color-surface);
  border: 1px solid rgba(223, 70, 70, 0.36);
  border-radius: var(--radius-2xl);
  box-shadow:
    0 22px 44px rgba(20, 22, 31, 0.18),
    0 0 38px rgba(223, 70, 70, 0.16);
  color: var(--color-error);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  height: 112px;
  justify-content: center;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate3d(-50%, -50%, 0) rotate(-4deg);
  width: 112px;
  z-index: 3;
}

.module-core .q-icon {
  font-size: 34px;
}

.module-core span {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0;
  line-height: 1;
}

.module-orbit {
  border: 1px dashed rgba(79, 70, 229, 0.38);
  border-radius: var(--radius-full);
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate3d(-50%, -50%, 0) rotate(0deg);
}

.orbit-a {
  animation: orbitSpin 18s linear infinite;
  height: 176px;
  width: 176px;
}

.orbit-b {
  animation: orbitSpinReverse 24s linear infinite;
  border-color: rgba(223, 70, 70, 0.28);
  height: 224px;
  width: 224px;
}

.connector {
  animation: connectorBreath 3.8s var(--ease-in-out) infinite;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(127, 139, 168, 0.38),
    transparent
  );
  height: 1px;
  position: absolute;
  transform-origin: center;
  z-index: 1;
}

.connector-a {
  left: 18%;
  top: 38%;
  transform: rotate(24deg);
  width: 34%;
}

.connector-b {
  right: 18%;
  top: 34%;
  transform: rotate(-20deg);
  width: 30%;
}

.connector-c {
  animation-delay: 0.7s;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(223, 70, 70, 0.72),
    transparent
  );
  left: 33%;
  top: 67%;
  transform: rotate(-12deg);
  width: 36%;
}

.signal-pulse {
  background: var(--color-info);
  border-radius: var(--radius-full);
  box-shadow: 0 0 16px currentColor;
  height: 7px;
  opacity: 0;
  position: absolute;
  width: 7px;
  z-index: 4;
}

.pulse-a {
  animation: pulseTravelA 3.6s var(--ease-in-out) infinite;
  color: var(--color-info);
  left: 18%;
  top: 38%;
}

.pulse-b {
  animation: pulseTravelB 4.2s var(--ease-in-out) infinite 0.9s;
  color: var(--color-error);
  left: 42%;
  top: 67%;
}

.port {
  animation: portBlink 4.4s var(--ease-in-out) infinite;
  background: var(--color-surface);
  border: 2px solid rgba(127, 139, 168, 0.52);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 18px rgba(79, 70, 229, 0.18);
  height: 34px;
  position: absolute;
  width: 34px;
  z-index: 2;
}

.port::before {
  background: currentColor;
  border-radius: var(--radius-full);
  content: "";
  height: 8px;
  left: 50%;
  opacity: 0.75;
  position: absolute;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: 8px;
}

.port-a {
  color: var(--color-primary);
  left: 15%;
  top: 28%;
}

.port-b {
  animation-delay: 0.8s;
  color: var(--color-info);
  right: 16%;
  top: 24%;
}

.port-c {
  animation-delay: 1.4s;
  color: var(--color-warning);
  left: 20%;
  bottom: 20%;
}

.port-d {
  animation-delay: 2s;
  border-color: rgba(223, 70, 70, 0.64);
  box-shadow: 0 0 20px rgba(223, 70, 70, 0.22);
  color: var(--color-error);
  right: 22%;
  bottom: 18%;
}

.module-footer {
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  justify-content: space-between;
  text-transform: uppercase;
}

.module-footer strong {
  animation: statusBlink 2.2s var(--ease-in-out) infinite;
  color: var(--color-error);
}

@keyframes ambientSweep {
  from {
    opacity: 0.42;
    transform: translate3d(-2%, -1%, 0) scale3d(1, 1, 1);
  }
  to {
    opacity: 0.78;
    transform: translate3d(2%, 1%, 0) scale3d(1.04, 1.04, 1);
  }
}

@keyframes stageGlow {
  0%,
  100% {
    opacity: 0.72;
    transform: scale3d(1, 1, 1);
  }
  50% {
    opacity: 1;
    transform: scale3d(1.04, 1.04, 1);
  }
}

@keyframes moduleFloat {
  0%,
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(-4deg);
  }
  50% {
    transform: translate3d(-50%, calc(-50% - 7px), 0) rotate(2deg);
  }
}

@keyframes orbitSpin {
  from {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
  to {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
}

@keyframes orbitSpinReverse {
  from {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
  to {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
}

@keyframes connectorBreath {
  0%,
  100% {
    opacity: 0.36;
    scale: 0.96 1;
  }
  50% {
    opacity: 0.92;
    scale: 1.04 1;
  }
}

@keyframes pulseTravelA {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale3d(0.8, 0.8, 1);
  }
  18%,
  72% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(128px, 62px, 0) scale3d(1, 1, 1);
  }
}

@keyframes pulseTravelB {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale3d(0.8, 0.8, 1);
  }
  18%,
  68% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(104px, -36px, 0) scale3d(1, 1, 1);
  }
}

@keyframes portBlink {
  0%,
  100% {
    opacity: 0.74;
    transform: scale3d(1, 1, 1);
  }
  50% {
    opacity: 1;
    transform: scale3d(1.08, 1.08, 1);
  }
}

@keyframes statusBlink {
  0%,
  100% {
    opacity: 0.72;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found-page::after,
  .module-stage::before,
  .module-core,
  .module-orbit,
  .connector,
  .signal-pulse,
  .port,
  .module-footer strong {
    animation: none;
  }
}

:global(body.body--dark) .module-panel,
:global(body.body--dark) .route-preview,
:global(body.body--dark) .status-pill {
  backdrop-filter: blur(18px);
}

@media (max-width: 900px) {
  .not-found-page {
    align-items: flex-start;
    overflow: auto;
    padding: var(--space-6);
  }

  .not-found-shell {
    gap: var(--space-6);
    grid-template-columns: 1fr;
  }

  .not-found-visual {
    justify-content: flex-start;
    width: 100%;
  }

  .module-panel {
    min-height: 280px;
  }
}

@media (max-width: 600px) {
  .not-found-page {
    padding: var(--space-5) var(--space-4);
  }

  h1 {
    font-size: var(--font-size-2xl);
  }

  .not-found-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .not-found-actions .q-btn {
    width: 100%;
  }
}
</style>
