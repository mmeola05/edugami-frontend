<template>
  <q-page class="page-shell-premium assignments-page">
    <section class="tenant-page-head assignments-head">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="co_present" size="18px" />
          {{ t("tenant.layout.group_academic") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.assignments.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.assignments.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions head-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search assignment-search"
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
          :label="t('tenant.modules.assignments.create')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="assignment-summary-grid">
      <article class="tenant-metric-card hero-metric">
        <div>
          <span>{{ t("tenant.modules.assignments.active_assignments") }}</span>
          <strong>{{ activeAssignments.length }}</strong>
          <p>{{ t("tenant.modules.assignments.total_assignments", { count: assignments.length }) }}</p>
        </div>
        <div class="hero-icon">
          <q-icon name="co_present" size="32px" />
        </div>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="person" size="22px" />
        <span>{{ t("tenant.modules.assignments.teachers_with_load") }}</span>
        <strong>{{ totalTeachersWithLoad }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="meeting_room" size="22px" />
        <span>{{ t("tenant.modules.assignments.classes_covered") }}</span>
        <strong>{{ totalClassesCovered }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric accent">
        <q-icon name="warning" size="22px" />
        <span>{{ t("tenant.modules.assignments.conflicts") }}</span>
        <strong>{{ conflicts.length }}</strong>
      </article>
    </section>

    <section class="assignments-workspace tenant-workspace-card">
      <div class="filter-bar">
        <q-tabs
          v-model="statusFilter"
          dense
          inline-label
          active-color="primary"
          indicator-color="primary"
          class="assignment-tabs"
        >
          <q-tab name="all" icon="grid_view" :label="t('common.all')" />
          <q-tab name="active" icon="verified" :label="t('common.active')" />
          <q-tab name="completed" icon="task_alt" :label="t('tenant.modules.status.completed')" />
          <q-tab name="suspended" icon="pause_circle" :label="t('tenant.modules.status.suspended')" />
        </q-tabs>

        <div class="filter-actions">
          <q-select
            v-model="teacherFilter"
            :options="teacherFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="teacher-filter"
          />
          <q-select
            v-model="classFilter"
            :options="classFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="class-filter"
          />
        </div>
      </div>

      <div v-if="loading" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredAssignments.length" class="assignment-list">
        <article
          v-for="assignment in filteredAssignments"
          :key="assignment.id"
          class="assignment-row"
          :class="[assignmentTone(assignment), { 'has-conflict': assignment.conflict }]"
        >
          <button class="assignment-main" type="button" @click="openDetail(assignment)">
            <div class="assignment-avatar">
              <q-icon name="co_present" size="20px" />
            </div>
            <div class="assignment-copy">
              <div class="assignment-title-line">
                <strong>{{ assignment.teacherName }}</strong>
                <q-badge :color="statusColor(assignment.status)" text-color="white">
                  {{ statusLabel(assignment.status) }}
                </q-badge>
                <q-badge v-if="assignment.conflict" color="negative" text-color="white">
                  {{ assignment.conflictText }}
                </q-badge>
              </div>
              <p>
                <span class="assignment-role" :class="'role-' + assignment.assignmentRole">{{ roleLabel(assignment.assignmentRole) }}</span>
                &bull;
                <span>{{ assignment.className || '-' }}</span>
                &bull;
                <span>{{ assignment.subjectName || '-' }}</span>
              </p>
            </div>
          </button>

          <div class="assignment-actions">
            <q-btn flat round dense icon="visibility" @click="openDetail(assignment)">
              <q-tooltip>{{ t("tenant.modules.view_detail") }}</q-tooltip>
            </q-btn>
            <q-btn v-if="canUpdate" flat round dense icon="edit" @click="openEdit(assignment)">
              <q-tooltip>{{ t("common.edit") }}</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>

      <div v-else class="state-box">
        <q-icon name="co_present" color="primary" size="42px" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.assignments.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.assignments.empty_text") }}</span>
      </div>
    </section>

    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="assignment-detail-drawer"
    >
      <div v-if="selectedAssignment" class="detail-shell">
        <div class="detail-hero" :class="assignmentTone(selectedAssignment)">
          <q-btn flat round dense icon="close" class="detail-close" @click="detailOpen = false" />
          <div class="assignment-avatar detail-avatar"><q-icon name="co_present" size="32px"/></div>
          <h2>{{ selectedAssignment.teacherName }}</h2>
          <p>{{ roleLabel(selectedAssignment.assignmentRole) }}</p>
          <q-badge v-if="selectedAssignment.conflict" color="negative" text-color="white" class="q-mt-sm">
            {{ selectedAssignment.conflictText }}
          </q-badge>
        </div>

        <div class="detail-content">
          <div class="detail-actions">
            <q-btn v-if="canUpdate" color="primary" icon="edit" :label="t('common.edit')" no-caps unelevated @click="openEdit(selectedAssignment)" />
          </div>

          <section class="detail-block">
            <h3>{{ t("tenant.modules.assignments.class") }}</h3>
            <p>{{ selectedAssignment.className || '-' }}</p>
          </section>

          <section class="detail-block">
            <h3>{{ t("tenant.modules.assignments.subject") }}</h3>
            <p>{{ selectedAssignment.subjectName || '-' }}</p>
          </section>

          <section class="detail-block" v-if="selectedAssignment.startsAt || selectedAssignment.endsAt">
            <h3>{{ t("tenant.modules.fields.period") }}</h3>
            <p>
              {{ selectedAssignment.startsAt || '?' }} 
              &rarr; 
              {{ selectedAssignment.endsAt || '?' }}
            </p>
          </section>
        </div>
      </div>
    </q-drawer>

    <q-drawer
      v-model="editorOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer assignment-editor-drawer"
    >
      <aside class="tenant-editor-shell editor-shell">
        <div class="tenant-editor-head editor-head">
          <div class="tenant-editor-icon editor-icon">
            <q-icon name="co_present" size="24px" />
          </div>
          <div>
            <h2>{{ editingAssignment ? t("common.edit") : t("tenant.modules.assignments.create") }}</h2>
            <p>{{ t("tenant.modules.assignments.create_subtitle") }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="tenant-editor-form assignment-form" @submit.prevent="submitAssignment">
          <q-select
            v-model="form.teacherUserId"
            :options="teacherOptions"
            :label="t('tenant.modules.fields.teacher')"
            outlined
            dense
            emit-value
            map-options
            :disable="!!editingAssignment"
            :rules="[(value) => Boolean(value) || t('common.required')]"
          />
          <q-select
            v-model="form.classId"
            :options="classOptions"
            :label="t('tenant.modules.fields.class')"
            outlined
            dense
            emit-value
            map-options
            :disable="!!editingAssignment"
            :rules="[(value) => Boolean(value) || t('common.required')]"
          />
          <q-select
            v-model="form.subjectId"
            :options="subjectOptions"
            :label="t('tenant.modules.fields.subject')"
            outlined
            dense
            emit-value
            map-options
            :disable="!!editingAssignment"
            :rules="[(value) => Boolean(value) || t('common.required')]"
          />
          <q-select
            v-model="form.assignmentRole"
            :options="roleOptions"
            :label="t('tenant.modules.fields.assignment_role')"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('tenant.modules.fields.status')"
            outlined
            dense
            emit-value
            map-options
          />
          
          <AppDateField
            v-model="form.startsAt"
            :label="t('tenant.modules.fields.starts_at')"
          />
          <AppDateField
            v-model="form.endsAt"
            :label="t('tenant.modules.fields.ends_at')"
          />
        </q-form>

        <div class="tenant-editor-actions editor-actions">
          <q-btn flat :label="t('common.cancel')" no-caps @click="editorOpen = false" />
          <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated @click="submitAssignment" />
        </div>
      </aside>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import AppDateField from "src/components/common/AppDateField.vue";
import {
  getTenantClasses,
  getTenantCourses,
  getTenantTeachers,
  getTenantTeacherAssignments
} from "src/utils/api/get";
import { assignTenantTeacher } from "src/utils/api/post";
import { updateTenantTeacherAssignment } from "src/utils/api/patch";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const editorOpen = ref(false);
const detailOpen = ref(false);
const editingAssignment = ref(null);
const selectedAssignment = ref(null);
const searchQuery = ref("");
const statusFilter = ref("all");
const teacherFilter = ref("all");
const classFilter = ref("all");

const assignments = ref([]);
const teachers = ref([]);
const classes = ref([]);
const subjects = ref([]);

const form = reactive({
  teacherUserId: null,
  classId: null,
  subjectId: null,
  assignmentRole: "lead",
  startsAt: "",
  endsAt: "",
  status: "active",
});

const canCreate = computed(() => tenantSession.hasPermission("teacher_assignments.assign") || tenantSession.hasPermission("teacher_assignments.manage"));
const canUpdate = computed(() => tenantSession.hasPermission("teacher_assignments.manage"));

const activeAssignments = computed(() => assignments.value.filter((item) => item.status === "active"));
const conflicts = computed(() => assignments.value.filter((item) => !!item.conflict));

const totalTeachersWithLoad = computed(() => uniqueCount(assignments.value.filter(a => a.status === 'active').map((item) => item.teacherUserId)));
const totalClassesCovered = computed(() => uniqueCount(assignments.value.filter(a => a.status === 'active').map((item) => item.classId)));

const teacherOptions = computed(() => teachers.value.map((item) => ({ label: item.displayName || item.email, value: item.id })));
const classOptions = computed(() => classes.value.map((item) => ({ label: item.name, value: item.id })));
const subjectOptions = computed(() => subjects.value.map((item) => ({ label: item.name, value: item.id })));

const teacherFilterOptions = computed(() => [
  { label: t("common.all") + " " + t("tenant.modules.assignments.teachers_with_load").toLowerCase(), value: "all" },
  ...teacherOptions.value
]);

const classFilterOptions = computed(() => [
  { label: t("common.all") + " " + t("tenant.modules.assignments.classes_covered").toLowerCase(), value: "all" },
  ...classOptions.value
]);

const statusOptions = computed(() => [
  { label: t("tenant.modules.status.planned"), value: "planned" },
  { label: t("common.active"), value: "active" },
  { label: t("tenant.modules.status.completed"), value: "completed" },
  { label: t("tenant.modules.status.suspended"), value: "suspended" },
  { label: t("tenant.modules.status.cancelled"), value: "cancelled" },
]);

const roleOptions = computed(() => [
  { label: t("tenant.modules.assignments.role_lead"), value: "lead" },
  { label: t("tenant.modules.assignments.role_support"), value: "support" },
  { label: t("tenant.modules.assignments.role_substitute"), value: "substitute" },
]);

const filteredAssignments = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  return assignments.value.filter((item) => {
    const matchesStatus = statusFilter.value === "all" || item.status === statusFilter.value;
    const matchesTeacher = teacherFilter.value === "all" || item.teacherUserId === teacherFilter.value;
    const matchesClass = classFilter.value === "all" || item.classId === classFilter.value;
    
    const haystack = `${item.teacherName} ${item.className} ${item.subjectName} ${roleLabel(item.assignmentRole)}`.toLowerCase();
    
    return matchesStatus && matchesTeacher && matchesClass && (!needle || haystack.includes(needle));
  });
});

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function normalizeAssignment(item, classSubjectLeadsMap) {
  const role = item.assignment_role || "lead";
  const status = item.status || "active";
  const key = `${item.class_id}-${item.subject_id}`;
  
  let conflict = null;
  let conflictText = '';

  if (role === 'lead' && status === 'active' && classSubjectLeadsMap[key] > 1) {
    conflict = 'multiple_leads';
    conflictText = t("tenant.modules.assignments.conflict_multiple_leads");
  }

  // Find names if missing from response
  let tName = item.teacher_name;
  if (!tName) {
    const tMatch = teachers.value.find(t => t.id === item.teacher_user_id);
    if (tMatch) tName = tMatch.displayName || tMatch.email;
  }
  
  let cName = item.class_name;
  if (!cName) {
    const cMatch = classes.value.find(c => c.id === item.class_id);
    if (cMatch) cName = cMatch.name;
  }

  let sName = item.subject_name;
  if (!sName) {
    const sMatch = subjects.value.find(s => s.id === item.subject_id);
    if (sMatch) sName = sMatch.name;
  }

  return {
    id: item.assignment_id || item.id,
    teacherUserId: item.teacher_user_id,
    teacherName: tName || '-',
    classId: item.class_id,
    className: cName || '-',
    subjectId: item.subject_id,
    subjectName: sName || '-',
    assignmentRole: role,
    status: status,
    startsAt: item.starts_at ? item.starts_at.substring(0, 10) : "",
    endsAt: item.ends_at ? item.ends_at.substring(0, 10) : "",
    conflict,
    conflictText
  };
}

function normalizeTeacher(item) {
  return {
    id: item.user_id || item.id,
    email: item.email,
    displayName: item.display_name,
  };
}

function normalizeClass(item) {
  return {
    id: item.class_id || item.id,
    name: item.name,
  };
}

function normalizeSubject(item) {
  return {
    id: item.subject_id || item.id,
    name: item.name,
  };
}

function statusLabel(status) {
  if (status === "active") return t("common.active");
  if (status === "planned") return t("tenant.modules.status.planned");
  if (status === "completed") return t("tenant.modules.status.completed");
  if (status === "suspended") return t("tenant.modules.status.suspended");
  if (status === "cancelled") return t("tenant.modules.status.cancelled");
  return status || "-";
}

function statusColor(status) {
  if (status === "active") return "positive";
  if (status === "planned") return "info";
  if (status === "completed") return "primary";
  if (status === "suspended") return "warning";
  if (status === "cancelled") return "grey";
  return "grey";
}

function roleLabel(role) {
  if (role === "lead") return t("tenant.modules.assignments.role_lead");
  if (role === "support") return t("tenant.modules.assignments.role_support");
  if (role === "substitute") return t("tenant.modules.assignments.role_substitute");
  return role || "-";
}

function assignmentTone(assignment) {
  const seed = `${assignment.teacherUserId}-${assignment.classId}`;
  const index = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return `tone-${index + 1}`;
}

function resetForm() {
  form.teacherUserId = null;
  form.classId = null;
  form.subjectId = null;
  form.assignmentRole = "lead";
  form.startsAt = "";
  form.endsAt = "";
  form.status = "active";
}

function openCreate() {
  editingAssignment.value = null;
  detailOpen.value = false;
  resetForm();
  editorOpen.value = true;
}

function openEdit(assignment) {
  editingAssignment.value = assignment;
  detailOpen.value = false;
  
  form.teacherUserId = assignment.teacherUserId;
  form.classId = assignment.classId;
  form.subjectId = assignment.subjectId;
  form.assignmentRole = assignment.assignmentRole;
  form.startsAt = assignment.startsAt;
  form.endsAt = assignment.endsAt;
  form.status = assignment.status;
  
  editorOpen.value = true;
}

function openDetail(assignment) {
  selectedAssignment.value = assignment;
  detailOpen.value = true;
}

function payload() {
  const data = {
    teacherUserId: form.teacherUserId,
    classId: form.classId,
    subjectId: form.subjectId,
    assignmentRole: form.assignmentRole,
    status: form.status,
  };
  
  if (form.startsAt) data.startsAt = new Date(form.startsAt).toISOString();
  if (form.endsAt) data.endsAt = new Date(form.endsAt).toISOString();
  
  return data;
}

async function loadData() {
  loading.value = true;
  try {
    const [assignmentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
      getTenantTeacherAssignments(),
      tenantSession.hasPermission("teachers.read") ? getTenantTeachers() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("classes.read") ? getTenantClasses() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("courses.read") ? getTenantCourses() : Promise.resolve({ data: { data: [] } }),
    ]);
    
    teachers.value = (teachersRes.data.data || []).map(normalizeTeacher);
    classes.value = (classesRes.data.data || []).map(normalizeClass);
    subjects.value = (subjectsRes.data.data || []).map(normalizeSubject);

    const rawAssignments = assignmentsRes.data.data || [];
    
    // Calculate conflicts mapping
    const classSubjectLeadsMap = {};
    rawAssignments.forEach(a => {
      if (a.assignment_role === 'lead' && a.status === 'active') {
        const key = `${a.class_id}-${a.subject_id}`;
        classSubjectLeadsMap[key] = (classSubjectLeadsMap[key] || 0) + 1;
      }
    });

    assignments.value = rawAssignments.map(a => normalizeAssignment(a, classSubjectLeadsMap));

  } finally {
    loading.value = false;
  }
}

async function submitAssignment() {
  saving.value = true;
  try {
    if (editingAssignment.value) {
      await updateTenantTeacherAssignment(editingAssignment.value.id, payload());
    } else {
      await assignTenantTeacher(payload());
    }
    editorOpen.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped lang="scss">
.assignments-page {
  display: grid;
  gap: var(--space-5);
}

.assignments-head {
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

.assignment-search {
  min-width: min(340px, 40vw);
}

.assignment-summary-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(300px, 1.25fr) repeat(3, minmax(170px, 0.7fr));
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

.assignments-workspace {
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

.filter-actions {
  display: flex;
  gap: var(--space-3);
}

.teacher-filter,
.class-filter {
  min-width: 180px;
}

.assignment-list {
  display: grid;
  gap: var(--space-2);
  max-height: calc(100vh - 360px);
  min-height: 260px;
  overflow: auto;
  padding: var(--space-3);
}

.assignment-row {
  align-items: center;
  background: var(--eg-surface);
  border: 1px solid transparent;
  border-radius: var(--tenant-radius-md);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 1fr auto;
  padding: var(--space-3);
  transition:
    border-color 160ms var(--ease-out),
    box-shadow 160ms var(--ease-out),
    transform 160ms var(--ease-out);

  &:hover {
    border-color: var(--eg-border);
    box-shadow: var(--eg-shadow-md);
    transform: translateY(-1px);
  }
  
  &.has-conflict {
    border-color: rgba(207, 63, 142, 0.4);
    background: rgba(207, 63, 142, 0.03);
  }
}

.assignment-main {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: var(--space-3);
  min-width: 0;
  padding: 0;
  text-align: left;
}

.assignment-avatar {
  align-items: center;
  background: var(--tenant-blue-card);
  border-radius: 18px;
  color: #fff;
  display: flex;
  flex: 0 0 auto;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  height: 46px;
  justify-content: center;
  width: 46px;
}

.tone-2 .assignment-avatar,
.tone-2.detail-hero {
  background: var(--tenant-cyan-card);
}

.tone-3 .assignment-avatar,
.tone-3.detail-hero {
  background: var(--tenant-pink-card);
}

.tone-4 .assignment-avatar,
.tone-4.detail-hero {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.tone-5 .assignment-avatar,
.tone-5.detail-hero {
  background: var(--tenant-dark-card);
}

.assignment-copy {
  display: grid;
  gap: 2px;
  min-width: 0;

  p {
    align-items: center;
    color: var(--eg-muted);
    display: flex;
    font-size: var(--font-size-sm);
    gap: var(--space-2);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.assignment-title-line {
  align-items: center;
  display: flex;
  gap: var(--space-2);

  strong {
    color: var(--eg-text);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
  }
}

.assignment-role {
  font-weight: var(--font-weight-bold);
  
  &.role-lead {
    color: var(--eg-primary);
  }
}

.assignment-actions {
  display: flex;
  gap: var(--space-1);
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

.assignment-detail-drawer {
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
  }

  h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    opacity: 0.82;
    text-transform: uppercase;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.5px;
  }
}

.detail-close {
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
}

.detail-content {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-5);
}

.detail-actions {
  display: flex;
  gap: var(--space-2);
}

.detail-block {
  h3 {
    color: var(--eg-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-2);
    text-transform: uppercase;
  }

  p {
    color: var(--eg-text);
    font-size: var(--font-size-base);
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

.assignment-form {
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
