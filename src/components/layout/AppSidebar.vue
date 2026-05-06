<template>
  <q-drawer
    v-model="internalOpen"
    show-if-above
    bordered
    class="premium-sidebar"
    :class="{
      'is-mini': !effectiveExpanded,
      'is-expanded': effectiveExpanded,
      'is-pinned': pinned,
    }"
    :width="290"
    :mini="!effectiveExpanded"
    :mini-width="84"
    :mini-to-overlay="!pinned"
    @mouseenter="$emit('hover-change', true)"
    @mouseleave="$emit('hover-change', false)"
  >
    <div class="sidebar-shell">
      <div class="brand-area">
        <div class="glass-brand shadow-md">
          <q-icon name="hub" size="36px" color="white" />
        </div>
      </div>

      <q-scroll-area class="col">
        <q-list padding class="nav-list">
          <q-item-label header class="nav-label">
            {{ $t("menu.main_title") }}
          </q-item-label>

          <q-item
            v-for="link in navLinks"
            v-show="!effectiveExpanded"
            :key="link.moduleKey"
            clickable
            v-ripple
            :to="link.to"
            class="menu-item-premium"
            active-class="menu-item-active"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" size="22px" />
            </q-item-section>
            <q-item-section class="nav-text-section">
              <q-item-label class="nav-item-label">{{
                $t(link.title)
              }}</q-item-label>
            </q-item-section>

            <q-item-section side v-if="link.badge" class="nav-badge-section">
              <q-badge color="negative" rounded :label="link.badge" />
            </q-item-section>
          </q-item>

          <q-item
            v-if="dashboardLink"
            v-show="effectiveExpanded"
            clickable
            v-ripple
            :to="dashboardLink.to"
            class="menu-item-premium"
            active-class="menu-item-active"
          >
            <q-item-section avatar>
              <q-icon :name="dashboardLink.icon" size="22px" />
            </q-item-section>
            <q-item-section class="nav-text-section">
              <q-item-label class="nav-item-label">{{
                $t(dashboardLink.title)
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-expansion-item
            v-for="group in groupedNavLinks"
            v-show="effectiveExpanded"
            :key="group.parent.moduleKey"
            default-opened
            dense
            dense-toggle
            expand-icon="keyboard_arrow_down"
            class="nav-section"
            header-class="nav-section-header"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon :name="group.parent.icon" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-section-label">{{
                  group.parentLabel
                }}</q-item-label>
              </q-item-section>
            </template>

            <q-item
              v-if="group.parent.to"
              clickable
              v-ripple
              :to="group.parent.to"
              class="menu-item-premium section-menu-item"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon :name="group.parent.icon" size="20px" />
              </q-item-section>
              <q-item-section class="nav-text-section">
                <q-item-label class="nav-item-label">{{
                  $t(group.parent.title)
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              v-for="link in group.children"
              :key="link.moduleKey"
              clickable
              v-ripple
              :to="link.to"
              class="menu-item-premium section-menu-item"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" size="20px" />
              </q-item-section>
              <q-item-section class="nav-text-section">
                <q-item-label class="nav-item-label">{{
                  $t(link.title)
                }}</q-item-label>
              </q-item-section>

              <q-item-section side v-if="link.badge" class="nav-badge-section">
                <q-badge color="negative" rounded :label="link.badge" />
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item
            v-for="link in directExpandedLinks"
            v-show="effectiveExpanded"
            :key="link.moduleKey"
            clickable
            v-ripple
            :to="link.to"
            class="menu-item-premium"
            active-class="menu-item-active"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" size="22px" />
            </q-item-section>
            <q-item-section class="nav-text-section">
              <q-item-label class="nav-item-label">{{
                $t(link.title)
              }}</q-item-label>
            </q-item-section>

            <q-item-section side v-if="link.badge" class="nav-badge-section">
              <q-badge color="negative" rounded :label="link.badge" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div class="footer-area">
        <div class="premium-card-mini">
          <q-icon name="support_agent" color="primary" size="sm" />
          <div class="footer-copy">
            <span class="footer-title"
              >EduGami AI v{{ APP_CONFIG.VERSION }}</span
            >
            <span class="footer-status">
              {{ $t("sidebar.status") }}: <strong>{{ systemStatus }}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { APP_CONFIG, getSystemStatus } from "src/constants/assets.constants";
import { useUserStore } from "src/stores/userStore";
import { getAlerts } from "src/utils/api/get";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "hover-change"]);
const $q = useQuasar();
const userStore = useUserStore();
const openAlertsCount = ref(0);

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isMobile = computed(() => $q.screen.lt.md);
const effectiveExpanded = computed(() => isMobile.value || props.expanded);

