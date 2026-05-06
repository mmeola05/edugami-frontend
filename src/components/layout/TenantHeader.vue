<template>
  <q-header class="header-premium" :class="{ 'header-sticky': isScrolled }">
    <q-toolbar class="toolbar-layout">
      <q-btn
        flat
        dense
        round
        icon="menu"
        :aria-label="$t('header.open_menu')"
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
              <q-item v-if="searchResults.length === 0" class="menu-empty-premium">
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
          v-if="tenantSession.hasMultipleContexts"
          flat
          dense
          round
          icon="swap_horiz"
          class="action-btn"
          to="/auth/tenant-context"
        >
          <q-tooltip>{{ $t("tenant.layout.change_context") }}</q-tooltip>
        </q-btn>

        <language-switcher />
        <theme-toggle />

        <q-btn-dropdown
          flat
          dense
          no-caps
          dropdown-icon="keyboard_arrow_down"
          class="tenant-user-menu"
        >
          <template #label>
            <div class="user-label">
              <q-avatar size="32px" class="bg-primary text-white">
                {{ initials }}
              </q-avatar>
              <div class="user-copy hide-on-small">
                <strong>{{ tenantSession.user?.displayName || tenantSession.user?.email }}</strong>
                <span>{{ roleSummary }}</span>
              </div>
            </div>
          </template>

          <q-list class="tenant-menu-list">
            <q-item-label header class="menu-header-label">
              {{ tenantSession.activeContext?.tenantName || $t("tenant.layout.center") }}
            </q-item-label>
            <q-item clickable v-close-popup to="/tenant/dashboard">
              <q-item-section avatar>
                <q-icon name="dashboard_customize" />
              </q-item-section>
              <q-item-section>{{ $t("tenant.layout.nav_panel") }}</q-item-section>
            </q-item>
            <q-item v-if="tenantSession.hasMultipleContexts" clickable v-close-popup to="/auth/tenant-context">
              <q-item-section avatar>
                <q-icon name="swap_horiz" />
              </q-item-section>
              <q-item-section>{{ $t("tenant.layout.change_context") }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>{{ $t("tenant.layout.logout") }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-toolbar>

    <q-linear-progress
      :value="0.95"
      color="positive"
      class="status-bar"
      size="2px"
    />
  </q-header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import ThemeToggle from "./ThemeToggle.vue";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";

defineProps({
  drawerOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-drawer"]);

const router = useRouter();
const { t } = useI18n();
const tenantSession = useTenantSessionStore();
const searchQuery = ref("");
const searchOpen = ref(false);
const isScrolled = ref(false);

const roleSummary = computed(() =>
  (tenantSession.activeContext?.roles || [])
    .map((role) => role.name || role.code)
    .join(", ") || t("tenant.layout.no_role"),
);

const initials = computed(() => {
  const value = tenantSession.user?.displayName || tenantSession.user?.email || "EG";
  return value
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
});

const searchIndex = computed(() =>
  [
    tenantLink("tenant.layout.nav_panel", "tenant.layout.nav_panel_caption", "dashboard_customize", "/tenant/dashboard", null, "dashboard panel inicio tenant centro"),
    tenantLink("tenant.layout.nav_periods", "tenant.layout.nav_periods_caption", "event_note", "/tenant/periods", "PERIODS", "periodos curso trimestre evaluacion calendario"),
    tenantLink("tenant.layout.nav_classes", "tenant.layout.nav_classes_caption", "groups", "/tenant/classes", "CLASSES", "clases grupos aulas"),
    tenantLink("tenant.layout.nav_students", "tenant.layout.nav_students_caption", "school", "/tenant/students", "STUDENTS", "alumnos estudiantes matriculas familias"),
    tenantLink("tenant.layout.nav_enrollments", "tenant.layout.nav_enrollments_caption", "how_to_reg", "/tenant/enrollments", "ENROLLMENTS", "matriculas inscripciones clases asignaturas historico"),
    tenantLink("tenant.layout.nav_teachers", "tenant.layout.nav_teachers_caption", "co_present", "/tenant/teachers", "TEACHERS", "profesores docentes"),
    tenantLink("tenant.layout.nav_assignments", "tenant.layout.nav_assignments_caption", "assignment_ind", "/tenant/teacher-assignments", "TEACHER_ASSIGNMENTS", "asignaciones profesor clase asignatura"),
    tenantLink("tenant.layout.nav_courses", "tenant.layout.nav_courses_caption", "menu_book", "/tenant/courses", "COURSES", "asignaturas materias cursos"),
    tenantLink("tenant.layout.nav_admin", "tenant.layout.nav_admin_caption", "manage_accounts", "/tenant/admin/users", "TENANT_ADMIN", "usuarios roles permisos admin"),
    tenantLink("tenant.layout.nav_reports", "tenant.layout.nav_reports_caption", "insights", "/tenant/reports", "REPORTS", "informes analitica progreso"),
    tenantLink("tenant.layout.nav_ai", "tenant.layout.nav_ai_caption", "psychology", "/tenant/ai-tutor", "AI_TUTOR", "ia tutor inteligencia artificial", "TEACHER"),
  ].filter((item) =>
    (!item.moduleKey || tenantSession.hasModule(item.moduleKey)) &&
    (!item.roleCode || tenantSession.hasRole(item.roleCode)),
  ),
);

const searchResults = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  if (!needle) return searchIndex.value.slice(0, 5);
  return searchIndex.value
    .filter((item) =>
      `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(needle),
    )
    .slice(0, 7);
});

function tenantLink(labelKey, descriptionKey, icon, to, moduleKey, keywords, roleCode = null) {
  return {
    label: t(labelKey),
    description: t(descriptionKey),
    icon,
    to,
    moduleKey,
    roleCode,
    keywords,
  };
}

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

async function logout() {
  await tenantSession.logout();
  router.push("/auth/login");
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

watch(searchQuery, (value) => {
  searchOpen.value = value.trim().length > 0;
});
</script>

<style scoped lang="scss">
.header-premium {
  background: var(--eg-header, color-mix(in srgb, var(--color-surface-strong) 88%, transparent));
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--eg-border, var(--color-border-subtle));
  color: var(--eg-text, var(--color-text-primary));
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
  height: 76px;
  padding: 0 var(--space-8);

  @media (max-width: 600px) {
    gap: var(--space-2);
    padding: 0 var(--space-4);
  }
}

.menu-toggle,
.action-btn {
  color: var(--eg-muted, var(--color-text-secondary));
  transition: var(--transition-fast);

  &:hover {
    background: var(--eg-primary-soft, rgba(79, 70, 229, 0.08));
    color: var(--eg-primary, var(--color-primary));
  }
}

.brand-section,
.user-label {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.brand-section {
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-3);
}

.brand-icon {
  color: var(--eg-primary, var(--color-primary));
  filter: drop-shadow(0 8px 18px rgba(36, 21, 242, 0.2));
}

.brand-name {
  color: var(--eg-text, var(--color-text-primary));
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
    border: 1px solid var(--eg-border, var(--color-border-subtle));
    border-radius: var(--radius-full);
    color: var(--eg-text, var(--color-text-primary));
    transition: var(--transition-color);
  }

  :deep(.q-field__control:hover) {
    border-color: var(--color-border-default);
  }
}

.separator-header {
  background: var(--eg-border, var(--color-border-subtle));
  height: 24px;
}

.actions-group {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.tenant-user-menu {
  color: var(--eg-text, var(--color-text-primary));
}

.user-copy {
  display: grid;
  gap: 2px;
  max-width: 180px;
  text-align: left;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--eg-text, var(--color-text-primary));
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--eg-muted, var(--color-text-tertiary));
    font-size: 11px;
  }
}

.tenant-menu-list,
.search-list-premium {
  min-width: 300px;
  padding: var(--space-1) !important;
}

.search-item-premium {
  border-radius: var(--radius-lg);
  margin-bottom: 2px;
  padding: var(--space-3) !important;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(36, 21, 242, 0.05);

    .result-chevron {
      opacity: 1;
      transform: translateX(2px);
    }
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

.menu-header-label {
  color: var(--color-text-tertiary) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase;
}

.menu-empty-premium {
  padding: var(--space-8) var(--space-4) !important;
  text-align: center;
}

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

.status-bar {
  height: 2px !important;
}

.hide-on-mobile {
  @media (max-width: 768px) {
    display: none !important;
  }
}

.hide-on-small {
  @media (max-width: 600px) {
    display: none !important;
  }
}
</style>
