<template>
  <q-page class="page-shell-premium tenant-dashboard">
    <div class="page-header">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="dashboard" size="18px" />
          {{ t("tenant.layout.nav_dashboard") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.dashboard.title") }}</h1>
        <p class="text-page-subtitle">
          {{ t("tenant.dashboard.context", { name: context?.tenantName || t("tenant.dashboard.no_context") }) }}
          <router-link v-if="activePeriod" to="/tenant/periods" class="active-period-badge" style="text-decoration: none; cursor: pointer;">
            &bull; {{ activePeriod.name }}
          </router-link>
        </p>
      </div>
      <div class="header-actions">
        <q-btn
          v-if="tenantSession.hasMultipleContexts"
          outline
          color="primary"
          icon="swap_horiz"
          :label="t('tenant.layout.change_context')"
          no-caps
          to="/auth/tenant-context"
        />
      </div>
    </div>

    <div class="tenant-grid">
      <article class="tenant-metric-card dashboard-metric tone-1" @click="$router.push('/tenant/students')">
        <div>
          <span>{{ t("tenant.dashboard.students") }}</span>
          <strong>{{ overview.students }}</strong>
        </div>
        <div class="metric-icon">
          <q-icon name="school" size="24px" />
        </div>
      </article>

      <article class="tenant-metric-card dashboard-metric tone-2" @click="$router.push('/tenant/classes')">
        <div>
          <span>{{ t("tenant.dashboard.classes") }}</span>
          <strong>{{ overview.classes }}</strong>
        </div>
        <div class="metric-icon">
          <q-icon name="groups" size="24px" />
        </div>
      </article>

      <article class="tenant-metric-card dashboard-metric tone-3" @click="$router.push('/tenant/courses')">
        <div>
          <span>{{ t("tenant.dashboard.courses") }}</span>
          <strong>{{ overview.subjects }}</strong>
        </div>
        <div class="metric-icon">
          <q-icon name="menu_book" size="24px" />
        </div>
      </article>
      
      <article class="tenant-metric-card dashboard-metric tone-4" @click="$router.push('/tenant/teachers')">
        <div>
          <span>{{ t("tenant.layout.nav_teachers") }}</span>
          <strong>{{ overview.teachers || 0 }}</strong>
        </div>
        <div class="metric-icon">
          <q-icon name="co_present" size="24px" />
        </div>
      </article>
    </div>

    <!-- Acciones Rápidas -->
    <q-card class="card-saas quick-actions-panel">
      <q-card-section>
        <h3 class="panel-title">{{ t("tenant.dashboard.actions.title") }}</h3>
        <div class="actions-row">
          <q-btn v-if="tenantSession.hasModule('CLASSES')" outline color="primary" icon="add_box" :label="t('tenant.dashboard.actions.create_class')" no-caps to="/tenant/classes?action=create" />
          <q-btn v-if="tenantSession.hasModule('STUDENTS')" color="primary" icon="person_add" :label="t('tenant.dashboard.actions.create_student')" no-caps unelevated to="/tenant/students?action=create" />
          <q-btn v-if="tenantSession.hasModule('TENANT_ADMIN')" outline color="secondary" icon="group_add" :label="t('tenant.dashboard.actions.link_guardian')" no-caps to="/tenant/students" />
          <q-btn v-if="tenantSession.hasModule('TEACHER_ASSIGNMENTS')" outline color="primary" icon="assignment_ind" :label="t('tenant.dashboard.actions.create_teacher')" no-caps to="/tenant/teacher-assignments" />
        </div>
      </q-card-section>
    </q-card>
 
    <!-- Actividad Reciente -->
    <section class="recent-activity-section">
      <h3 class="section-title">{{ t("tenant.dashboard.activity.title") }}</h3>
      <q-card class="card-saas activity-card">
        <q-list v-if="recentActivity.length > 0" class="activity-list" separator>
          <q-item v-for="event in recentActivity" :key="event.history_event_id" class="activity-item">
            <q-item-section avatar>
              <q-avatar :color="getEventColor(event.event_type)" text-color="white" :icon="getEventIcon(event.event_type)" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="event-title">{{ formatEventTitle(event) }}</q-item-label>
              <q-item-label caption class="event-date">{{ formatDate(event.occurred_at) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="empty-state">
          <q-icon name="history" size="40px" color="grey-4" />
          <p>{{ t("tenant.no_history") }}</p>
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { getTenantOverview, getTenantPeriods, getTenantAcademicHistory } from "src/utils/api/get";
import { date } from "quasar";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();
const context = computed(() => tenantSession.activeContext);

const overview = ref({ classes: 0, students: 0, subjects: 0, teachers: 0 });
const activePeriod = ref(null);
const recentActivity = ref([]);

function formatDate(isoString) {
  return date.formatDate(isoString, "DD MMM YYYY, HH:mm");
}

function getEventColor(type) {
  if (type.includes("student")) return "info";
  if (type.includes("teacher")) return "warning";
  if (type.includes("class")) return "primary";
  return "grey-7";
}

function getEventIcon(type) {
  if (type === "student_created") return "person_add";
  if (type === "student_moved") return "transfer_within_a_station";
  if (type === "student_subjects_assigned") return "menu_book";
  if (type === "teacher_assigned") return "co_present";
  return "history";
}

function formatEventTitle(event) {
  const type = event.event_type;
  if (type === "student_created") return "Nuevo alumno matriculado";
  if (type === "student_moved") return "Alumno cambiado de clase";
  if (type === "student_subjects_assigned") return "Asignaturas actualizadas para alumno";
  if (type === "teacher_assigned") return "Profesor asignado a clase";
  return type;
}

onMounted(async () => {
  try {
    const [overviewRes, periodsRes, historyRes] = await Promise.all([
      getTenantOverview(),
      getTenantPeriods().catch(() => ({ data: { data: [] } })),
      tenantSession.hasPermission("academic_history.read") ? getTenantAcademicHistory() : Promise.resolve({ data: { data: [] } })
    ]);
    
    overview.value = overviewRes.data.data;
    
    const periods = periodsRes.data?.data || [];
    activePeriod.value = periods.find(p => p.status === "active") || null;

    recentActivity.value = (historyRes.data?.data || []).slice(0, 8); // Top 8 events
  } catch {
    overview.value = { classes: 0, students: 0, subjects: 0, teachers: 0 };
  }
});
</script>

<style scoped lang="scss">
.tenant-dashboard,
.page-header {
  display: grid;
  gap: var(--space-5);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.section-kicker {
  align-items: center;
  color: var(--eg-primary);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  gap: var(--space-2);
  text-transform: uppercase;
}

.active-period-badge {
  color: var(--eg-primary);
  font-weight: var(--font-weight-bold);
}

.tenant-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.dashboard-metric {
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  min-height: 104px;
  padding: var(--space-5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  span {
    color: var(--eg-muted);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }

  strong {
    color: var(--eg-text);
    display: block;
    font-size: 2.2rem;
    font-weight: var(--font-weight-extrabold);
    margin-top: var(--space-1);
    line-height: 1;
  }
}

.metric-icon {
  align-items: center;
  border-radius: 16px;
  display: flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.tone-1 .metric-icon { background: var(--tenant-blue-card); color: white; }
.tone-2 .metric-icon { background: var(--tenant-pink-card); color: white; }
.tone-3 .metric-icon { background: var(--tenant-cyan-card); color: white; }
.tone-4 .metric-icon { background: var(--tenant-dark-card); color: white; }

.quick-actions-panel {
  border: 1px solid var(--eg-border-soft);
  margin-top: var(--space-2);
}

.panel-title {
  font-size: 1.1rem;
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--space-4) 0;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.recent-activity-section {
  margin-top: var(--space-2);
}

.section-title {
  font-size: 1.3rem;
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--space-4) 0;
}

.activity-card {
  border: 1px solid var(--eg-border-soft);
  overflow: hidden;
}

.activity-list {
  padding: 0;
}

.activity-item {
  padding: var(--space-3) var(--space-4);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0,0,0,0.01);
  }
}

.event-title {
  font-weight: var(--font-weight-bold);
  font-size: 0.95rem;
  color: var(--eg-text);
}

.event-date {
  color: var(--eg-muted);
  font-weight: var(--font-weight-medium);
}

.empty-state {
  align-items: center;
  color: var(--eg-muted);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
}

@media (max-width: 700px) {
  .page-header {
    grid-template-columns: 1fr;
  }
}
</style>
