<template>
  <q-page class="page-shell-premium classes-page">
    <section class="tenant-page-head classes-head">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="groups" size="18px" />
          {{ t("tenant.layout.group_academic") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.classes.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.classes.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions head-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search class-search"
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
          :label="t('tenant.modules.classes.create')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="class-overview-grid">
      <article class="tenant-metric-card license-style-card">
        <div>
          <span>{{ t("tenant.modules.classes.title") }}</span>
          <strong>{{ activeClasses.length }} / {{ classes.length }}</strong>
          <p>{{ t("tenant.modules.classes.students") }}: {{ totalStudents }}</p>
        </div>
        <div class="ring-meter" :style="{ '--value': activeRate }">
          <div class="ring-value">{{ activeRate }}%</div>
        </div>
      </article>

      <article class="tenant-metric-card mini-metric">
        <div class="metric-icon bg-soft-primary">
          <q-icon name="school" size="22px" />
        </div>
        <span>{{ t("tenant.modules.classes.students") }}</span>
        <strong>{{ totalStudents }}</strong>
      </article>

      <article class="tenant-metric-card mini-metric">
        <div class="metric-icon bg-soft-positive">
          <q-icon name="verified" size="22px" />
        </div>
        <span>{{ t("tenant.modules.stats_active") }}</span>
        <strong>{{ activeClasses.length }}</strong>
      </article>
    </section>

    <section class="tenant-workspace-card class-workspace">
      <div class="filter-bar">
        <q-tabs
          v-model="statusFilter"
          dense
          inline-label
          active-color="primary"
          indicator-color="primary"
          class="class-tabs"
        >
          <q-tab name="all" icon="grid_view" :label="t('common.all')" />
          <q-tab name="active" icon="play_circle" :label="t('common.active')" />
          <q-tab name="archived" icon="inventory_2" :label="t('common.archived')" />
        </q-tabs>
        <q-select
          v-model="yearFilter"
          :options="yearOptions"
          dense
          outlined
          emit-value
          map-options
          class="year-filter"
        />
      </div>

      <div v-if="loading" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredClasses.length" class="class-grid">
        <article
          v-for="item in filteredClasses"
          :key="item.id"
          class="tenant-entity-card class-card"
          :class="cardTone(item)"
        >
          <div class="class-visual">
            <q-badge class="class-code" text-color="white">
              {{ item.code || t("common.no_code") }}
            </q-badge>
            <q-icon name="groups" class="class-watermark" />
          </div>

          <div class="class-body">
            <div class="class-title-row">
              <div>
                <h2>{{ item.name }}</h2>
                <p>{{ item.level || "-" }} - {{ item.academicYear }}</p>
              </div>
              <q-badge :color="statusColor(item.status)" text-color="white">
                {{ statusLabel(item.status) }}
              </q-badge>
            </div>

            <div class="class-meta">
              <span>
                <q-icon name="school" size="16px" />
                {{ item.studentsCount }} {{ t("tenant.modules.classes.students") }}
              </span>
              <span>
                <q-icon name="calendar_month" size="16px" />
                {{ item.academicYear }}
              </span>
            </div>

            <div class="class-actions">
              <q-btn
                flat
                dense
                no-caps
                icon="visibility"
                :label="t('tenant.modules.view_detail')"
                @click="openDetail(item)"
              />
              <q-btn
                v-if="canUpdate"
                color="primary"
                dense
                no-caps
                unelevated
                icon="edit"
                :label="t('common.edit')"
                @click="openEdit(item)"
              />
            </div>
          </div>
        </article>
      </div>

      <div v-else class="state-box">
        <q-icon name="groups_2" color="primary" size="42px" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.classes.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.classes.empty_text") }}</span>
      </div>
    </section>

    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="420"
      class="class-detail-drawer"
    >
      <div v-if="selectedClass" class="detail-shell">
        <div class="detail-visual" :class="cardTone(selectedClass)">
          <q-btn flat round dense icon="close" class="detail-close" @click="detailOpen = false" />
          <q-icon name="groups" />
        </div>

        <div class="detail-content">
          <q-badge :color="statusColor(selectedClass.status)" text-color="white">
            {{ statusLabel(selectedClass.status) }}
          </q-badge>
          <h2>{{ selectedClass.name }}</h2>
          <p>{{ selectedClass.code || t("common.no_code") }}</p>

          <div class="detail-grid">
            <div>
              <span>{{ t("tenant.modules.classes.level") }}</span>
              <strong>{{ selectedClass.level || "-" }}</strong>
            </div>
            <div>
              <span>{{ t("tenant.modules.classes.academic_year") }}</span>
              <strong>{{ selectedClass.academicYear }}</strong>
            </div>
            <div>
              <span>{{ t("tenant.modules.classes.students") }}</span>
              <strong>{{ selectedClass.studentsCount }}</strong>
            </div>
          </div>

          <section class="class-detail-block">
            <h3>{{ t("tenant.modules.classes.students") }}</h3>
            <div v-if="selectedClassStudents.length" class="mini-list">
              <span v-for="student in selectedClassStudents.slice(0, 6)" :key="student.id">
                {{ student.displayName }}
              </span>
            </div>
            <p v-else>{{ t("tenant.modules.classes.no_students") }}</p>
          </section>

          <section class="class-detail-block">
            <h3>{{ t("tenant.modules.classes.subjects") }}</h3>
            <div v-if="selectedClassSubjects.length" class="chip-list">
              <q-chip v-for="subject in selectedClassSubjects" :key="subject.id" color="primary" text-color="primary">
                {{ subject.name }}
              </q-chip>
            </div>
            <p v-else>{{ t("tenant.modules.classes.no_subjects") }}</p>
          </section>

          <section class="class-detail-block">
            <h3>{{ t("tenant.modules.classes.teachers") }}</h3>
            <div v-if="selectedClassTeachers.length" class="teacher-list">
              <div v-for="teacher in selectedClassTeachers" :key="teacher.key">
                <strong>{{ teacher.teacherName }}</strong>
                <span>{{ teacher.subjectName }}</span>
              </div>
            </div>
            <p v-else>{{ t("tenant.modules.classes.no_teachers") }}</p>
          </section>

          <q-btn
            v-if="canUpdate"
            color="primary"
            icon="edit"
            :label="t('common.edit')"
            no-caps
            unelevated
            @click="openEdit(selectedClass)"
          />
        </div>
      </div>
    </q-drawer>

    <q-drawer
      v-model="editorOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer class-editor-drawer"
    >
      <aside class="tenant-editor-shell editor-shell">
        <div class="tenant-editor-head editor-head">
          <div class="tenant-editor-icon editor-icon">
            <q-icon name="groups" size="24px" />
          </div>
          <div>
            <h2>{{ editingClass ? t("common.edit") : t("tenant.modules.classes.create") }}</h2>
            <p>{{ t("tenant.modules.classes.create_subtitle") }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="tenant-editor-form class-form editor-form" @submit.prevent="submitClass">
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
            v-model="form.level"
            :label="t('tenant.modules.fields.level')"
            outlined
            dense
          />
          <q-input
            v-model="form.academicYear"
            :label="t('tenant.modules.fields.academic_year')"
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
          <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated @click="submitClass" />
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
import { createTenantClass } from "src/utils/api/post";
import { updateTenantClass } from "src/utils/api/patch";
import { useRoute } from "vue-router";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const editorOpen = ref(false);
const detailOpen = ref(false);
const route = useRoute();
const editingClass = ref(null);
const selectedClass = ref(null);
const searchQuery = ref("");
const statusFilter = ref("all");
const yearFilter = ref("all");
const classes = ref([]);
const students = ref([]);
const subjects = ref([]);
const teacherAssignments = ref([]);

const form = reactive({
  name: "",
  code: "",
  level: "",
  academicYear: "2025-2026",
  status: "active",
});

const canCreate = computed(() => tenantSession.hasPermission("classes.create"));
const canUpdate = computed(() => tenantSession.hasPermission("classes.update"));
const activeClasses = computed(() => classes.value.filter((item) => item.status === "active"));
const totalStudents = computed(() => classes.value.reduce((total, item) => total + item.studentsCount, 0));
const activeRate = computed(() => classes.value.length ? Math.round((activeClasses.value.length / classes.value.length) * 100) : 0);

const statusOptions = computed(() => [
  { label: t("common.active"), value: "active" },
  { label: t("common.archived"), value: "archived" },
]);

const yearOptions = computed(() => [
  { label: t("common.all"), value: "all" },
  ...[...new Set(classes.value.map((item) => item.academicYear).filter(Boolean))]
    .sort()
    .reverse()
    .map((year) => ({ label: year, value: year })),
]);

const filteredClasses = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  return classes.value.filter((item) => {
    const matchesStatus = statusFilter.value === "all" || item.status === statusFilter.value;
    const matchesYear = yearFilter.value === "all" || item.academicYear === yearFilter.value;
    const matchesSearch = !needle || `${item.name} ${item.code} ${item.level} ${item.academicYear}`.toLowerCase().includes(needle);
    return matchesStatus && matchesYear && matchesSearch;
  });
});

const selectedClassStudents = computed(() => {
  if (!selectedClass.value) return [];
  return students.value.filter((student) => student.primaryClassId === selectedClass.value.id);
});

const selectedClassSubjects = computed(() => {
  if (!selectedClass.value) return [];
  const directSubjectIds = new Set(
    selectedClassStudents.value.flatMap((student) => student.subjectIds)
  );
  const assignedSubjectIds = new Set(
    teacherAssignments.value
      .filter((assignment) => assignment.classId === selectedClass.value.id)
      .map((assignment) => assignment.subjectId)
  );
  const ids = new Set([...directSubjectIds, ...assignedSubjectIds]);
  return subjects.value.filter((subject) => ids.has(subject.id));
});

const selectedClassTeachers = computed(() => {
  if (!selectedClass.value) return [];
  const seen = new Set();
  return teacherAssignments.value
    .filter((assignment) => assignment.classId === selectedClass.value.id && assignment.status !== "completed")
    .filter((assignment) => {
      const key = `${assignment.teacherUserId}-${assignment.subjectId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((assignment) => ({ ...assignment, key: `${assignment.teacherUserId}-${assignment.subjectId}` }));
});

function normalizeClass(item) {
  return {
    id: item.class_id,
    name: item.name,
    code: item.code,
    level: item.level,
    academicYear: item.academic_year,
    studentsCount: item.students_count || 0,
    status: item.status,
  };
}

function normalizeStudent(item) {
  const subjectsList = Array.isArray(item.subjects) ? item.subjects.filter(Boolean) : [];
  return {
    id: item.student_id,
    displayName: item.preferred_name || item.full_name,
    primaryClassId: item.primary_class_id,
    subjectIds: subjectsList.map((subject) => subject.subjectId || subject.subject_id).filter(Boolean),
  };
}

function normalizeSubject(item) {
  return {
    id: item.subject_id,
    name: item.name,
  };
}

function normalizeAssignment(item) {
  return {
    teacherUserId: item.teacher_user_id,
    teacherName: item.teacher_name,
    classId: item.class_id,
    subjectId: item.subject_id,
    subjectName: item.subject_name,
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

function cardTone(item) {
  const seed = `${item.id}-${item.name}`;
  const index = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % 4;
  return `tone-${index + 1}`;
}

function resetForm() {
  form.name = "";
  form.code = "";
  form.level = "";
  form.academicYear = yearOptions.value.find((item) => item.value !== "all")?.value || "2025-2026";
  form.status = "active";
}

function openCreate() {
  editingClass.value = null;
  resetForm();
  editorOpen.value = true;
}

function openEdit(item) {
  detailOpen.value = false;
  editingClass.value = item;
  form.name = item.name;
  form.code = item.code || "";
  form.level = item.level || "";
  form.academicYear = item.academicYear || "2025-2026";
  form.status = item.status || "active";
  editorOpen.value = true;
}

function openDetail(item) {
  selectedClass.value = item;
  detailOpen.value = true;
}

function payload() {
  return {
    name: form.name,
    code: form.code || null,
    level: form.level || null,
    academicYear: form.academicYear,
    status: form.status,
  };
}

async function loadClasses() {
  loading.value = true;
  try {
    const [classesRes, studentsRes, subjectsRes, assignmentsRes] = await Promise.all([
      getTenantClasses(),
      tenantSession.hasPermission("students.read") ? getTenantStudents() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("courses.read") ? getTenantCourses() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("teacher_assignments.read") ? getTenantTeacherAssignments() : Promise.resolve({ data: { data: [] } }),
    ]);
    classes.value = (classesRes.data.data || []).map(normalizeClass);
    students.value = (studentsRes.data.data || []).map(normalizeStudent);
    subjects.value = (subjectsRes.data.data || []).map(normalizeSubject);
    teacherAssignments.value = (assignmentsRes.data.data || []).map(normalizeAssignment);
  } finally {
    loading.value = false;
  }
}

async function submitClass() {
  saving.value = true;
  try {
    if (editingClass.value) {
      await updateTenantClass(editingClass.value.id, payload());
    } else {
      await createTenantClass(payload());
    }
    editorOpen.value = false;
    await loadClasses();
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await loadClasses();
  if (route.query.action === "create" && canCreate.value) {
    openCreate();
  }
});
</script>

<style scoped lang="scss">
.classes-page {
  display: grid;
  gap: var(--space-5);
}

.classes-head {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr auto;
}

.section-kicker {
  align-items: center;
  color: var(--color-primary);
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

.class-search {
  min-width: min(340px, 40vw);

  :deep(.q-field__control) {
    background: var(--color-surface-strong);
    border-radius: var(--radius-full);
  }
}

.class-overview-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(300px, 1.35fr) repeat(2, minmax(190px, 0.65fr));
}

.license-style-card {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr auto;
  min-height: 126px;

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }

  strong {
    color: var(--color-text-primary);
    display: block;
    font-size: 1.8rem;
    font-weight: var(--font-weight-extrabold);
    margin-top: var(--space-2);
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
}

.ring-meter {
  align-items: center;
  background: conic-gradient(var(--color-primary) calc(var(--value, 85) * 1%), color-mix(in srgb, var(--color-primary) 8%, var(--color-bg-secondary)) 0);
  border-radius: var(--radius-full);
  display: flex;
  height: 96px;
  justify-content: center;
  width: 96px;

  &::before {
    background: var(--color-surface-strong);
    border-radius: inherit;
    content: "";
    height: 68px;
    position: absolute;
    width: 68px;
  }
}

.ring-value {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  position: relative;
}

.mini-metric {
  display: grid;
  gap: var(--space-2);
  min-height: 126px;

  span {
    align-self: end;
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }

  strong {
    color: var(--color-text-primary);
    font-size: 1.55rem;
    font-weight: var(--font-weight-extrabold);
  }
}

.metric-icon {
  align-items: center;
  border-radius: var(--tenant-radius-sm);
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.class-workspace {
  overflow: hidden;
}

.filter-bar {
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  min-height: 58px;
  padding: 0 var(--space-4);
}

.year-filter {
  min-width: 180px;

  :deep(.q-field__control) {
    border-radius: var(--radius-full);
  }
}

.class-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  padding: var(--space-4);
}

.class-card {
  border-radius: var(--tenant-radius-md);
}

.class-visual,
.detail-visual {
  background: var(--gradient-primary);
  min-height: 88px;
  overflow: hidden;
  position: relative;
}

.tone-1 .class-visual,
.tone-1.detail-visual {
  background: linear-gradient(135deg, #2415f2, #2f8cff);
}

.tone-2 .class-visual,
.tone-2.detail-visual {
  background: linear-gradient(135deg, #0aa6c2, #10a976);
}

.tone-3 .class-visual,
.tone-3.detail-visual {
  background: linear-gradient(135deg, #cf3f8e, #5f29ff);
}

.tone-4 .class-visual,
.tone-4.detail-visual {
  background: linear-gradient(135deg, #14243a, #0aa6c2);
}

.class-code {
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

.class-watermark {
  bottom: -24px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 96px;
  position: absolute;
  right: -10px;
}

.class-body {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
}

.class-title-row {
  align-items: flex-start;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;

  h2 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
}

.class-meta,
.class-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.class-meta span {
  align-items: center;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  gap: var(--space-1);
}

.class-actions {
  justify-content: space-between;
}

.class-detail-drawer {
  background: var(--color-surface);
}

.detail-shell {
  min-height: 100%;
}

.detail-visual {
  align-items: center;
  color: rgba(255, 255, 255, 0.24);
  display: flex;
  font-size: 108px;
  justify-content: center;
  min-height: 150px;
}

.detail-close {
  color: white;
  position: absolute;
  right: var(--space-4);
  top: var(--space-4);
}

.detail-content {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);

  h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
  }

  p {
    color: var(--color-text-secondary);
  }
}

.detail-grid {
  display: grid;
  gap: var(--space-3);

  div {
    background: var(--color-surface-strong);
    border: 1px solid var(--color-border-subtle);
    border-radius: 18px;
    display: grid;
    gap: var(--space-1);
    padding: var(--space-4);
  }

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-extrabold);
  }
}

.class-detail-block {
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

.mini-list,
.teacher-list {
  display: grid;
  gap: var(--space-2);
}

.mini-list span {
  background: var(--eg-surface);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--radius-full);
  color: var(--eg-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  padding: 8px var(--space-3);
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.teacher-list div {
  background: var(--eg-surface);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-sm);
  display: grid;
  gap: 2px;
  padding: var(--space-3);

  strong {
    color: var(--eg-text);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--eg-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }
}

.class-form {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.state-box {
  align-items: center;
  color: var(--color-text-secondary);
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  min-height: 220px;
  padding: var(--space-6);
  text-align: center;

  strong {
    color: var(--color-text-primary);
  }
}

@media (max-width: 1100px) {
  .class-overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .classes-head,
  .license-style-card,
  .filter-bar,
  .class-form {
    grid-template-columns: 1fr;
  }

  .head-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .class-search {
    min-width: 0;
    width: 100%;
  }

  .filter-bar {
    align-items: stretch;
    display: grid;
    padding: var(--space-4);
  }
}
</style>
