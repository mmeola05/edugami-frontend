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
        <div class="brand-lockup">
          <div class="glass-brand shadow-md">
            <q-icon name="school" size="26px" color="white" />
          </div>
          <div class="brand-copy">
            <strong>EduGami AI</strong>
            <span>Tenant Admin</span>
          </div>
        </div>
      </div>

      <q-scroll-area class="col">
        <q-list padding class="nav-list">
          <q-item-label header class="nav-label">
            {{ $t("tenant.layout.center") }}
          </q-item-label>

          <q-item
            v-for="link in visibleLinks"
            v-show="!effectiveExpanded"
            :key="link.to"
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
              <q-item-label class="nav-item-label">{{ $t(link.labelKey) }}</q-item-label>
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
              <q-item-label class="nav-item-label">{{ $t(dashboardLink.labelKey) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-expansion-item
            v-for="group in groupedLinks"
            v-show="effectiveExpanded"
            :key="group.key"
            default-opened
            dense
            dense-toggle
            expand-icon="keyboard_arrow_down"
            class="nav-section"
            header-class="nav-section-header"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon :name="group.icon" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-section-label">{{ $t(group.labelKey) }}</q-item-label>
              </q-item-section>
            </template>

            <q-item
              v-for="link in group.links"
              :key="link.to"
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
                <q-item-label class="nav-item-label">{{ $t(link.labelKey) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>

      <div class="footer-area">
        <div class="premium-card-mini">
          <q-icon name="apartment" color="primary" size="sm" />
          <div class="footer-copy">
            <span class="footer-title">{{ tenantSession.activeContext?.tenantName || $t("tenant.layout.center") }}</span>
            <span class="footer-status">{{ roleSummary }}</span>
          </div>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { computed } from "vue";
import { useQuasar } from "quasar";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";

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
const tenantSession = useTenantSessionStore();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isMobile = computed(() => $q.screen.lt.md);
const effectiveExpanded = computed(() => isMobile.value || props.expanded);

const navLinks = [
  direct("tenant.layout.nav_panel", "dashboard_customize", "/tenant/dashboard", null),
  academic("tenant.layout.nav_periods", "event_note", "/tenant/periods", "PERIODS"),
  academic("tenant.layout.nav_classes", "groups", "/tenant/classes", "CLASSES"),
  academic("tenant.layout.nav_courses", "menu_book", "/tenant/courses", "COURSES"),
  academic("tenant.layout.nav_assignments", "assignment_ind", "/tenant/teacher-assignments", "TEACHER_ASSIGNMENTS"),
  people("tenant.layout.nav_students", "school", "/tenant/students", "STUDENTS"),
  people("tenant.layout.nav_teachers", "co_present", "/tenant/teachers", "TEACHERS"),
  people("tenant.layout.nav_guardians", "family_restroom", "/tenant/guardians", "STUDENTS"),
  people("tenant.layout.nav_staff", "badge", "/tenant/staff", "TENANT_ADMIN"),
  access("tenant.layout.nav_admin", "manage_accounts", "/tenant/admin/users", "TENANT_ADMIN"),
  access("tenant.layout.nav_settings", "settings", "/tenant/settings", "TENANT_ADMIN"),
  tracking("tenant.layout.nav_reports", "insights", "/tenant/reports", "REPORTS"),
  tracking("tenant.layout.nav_ai", "psychology", "/tenant/ai-tutor", "AI_TUTOR", "TEACHER"),
];

const visibleLinks = computed(() =>
  navLinks.filter((link) =>
    (!link.moduleKey || tenantSession.hasModule(link.moduleKey)) &&
    (!link.roleCode || tenantSession.hasRole(link.roleCode)),
  ),
);

const dashboardLink = computed(() => visibleLinks.value.find((link) => !link.groupKey));

const groups = [
  {
    key: "academic",
    labelKey: "tenant.layout.group_academic",
    icon: "auto_stories",
  },
  {
    key: "people",
    labelKey: "tenant.layout.group_people",
    icon: "groups",
  },
  {
    key: "access",
    labelKey: "tenant.layout.group_access",
    icon: "admin_panel_settings",
  },
  {
    key: "tracking",
    labelKey: "tenant.layout.group_tracking",
    icon: "monitor_heart",
  },
];

const groupedLinks = computed(() =>
  groups
    .map((group) => ({
      ...group,
      links: visibleLinks.value.filter((link) => link.groupKey === group.key),
    }))
    .filter((group) => group.links.length > 0),
);

const roleSummary = computed(() =>
  (tenantSession.activeContext?.roles || [])
    .map((role) => role.name || role.code)
    .join(", ") || "Sin rol",
);

function direct(labelKey, icon, to, moduleKey) {
  return { labelKey, icon, to, moduleKey, groupKey: null };
}

function academic(labelKey, icon, to, moduleKey) {
  return { labelKey, icon, to, moduleKey, groupKey: "academic" };
}

function people(labelKey, icon, to, moduleKey) {
  return { labelKey, icon, to, moduleKey, groupKey: "people" };
}

function access(labelKey, icon, to, moduleKey) {
  return { labelKey, icon, to, moduleKey, groupKey: "access" };
}

function tracking(labelKey, icon, to, moduleKey, roleCode = null) {
  return { labelKey, icon, to, moduleKey, roleCode, groupKey: "tracking" };
}
</script>

<style scoped lang="scss">
.premium-sidebar {
  background: var(--eg-sidebar, var(--color-surface-strong));
  backdrop-filter: blur(18px);
  border-right: 1px solid var(--eg-border, var(--color-border-subtle));
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
  height: 106px;
  justify-content: flex-start;
  padding: var(--space-6) var(--space-5);
}

.brand-lockup {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  min-width: 0;
}

.glass-brand {
  align-items: center;
  background: var(--gradient-primary);
  border: 1px solid rgba(247, 251, 255, 0.18);
  border-radius: 18px;
  box-shadow: var(--shadow-glow);
  display: flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.brand-copy {
  display: grid;
  gap: 2px;
  min-width: 0;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--eg-text, var(--color-text-primary));
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
    line-height: 1;
  }

  span {
    color: var(--eg-muted, var(--color-text-tertiary));
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.nav-list {
  display: grid;
  gap: var(--space-1);
  padding: 0 var(--space-1) var(--space-1);
}

.nav-label {
  color: var(--eg-muted, var(--color-text-tertiary));
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
  border-radius: 18px;
  color: var(--eg-muted, var(--color-text-secondary));
  font-weight: var(--font-weight-medium);
  margin: var(--space-1) var(--space-3);
  transition: var(--transition-fast);

  &:hover {
    background: var(--eg-primary-soft, rgba(36, 21, 242, 0.07));
    color: var(--eg-primary, var(--color-primary));
    transform: translate3d(2px, 0, 0);
  }
}

.menu-item-active {
  background: var(--eg-primary-soft, color-mix(in srgb, var(--color-primary) 10%, var(--color-surface-strong))) !important;
  box-shadow: 0 12px 28px rgba(36, 21, 242, 0.1);
  color: var(--eg-primary, var(--color-primary)) !important;
  font-weight: var(--font-weight-extrabold);
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
  color: var(--eg-muted, var(--color-text-tertiary));
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
  background: var(--eg-surface-soft, var(--color-surface-strong));
  border: 1px solid var(--eg-border, var(--color-border-subtle));
  border-radius: 22px;
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

.footer-title,
.footer-status {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-title {
  color: var(--eg-text, var(--color-text-primary));
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.footer-status {
  color: var(--eg-muted, var(--color-text-tertiary));
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
}

.nav-text-section,
.nav-label,
.footer-copy {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.premium-sidebar.is-mini {
  .brand-area {
    justify-content: center;
    padding: var(--space-5) var(--space-2);
  }

  .glass-brand {
    height: 52px;
    width: 52px;
  }

  .brand-copy {
    display: none;
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
