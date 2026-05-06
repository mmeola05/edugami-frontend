<template>
  <q-page class="page-shell-premium teachers-page">
    <section class="tenant-page-head teachers-head">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="group" size="18px" />
          {{ t("tenant.layout.group_academic") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.teachers.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.teachers.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions head-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search"
          :placeholder="t('tenant.modules.search_placeholder')"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
        <q-btn
          v-if="canCreate"
          color="primary"
          icon="add"
          :label="t('tenant.admin.new_user')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="teacher-summary-grid">
      <article class="tenant-metric-card hero-metric">
        <div>
          <span>{{ t("tenant.modules.teachers.active_teachers") }}</span>
          <strong>{{ activeTeachers.length }}</strong>
          <p>{{ t("tenant.modules.teachers.total_teachers", { count: teachers.length }) }}</p>
        </div>
        <div class="hero-icon">
          <q-icon name="group" size="32px" />
        </div>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="assignment" size="22px" />
        <span>{{ t("tenant.modules.teachers.total_load") }}</span>
        <strong>{{ totalAssignments }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric accent">
        <q-icon name="person_off" size="22px" />
        <span>{{ t("tenant.modules.teachers.no_load") }}</span>
        <strong>{{ teachersWithoutLoad.length }}</strong>
      </article>
    </section>

    <section class="teachers-workspace tenant-workspace-card">
      <div class="filter-bar">
        <q-tabs
          v-model="statusFilter"
          dense
          inline-label
          active-color="primary"
          indicator-color="primary"
          class="teacher-tabs"
        >
          <q-tab name="all" icon="grid_view" :label="t('common.all')" />
          <q-tab name="active" icon="verified" :label="t('common.active')" />
          <q-tab name="suspended" icon="pause_circle" :label="t('tenant.modules.status.suspended')" />
        </q-tabs>
      </div>

      <div v-if="loading" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredTeachers.length" class="teacher-grid">
        <article
          v-for="teacher in filteredTeachers"
          :key="teacher.id"
          class="teacher-card"
          :class="teacherTone(teacher)"
        >
          <div class="teacher-card-hero">
            <div class="teacher-avatar">
              {{ teacher.initials }}
            </div>
            <div class="teacher-status">
              <q-badge :color="teacher.status === 'active' ? 'positive' : 'warning'" text-color="white">
                {{ teacher.status === 'active' ? t("common.active") : t("tenant.modules.status.suspended") }}
              </q-badge>
            </div>
          </div>
          
          <div class="teacher-card-content">
            <h3 class="ellipsis">{{ teacher.displayName || teacher.email }}</h3>
            <p class="ellipsis">{{ teacher.email }}</p>
            
            <div class="teacher-load">
              <div class="load-stat">
                <strong>{{ teacher.classCount }}</strong>
                <span>{{ t("tenant.modules.teachers.classes_assigned") }}</span>
              </div>
              <div class="load-stat">
                <strong>{{ teacher.subjectCount }}</strong>
                <span>{{ t("tenant.modules.teachers.subjects_assigned") }}</span>
              </div>
            </div>
          </div>

          <div class="teacher-card-actions">
            <q-btn flat round dense icon="visibility" color="primary" @click="openDetail(teacher)">
              <q-tooltip>{{ t("tenant.modules.view_detail") }}</q-tooltip>
            </q-btn>
            <q-btn v-if="canUpdate" flat round dense icon="edit" @click="openEdit(teacher)">
              <q-tooltip>{{ t("common.edit") }}</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>

      <div v-else class="state-box">
        <q-icon name="group" color="primary" size="42px" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.teachers.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.teachers.empty_text") }}</span>
      </div>
    </section>

    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="teacher-detail-drawer"
    >
      <div v-if="selectedTeacher" class="detail-shell">
        <div class="detail-hero" :class="teacherTone(selectedTeacher)">
          <q-btn flat round dense icon="close" class="detail-close" @click="detailOpen = false" />
          <div class="teacher-avatar detail-avatar">{{ selectedTeacher.initials }}</div>
          <h2>{{ selectedTeacher.displayName || selectedTeacher.email }}</h2>
          <p>{{ selectedTeacher.email }}</p>
          <q-badge :color="selectedTeacher.status === 'active' ? 'positive' : 'warning'" text-color="white" class="q-mt-sm">
            {{ selectedTeacher.status === 'active' ? t("common.active") : t("tenant.modules.status.suspended") }}
          </q-badge>
          
          <q-tabs
            v-model="detailTab"
            dense
            class="detail-tabs"
            active-color="white"
            indicator-color="white"
            align="justify"
            narrow-indicator
            no-caps
          >
            <q-tab name="overview" :label="t('common.overview')" />
            <q-tab name="history" :label="t('common.history')" />
          </q-tabs>
        </div>

        <q-tab-panels v-model="detailTab" animated class="detail-panels">
          <q-tab-panel name="overview" class="detail-content">
            <div class="detail-actions">
              <q-btn v-if="canUpdate" color="primary" icon="edit" :label="t('common.edit')" no-caps unelevated @click="openEdit(selectedTeacher)" />
            </div>

            <section class="detail-block">
              <h3>{{ t("tenant.modules.teachers.total_load") }}</h3>
              <div class="load-detail-grid">
                <div class="load-item">
                  <strong>{{ selectedTeacher.classCount }}</strong>
                  <span>{{ t("tenant.modules.teachers.classes_assigned") }}</span>
                </div>
                <div class="load-item">
                  <strong>{{ selectedTeacher.subjectCount }}</strong>
                  <span>{{ t("tenant.modules.teachers.subjects_assigned") }}</span>
                </div>
                <div class="load-item">
                  <strong>{{ selectedTeacher.assignments.length }}</strong>
                  <span>{{ t("tenant.modules.assignments.active_assignments") }}</span>
                </div>
              </div>
            </section>

            <section class="detail-block" v-if="selectedTeacher.assignments.length">
              <h3>{{ t("tenant.layout.nav_assignments") }}</h3>
              <div class="assignment-compact-list">
                <div class="assignment-compact-item" v-for="a in selectedTeacher.assignments" :key="a.id">
                  <q-icon name="co_present" size="16px" color="primary" />
                  <div class="assignment-compact-text">
                    <strong>{{ a.subjectName || '-' }}</strong>
                    <span>{{ a.className || '-' }} &bull; {{ t("tenant.modules.assignments.role_" + a.assignmentRole) }}</span>
                  </div>
                </div>
              </div>
            </section>
          </q-tab-panel>

          <q-tab-panel name="history" class="detail-content">
            <div v-if="teacherHistoryLoading" class="flex flex-center q-pa-lg">
              <q-spinner-dots color="primary" size="40px" />
            </div>
            <div v-else-if="teacherHistory.length" class="history-timeline">
              <q-timeline color="primary">
                <q-timeline-entry
                  v-for="event in teacherHistory"
                  :key="event.history_event_id"
                  :title="formatEventTitle(event)"
                  :subtitle="formatDate(event.occurred_at)"
                  :icon="getEventIcon(event.event_type)"
                  :color="getEventColor(event.event_type)"
                >
                  <div class="event-details">
                    <p v-if="event.class_name"><strong>{{ t('tenant.modules.students.class') }}:</strong> {{ event.class_name }}</p>
                    <p v-if="event.subject_name"><strong>{{ t('tenant.modules.students.subjects') }}:</strong> {{ event.subject_name }}</p>
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </div>
            <div v-else class="empty-state">
              <q-icon name="history" size="48px" color="grey-4" />
              <p>{{ t("common.no_history") }}</p>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-drawer>

    <q-drawer
      v-model="editorOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer teacher-editor-drawer"
    >
      <aside class="tenant-editor-shell editor-shell">
        <div class="tenant-editor-head editor-head">
          <div class="tenant-editor-icon editor-icon">
            <q-icon name="person" size="24px" />
          </div>
          <div>
            <h2>{{ editingTeacher ? t("common.edit") : t("tenant.admin.new_user") }}</h2>
            <p>{{ t("tenant.admin.dialog_subtitle") }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="tenant-editor-form teacher-form" @submit.prevent="submitTeacher">
          <q-input
            v-model="form.displayName"
            :label="t('tenant.admin.display_name')"
            outlined
            dense
            :rules="[(val) => Boolean(val) || t('common.required')]"
          />
          <q-input
            v-model="form.email"
            :label="t('tenant.admin.email')"
            outlined
            dense
            :disable="!!editingTeacher"
            :rules="[(val) => Boolean(val) || t('common.required')]"
          />
          <q-input
            v-if="!editingTeacher"
            v-model="form.password"
            :label="t('tenant.admin.password')"
            type="password"
            outlined
            dense
            :rules="[(val) => (val && val.length >= 8) || t('rules.min_length', { len: 8 })]"
          />
          
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('tenant.admin.status')"
            outlined
            dense
            emit-value
            map-options
          />
        </q-form>

        <div class="tenant-editor-actions editor-actions">
          <q-btn flat :label="t('common.cancel')" no-caps @click="editorOpen = false" />
          <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated @click="submitTeacher" />
        </div>
      </aside>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { getTenantTeachers, getTenantTeacherAssignments, getTenantAcademicHistory } from "src/utils/api/get";
import { createTenantAdminUser } from "src/utils/api/post";
import { updateTenantAdminUser } from "src/utils/api/patch";
import { date } from "quasar";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const editorOpen = ref(false);
const detailOpen = ref(false);
const detailTab = ref("overview");
const route = useRoute();
const editingTeacher = ref(null);
const selectedTeacher = ref(null);
const teacherHistory = ref([]);
const teacherHistoryLoading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("all");

const teachers = ref([]);
const assignments = ref([]);

const form = reactive({
  email: "",
  password: "",
  displayName: "",
  status: "active",
});

const canCreate = computed(() => tenantSession.hasPermission("tenant_users.manage"));
const canUpdate = computed(() => tenantSession.hasPermission("tenant_users.manage"));

const activeTeachers = computed(() => teachers.value.filter((item) => item.status === "active"));
const teachersWithoutLoad = computed(() => activeTeachers.value.filter((item) => item.assignments.length === 0));
const totalAssignments = computed(() => assignments.value.filter(a => a.status === 'active').length);

const statusOptions = computed(() => [
  { label: t("common.active"), value: "active" },
  { label: t("tenant.modules.status.suspended"), value: "suspended" },
]);

const filteredTeachers = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  return teachers.value.filter((item) => {
    const matchesStatus = statusFilter.value === "all" || item.status === statusFilter.value;
    const haystack = `${item.displayName} ${item.email}`.toLowerCase();
    
    return matchesStatus && (!needle || haystack.includes(needle));
  });
});

function getInitials(name, email) {
  const source = name || email || "?";
  const parts = source.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.substring(0, 2).toUpperCase();
}

function normalizeAssignment(a) {
  return {
    id: a.assignment_id || a.id,
    teacherUserId: a.teacher_user_id || a.teacherUserId,
    classId: a.class_id || a.classId,
    className: a.class_name || a.className,
    subjectId: a.subject_id || a.subjectId,
    subjectName: a.subject_name || a.subjectName,
    assignmentRole: a.assignment_role || a.assignmentRole || "lead",
    status: a.status || "active",
  };
}

function normalizeTeacher(item, allAssignments) {
  const teacherId = item.user_id || item.id;
  const teacherAssignments = allAssignments.filter(
    (a) => a.teacherUserId === teacherId && a.status === 'active'
  );

  const uniqueClasses = new Set(teacherAssignments.map(a => a.classId).filter(Boolean));
  const uniqueSubjects = new Set(teacherAssignments.map(a => a.subjectId).filter(Boolean));

  return {
    id: teacherId,
    email: item.email,
    displayName: item.display_name || item.displayName || "",
    status: item.status || "active",
    initials: getInitials(item.display_name || item.displayName, item.email),
    assignments: teacherAssignments,
    classCount: uniqueClasses.size,
    subjectCount: uniqueSubjects.size,
  };
}

function teacherTone(teacher) {
  const seed = `${teacher.id}`;
  const index = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return `tone-${index + 1}`;
}

function resetForm() {
  form.email = "";
  form.password = "";
  form.displayName = "";
  form.status = "active";
}

function openCreate() {
  editingTeacher.value = null;
  detailOpen.value = false;
  resetForm();
  editorOpen.value = true;
}

function openEdit(teacher) {
  editingTeacher.value = teacher;
  detailOpen.value = false;
  
  form.email = teacher.email;
  form.displayName = teacher.displayName;
  form.status = teacher.status;
  form.password = ""; // Not editable here directly
  
  editorOpen.value = true;
}

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
  if (type === "student_created") return t("tenant.history.student_created") || "Nuevo alumno matriculado";
  if (type === "student_moved") return t("tenant.history.student_moved") || "Alumno cambiado de clase";
  if (type === "student_subjects_assigned") return t("tenant.history.student_subjects_assigned") || "Asignaturas actualizadas";
  if (type === "teacher_assigned") return t("tenant.history.teacher_assigned") || "Profesor asignado";
  return type;
}

async function openDetail(teacher) {
  selectedTeacher.value = teacher;
  teacherHistory.value = [];
  teacherHistoryLoading.value = true;
  detailOpen.value = true;
  detailTab.value = "overview";

  if (tenantSession.hasPermission("academic_history.read")) {
    try {
      const res = await getTenantAcademicHistory({ teacherUserId: teacher.id });
      teacherHistory.value = res.data?.data || [];
    } catch {
      teacherHistory.value = [];
    }
  }
  teacherHistoryLoading.value = false;
}

function payload() {
  const data = {
    displayName: form.displayName,
    status: form.status,
  };
  
  if (!editingTeacher.value) {
    data.email = form.email;
    data.password = form.password;
    data.roleCodes = ["TEACHER"];
  }
  
  return data;
}

async function loadData() {
  loading.value = true;
  try {
    const [teachersRes, assignmentsRes] = await Promise.all([
      getTenantTeachers(),
      tenantSession.hasPermission("teacher_assignments.read") ? getTenantTeacherAssignments() : Promise.resolve({ data: { data: [] } }),
    ]);
    
    assignments.value = (assignmentsRes.data.data || []).map(normalizeAssignment);
    teachers.value = (teachersRes.data.data || []).map(t => normalizeTeacher(t, assignments.value));

  } finally {
    loading.value = false;
  }
}

async function submitTeacher() {
  saving.value = true;
  try {
    if (editingTeacher.value) {
      await updateTenantAdminUser(editingTeacher.value.id, payload());
    } else {
      await createTenantAdminUser(payload());
    }
    editorOpen.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await loadData();
  if (route.query.action === "create" && canCreate.value) {
    openCreate();
  }
});
</script>

<style scoped lang="scss">
.teachers-page {
  display: grid;
  gap: var(--space-5);
}

.teachers-head {
  align-items: center;
  display: grid;
  gap: var(--space-4);
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

.head-actions {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.teacher-search {
  min-width: min(340px, 40vw);
}

.teacher-summary-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(300px, 1.25fr) repeat(2, minmax(170px, 0.7fr));
}

.hero-metric {
  align-items: center;
  background:
    radial-gradient(circle at 86% 18%, rgba(16, 169, 118, 0.18), transparent 32%),
    var(--eg-surface);
  display: flex;
  justify-content: space-between;
  min-height: 118px;

  span,
  p {
    color: var(--eg-muted);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--eg-text);
    display: block;
    font-size: 2rem;
    font-weight: var(--font-weight-extrabold);
    margin-block: var(--space-1);
  }
}

.hero-icon {
  align-items: center;
  background: linear-gradient(135deg, var(--eg-primary), #10a976);
  border-radius: 24px;
  color: #fff;
  display: flex;
  height: 64px;
  justify-content: center;
  width: 64px;
}

.compact-metric {
  align-content: center;
  display: grid;
  gap: var(--space-2);
  min-height: 118px;

  .q-icon {
    color: var(--eg-primary);
  }

  span {
    color: var(--eg-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-extrabold);
    text-transform: uppercase;
  }

  strong {
    color: var(--eg-text);
    font-size: 1.55rem;
    font-weight: var(--font-weight-extrabold);
  }

  &.accent .q-icon {
    color: #cf3f8e;
  }
  
  &.accent strong {
    color: #cf3f8e;
  }
}

.teachers-workspace {
  overflow: hidden;
}

.filter-bar {
  align-items: center;
  border-bottom: 1px solid var(--eg-border-soft);
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  min-height: 62px;
  padding: var(--space-2) var(--space-4);
  flex-wrap: wrap;
}

.teacher-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  max-height: calc(100vh - 360px);
  min-height: 260px;
  overflow: auto;
  padding: var(--space-4);
}

.teacher-card {
  background: var(--eg-surface);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out),
    transform 160ms var(--ease-out);

  &:hover {
    border-color: var(--eg-border);
    box-shadow: var(--eg-shadow-md);
    transform: translateY(-2px);
  }
}