const rootLinks = [
  {
    title: "menu.dashboard",
    icon: "dashboard_customize",
    to: "/root/dashboard",
    moduleKey: "ROOT_DASHBOARD",
  },
  {
    title: "menu.tenants",
    icon: "business",
    to: "/root/tenants",
    moduleKey: "TENANTS",
  },
  {
    title: "menu.accounts",
    icon: "manage_accounts",
    to: "/root/platform-accounts",
    moduleKey: "PLATFORM_ACCOUNTS",
  },
  {
    title: "menu.alerts",
    icon: "notifications_active",
    to: "/root/alerts",
    moduleKey: "ALERTS",
    badgeKey: "openAlerts",
  },
  {
    title: "menu.services",
    icon: "hub",
    to: "/root/services",
    moduleKey: "SERVICES",
  },
  {
    title: "menu.metrics",
    icon: "analytics",
    to: "/root/metrics",
    moduleKey: "METRICS",
  },
  {
    title: "menu.rbac",
    icon: "admin_panel_settings",
    to: "/root/rbac",
    moduleKey: "RBAC",
  },
  {
    title: "menu.audit",
    icon: "fact_check",
    to: "/root/audit",
    moduleKey: "AUDIT",
  },
  {
    title: "menu.modules",
    icon: "extension",
    to: "/root/modules",
    moduleKey: "GLOBAL_MODULES",
  },
];

const navLinks = computed(() =>
  rootLinks
    .filter((link) => userStore.hasModule(link.moduleKey))
    .map((link) => {
      const module = moduleByKey.value.get(link.moduleKey) || {};
      return {
        ...link,
        module,
        parentModuleKey: module.parent_module_key || null,
        label: module.name || link.title,
        displayOrder: Number(module.display_order || 0),
        badge:
          link.badgeKey === "openAlerts" && openAlertsCount.value > 0
            ? openAlertsCount.value
            : null,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder),
);

const moduleByKey = computed(
  () => new Map(userStore.modules.map((module) => [module.module_key, module])),
);

const dashboardLink = computed(() =>
  navLinks.value.find((link) => link.moduleKey === "ROOT_DASHBOARD"),
);

const groupedNavLinks = computed(() => {
  const linkByKey = new Map(navLinks.value.map((link) => [link.moduleKey, link]));
  const groups = [];

  for (const parent of navLinks.value) {
    if (parent.moduleKey === "ROOT_DASHBOARD") continue;
    const children = navLinks.value.filter(
      (link) =>
        link.moduleKey !== "ROOT_DASHBOARD" &&
        link.parentModuleKey === parent.moduleKey,
    );
    if (children.length === 0) continue;
    groups.push({
      parent,
      parentLabel: parent.module?.name || parent.moduleKey,
      children: children.sort((a, b) => a.displayOrder - b.displayOrder),
    });
  }

  return groups.filter((group) => linkByKey.has(group.parent.moduleKey));
});

const groupedKeys = computed(
  () =>
    new Set(
      groupedNavLinks.value.flatMap((group) => [
        group.parent.moduleKey,
        ...group.children.map((child) => child.moduleKey),
      ]),
    ),
);

const directExpandedLinks = computed(() =>
  navLinks.value.filter(
    (link) =>
      link.moduleKey !== "ROOT_DASHBOARD" && !groupedKeys.value.has(link.moduleKey),
  ),
);

const systemStatus = computed(() => getSystemStatus());

async function loadOpenAlertsCount() {
  if (!userStore.hasModule("ALERTS")) return;
  try {
    const res = await getAlerts({ status: "open" });
    openAlertsCount.value = (res?.data?.data || []).length;
  } catch {
    openAlertsCount.value = 0;
  }
}

onMounted(loadOpenAlertsCount);
</script>

<style scoped lang="scss">
.premium-sidebar {
  background: var(--color-surface);
  backdrop-filter: blur(18px);
  border-right: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  overflow-x: hidden;
  transition:
    width var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.sidebar-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
}

.brand-area {
  align-items: center;
  display: flex;
  height: 128px;
  justify-content: center;
  padding: var(--space-6);
}

.glass-brand {
  align-items: center;
  background: var(--gradient-primary);
  border: 1px solid rgba(247, 251, 255, 0.18);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glow);
  display: flex;
  height: 64px;
  justify-content: center;
  width: 64px;
}

.nav-list {
  display: grid;
  gap: var(--space-1);
  padding: 0 var(--space-1) var(--space-1);
}

.nav-label {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
  padding: var(--space-2) var(--space-3);
}

.nav-item-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
}

