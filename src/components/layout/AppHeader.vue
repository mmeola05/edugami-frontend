<template>
  <q-header class="header-premium" :class="{ 'header-sticky': isScrolled }">
    <q-toolbar class="toolbar-layout">
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="$t('header.open_menu')"
        class="menu-toggle"
        @click="$emit('toggle-drawer')"
      />

      <div class="brand-section" aria-label="EduGami AI">
        <q-icon name="auto_stories" size="28px" class="brand-icon" />
        <h1 class="brand-name">EduGami</h1>
        <span class="brand-accent">AI</span>
      </div>

      <q-space />

      <div class="search-container hide-on-mobile">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          class="search-input"
          :placeholder="$t('header.search_placeholder')"
          @keyup.enter="performSearch"
        >
          <template #prepend>
            <q-icon name="search" size="sm" />
          </template>
          <q-menu
            v-model="searchOpen"
            no-parent-event
            no-focus
            no-refocus
            fit
            class="search-menu"
            content-class="premium-menu search-results-dropdown"
          >
            <q-list class="search-list-premium">
              <q-item
                v-if="searchResults.length === 0"
                class="menu-empty-premium"
              >
                <q-item-section avatar>
                  <div class="empty-icon-shell">
                    <q-icon name="search_off" size="24px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="empty-title">{{ $t("header.no_results") }}</q-item-label>
                  <q-item-label caption class="empty-subtitle">{{ $t("header.search_hint") }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item
                v-for="item in searchResults"
                :key="item.to"
                clickable
                v-close-popup
                class="search-item-premium"
                @click="goTo(item.to)"
              >
                <q-item-section avatar>
                  <q-avatar
                    size="32px"
                    :icon="item.icon"
                    class="bg-soft-primary text-primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="result-label">{{ item.label }}</q-item-label>
                  <q-item-label caption class="result-desc">{{ item.description }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" size="14px" class="result-chevron" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-input>
      </div>

      <q-separator vertical class="separator-header hide-on-mobile" />

      <div class="actions-group">
        <q-btn
          flat
          dense
          round
          icon="notifications_none"
          class="action-btn"
          aria-label="Notificaciones"
        >
          <q-badge
            v-if="notificationCount"
            color="negative"
            rounded
            floating
            :label="notificationCount"
          />
          <q-menu
            class="header-menu notification-menu"
            content-class="premium-menu"
            anchor="bottom right"
            self="top right"
          >
            <q-list class="notification-list">
              <q-item-label header class="menu-header-label">
                <q-icon name="notifications" size="14px" class="q-mr-xs" />
                {{ $t("header.notifications") }}
              </q-item-label>
              
              <q-item v-if="notificationItems.length === 0" class="menu-empty-premium">
                <q-item-section avatar>
                  <div class="empty-icon-shell">
                    <q-icon name="done_all" size="24px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="empty-title">{{ $t("header.all_clear") }}</q-item-label>
                  <q-item-label caption class="empty-subtitle">{{
                    $t("header.no_notifications")
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-for="notif in notificationItems.slice(0, 5)"
                :key="notif.id"
                clickable
                @click="goTo(notif.to || '/root/alerts')"
                v-close-popup
                class="notification-item-premium"
                :class="`severity-${notif.type || 'info'}`"
              >
                <q-item-section avatar>
                  <q-avatar
                    size="36px"
                    :icon="notif.icon || 'notifications'"
                    :class="`bg-soft-${notificationColor(notif)} text-${notificationColor(notif)}`"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="notif-title">{{ notif.title }}</q-item-label>
                  <q-item-label caption class="notif-message">{{
                    notif.message || notif.timestamp
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                   <div class="notif-dot" :class="`bg-${notificationColor(notif)}`"></div>
                </q-item-section>
              </q-item>
              
              <div v-if="notificationItems.length" class="menu-footer-actions">
                <q-btn 
                  flat 
                  no-caps 
                  full-width 
                  class="btn-view-all"
                  to="/root/alerts" 
                  v-close-popup
                >
                  <span>{{ $t("header.view_alerts") }}</span>
                  <q-icon name="arrow_forward" size="14px" />
                </q-btn>
              </div>
            </q-list>
          </q-menu>
        </q-btn>

        <language-switcher />
        <theme-toggle />
        <user-menu :drawer-open="drawerOpen" />
      </div>
    </q-toolbar>

    <q-linear-progress
      v-if="showStatusBar"
      :value="systemHealth"
      :color="
        systemHealth > 0.8
          ? 'positive'
          : systemHealth > 0.5
            ? 'warning'
            : 'negative'
      "
      class="status-bar"
      size="2px"
    />
  </q-header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useNotificationStore } from "src/stores/notifications";
import { getAlerts } from "src/utils/api/get";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import ThemeToggle from "./ThemeToggle.vue";
import UserMenu from "./UserMenu.vue";

defineProps({
  drawerOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-drawer"]);

const searchQuery = ref("");
const searchOpen = ref(false);
const isScrolled = ref(false);
const showStatusBar = ref(true);
const systemHealth = ref(0.95);
const openAlerts = ref([]);

const { t } = useI18n();
const notificationStore = useNotificationStore();
const router = useRouter();

const searchIndex = computed(() => [
  {
    label: t("header.search_index.dashboard"),
    description: t("header.search_index.dashboard_desc"),
    icon: "dashboard_customize",
    to: "/root/dashboard",
    keywords: "dashboard panel inicio root",
  },
  {
    label: t("header.search_index.tenants"),
    description: t("header.search_index.tenants_desc"),
    icon: "business",
    to: "/root/tenants",
    keywords: "tenant colegio cliente instancia modulo",
  },
  {
    label: t("header.search_index.accounts"),
    description: t("header.search_index.accounts_desc"),
    icon: "manage_accounts",
    to: "/root/platform-accounts",
    keywords: "cuentas usuarios root support admin",
  },
  {
    label: t("header.search_index.alerts"),
    description: t("header.search_index.alerts_desc"),
    icon: "notifications_active",
    to: "/root/alerts",
    keywords: "alertas incidencias errores warning",
  },
  {
    label: t("header.search_index.services"),
    description: t("header.search_index.services_desc"),
    icon: "hub",
    to: "/root/services",
    keywords: "servicios procesos restart docker ops agent",
  },
  {
    label: t("header.search_index.metrics"),
    description: t("header.search_index.metrics_desc"),
    icon: "analytics",
    to: "/root/metrics",
    keywords: "metricas rendimiento ram cpu db actividad",
  },
  {
    label: t("header.search_index.rbac"),
    description: t("header.search_index.rbac_desc"),
    icon: "admin_panel_settings",
    to: "/root/rbac",
    keywords: "roles permisos rbac acceso",
  },
  {
    label: t("header.search_index.modules"),
    description: t("header.search_index.modules_desc"),
    icon: "extension",
    to: "/root/modules",
    keywords: "modulos catalogo scope root support tenant",
  },
  {
    label: t("header.search_index.audit"),
    description: t("header.search_index.audit_desc"),
    icon: "fact_check",
    to: "/root/audit",
    keywords: "auditoria audit cambios rbac modulos trazabilidad",
  },
]);

const searchResults = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  if (!needle) return searchIndex.value.slice(0, 5);
  return searchIndex.value
    .filter((item) =>
      `${item.label} ${item.description} ${item.keywords}`
        .toLowerCase()
        .includes(needle),
    )
    .slice(0, 7);
});

const notificationItems = computed(() => [
  ...openAlerts.value.map((alert) => ({
    id: `alert-${alert.alert_id}`,
    title: alert.title,
    message: alert.message,
    icon: "notifications_active",
    color:
      alert.severity === "fatal" || alert.severity === "error"
        ? "negative"
        : "warning",
    to: "/root/alerts",
  })),
  ...notificationStore.alerts,
]);

const notificationCount = computed(() => notificationItems.value.length);

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  loadOpenAlerts();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

function handleScroll() {
  isScrolled.value = window.scrollY > 0;
}

function performSearch() {
  const first = searchResults.value[0];
  if (first) goTo(first.to);
}

function goTo(to) {
  searchOpen.value = false;
  router.push(to);
}

function notificationColor(notif) {
  if (notif.color) return notif.color;
  if (notif.type === "success") return "positive";
  if (notif.type === "error" || notif.type === "fatal") return "negative";
  if (notif.type === "warning") return "warning";
  return "info";
}

async function loadOpenAlerts() {
  try {
    const res = await getAlerts({ status: "open" });
    openAlerts.value = res?.data?.data || [];
  } catch {
    openAlerts.value = [];
  }
}

watch(searchQuery, (value) => {
  searchOpen.value = value.trim().length > 0;
});
</script>

<style scoped lang="scss">
.header-premium {
  background: var(--color-surface);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  transition:
    var(--transition-color),
    box-shadow var(--duration-base) var(--ease-out);
  z-index: var(--z-sticky);

  &.header-sticky {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-md);
  }
}

.toolbar-layout {
  gap: var(--space-4);
  height: 68px;
  padding: 0 var(--space-6);

  @media (max-width: 600px) {
    gap: var(--space-2);
    padding: 0 var(--space-4);
  }
}

.menu-toggle,
.action-btn {
  color: var(--color-text-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
  }
}

.brand-section {
  align-items: center;
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
  }
}

.brand-icon {
  color: var(--color-primary);
  filter: drop-shadow(0 8px 18px rgba(79, 70, 229, 0.2));
}

.brand-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  line-height: 1;

  @media (max-width: 480px) {
    display: none;
  }
}

.brand-accent {
  background: var(--gradient-primary);
  background-clip: text;
  color: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
}

.search-container {
  display: flex;
  min-width: 260px;
}

.search-input {
  width: 100%;

  :deep(.q-field__control) {
    background: var(--color-surface-strong);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
    transition: var(--transition-color);
  }

  :deep(.q-field__control:hover) {
    border-color: var(--color-border-default);
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }
}

.separator-header {
  background: var(--color-border-subtle);
  height: 24px;
}

.actions-group {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  position: relative;
}

.header-menu {
  color: var(--color-text-primary);
}

.search-list-premium {
  padding: var(--space-1) !important;
}

.search-item-premium {
  border-radius: var(--radius-lg);
  margin-bottom: 2px;
  padding: var(--space-3) !important;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.05);
    
    .result-chevron {
      opacity: 1;
      transform: translateX(2px);
    }
  }

  .result-label {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 700;
  }

  .result-desc {
    color: var(--color-text-tertiary);
    font-size: 11px;
    margin-top: 2px;
  }

  .result-chevron {
    color: var(--color-primary);
    opacity: 0;
    transition: var(--transition-fast);
  }
}