.teacher-card-hero {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) 0;
}

.teacher-avatar {
  align-items: center;
  background: var(--tenant-blue-card);
  border-radius: 20px;
  color: #fff;
  display: flex;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-extrabold);
  height: 56px;
  justify-content: center;
  width: 56px;
}

.tone-2 .teacher-avatar,
.tone-2.detail-hero {
  background: var(--tenant-cyan-card);
}

.tone-3 .teacher-avatar,
.tone-3.detail-hero {
  background: var(--tenant-pink-card);
}

.tone-4 .teacher-avatar,
.tone-4.detail-hero {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.tone-5 .teacher-avatar,
.tone-5.detail-hero {
  background: var(--tenant-dark-card);
}

.teacher-card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: var(--space-4);

  h3 {
    color: var(--eg-text);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
    margin: 0 0 2px;
  }

  p {
    color: var(--eg-muted);
    font-size: var(--font-size-sm);
    margin: 0 0 var(--space-4);
  }
}

.teacher-load {
  display: flex;
  gap: var(--space-4);
  margin-top: auto;
  border-top: 1px dashed var(--eg-border-soft);
  padding-top: var(--space-3);
}

.load-stat {
  display: flex;
  flex-direction: column;
  
  strong {
    color: var(--eg-text);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-extrabold);
  }
  
  span {
    color: var(--eg-muted);
    font-size: 0.65rem;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }
}