.menu-item-premium {
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin: var(--space-1) var(--space-3);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
    transform: translate3d(2px, 0, 0);
  }
}

.menu-item-active {
  background: var(--gradient-primary) !important;
  box-shadow: var(--shadow-glow);
  color: #f7fbff !important;
}

.nav-section {
  margin: var(--space-1) var(--space-2);
}

:deep(.nav-section-header) {
  border-radius: var(--radius-lg);
  color: var(--color-text-tertiary);
  min-height: 40px;
  padding-inline: var(--space-3);
}

.nav-section-label {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
  text-transform: uppercase;
}

.section-menu-item {
  margin-left: var(--space-5);
  margin-right: var(--space-2);
}

.footer-area {
  padding: var(--space-4);
}

.premium-card-mini {
  align-items: center;
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
}

.footer-copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.footer-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.footer-status {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);

  strong {
    color: var(--color-success);
    font-weight: var(--font-weight-bold);
  }
}

.nav-text-section,
.nav-badge-section,
.nav-label,
.footer-copy {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.premium-sidebar.is-mini {
  .brand-area {
    padding: var(--space-5) var(--space-2);
  }

  .glass-brand {
    height: 52px;
    width: 52px;
  }

  .nav-list {
    padding-inline: var(--space-2);
  }

  .menu-item-premium {
    justify-content: center;
    margin-inline: var(--space-1);
    min-height: 48px;
    padding-inline: 0;
  }

  .nav-label,
  .nav-text-section,
  .nav-badge-section,
  .footer-copy {
    display: none;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(-8px, 0, 0);
  }

  .premium-card-mini {
    aspect-ratio: 1;
    height: 52px;
    justify-content: center;
    padding: 0;
    width: 52px;
  }

  .footer-area {
    display: flex;
    justify-content: center;
    padding-inline: var(--space-2);
  }
}

  .premium-sidebar.is-expanded {
  .nav-label,
  .nav-text-section,
  .nav-badge-section,
  .footer-copy {
    display: flex;
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .nav-label {
    display: block;
  }
}

@media (max-width: 1023px) {
  .premium-sidebar {
    max-width: min(86vw, 320px);
  }

  .premium-sidebar.is-mini {
    .nav-label,
    .nav-text-section,
    .nav-badge-section,
    .footer-copy {
      display: flex;
      opacity: 1;
      pointer-events: auto;
      transform: none;
    }

    .nav-label {
      display: block;
    }

    .premium-card-mini {
      aspect-ratio: auto;
      height: auto;
      justify-content: flex-start;
      padding: var(--space-3);
      width: auto;
    }
  }
}
</style>
