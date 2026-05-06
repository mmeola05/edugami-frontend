<template>
  <q-page class="page-shell-premium students-page">
    <section class="tenant-page-head students-head">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="school" size="18px" />
          {{ t("tenant.layout.group_management") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.students.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.students.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions head-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search student-search"
          :placeholder="t('tenant.modules.search_placeholder')"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
        <q-btn
          v-if="canCreate"
          color="primary"
          icon="person_add"
          :label="t('tenant.modules.students.create')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="student-summary-grid">
      <article class="tenant-metric-card hero-metric">
        <div>
          <span>{{ t("tenant.modules.students.active_students") }}</span>
          <strong>{{ activeStudents.length }}</strong>
          <p>{{ t("tenant.modules.students.total_students", { count: students.length }) }}</p>
        </div>
        <div class="hero-icon">
          <q-icon name="school" size="32px" />
        </div>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="groups" size="22px" />
        <span>{{ t("tenant.modules.students.with_class") }}</span>
        <strong>{{ studentsWithClass }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric">
        <q-icon name="family_restroom" size="22px" />
        <span>{{ t("tenant.modules.students.with_guardians") }}</span>
        <strong>{{ studentsWithGuardians }}</strong>
      </article>

      <article class="tenant-metric-card compact-metric accent">
        <q-icon name="menu_book" size="22px" />
        <span>{{ t("tenant.modules.students.subject_links") }}</span>
        <strong>{{ totalSubjectLinks }}</strong>
      </article>
    </section>

    <section class="student-workspace tenant-workspace-card">
      <div class="filter-bar">
        <q-tabs
          v-model="statusFilter"
          dense
          inline-label
          active-color="primary"
          indicator-color="primary"
          class="student-tabs"
        >
          <q-tab name="all" icon="grid_view" :label="t('common.all')" />
          <q-tab name="active" icon="verified" :label="t('common.active')" />
          <q-tab name="inactive" icon="pause_circle" :label="t('common.inactive')" />
          <q-tab name="archived" icon="inventory_2" :label="t('common.archived')" />
        </q-tabs>

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

      <div v-if="loading" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredStudents.length" class="student-list">
        <article
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-row"
          :class="studentTone(student)"
        >
          <button class="student-main" type="button" @click="openDetail(student)">
            <div class="student-avatar">
              {{ initials(student.displayName) }}
            </div>
            <div class="student-copy">
              <div class="student-title-line">
                <strong>{{ student.displayName }}</strong>
                <q-badge :color="statusColor(student.status)" text-color="white">
                  {{ statusLabel(student.status) }}
                </q-badge>
              </div>
              <p>
                <span>{{ student.className || t("tenant.modules.students.no_class") }}</span>
                <span v-if="student.externalRef">{{ student.externalRef }}</span>
              </p>
            </div>
          </button>

          <div class="student-pills">
            <span>
              <q-icon name="menu_book" size="15px" />
              {{ student.subjects.length }} {{ t("tenant.modules.students.subjects") }}
            </span>
            <span>
              <q-icon name="family_restroom" size="15px" />
              {{ student.guardians.length }} {{ t("tenant.modules.students.guardians") }}
            </span>
          </div>

          <div class="student-actions">
            <q-btn flat round dense icon="visibility" @click="openDetail(student)">
              <q-tooltip>{{ t("tenant.modules.view_detail") }}</q-tooltip>
            </q-btn>
            <q-btn v-if="canUpdate" flat round dense icon="edit" @click="openEdit(student)">
              <q-tooltip>{{ t("common.edit") }}</q-tooltip>
            </q-btn>
            <q-btn v-if="canUpdate" flat round dense icon="swap_horiz" @click="openMove(student)">
              <q-tooltip>{{ t("tenant.modules.students.move") }}</q-tooltip>
            </q-btn>
            <q-btn v-if="canUpdate" color="primary" round dense unelevated icon="library_add" @click="openAssign(student)">
              <q-tooltip>{{ t("tenant.modules.students.assign_subjects") }}</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>

      <div v-else class="state-box">
        <q-icon name="school" color="primary" size="42px" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.students.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.students.empty_text") }}</span>
      </div>
    </section>

    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="student-detail-drawer"
    >
      <div v-if="selectedStudent" class="detail-shell">
        <div class="detail-hero" :class="studentTone(selectedStudent)">
          <q-btn flat round dense icon="close" class="detail-close" @click="detailOpen = false" />
          <div class="student-avatar detail-avatar">{{ initials(selectedStudent.displayName) }}</div>
          <h2>{{ selectedStudent.displayName }}</h2>
          <p>{{ selectedStudent.className || t("tenant.modules.students.no_class") }}</p>
          
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
            <q-tab name="guardians" :label="t('tenant.modules.students.guardians')" />
          </q-tabs>
        </div>

        <q-tab-panels v-model="detailTab" animated class="detail-panels">
          <q-tab-panel name="overview" class="detail-content">
            <div class="detail-actions">
              <q-btn v-if="canUpdate" color="primary" icon="edit" :label="t('common.edit')" no-caps unelevated @click="openEdit(selectedStudent)" />
              <q-btn v-if="canUpdate" color="primary" outline icon="family_restroom" :label="t('tenant.modules.students.link_guardian')" no-caps @click="openLink(selectedStudent)" />
              <q-btn v-if="canUpdate" flat color="primary" icon="transfer_within_a_station" :label="t('tenant.modules.students.move')" no-caps @click="openMove(selectedStudent)" />
            </div>

            <section class="detail-block">
              <h3>{{ t("tenant.modules.students.subjects") }}</h3>
              <div v-if="selectedStudent.subjects.length" class="chip-list">
                <q-chip v-for="subject in selectedStudent.subjects" :key="subject.subjectId" color="primary" text-color="primary">
                  {{ subject.name }}
                </q-chip>
              </div>
              <p v-else>{{ t("tenant.modules.students.no_subjects") }}</p>
            </section>

            <section v-if="selectedStudent.metadata && Object.keys(selectedStudent.metadata).length" class="detail-block">
              <h3>{{ t("common.additional_info") }}</h3>
              <div class="metadata-grid">
                <div v-for="(val, key) in selectedStudent.metadata" :key="key" class="metadata-item">
                  <span class="label">{{ key }}:</span>
                  <span class="value">{{ val }}</span>
                </div>
              </div>
            </section>

            <q-btn
              v-if="canUpdate"
              color="primary"
              icon="library_add"
              :label="t('tenant.modules.students.assign_subjects')"
              no-caps
              unelevated
              class="full-width q-mt-md"
              @click="openAssign(selectedStudent)"
            />
          </q-tab-panel>

          <q-tab-panel name="history" class="detail-content">
            <div v-if="studentHistoryLoading" class="flex flex-center q-pa-lg">
              <q-spinner-dots color="primary" size="40px" />
            </div>
            <div v-else-if="studentHistory.length" class="history-timeline">
              <q-timeline color="primary">
                <q-timeline-entry
                  v-for="event in studentHistory"
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

          <q-tab-panel name="guardians" class="detail-content">
            <div v-if="selectedStudent.guardians.length" class="guardian-list">
              <q-item v-for="guardian in selectedStudent.guardians" :key="guardian.userId || guardian.email" class="guardian-item card-saas q-mb-sm">
                <q-item-section avatar>
                  <q-avatar color="soft-primary" text-color="primary" icon="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ guardian.displayName || guardian.email }}</q-item-label>
                  <q-item-label caption>{{ guardian.relationshipType || t('tenant.modules.guardian') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="mail" color="primary" :href="'mailto:' + guardian.email" />
                </q-item-section>
              </q-item>
            </div>
            <p v-else class="text-center q-pa-md">{{ t("tenant.modules.students.no_guardians") }}</p>
            
            <q-btn
              v-if="canUpdate"
              outline
              color="primary"
              icon="add"
              :label="t('tenant.modules.students.link_guardian')"
              no-caps
              class="full-width q-mt-md"
              @click="openLink(selectedStudent)"
            />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-drawer>

    <q-drawer
      v-model="actionOpen"
      side="right"
      overlay
      bordered
      :width="460"
      class="tenant-editor-drawer student-action-drawer"
    >
      <aside class="tenant-editor-shell editor-shell">
        <div class="tenant-editor-head editor-head">
          <div class="tenant-editor-icon editor-icon">
            <q-icon :name="actionIcon" size="24px" />
          </div>
          <div>
            <h2>{{ actionTitle }}</h2>
            <p>{{ actionSubtitle }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="actionOpen = false" />
        </div>

        <q-form class="tenant-editor-form student-form" @submit.prevent="submitAction">
          <template v-if="actionMode === 'create' || actionMode === 'edit'">
            <q-input
              v-model="studentForm.fullName"
              :label="t('tenant.modules.fields.full_name')"
              outlined
              dense
              :rules="[(value) => Boolean(value) || t('common.required')]"
            />
            <q-input
              v-model="studentForm.preferredName"
              :label="t('tenant.modules.fields.preferred_name')"
              outlined
              dense
            />
            <q-input
              v-model="studentForm.externalRef"
              :label="t('tenant.modules.fields.external_ref')"
              outlined
              dense
            />
            <q-select
              v-model="studentForm.primaryClassId"
              :options="classOptions"
              :label="t('tenant.modules.fields.primary_class')"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
            <q-select
              v-model="studentForm.subjectIds"
              :options="subjectOptions"
              :label="t('tenant.modules.fields.subjects')"
              outlined
              dense
              multiple
              use-chips
              emit-value
              map-options
            />
            <q-select
              v-model="studentForm.status"
              :options="statusOptions"
              :label="t('tenant.modules.fields.status')"
              outlined
              dense
              emit-value
              map-options
            />
          </template>

          <template v-else-if="actionMode === 'move'">
            <div class="selected-action-student">
              <span>{{ t("tenant.modules.students.name") }}</span>
              <strong>{{ selectedStudent?.displayName }}</strong>
            </div>
            <q-select
              v-model="moveForm.classId"
              :options="classOptions"
              :label="t('tenant.modules.fields.class')"
              outlined
              dense
              emit-value
              map-options
              :rules="[(value) => Boolean(value) || t('common.required')]"
            />
            <AppDateField
              v-model="moveForm.movedAt"
              :label="t('tenant.modules.fields.change_date')"
            />
          </template>

          <template v-else-if="actionMode === 'assign'">
            <div class="selected-action-student">
              <span>{{ t("tenant.modules.students.name") }}</span>
              <strong>{{ selectedStudent?.displayName }}</strong>
            </div>
            <q-select
              v-model="assignForm.subjectIds"
              :options="subjectOptions"
              :label="t('tenant.modules.fields.subjects')"
              outlined
              dense
              multiple
              use-chips
              emit-value
              map-options
              :rules="[(value) => Boolean(value?.length) || t('common.required')]"
            />
            <q-toggle
              v-model="assignForm.replace"
              color="primary"
              :label="t('tenant.modules.students.replace_subjects')"
            />
            <AppDateField
              v-model="assignForm.assignedAt"
              :label="t('tenant.modules.fields.change_date')"
            />
          </template>
          <template v-if="actionMode === 'link_guardian'">
            <q-select
              v-model="linkForm.guardianUserId"
              :options="guardianOptions"
              :label="t('tenant.modules.guardians.title')"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => Boolean(val) || t('common.required')]"
            />
            <q-input
              v-model="linkForm.relationshipType"
              :label="t('tenant.modules.fields.relationship')"
              outlined
              dense
              :rules="[(val) => Boolean(val) || t('common.required')]"
            />
          </template>
        </q-form>

        <div class="tenant-editor-actions editor-actions">
          <q-btn flat :label="t('common.cancel')" no-caps @click="actionOpen = false" />
          <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated @click="submitAction" />
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
import { getTenantClasses, getTenantCourses, getTenantStudents, getTenantAcademicHistory } from "src/utils/api/get";
import { assignTenantStudentSubjects, createTenantStudent, moveTenantStudentToClass, linkTenantGuardian } from "src/utils/api/post";
import { updateTenantStudent } from "src/utils/api/patch";
import { date } from "quasar";
import { useRoute } from "vue-router";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const actionOpen = ref(false);
const detailOpen = ref(false);
const detailTab = ref("overview");
const actionMode = ref("create");
const selectedStudent = ref(null);
const searchQuery = ref("");
const route = useRoute();
const statusFilter = ref("all");
const classFilter = ref("all");
const students = ref([]);
const classes = ref([]);
const subjects = ref([]);

const studentForm = reactive({
  fullName: "",
  preferredName: "",
  externalRef: "",
  primaryClassId: null,
  subjectIds: [],
  status: "active",
});

const moveForm = reactive({
  classId: null,
  movedAt: "",
});

const assignForm = reactive({
  subjectIds: [],
  assignedAt: "",
  replace: false,
});

const linkForm = reactive({
  guardianUserId: null,
  relationshipType: "",
});

const canCreate = computed(() => tenantSession.hasPermission("students.create"));
const canUpdate = computed(() => tenantSession.hasPermission("students.update"));
const activeStudents = computed(() => students.value.filter((item) => item.status === "active"));
const studentsWithClass = computed(() => students.value.filter((item) => item.primaryClassId).length);
const studentsWithGuardians = computed(() => students.value.filter((item) => item.guardians.length > 0).length);
const totalSubjectLinks = computed(() => students.value.reduce((total, item) => total + item.subjects.length, 0));

const classOptions = computed(() => classes.value.map((item) => ({ label: item.name, value: item.id })));
const subjectOptions = computed(() => subjects.value.map((item) => ({ label: item.name, value: item.id })));
const classFilterOptions = computed(() => [
  { label: t("common.all"), value: "all" },
  { label: t("tenant.modules.students.no_class"), value: "__none" },
  ...classOptions.value,
]);
const statusOptions = computed(() => [
  { label: t("common.active"), value: "active" },
  { label: t("common.inactive"), value: "inactive" },
  { label: t("common.archived"), value: "archived" },
]);

const guardianOptions = ref([]);

const filteredStudents = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  return students.value.filter((item) => {
    const matchesStatus = statusFilter.value === "all" || item.status === statusFilter.value;
    const matchesClass =
      classFilter.value === "all" ||
      (classFilter.value === "__none" ? !item.primaryClassId : item.primaryClassId === classFilter.value);
    const haystack = `${item.displayName} ${item.preferredName} ${item.externalRef} ${item.className} ${item.subjects.map((subject) => subject.name).join(" ")}`.toLowerCase();
    return matchesStatus && matchesClass && (!needle || haystack.includes(needle));
  });
});

const actionTitle = computed(() => {
  if (actionMode.value === "edit") return t("common.edit");
  if (actionMode.value === "move") return t("tenant.modules.students.move_title");
  if (actionMode.value === "assign") return t("tenant.modules.students.assign_subjects_title");
  if (actionMode.value === "link_guardian") return t("tenant.modules.students.link_guardian");
  return t("tenant.modules.students.create");
});

const actionIcon = computed(() => {
  if (actionMode.value === "move") return "swap_horiz";
  if (actionMode.value === "assign") return "library_add";
  if (actionMode.value === "edit") return "edit";
  if (actionMode.value === "link_guardian") return "family_restroom";
  return "person_add";
});

const actionSubtitle = computed(() => {
  if (actionMode.value === "move") return t("tenant.modules.students.move_subtitle");
  if (actionMode.value === "assign") return t("tenant.modules.students.assign_subjects_subtitle");
  if (actionMode.value === "link_guardian") return t("tenant.modules.students.link_guardian_subtitle");
  return t("tenant.modules.students.create_subtitle");
});

function normalizeStudent(item) {
  const subjectsList = Array.isArray(item.subjects) ? item.subjects.filter(Boolean) : [];
  const guardiansList = Array.isArray(item.guardians) ? item.guardians.filter(Boolean) : [];
  return {
    id: item.student_id,
    fullName: item.full_name,
    preferredName: item.preferred_name,
    displayName: item.preferred_name || item.full_name,
    externalRef: item.external_ref,
    primaryClassId: item.primary_class_id,
    className: item.class_name,
    status: item.status,
    metadata: item.metadata_json || {},
    subjects: subjectsList,
    subjectIds: subjectsList.map((subject) => subject.subjectId || subject.subject_id).filter(Boolean),
    guardians: guardiansList,
  };
}

function normalizeClass(item) {
  return {
    id: item.class_id,
    name: item.name,
  };
}

function normalizeSubject(item) {
  return {
    id: item.subject_id,
    name: item.name,
  };
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "AL";
}

function statusLabel(status) {
  if (status === "active") return t("common.active");
  if (status === "inactive") return t("common.inactive");
  if (status === "archived") return t("common.archived");
  return status || "-";
}

function statusColor(status) {
  if (status === "active") return "positive";
  if (status === "inactive") return "warning";
  if (status === "archived") return "grey";
  return "grey";
}

const studentHistory = ref([]);
const studentHistoryLoading = ref(false);

function studentTone(student) {
  const seed = `${student.id}-${student.displayName}`;
  const index = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return `tone-${index + 1}`;
}

function resetStudentForm() {
  studentForm.fullName = "";
  studentForm.preferredName = "";
  studentForm.externalRef = "";
  studentForm.primaryClassId = null;
  studentForm.subjectIds = [];
  studentForm.status = "active";
}

function openCreate() {
  selectedStudent.value = null;
  actionMode.value = "create";
  resetStudentForm();
  actionOpen.value = true;
}

function openEdit(student) {
  selectedStudent.value = student;
  detailOpen.value = false;
  actionMode.value = "edit";
  studentForm.fullName = student.fullName || "";
  studentForm.preferredName = student.preferredName || "";
  studentForm.externalRef = student.externalRef || "";
  studentForm.primaryClassId = student.primaryClassId || null;
  studentForm.subjectIds = [...student.subjectIds];
  studentForm.status = student.status || "active";
  actionOpen.value = true;
}

function openMove(student) {
  selectedStudent.value = student;
  detailOpen.value = false;
  actionMode.value = "move";
  moveForm.classId = student.primaryClassId || null;
  moveForm.movedAt = "";
  actionOpen.value = true;
}

function openAssign(student) {
  selectedStudent.value = student;
  detailOpen.value = false;
  actionMode.value = "assign";
  assignForm.subjectIds = [...student.subjectIds];
  assignForm.assignedAt = "";
  assignForm.replace = false;
  actionOpen.value = true;
}

function openLink(student) {
  selectedStudent.value = student;
  detailOpen.value = false;
  actionMode.value = "link_guardian";
  linkForm.guardianUserId = null;
  linkForm.relationshipType = "";
  actionOpen.value = true;
  // Pre-load guardians if needed
  if (!guardianOptions.value.length) {
    import("src/utils/api/get").then(({ getTenantGuardians }) => {
      getTenantGuardians().then(res => {
        guardianOptions.value = (res.data.data || []).map(g => ({
          label: g.display_name || g.email,
          value: g.user_id || g.id
        }));
      });
    });
  }
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

async function openDetail(student) {
  selectedStudent.value = student;
  studentHistory.value = [];
  studentHistoryLoading.value = true;
  detailOpen.value = true;
  detailTab.value = "overview";
  
  if (tenantSession.hasPermission("academic_history.read")) {
    try {
      const res = await getTenantAcademicHistory({ studentId: student.id });
      studentHistory.value = res.data?.data || [];
    } catch {
      studentHistory.value = [];
    }
  }
  studentHistoryLoading.value = false;
}

function studentPayload() {
  return {
    fullName: studentForm.fullName,
    preferredName: studentForm.preferredName || null,
    externalRef: studentForm.externalRef || null,
    primaryClassId: studentForm.primaryClassId || null,
    subjectIds: studentForm.subjectIds || [],
    status: studentForm.status,
  };
}

async function loadData() {
  loading.value = true;
  try {
    const [studentsRes, classesRes, subjectsRes] = await Promise.all([
      getTenantStudents(),
      tenantSession.hasPermission("classes.read") ? getTenantClasses() : Promise.resolve({ data: { data: [] } }),
      tenantSession.hasPermission("courses.read") ? getTenantCourses() : Promise.resolve({ data: { data: [] } }),
    ]);
    students.value = (studentsRes.data.data || []).map(normalizeStudent);
    classes.value = (classesRes.data.data || []).map(normalizeClass);
    subjects.value = (subjectsRes.data.data || []).map(normalizeSubject);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
  if (route.query.action === "create" && canCreate.value) {
    openCreate();
  }
});

async function submitAction() {
  saving.value = true;
  try {
    if (actionMode.value === "create") {
      await createTenantStudent(studentPayload());
    } else if (actionMode.value === "edit" && selectedStudent.value) {
      await updateTenantStudent(selectedStudent.value.id, studentPayload());
    } else if (actionMode.value === "move" && selectedStudent.value) {
      await moveTenantStudentToClass(selectedStudent.value.id, { ...moveForm });
    } else if (actionMode.value === "assign" && selectedStudent.value) {
      await assignTenantStudentSubjects(selectedStudent.value.id, { ...assignForm });
    } else if (actionMode.value === "link_guardian" && selectedStudent.value) {
      await linkTenantGuardian(selectedStudent.value.id, {
        guardianUserId: linkForm.guardianUserId,
        relationshipType: linkForm.relationshipType,
      });
    }
    actionOpen.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped lang="scss">
.students-page {
  display: grid;
  gap: var(--space-5);
}

.students-head {
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

.student-search {
  min-width: min(340px, 40vw);
}

.student-summary-grid {
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
}

.student-workspace {
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

.class-filter {
  min-width: 210px;
}

.student-list {
  display: grid;
  gap: var(--space-2);
  max-height: calc(100vh - 360px);
  min-height: 260px;
  overflow: auto;
  padding: var(--space-3);
}

.student-row {
  align-items: center;
  background: var(--eg-surface);
  border: 1px solid transparent;
  border-radius: var(--tenant-radius-md);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(300px, 1.2fr) minmax(230px, 0.8fr) auto;
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
}

.student-main {
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

.student-avatar {
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

.tone-2 .student-avatar,
.tone-2.detail-hero {
  background: var(--tenant-cyan-card);
}

.tone-3 .student-avatar,
.tone-3.detail-hero {
  background: var(--tenant-pink-card);
}

.tone-4 .student-avatar,
.tone-4.detail-hero {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.tone-5 .student-avatar,
.tone-5.detail-hero {
  background: var(--tenant-dark-card);
}

.student-copy {
  min-width: 0;
}

.student-title-line {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;

  strong {
    color: var(--eg-text);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.student-copy p {
  align-items: center;
  color: var(--eg-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.student-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  span {
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
}

.student-actions {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  justify-content: flex-end;
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

.student-detail-drawer {
  background: var(--eg-surface);
}

.detail-shell {
  min-height: 100%;
}

.detail-hero {
  align-items: center;
  background: var(--tenant-blue-card);
  color: #fff;
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  min-height: 210px;
  padding: var(--space-6) var(--space-5) var(--space-5);
  position: relative;
  text-align: center;

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
  grid-template-columns: 1fr 1fr;
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
    font-size: var(--font-size-xs);
  }
}

.metadata-grid {
  display: grid;
  gap: var(--space-2);
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);

  .label {
    color: var(--eg-muted);
    font-weight: var(--font-weight-bold);
  }

  .value {
    color: var(--eg-text);
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

.guardian-item {
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-md);
  padding: var(--space-2);
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

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.guardian-list {
  display: grid;
  gap: var(--space-2);

  div {
    display: grid;
    gap: 2px;
  }

  strong {
    color: var(--eg-text);
  }

  span {
    color: var(--eg-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }
}

.student-form {
  display: grid;
  gap: var(--space-4);
}

.selected-action-student {
  background: var(--eg-surface-soft);
  border: 1px solid var(--eg-border-soft);
  border-radius: var(--tenant-radius-md);
  display: grid;
  gap: var(--space-1);
  padding: var(--space-4);

  span {
    color: var(--eg-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-extrabold);
    text-transform: uppercase;
  }

  strong {
    color: var(--eg-text);
    font-weight: var(--font-weight-extrabold);
  }
}

@media (max-width: 1180px) {
  .student-summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .student-row {
    grid-template-columns: 1fr;
  }

  .student-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .students-head,
  .student-summary-grid {
    grid-template-columns: 1fr;
  }

  .head-actions,
  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .student-search,
  .class-filter {
    min-width: 0;
    width: 100%;
  }

  .filter-bar {
    display: grid;
  }

  .student-list {
    max-height: none;
  }

  .detail-actions {
    grid-template-columns: 1fr;
  }
}
</style>