.teacher-card-actions {
  border-top: 1px solid var(--eg-border-soft);
  display: flex;
  gap: var(--space-1);
  justify-content: flex-end;
  padding: var(--space-2) var(--space-3);
  background: rgba(0,0,0,0.015);
}

.state-box {
  align-items: center;
  color: var(--eg-muted);
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  min-height: 260px;
  padding: var(--space-6);
  text-align: center;

  strong {
    color: var(--eg-text);
  }
}

.teacher-detail-drawer {
  background: var(--eg-surface);
}

.detail-shell {
  min-height: 100%;
}

.detail-hero {
  align-items: center;
  color: #fff;
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  min-height: 210px;
  padding: var(--space-6) var(--space-5) var(--space-5);
  position: relative;
  text-align: center;

  .detail-avatar {
    height: 72px;
    width: 72px;
    margin-bottom: var(--space-2);
    font-size: var(--font-size-xl);
  }

  h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
    margin-bottom: var(--space-1);
  }

  p {
    opacity: 0.82;
    margin-bottom: var(--space-4);
  }
}

.detail-tabs {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.detail-panels {
  background: transparent;
}

.detail-avatar {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.24);
  height: 64px;
  width: 64px;
}

.detail-close {
  color: #fff;
  position: absolute;
  right: var(--space-4);
  top: var(--space-4);
}