.search-list,
.notification-list {
  padding: var(--space-2);
}

.search-list {
  min-width: 360px;
}

.notification-list {
  min-width: 360px;
  padding: 0 !important;
}

.menu-header-label {
  align-items: center;
  color: var(--color-text-tertiary) !important;
  display: flex !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  padding: var(--space-4) var(--space-4) var(--space-2) !important;
  text-transform: uppercase;
}

.menu-empty-premium {
  padding: var(--space-8) var(--space-4) !important;
  text-align: center;

  .empty-icon-shell {
    align-items: center;
    background: rgba(16, 169, 118, 0.1);
    border-radius: var(--radius-full);
    color: var(--color-success);
    display: flex;
    height: 56px;
    justify-content: center;
    margin: 0 auto var(--space-3);
    width: 56px;
  }

  .empty-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
  }

  .empty-subtitle {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
  }
}

.notification-item-premium {
  border-radius: var(--radius-lg);
  margin: 0 var(--space-2) var(--space-1);
  padding: var(--space-3) var(--space-3) !important;
  position: relative;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.04);
    transform: translateX(4px);

    &::before {
      height: 60%;
      opacity: 1;
    }
  }

  &::before {
    background: currentColor;
    border-radius: var(--radius-full);
    content: "";
    height: 12px;
    left: 0;
    opacity: 0.4;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: var(--transition-fast);
    width: 3px;
  }

  &.severity-error { color: var(--color-error); }
  &.severity-warning { color: var(--color-warning); }
  &.severity-info { color: var(--color-info); }

  .notif-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 700;
    line-height: 1.2;
  }

  .notif-message {
    color: var(--color-text-secondary);
    font-size: 12px;
    line-height: 1.4;
    margin-top: 4px;
  }
}

.menu-footer-actions {
  border-top: 1px solid var(--color-border-subtle);
  margin-top: var(--space-2);
  padding: var(--space-2);
}

.btn-view-all {
  border-radius: var(--radius-lg);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  width: 100%;

  &:hover {
    background: rgba(79, 70, 229, 0.08);
  }

  span {
    margin-right: var(--space-2);
  }
}

.status-bar {
  height: 2px !important;
}

.hide-on-mobile {
  @media (max-width: 768px) {
    display: none !important;
  }
}
</style>
