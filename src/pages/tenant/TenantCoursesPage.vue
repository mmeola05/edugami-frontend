<template>
  <q-page class="page-shell-premium subjects-page">
    <section class="tenant-page-head subjects-head">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="menu_book" size="18px" />
          {{ t("tenant.layout.group_academic") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.courses.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.courses.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions head-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search subject-search"
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
          :label="t('tenant.modules.courses.create')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="subject-summary-grid">
      <article class="tenant-metric-card hero-metric">
        <div>
          <span>{{ t("tenant.modules.courses.active_subjects") }}</span>
          <strong>{{ activeSubjects.length }}</strong>
          <p>{{ t("tenant.modules.courses.total_subjects", { count: subjects.length }) }}</p>
        </div>
        <div class="hero-icon">
          <q-icon name="auto_stories" size="32px" />
        </div>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="groups" size="22px" />
        <span>{{ t("tenant.modules.courses.students") }}</span>
        <strong>{{ totalStudents }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="meeting_room" size="22px" />
        <span>{{ t("tenant.modules.courses.classes") }}</span>
        <strong>{{ totalClassLinks }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric accent">
        <q-icon name="co_present" size="22px" />
        <span>{{ t("tenant.modules.courses.teachers") }}</span>
        <strong>{{ totalTeacherLinks }}</strong>
      </article>
    </section>

    <section class="subjects-workspace tenant-workspace-card">
      <div class="filter-bar">
        <q-tabs
          v-model="statusFilter"
          dense
          inline-label
          active-color="primary"
          indicator-color="primary"
          class="subject-tabs"
        >
          <q-tab name="all" icon="grid_view" :label="t('common.all')" />
          <q-tab name="active" icon="verified" :label="t('common.active')" />
          <q-tab name="archived" icon="inventory_2" :label="t('common.archived')" />
        </q-tabs>

        <q-select
          v-model="stageFilter"
          :options="stageOptions"
          dense
          outlined
          emit-value
          map-options
          class="stage-filter"
        />
      </div>

      <div v-if="loading" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredSubjects.length" class="subject-grid">
        <article
          v-for="subject in filteredSubjects"
          :key="subject.id"
          class="subject-card"
          :class="subjectTone(subject)"
        >
          <button class="subject-visual" type="button" @click="openDetail(subject)">
            <q-badge class="subject-code" text-color="white">
              {{ subject.code || t("common.no_code") }}
            </q-badge>
            <q-icon name="auto_stories" />
          </button>

          <div class="subject-body">
            <div class="subject-title-row">
              <div>
                <h2>{{ subject.name }}</h2>
                <p>{{ subject.stage || t("tenant.modules.courses.no_stage") }}</p>
              </div>
              <q-badge :color="statusColor(subject.status)" text-color="white">
                {{ statusLabel(subject.status) }}
              </q-badge>
            </div>

            <div class="subject-metrics">
              <span>
                <q-icon name="groups" size="15px" />
                {{ subject.students.length || subject.studentsCount }} {{ t("tenant.modules.courses.students") }}
              </span>
              <span>
                <q-icon name="meeting_room" size="15px" />
                {{ subject.classes.length }} {{ t("tenant.modules.courses.classes") }}
              </span>
              <span>
                <q-icon name="co_present" size="15px" />
                {{ subject.teachers.length }} {{ t("tenant.modules.courses.teachers") }}
              </span>
            </div>

            <div class="subject-actions">
              <q-btn flat dense no-caps icon="visibility" :label="t('tenant.modules.view_detail')" @click="openDetail(subject)" />
              <q-btn
                v-if="canUpdate"
                color="primary"
                dense
                no-caps
                unelevated
                icon="edit"
                :label="t('common.edit')"
                @click="openEdit(subject)"
              />
            </div>
          </div>
        </article>
      </div>

      <div v-else class="state-box">
        <q-icon name="menu_book" color="primary" size="42px" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.courses.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.courses.empty_text") }}</span>
      </div>
    </section>

    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="subject-detail-drawer"
    >
      <div v-if="selectedSubject" class="detail-shell">
        <div class="detail-hero" :class="subjectTone(selectedSubject)">
          <q-btn flat round dense icon="close" class="detail-close" @click="detailOpen = false" />
          <q-icon name="auto_stories" />
          <h2>{{ selectedSubject.name }}</h2>
          <p>{{ selectedSubject.code || t("common.no_code") }}</p>
        </div>

        <div class="detail-content">
          <div class="detail-actions">
            <q-btn v-if="canUpdate" color="primary" icon="edit" :label="t('common.edit')" no-caps unelevated @click="openEdit(selectedSubject)" />
          </div>

          <section class="detail-block">
            <h3>{{ t("tenant.modules.courses.classes") }}</h3>
            <div v-if="selectedSubject.classes.length" class="chip-list">
              <q-chip v-for="item in selectedSubject.classes" :key="item.id" color="primary" text-color="primary">
                {{ item.name }}
              </q-chip>
            </div>
            <p v-else>{{ t("tenant.modules.courses.no_classes") }}</p>
          </section>

          <section class="detail-block">
            <h3>{{ t("tenant.modules.courses.teachers") }}</h3>
            <div v-if="selectedSubject.teachers.length" class="teacher-list">
              <div v-for="teacher in selectedSubject.teachers" :key="teacher.key">
                <strong>{{ teacher.teacherName }}</strong>
                <span>{{ teacher.className }}</span>
              </div>
            </div>
            <p v-else>{{ t("tenant.modules.courses.no_teachers") }}</p>
          </section>

          <section class="detail-block">
            <h3>{{ t("tenant.modules.courses.students") }}</h3>
            <div v-if="selectedSubject.students.length" class="mini-list">
              <span v-for="student in selectedSubject.students.slice(0, 8)" :key="student.id">
                {{ student.displayName }}
              </span>
            </div>
            <p v-else>{{ t("tenant.modules.courses.no_students") }}</p>
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
      class="tenant-editor-drawer subject-editor-drawer"
    >
      <aside class="tenant-editor-shell editor-shell">
        <div class="tenant-editor-head editor-head">
          <div class="tenant-editor-icon editor-icon">
            <q-icon name="menu_book" size="24px" />
          </div>
          <div>
            <h2>{{ editingSubject ? t("common.edit") : t("tenant.modules.courses.create") }}</h2>
            <p>{{ t("tenant.modules.courses.create_subtitle") }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="tenant-editor-form subject-form" @submit.prevent="submitSubject">
          <q-input
            v-model="form.name"
            :label="t('tenant.modules.fields.name')"
            outlined
            dense
            :rules="[(value) => Boolean(value) || t('common.required')]"
          />
          <q-input
            v-model="form.code"
            :label="t('tenant.modules.fields.code')"
            outlined
            dense
          />
          <q-input
            v-model="form.stage"
            :label="t('tenant.modules.fields.stage')"
            outlined
            dense
          />
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('tenant.modules.fields.status')"
            emit-value
            map-options
            outlined
            dense
          />
        </q-form>

        <div class="tenant-editor-actions editor-actions">
          <q-btn flat :label="t('common.cancel')" no-caps @click="editorOpen = false" />
          <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated @click="submitSubject" />
        </div>
      </aside>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { getTenantClasses, getTenantCourses, getTenantStudents, getTenantTeacherAssignments } from "src/utils/api/get";
import { createTenantCourse } from "src/utils/api/post";
import { updateTenantCourse } from "src/utils/api/patch";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const editorOpen = ref(false);
const detailOpen = ref(false);
const editingSubject = ref(null);
const selectedSubject = ref(null);
const searchQuery = ref("");
const statusFilter = ref("all");
const stageFilter = ref("all");
const subjects = ref([]);
const students = ref([]);
const classes = ref([]);
const teacherAssignments = ref([]);

const form = reactive({
  name: "",
  code: "",
  stage: "",
  status: "active",
});

const canCreate = computed(() => tenantSession.hasPermission("courses.create"));
const canUpdate = computed(() => tenantSession.hasPermission("courses.update"));
const activeSubjects = computed(() => subjects.value.filter((item) => item.status === "active"));
const totalStudents = computed(() => uniqueCount(subjects.value.flatMap((item) => item.students.map((student) => student.id))));
const totalClassLinks = computed(() => uniqueCount(subjects.value.flatMap((item) => item.classes.map((klass) => `${item.id}-${klass.id}`))));
const totalTeacherLinks = computed(() => uniqueCount(subjects.value.flatMap((item) => item.teachers.map((teacher) => teacher.key))));

const statusOptions = computed(() => [
  { label: t("common.active"), value: "active" },
  { label: t("common.archived"), value: "archived" },
]);

const stageOptions = computed(() => [
  { label: t("common.all"), value: "all" },
  { label: t("tenant.modules.courses.no_stage"), value: "__none" },
  ...[...new Set(subjects.value.map((item) => item.stage).filter(Boolean))]
    .sort()
    .map((stage) => ({ label: stage, value: stage })),
]);

const enrichedSubjects = computed(() => subjects.value.map((subject) => {
  const subjectStudents = students.value.filter((student) => student.subjectIds.includes(subject.id));
  const assignments = teacherAssignments.value.filter((assignment) => assignment.subjectId === subject.id);
  const classMap = new Map();

  subjectStudents.forEach((student) => {
    if (student.primaryClassId) {
      const className = student.className || classes.value.find((item) => item.id === student.primaryClassId)?.name;
      classMap.set(student.primaryClassId, { id: student.primaryClassId, name: className || "-" });
    }
  });
  assignments.forEach((assignment) => {
    if (assignment.classId) classMap.set(assignment.classId, { id: assignment.classId, name: assignment.className || "-" });
  });

  return {
    ...subject,
    students: subjectStudents,
    classes: [...classMap.values()],
    teachers: assignments.map((assignment) => ({
      ...assignment,
      key: `${assignment.teacherUserId}-${assignment.classId}-${assignment.subjectId}`,
    })),
  };
}));

const filteredSubjects = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  return enrichedSubjects.value.filter((item) => {
    const matchesStatus = statusFilter.value === "all" || item.status === statusFilter.value;
    const matchesStage = stageFilter.value === "all" || (stageFilter.value === "__none" ? !item.stage : item.stage === stageFilter.value);
    const haystack = `${item.name} ${item.code} ${item.stage} ${item.classes.map((klass) => klass.name).join(" ")} ${item.teachers.map((teacher) => teacher.teacherName).join(" ")}`.toLowerCase();
    return matchesStatus && matchesStage && (!needle || haystack.includes(needle));
  });
});

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function normalizeSubject(item) {
  return {
    id: item.subject_id,
    name: item.name,
    code: item.code,
    stage: item.stage,
    status: item.status,
    studentsCount: item.students_count || 0,
  };
}

function normalizeStudent(item) {
  const subjectsList = Array.isArray(item.subjects) ? item.subjects.filter(Boolean) : [];
  return {
    id: item.student_id,
    displayName: item.preferred_name || item.full_name,
    primaryClassId: item.primary_class_id,
    className: item.class_name,
    subjectIds: subjectsList.map((subject) => subject.subjectId || subject.subject_id).filter(Boolean),
  };
}

function normalizeClass(item) {
  return {
    id: item.class_id,
    name: item.name,
  };
}

function normalizeAssignment(item) {
  return {
    teacherUserId: item.teacher_user_id,
    teacherName: item.teacher_name,
    classId: item.class_id,
    className: item.class_name,
    subjectId: item.subject_id,
    status: item.status,
  };
}

function statusLabel(status) {
  if (status === "active") return t("common.active");
  if (status === "archived") return t("common.archived");
  return status || "-";
}

function statusColor(status) {
  if (status === "active") return "positive";
  if (status === "archived") return "grey";
  return "grey";
}

function subjectTone(subject) {
  const seed = `${subject.id}-${subject.name}`;
  const index = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return `tone-${index + 1}`;
}

function resetForm() {
  form.name = "";
  form.code = "";
  form.stage = "";
  form.status = "active";
}

function openCreate() {
  editingSubject.value = null;
  resetForm();
  editorOpen.value = true;
}

function openEdit(subject) {
  detailOpen.value = false;
  editingSubject.value = subject;
  form.name = subject.name || "";
  form.code = subject.code || "";
  form.stage = subject.stage || "";
  form.status = subject.status || "active";
  editorOpen.value = true;
}

function openDetail(subject) {
  selectedSubject.value = subject;
  detailOpen.value = true;
}

function payload() {
  return {
    name: form.name,
    code: form.code || null,
    stage: form.stage || null,
    status: form.status,
  };
}

async function loadData() {
  loading.value = true;
  try {
    const [subjectsRes, studentsRes, classesRes, assignmentsRes] = await Promise.all([
      getTenantCourses(),
      tenantSession.hasPermission("students.read") ? getTenantStudents() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("classes.read") ? getTenantClasses() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("teacher_assignments.read") ? getTenantTeacherAssignments() : Promise.resolve({ data: { data: [] } }),
    ]);
    subjects.value = (subjectsRes.data.data || []).map(normalizeSubject);
    students.value = (studentsRes.data.data || []).map(normalizeStudent);
    classes.value = (classesRes.data.data || []).map(normalizeClass);
    teacherAssignments.value = (assignmentsRes.data.data || []).map(normalizeAssignment);
  } finally {
    loading.value = false;
  }
}

async function submitSubject() {
  saving.value = true;
  try {
    if (editingSubject.value) {
      await updateTenantCourse(editingSubject.value.id, payload());
    } else {
      await createTenantCourse(payload());
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
.subjects-page {
  display: grid;
  gap: var(--space-5);
}

.subjects-head {
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

.subject-search {
  min-width: min(340px, 40vw);
}

.subject-summary-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(300px, 1.25fr) repeat(3, minmax(170px, 0.7fr));
}

.hero-metric {
  align-items: center;
  background:
    radial-gradient(circle at 82% 20%, rgba(207, 63, 142, 0.16), transparent 34%),
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
  background: linear-gradient(135deg, #cf3f8e, var(--eg-primary));
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
    color: #10a976;
  }
}

.subjects-workspace {
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
}

.stage-filter {
  min-width: 210px;
}

.subject-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  max-height: calc(100vh - 360px);
  min-height: 300px;
  overflow: auto;
  padding: var(--space-4);
}

.subject-card {
  background: var(--eg-surface);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-md);
  box-shadow: var(--eg-shadow-sm);
  overflow: hidden;
  transition:
    box-shadow 160ms var(--ease-out),
    transform 160ms var(--ease-out);

  &:hover {
    box-shadow: var(--eg-shadow-md);
    transform: translateY(-2px);
  }
}

.subject-visual,
.detail-hero {
  background: var(--tenant-blue-card);
}

.tone-2 .subject-visual,
.tone-2.detail-hero {
  background: var(--tenant-cyan-card);
}

.tone-3 .subject-visual,
.tone-3.detail-hero {
  background: var(--tenant-pink-card);
}

.tone-4 .subject-visual,
.tone-4.detail-hero {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.tone-5 .subject-visual,
.tone-5.detail-hero {
  background: var(--tenant-dark-card);
}

.subject-visual {
  border: 0;
  color: rgba(255, 255, 255, 0.28);
  cursor: pointer;
  display: block;
  min-height: 92px;
  overflow: hidden;
  position: relative;
  width: 100%;

  .q-icon {
    bottom: -28px;
    font-size: 108px;
    position: absolute;
    right: -12px;
  }
}

.subject-code {
  background: rgba(16, 20, 38, 0.56);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-weight-extrabold);
  left: var(--space-4);
  padding: 5px var(--space-2);
  position: absolute;
  text-transform: uppercase;
  top: var(--space-4);
}

.subject-body {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
}

.subject-title-row {
  align-items: flex-start;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;

  h2 {
    color: var(--eg-text);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    color: var(--eg-muted);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
}

.subject-metrics,
.subject-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.subject-metrics span {
  align-items: center;
  background: var(--eg-surface-soft);
  border-radius: var(--radius-full);
  color: var(--eg-muted);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-1);
  padding: 7px var(--space-3);
}

.subject-actions {
  justify-content: space-between;
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

.subject-detail-drawer {
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

  .q-icon {
    font-size: 58px;
    opacity: 0.85;
  }

  h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    opacity: 0.82;
  }
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
  }

  p {
    color: var(--eg-muted);
    font-size: var(--font-size-sm);
  }
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.teacher-list,
.mini-list {
  display: grid;
  gap: var(--space-2);
}

.teacher-list div,
.mini-list span {
  background: var(--eg-surface);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-sm);
  color: var(--eg-text);
  display: grid;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  gap: 2px;
  padding: var(--space-3);
}

.teacher-list span {
  color: var(--eg-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
}

.subject-form {
  display: grid;
  gap: var(--space-4);
}

@media (max-width: 1180px) {
  .subject-summary-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .subjects-head,
  .subject-summary-grid {
    grid-template-columns: 1fr;
  }

  .head-actions,
  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .subject-search,
  .stage-filter {
    min-width: 0;
    width: 100%;
  }

  .filter-bar {
    display: grid;
  }

  .subject-grid {
    max-height: none;
  }
}
</style>