.detail-content {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.detail-actions {
  display: grid;
  gap: var(--space-2);
}

.detail-block {
  background: var(--eg-surface-soft);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-md);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);

  h3 {
    color: var(--eg-text);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-extrabold);
    text-transform: none;
    margin-bottom: 0;
  }

  p {
    color: var(--eg-muted);
    font-size: var(--font-size-xs);
  }
}

.history-timeline {
  padding-left: var(--space-2);
}

.event-details {
  font-size: var(--font-size-xs);
  color: var(--eg-muted);
  
  p {
    margin: 2px 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--eg-muted);
  text-align: center;
  
  p {
    margin-top: var(--space-4);
  }
}

.load-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  background: var(--eg-surface-soft);
  border-radius: var(--tenant-radius-md);
  padding: var(--space-3);
  
  .load-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    strong {
      color: var(--eg-text);
      font-size: 1.2rem;
      font-weight: var(--font-weight-extrabold);
    }
    
    span {
      color: var(--eg-muted);
      font-size: 0.65rem;
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      line-height: 1.2;
    }
  }
}

.assignment-compact-list {
  display: grid;
  gap: var(--space-3);
}

.assignment-compact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  background: var(--eg-surface-soft);
  padding: var(--space-3);
  border-radius: var(--tenant-radius-sm);
  
  .q-icon {
    margin-top: 2px;
  }
  
  .assignment-compact-text {
    display: flex;
    flex-direction: column;
    
    strong {
      color: var(--eg-text);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
    }
    
    span {
      color: var(--eg-muted);
      font-size: var(--font-size-xs);
    }
  }
}

.editor-shell {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

.editor-head {
  align-items: center;
  border-bottom: 1px solid var(--eg-border-soft);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto 1fr auto;
  padding: var(--space-4) var(--space-5);

  h2 {
    color: var(--eg-text);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    color: var(--eg-muted);
    font-size: var(--font-size-sm);
  }
}

.editor-icon {
  align-items: center;
  background: var(--eg-surface-soft);
  border-radius: var(--tenant-radius-sm);
  color: var(--eg-primary);
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.teacher-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow: auto;
  padding: var(--space-5);
}

.editor-actions {
  background: var(--eg-surface);
  border-top: 1px solid var(--eg-border-soft);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding: var(--space-4) var(--space-5);
}
</style>
