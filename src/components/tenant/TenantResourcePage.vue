<template>
  <q-page class="page-shell-premium tenant-module-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">{{ page.title }}</h1>
        <p class="text-page-subtitle">{{ page.subtitle }}</p>
      </div>
      <div class="header-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="module-search"
          :placeholder="t('tenant.modules.search_placeholder')"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
        <q-btn
          v-if="page.canCreate && page.form"
          color="primary"
          icon="add"
          :label="page.createLabel"
          no-caps
          @click="openCreate"
        />
      </div>
    </div>

    <div v-if="moduleStats.length" class="module-context-strip">
      <div
        v-for="stat in moduleStats"
        :key="stat.label"
        class="context-pill"
      >
        <q-icon :name="stat.icon" size="18px" />
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
      </div>
    </div>

    <section v-if="filteredRows.length" class="entity-card-grid">
      <q-card
        v-for="row in featuredRows"
        :key="row.id"
        class="card-saas entity-card"
        clickable
        @click="openDetail(row)"
      >
        <div class="entity-card-visual" :class="visualClass(row)">
          <q-badge class="entity-type-badge" text-color="white">
            <q-icon :name="page.icon" size="14px" />
            {{ page.shortLabel || page.title }}
          </q-badge>
          <q-icon :name="page.icon" class="entity-watermark" />
        </div>
        <q-card-section>
          <div class="entity-card-head">
            <div class="icon-tile bg-soft-primary">
              <q-icon :name="page.icon" color="primary" size="20px" />
            </div>
            <q-badge :color="statusColor(row.status)" text-color="white">
              {{ statusLabel(row.status) }}
            </q-badge>
          </div>
          <div class="entity-card-title">{{ row.name }}</div>
          <div class="entity-card-caption">{{ row.caption || primaryDetail(row) }}</div>
          <div class="entity-card-meta">
            <span v-for="item in compactDetails(row).slice(0, 3)" :key="item.label">
              {{ item.label }}: <strong>{{ item.value }}</strong>
            </span>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <q-card v-if="page.showTable !== false" class="card-saas table-card">
      <q-table
        :rows="filteredRows"
        :columns="page.columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 0 }"
        :rows-per-page-options="[0]"
        hide-bottom
        class="tenant-table"
        @row-click="(_, row) => openDetail(row)"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="entity-cell">
              <div class="icon-tile bg-soft-primary entity-icon">
                <q-icon :name="page.icon" color="primary" size="18px" />
              </div>
              <div>
                <strong>{{ props.row.name }}</strong>
                <span>{{ props.row.caption || t("common.no_code") }}</span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="statusColor(props.row.status)" text-color="white">
              {{ statusLabel(props.row.status) }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-subjects="props">
          <q-td :props="props">
            <div class="chips-line">
              <q-chip
                v-for="subject in props.row.subjects.slice(0, 3)"
                :key="subject.subjectId || subject.name"
                dense
                color="primary"
                text-color="white"
              >
                {{ subject.name }}
              </q-chip>
              <span v-if="props.row.subjects.length > 3" class="text-secondary">
                +{{ props.row.subjects.length - 3 }}
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              @click.stop="openDetail(props.row)"
            >
              <q-tooltip>{{ t("tenant.modules.view_detail") }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="page.canUpdate"
              flat
              round
              dense
              icon="edit"
              @click.stop="openEdit(props.row)"
            >
              <q-tooltip>{{ t("common.edit") }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="page.key === 'STUDENTS' && page.canUpdate"
              flat
              round
              dense
              icon="swap_horiz"
              @click.stop="openMoveStudent(props.row)"
            >
              <q-tooltip>{{ t("tenant.modules.students.move") }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="page.key === 'STUDENTS' && page.canUpdate"
              flat
              round
              dense
              icon="library_add"
              @click.stop="openAssignSubjects(props.row)"
            >
              <q-tooltip>{{ t("tenant.modules.students.assign_subjects") }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="page.key === 'STUDENTS' && page.canUpdate"
              flat
              round
              dense
              icon="family_restroom"
              @click.stop="openGuardianDialog(props.row)"
            >
              <q-tooltip>{{ t("tenant.modules.link_guardian") }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="empty-state">
            <q-icon :name="page.icon" size="34px" color="primary" />
            <strong>{{ searchQuery ? t("tenant.modules.no_results") : page.emptyTitle }}</strong>
            <span>{{ searchQuery ? t("tenant.modules.no_results_text") : page.emptyText }}</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-card v-if="page.privacyNote" class="card-saas privacy-note">
      <q-card-section>
        <div class="row items-start no-wrap q-gutter-md">
          <div class="icon-tile bg-soft-warning">
            <q-icon name="verified_user" color="warning" size="21px" />
          </div>
          <div>
            <div class="module-card-title">{{ t("tenant.modules.privacy_rule") }}</div>
            <p class="text-secondary q-mt-xs q-mb-none">{{ page.privacyNote }}</p>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <AppDialog
      v-model="createDialog"
      :title="page.createLabel"
      :subtitle="page.createSubtitle"
      :icon="page.icon"
      wide
    >
      <q-form class="form-grid" @submit.prevent="submitCreate">
        <template v-for="field in visibleFormFields" :key="field.name">
          <q-select
            v-if="field.component === 'q-select'"
            v-model="form[field.name]"
            v-bind="field.props"
            :options="field.options()"
            :label="field.label"
            :rules="field.required ? [(value) => Boolean(value) || t('common.required')] : []"
            outlined
            dense
          />
          <AppDateField
            v-else-if="field.type === 'date'"
            v-model="form[field.name]"
            :label="field.label"
            :rules="field.required ? [(value) => Boolean(value) || t('common.required')] : []"
          />
          <q-input
            v-else
            v-model="form[field.name]"
            :label="field.label"
            :type="field.type || 'text'"
            :rules="field.required ? [(value) => Boolean(value) || t('common.required')] : []"
            outlined
            dense
          />
        </template>
      </q-form>

      <template #actions>
        <q-btn flat :label="t('common.cancel')" no-caps @click="createDialog = false" />
        <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" @click="submitCreate" />
      </template>
    </AppDialog>

    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="420"
      class="detail-drawer"
    >
      <div v-if="selectedRow" class="detail-shell">
        <div class="detail-head">
          <div class="icon-tile bg-soft-primary detail-icon">
            <q-icon :name="page.icon" color="primary" size="24px" />
          </div>
          <div>
            <h2>{{ selectedRow.name }}</h2>
            <p>{{ selectedRow.caption || primaryDetail(selectedRow) }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="detailOpen = false" />
        </div>

        <q-badge :color="statusColor(selectedRow.status)" text-color="white" class="detail-status">
          {{ statusLabel(selectedRow.status) }}
        </q-badge>

        <div class="detail-grid">
          <div
            v-for="item in detailItems(selectedRow)"
            :key="item.label"
            class="detail-item"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <div v-if="selectedRow.subjects?.length" class="detail-block">
          <span class="detail-block-label">{{ t("tenant.modules.students.subjects") }}</span>
          <div class="chips-line detail-chips">
            <q-chip
              v-for="subject in selectedRow.subjects"
              :key="subject.subjectId || subject.name"
              dense
              color="primary"
              text-color="white"
            >
              {{ subject.name }}
            </q-chip>
          </div>
        </div>

        <div class="detail-actions">
          <q-btn
            v-if="page.canUpdate"
            color="primary"
            icon="edit"
            :label="t('common.edit')"
            no-caps
            @click="openEdit(selectedRow)"
          />
          <q-btn
            v-if="page.key === 'STUDENTS' && page.canUpdate"
            outline
            color="primary"
            icon="swap_horiz"
            :label="t('tenant.modules.students.move')"
            no-caps
            @click="openMoveStudent(selectedRow)"
          />
          <q-btn
            v-if="page.key === 'STUDENTS' && page.canUpdate"
            outline
            color="primary"
            icon="library_add"
            :label="t('tenant.modules.students.assign_subjects')"
            no-caps
            @click="openAssignSubjects(selectedRow)"
          />
          <q-btn
            v-if="page.key === 'STUDENTS' && page.canUpdate"
            outline
            color="primary"
            icon="family_restroom"
            :label="t('tenant.modules.link_guardian')"
            no-caps
            @click="openGuardianDialog(selectedRow)"
          />
        </div>
      </div>
    </q-drawer>

    <AppDialog
      v-model="guardianDialog"
      :title="t('tenant.modules.link_guardian_title')"
      :subtitle="t('tenant.modules.link_guardian_subtitle')"
      icon="family_restroom"
      wide
    >
      <q-form class="form-grid" @submit.prevent="submitGuardianLink">
        <q-select
          v-model="guardianForm.guardianUserId"
          :options="guardianOptions"
          :label="t('tenant.modules.guardian')"
          emit-value
          map-options
          outlined
          dense
          :rules="[(value) => Boolean(value) || t('common.required')]"
        />
        <q-input
          v-model="guardianForm.relationshipType"
          :label="t('tenant.modules.relationship')"
          outlined
          dense
        />
      </q-form>

      <template #actions>
        <q-btn flat :label="t('common.cancel')" no-caps @click="guardianDialog = false" />
        <q-btn color="primary" icon="link" :label="t('common.confirm')" no-caps :loading="saving" @click="submitGuardianLink" />
      </template>
    </AppDialog>

    <AppDialog
      v-model="moveStudentDialog"
      :title="t('tenant.modules.students.move_title')"
      :subtitle="t('tenant.modules.students.move_subtitle')"
      icon="swap_horiz"
      wide
    >
      <q-form class="form-grid" @submit.prevent="submitMoveStudent">
        <q-select
          v-model="moveStudentForm.classId"
          :options="classOptions"
          :label="t('tenant.modules.fields.class')"
          emit-value
          map-options
          outlined
          dense
          :rules="[(value) => Boolean(value) || t('common.required')]"
        />
        <AppDateField
          v-model="moveStudentForm.movedAt"
          :label="t('tenant.modules.fields.change_date')"
        />
      </q-form>

      <template #actions>
        <q-btn flat :label="t('common.cancel')" no-caps @click="moveStudentDialog = false" />
        <q-btn color="primary" icon="swap_horiz" :label="t('common.confirm')" no-caps :loading="saving" @click="submitMoveStudent" />
      </template>
    </AppDialog>

    <AppDialog
      v-model="assignSubjectsDialog"
      :title="t('tenant.modules.students.assign_subjects_title')"
      :subtitle="t('tenant.modules.students.assign_subjects_subtitle')"
      icon="library_add"
      wide
    >
      <q-form class="form-grid" @submit.prevent="submitAssignSubjects">
        <q-select
          v-model="assignSubjectsForm.subjectIds"
          :options="subjectOptions"
          :label="t('tenant.modules.fields.subjects')"
          emit-value
          map-options
          multiple
          use-chips
          outlined
          dense
          :rules="[(value) => value?.length > 0 || t('common.required')]"
        />
        <q-toggle
          v-model="assignSubjectsForm.replace"
          :label="t('tenant.modules.students.replace_subjects')"
        />
        <AppDateField
          v-model="assignSubjectsForm.assignedAt"
          :label="t('tenant.modules.fields.change_date')"
        />
      </q-form>

      <template #actions>
        <q-btn flat :label="t('common.cancel')" no-caps @click="assignSubjectsDialog = false" />
        <q-btn color="primary" icon="library_add" :label="t('common.confirm')" no-caps :loading="saving" @click="submitAssignSubjects" />
      </template>
    </AppDialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AppDialog from "src/components/common/AppDialog.vue";
import AppDateField from "src/components/common/AppDateField.vue";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import {
  getTenantClasses,
  getTenantCourses,
  getTenantEnrollments,
  getTenantGuardians,
  getTenantPeriods,
  getTenantStudents,
  getTenantTeacherAssignments,
  getTenantTeachers,
} from "src/utils/api/get";
import {
  createTenantClass,
  createTenantCourse,
  createTenantEnrollment,
  createTenantPeriod,
  createTenantStudent,
  createTenantTeacherAssignment,
  assignTenantStudentSubjects,
  assignTenantTeacher,
  linkTenantGuardian,
  moveTenantStudentToClass,
} from "src/utils/api/post";
import {
  updateTenantClass,
  updateTenantCourse,
  updateTenantEnrollment,
  updateTenantPeriod,
  updateTenantStudent,
  updateTenantTeacherAssignment,
} from "src/utils/api/patch";

const props = defineProps({
  moduleKey: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const tenantSession = useTenantSessionStore();
const rows = ref([]);
const classOptions = ref([]);
const periodOptions = ref([]);
const subjectOptions = ref([]);
const studentOptions = ref([]);
const teacherOptions = ref([]);
const guardianOptions = ref([]);
const loading = ref(false);
const saving = ref(false);
const createDialog = ref(false);
const guardianDialog = ref(false);
const moveStudentDialog = ref(false);
const assignSubjectsDialog = ref(false);
const detailOpen = ref(false);
const editingRow = ref(null);
const selectedRow = ref(null);
const selectedStudent = ref(null);
const searchQuery = ref("");
const form = reactive({});
const guardianForm = reactive({ guardianUserId: "", relationshipType: "guardian" });
const moveStudentForm = reactive({ classId: "", movedAt: "" });
const assignSubjectsForm = reactive({ subjectIds: [], assignedAt: "", replace: false });

const periodTypeOptions = [
  { label: t("tenant.modules.period_types.school_year"), value: "school_year" },
  { label: t("tenant.modules.period_types.term"), value: "term" },
  { label: t("tenant.modules.period_types.evaluation"), value: "evaluation" },
  { label: t("tenant.modules.period_types.custom"), value: "custom" },
];

const periodStatusOptions = [
  { label: t("tenant.modules.status.planned"), value: "planned" },
  { label: t("tenant.modules.status.active"), value: "active" },
  { label: t("tenant.modules.status.closed"), value: "closed" },
  { label: t("tenant.modules.status.archived"), value: "archived" },
];

const assignmentStatusOptions = [
  { label: t("tenant.modules.status.planned"), value: "planned" },
  { label: t("tenant.modules.status.active"), value: "active" },
  { label: t("tenant.modules.status.completed"), value: "completed" },
  { label: t("tenant.modules.status.suspended"), value: "suspended" },
  { label: t("tenant.modules.status.cancelled"), value: "cancelled" },
];

const enrollmentTypeOptions = [
  { label: t("tenant.modules.enrollments.type_class"), value: "class" },
  { label: t("tenant.modules.enrollments.type_subject"), value: "subject" },
];

const enrollmentStatusOptions = [
  { label: t("tenant.modules.status.pending"), value: "pending" },
  { label: t("tenant.modules.status.active"), value: "active" },
  { label: t("tenant.modules.status.completed"), value: "completed" },
  { label: t("tenant.modules.status.dropped"), value: "dropped" },
  { label: t("tenant.modules.status.suspended"), value: "suspended" },
  { label: t("tenant.modules.status.cancelled"), value: "cancelled" },
];

const moduleBuilders = {
  PERIODS: () => ({
    key: "PERIODS",
    title: t("tenant.modules.periods.title"),
    subtitle: t("tenant.modules.periods.subtitle"),
    icon: "event_note",
    shortLabel: t("tenant.layout.nav_periods"),
    permissionCreate: "periods.create",
    createLabel: t("tenant.modules.periods.create"),
    createSubtitle: t("tenant.modules.periods.create_subtitle"),
    emptyTitle: t("tenant.modules.periods.empty_title"),
    emptyText: t("tenant.modules.periods.empty_text"),
    loader: getTenantPeriods,
    creator: createTenantPeriod,
    updater: updateTenantPeriod,
    permissionUpdate: "periods.update",
    showTable: false,
    stats: (allRows) => [
      {
        label: t("tenant.modules.periods.current"),
        value: allRows.find((row) => row.status === "active")?.name || "-",
        icon: "event_available",
      },
      {
        label: t("tenant.modules.periods.school_years"),
        value: allRows.filter((row) => row.periodType === "school_year").length,
        icon: "calendar_month",
      },
      {
        label: t("tenant.modules.periods.evaluations"),
        value: allRows.filter((row) => ["term", "evaluation"].includes(row.periodType)).length,
        icon: "timeline",
      },
    ],
    form: [
      input("name", t("tenant.modules.fields.name"), true),
      input("code", t("tenant.modules.fields.code"), true),
      select("periodType", t("tenant.modules.fields.period_type"), periodTypeOptions),
      input("startsAt", t("tenant.modules.fields.starts_at"), false, "date"),
      input("endsAt", t("tenant.modules.fields.ends_at"), false, "date"),
      select("status", t("tenant.modules.fields.status"), periodStatusOptions),
    ],
    columns: [
      col("name", t("tenant.modules.periods.name"), "left"),
      col("periodTypeLabel", t("tenant.modules.fields.period_type")),
      col("dateRange", t("tenant.modules.periods.dates")),
      col("isDefaultText", t("tenant.modules.periods.default")),
      col("status", t("tenant.modules.fields.status")),
      col("actions", t("tenant.modules.actions"), "right"),
    ],
    normalize: (item) => ({
      id: item.period_id,
      name: item.name,
      code: item.code,
      caption: item.code,
      periodType: item.period_type,
      periodTypeLabel: periodTypeLabel(item.period_type),
      startsAt: item.starts_at?.slice(0, 10) || "",
      endsAt: item.ends_at?.slice(0, 10) || "",
      dateRange: [item.starts_at?.slice(0, 10), item.ends_at?.slice(0, 10)].filter(Boolean).join(" - ") || "-",
      isDefaultText: item.is_default ? t("common.yes") : t("common.no"),
      status: item.status,
      raw: item,
    }),
  }),
  CLASSES: () => ({
    key: "CLASSES",
    title: t("tenant.modules.classes.title"),
    subtitle: t("tenant.modules.classes.subtitle"),
    icon: "groups",
    shortLabel: t("tenant.layout.nav_classes"),
    permissionCreate: "classes.create",
    createLabel: t("tenant.modules.classes.create"),
    createSubtitle: t("tenant.modules.classes.create_subtitle"),
    emptyTitle: t("tenant.modules.classes.empty_title"),
    emptyText: t("tenant.modules.classes.empty_text"),
    loader: getTenantClasses,
    creator: createTenantClass,
    updater: updateTenantClass,
    permissionUpdate: "classes.update",
    form: [
      input("name", t("tenant.modules.fields.name"), true),
      input("code", t("tenant.modules.fields.code")),
      input("level", t("tenant.modules.fields.level")),
      input("academicYear", t("tenant.modules.fields.academic_year")),
    ],
    columns: [
      col("name", t("tenant.modules.classes.name"), "left"),
      col("level", t("tenant.modules.classes.level")),
      col("academicYear", t("tenant.modules.classes.academic_year")),
      col("studentsCount", t("tenant.modules.classes.students"), "right"),
      col("status", t("tenant.modules.fields.status")),
      col("actions", t("tenant.modules.actions"), "right"),
    ],
    normalize: (item) => ({
      id: item.class_id,
      name: item.name,
      code: item.code,
      caption: item.code,
      level: item.level || "-",
      academicYear: item.academic_year,
      studentsCount: item.students_count || 0,
      status: item.status,
      raw: item,
    }),
  }),
  STUDENTS: () => ({
    key: "STUDENTS",
    title: t("tenant.modules.students.title"),
    subtitle: t("tenant.modules.students.subtitle"),
    icon: "school",
    shortLabel: t("tenant.layout.nav_students"),
    permissionCreate: "students.create",
    createLabel: t("tenant.modules.students.create"),
    createSubtitle: t("tenant.modules.students.create_subtitle"),
    emptyTitle: t("tenant.modules.students.empty_title"),
    emptyText: t("tenant.modules.students.empty_text"),
    privacyNote: t("tenant.modules.students.privacy"),
    loader: getTenantStudents,
    creator: createTenantStudent,
    updater: updateTenantStudent,
    permissionUpdate: "students.update",
    form: [
      input("fullName", t("tenant.modules.fields.full_name"), true),
      input("preferredName", t("tenant.modules.fields.preferred_name")),
      input("externalRef", t("tenant.modules.fields.external_ref")),
      select("primaryClassId", t("tenant.modules.fields.primary_class"), classOptions),
      select("subjectIds", t("tenant.modules.fields.subjects"), subjectOptions, true),
    ],
    columns: [
      col("name", t("tenant.modules.students.name"), "left"),
      col("className", t("tenant.modules.students.class")),
      col("subjects", t("tenant.modules.students.subjects")),
      col("guardiansCount", t("tenant.modules.students.guardians"), "right"),
      col("status", t("tenant.modules.fields.status")),
      col("actions", t("tenant.modules.actions"), "right"),
    ],
    normalize: (item) => ({
      id: item.student_id,
      name: item.full_name,
      caption: item.external_ref || item.preferred_name,
      fullName: item.full_name,
      preferredName: item.preferred_name,
      externalRef: item.external_ref,
      primaryClassId: item.primary_class_id,
      periodId: "",
      subjectIds: (item.subjects || []).map((subject) => subject.subjectId),
      className: item.class_name || "-",
      subjects: item.subjects || [],
      guardiansCount: item.guardians?.length || 0,
      status: item.status,
      raw: item,
    }),
  }),
  ENROLLMENTS: () => ({
    key: "ENROLLMENTS",
    title: t("tenant.modules.enrollments.title"),
    subtitle: t("tenant.modules.enrollments.subtitle"),
    icon: "how_to_reg",
    shortLabel: t("tenant.layout.nav_enrollments"),
    permissionCreate: "enrollments.manage",
    createLabel: t("tenant.modules.enrollments.create"),
    createSubtitle: t("tenant.modules.enrollments.create_subtitle"),
    emptyTitle: t("tenant.modules.enrollments.empty_title"),
    emptyText: t("tenant.modules.enrollments.empty_text"),
    loader: getTenantEnrollments,
    creator: createTenantEnrollment,
    updater: updateTenantEnrollment,
    permissionUpdate: "enrollments.manage",
    form: [
      select("enrollmentType", t("tenant.modules.fields.enrollment_type"), enrollmentTypeOptions, false, true),
      select("studentId", t("tenant.modules.fields.student"), studentOptions, false, true),
      select("classId", t("tenant.modules.fields.class"), classOptions),
      select("subjectId", t("tenant.modules.fields.subject"), subjectOptions),
      select("periodId", t("tenant.modules.fields.period"), periodOptions),
      input("startsAt", t("tenant.modules.fields.starts_at"), false, "date"),
      input("endsAt", t("tenant.modules.fields.ends_at"), false, "date"),
      select("status", t("tenant.modules.fields.status"), enrollmentStatusOptions),
    ],
    columns: [
      col("name", t("tenant.modules.enrollments.student"), "left"),
      col("enrollmentTypeLabel", t("tenant.modules.fields.enrollment_type")),
      col("targetName", t("tenant.modules.enrollments.target")),
      col("periodName", t("tenant.modules.enrollments.period")),
      col("dateRange", t("tenant.modules.periods.dates")),
      col("status", t("tenant.modules.fields.status")),
      col("actions", t("tenant.modules.actions"), "right"),
    ],
    normalize: (item) => ({
      id: item.enrollment_id,
      name: item.student_name,
      caption: item.class_name || item.subject_name || "-",
      enrollmentType: item.enrollment_type,
      enrollmentTypeLabel: item.enrollment_type === "subject" ? t("tenant.modules.enrollments.type_subject") : t("tenant.modules.enrollments.type_class"),
      studentId: item.student_id,
      classId: item.class_id,
      subjectId: item.subject_id,
      periodId: item.period_id,
      targetName: item.enrollment_type === "subject" ? item.subject_name : item.class_name,
      periodName: item.period_name || "-",
      startsAt: item.starts_at?.slice(0, 10) || "",
      endsAt: item.ends_at?.slice(0, 10) || "",
      dateRange: [item.starts_at?.slice(0, 10), item.ends_at?.slice(0, 10)].filter(Boolean).join(" - ") || "-",
      status: item.status,
      raw: item,
    }),
  }),
  TEACHERS: () => ({
    key: "TEACHERS",
    title: t("tenant.modules.teachers.title"),
    subtitle: t("tenant.modules.teachers.subtitle"),
    icon: "co_present",
    shortLabel: t("tenant.layout.nav_teachers"),
    emptyTitle: t("tenant.modules.teachers.empty_title"),
    emptyText: t("tenant.modules.teachers.empty_text"),
    loader: getTenantTeachers,
    columns: [
      col("name", t("tenant.modules.teachers.name"), "left"),
      col("email", t("tenant.modules.teachers.email")),
      col("rolesText", t("tenant.modules.teachers.roles")),
      col("status", t("tenant.modules.fields.status")),
    ],
    normalize: (item) => ({
      id: item.user_id,
      name: item.display_name,
      caption: item.email,
      email: item.email,
      rolesText: (item.roles || []).map((role) => role.name || role.code).join(", "),
      status: item.status,
    }),
  }),
  TEACHER_ASSIGNMENTS: () => ({
    key: "TEACHER_ASSIGNMENTS",
    title: t("tenant.modules.assignments.title"),
    subtitle: t("tenant.modules.assignments.subtitle"),
    icon: "assignment_ind",
    shortLabel: t("tenant.layout.nav_assignments"),
    permissionCreate: "teacher_assignments.manage",
    createLabel: t("tenant.modules.assignments.create"),
    createSubtitle: t("tenant.modules.assignments.create_subtitle"),
    emptyTitle: t("tenant.modules.assignments.empty_title"),
    emptyText: t("tenant.modules.assignments.empty_text"),
    loader: getTenantTeacherAssignments,
    creator: assignTenantTeacher,
    updater: updateTenantTeacherAssignment,
    permissionUpdate: "teacher_assignments.manage",
    form: [
      select("teacherUserId", t("tenant.modules.fields.teacher"), teacherOptions, false, true),
      select("classId", t("tenant.modules.fields.class"), classOptions, false, true),
      select("subjectId", t("tenant.modules.fields.subject"), subjectOptions, false, true),
      input("assignmentRole", t("tenant.modules.fields.assignment_role")),
      input("startsAt", t("tenant.modules.fields.starts_at"), false, "date"),
      input("endsAt", t("tenant.modules.fields.ends_at"), false, "date"),
      select("status", t("tenant.modules.fields.status"), assignmentStatusOptions),
    ],
    columns: [
      col("name", t("tenant.modules.assignments.teacher"), "left"),
      col("className", t("tenant.modules.assignments.class")),
      col("subjectName", t("tenant.modules.assignments.subject")),
      col("periodName", t("tenant.modules.assignments.period")),
      col("assignmentRole", t("tenant.modules.fields.assignment_role")),
      col("status", t("tenant.modules.fields.status")),
      col("actions", t("tenant.modules.actions"), "right"),
    ],
    normalize: (item) => ({
      id: item.assignment_id,
      name: item.teacher_name,
      caption: item.teacher_email,
      teacherUserId: item.teacher_user_id,
      classId: item.class_id,
      subjectId: item.subject_id,
      periodId: item.period_id,
      className: item.class_name,
      subjectName: item.subject_name,
      periodName: item.period_name || "-",
      assignmentRole: item.assignment_role,
      startsAt: item.starts_at?.slice(0, 10) || "",
      endsAt: item.ends_at?.slice(0, 10) || "",
      status: item.status,
      raw: item,
    }),
  }),
  COURSES: () => ({
    key: "COURSES",
    title: t("tenant.modules.courses.title"),
    subtitle: t("tenant.modules.courses.subtitle"),
    icon: "menu_book",
    shortLabel: t("tenant.layout.nav_courses"),
    permissionCreate: "courses.create",
    createLabel: t("tenant.modules.courses.create"),
    createSubtitle: t("tenant.modules.courses.create_subtitle"),
    emptyTitle: t("tenant.modules.courses.empty_title"),
    emptyText: t("tenant.modules.courses.empty_text"),
    loader: getTenantCourses,
    creator: createTenantCourse,
    updater: updateTenantCourse,
    permissionUpdate: "courses.update",
    form: [
      input("name", t("tenant.modules.fields.name"), true),
      input("code", t("tenant.modules.fields.code")),
      input("stage", t("tenant.modules.fields.stage")),
    ],
    columns: [
      col("name", t("tenant.modules.courses.name"), "left"),
      col("stage", t("tenant.modules.courses.stage")),
      col("studentsCount", t("tenant.modules.courses.students"), "right"),
      col("status", t("tenant.modules.fields.status")),
      col("actions", t("tenant.modules.actions"), "right"),
    ],
    normalize: (item) => ({
      id: item.subject_id,
      name: item.name,
      code: item.code,
      caption: item.code,
      stage: item.stage || "-",
      studentsCount: item.students_count || 0,
      status: item.status,
      raw: item,
    }),
  }),
  REPORTS: () => placeholder("REPORTS", t("tenant.modules.reports.title"), t("tenant.modules.reports.subtitle"), "insights", t("tenant.modules.reports.empty_title"), t("tenant.modules.reports.empty_text"), t("tenant.modules.reports.name")),
  AI_TUTOR: () => placeholder("AI_TUTOR", t("tenant.modules.ai.title"), t("tenant.modules.ai.subtitle"), "psychology", t("tenant.modules.ai.empty_title"), t("tenant.modules.ai.empty_text"), t("tenant.modules.ai.name")),
};

const page = computed(() => {
  const value = (moduleBuilders[props.moduleKey] || moduleBuilders.CLASSES)();
  return {
    ...value,
    canCreate: value.permissionCreate ? tenantSession.hasPermission(value.permissionCreate) : false,
    canUpdate: value.permissionUpdate ? tenantSession.hasPermission(value.permissionUpdate) : false,
  };
});

const filteredRows = computed(() => {
  const needle = searchQuery.value?.trim().toLowerCase();
  if (!needle) return rows.value;
  return rows.value.filter((row) =>
    searchableText(row).toLowerCase().includes(needle),
  );
});

const featuredRows = computed(() => filteredRows.value.slice(0, 6));

const moduleStats = computed(() => {
  if (page.value.stats) return page.value.stats(rows.value, filteredRows.value);
  const total = rows.value.length;
  const active = rows.value.filter((row) => row.status === "active").length;
  const visible = filteredRows.value.length;
  return [
    { label: t("tenant.modules.stats_total"), value: total, icon: page.value.icon },
    { label: t("tenant.modules.stats_active"), value: active, icon: "check_circle" },
    { label: t("tenant.modules.stats_visible"), value: visible, icon: "filter_alt" },
  ];
});

const visibleFormFields = computed(() => {
  const fields = page.value.form || [];
  if (page.value.key !== "ENROLLMENTS") return fields;
  return fields.filter((field) => {
    if (field.name === "subjectId") return form.enrollmentType === "subject";
    if (field.name === "classId") return true;
    return true;
  });
});

function col(name, label, align = "left") {
  return { name, label, field: name, align };
}

function input(name, label, required = false, type = "text") {
  return { name, label, required, type };
}

function select(name, label, optionsSource, multiple = false, required = false) {
  return {
    name,
    label,
    required,
    component: "q-select",
    options: () => (Array.isArray(optionsSource) ? optionsSource : optionsSource.value),
    props: {
      "emit-value": true,
      "map-options": true,
      multiple,
      "use-chips": multiple,
    },
  };
}

function placeholder(key, title, subtitle, icon, emptyTitle, emptyText, nameLabel) {
  return {
    key,
    title,
    subtitle,
    icon,
    emptyTitle,
    emptyText,
    loader: async () => ({ data: { data: [] } }),
    columns: [col("name", nameLabel), col("status", t("tenant.modules.fields.status"))],
    normalize: (item) => item,
  };
}

function statusLabel(status) {
  const labels = {
    active: t("common.active"),
    inactive: t("common.inactive"),
    archived: t("common.archived"),
    planned: t("tenant.modules.status.planned"),
    pending: t("tenant.modules.status.pending"),
    closed: t("tenant.modules.status.closed"),
    completed: t("tenant.modules.status.completed"),
    dropped: t("tenant.modules.status.dropped"),
    suspended: t("tenant.modules.status.suspended"),
    cancelled: t("tenant.modules.status.cancelled"),
  };
  return labels[status] || status || "-";
}

function statusColor(status) {
  if (status === "active") return "positive";
  if (["planned", "pending"].includes(status)) return "info";
  if (["suspended", "dropped", "cancelled"].includes(status)) return "warning";
  if (["archived", "closed", "completed", "inactive"].includes(status)) return "grey";
  return "grey";
}

function visualClass(row) {
  const source = `${page.value.key}-${row.id || row.name || ""}`;
  const index = [...source].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return `visual-${index + 1}`;
}

function searchableText(row) {
  return Object.values(row)
    .flatMap((value) => {
      if (Array.isArray(value)) return value.map((item) => JSON.stringify(item));
      if (value && typeof value === "object") return JSON.stringify(value);
      return value;
    })
    .filter(Boolean)
    .join(" ");
}

function primaryDetail(row) {
  return row.className || row.subjectName || row.periodName || row.email || row.stage || row.level || "-";
}

function compactDetails(row) {
  return detailItems(row).filter((item) => item.value && item.value !== "-");
}

function detailItems(row) {
  const details = [];
  const add = (label, value) => {
    if (value !== undefined && value !== null && value !== "") details.push({ label, value });
  };

  if (page.value.key === "PERIODS") {
    add(t("tenant.modules.fields.period_type"), row.periodTypeLabel);
    add(t("tenant.modules.periods.dates"), row.dateRange);
    add(t("tenant.modules.periods.default"), row.isDefaultText);
  } else if (page.value.key === "CLASSES") {
    add(t("tenant.modules.classes.level"), row.level);
    add(t("tenant.modules.classes.academic_year"), row.academicYear);
    add(t("tenant.modules.classes.students"), row.studentsCount);
  } else if (page.value.key === "STUDENTS") {
    add(t("tenant.modules.students.class"), row.className);
    add(t("tenant.modules.students.guardians"), row.guardiansCount);
    add(t("tenant.modules.fields.external_ref"), row.externalRef);
  } else if (page.value.key === "ENROLLMENTS") {
    add(t("tenant.modules.fields.enrollment_type"), row.enrollmentTypeLabel);
    add(t("tenant.modules.enrollments.target"), row.targetName);
    add(t("tenant.modules.enrollments.period"), row.periodName);
    add(t("tenant.modules.periods.dates"), row.dateRange);
  } else if (page.value.key === "TEACHERS") {
    add(t("tenant.modules.teachers.email"), row.email);
    add(t("tenant.modules.teachers.roles"), row.rolesText);
  } else if (page.value.key === "TEACHER_ASSIGNMENTS") {
    add(t("tenant.modules.assignments.class"), row.className);
    add(t("tenant.modules.assignments.subject"), row.subjectName);
    add(t("tenant.modules.assignments.period"), row.periodName);
    add(t("tenant.modules.fields.assignment_role"), row.assignmentRole);
  } else if (page.value.key === "COURSES") {
    add(t("tenant.modules.courses.stage"), row.stage);
    add(t("tenant.modules.courses.students"), row.studentsCount);
  }

  add(t("tenant.modules.fields.status"), statusLabel(row.status));
  return details;
}

function openDetail(row) {
  selectedRow.value = row;
  detailOpen.value = true;
}

function periodTypeLabel(value) {
  return periodTypeOptions.find((item) => item.value === value)?.label || value || "-";
}

function resetForm() {
  Object.keys(form).forEach((key) => delete form[key]);
  for (const field of page.value.form || []) {
    if (field.name === "academicYear") form[field.name] = "2025-2026";
    else if (field.name === "periodType") form[field.name] = "school_year";
    else if (field.name === "assignmentRole") form[field.name] = "lead";
    else if (field.name === "enrollmentType") form[field.name] = "class";
    else if (field.name === "status") form[field.name] = "active";
    else if (field.props?.multiple) form[field.name] = [];
    else form[field.name] = "";
  }
}

async function loadOptions() {
  const needsAcademicOptions = ["STUDENTS", "ENROLLMENTS", "TEACHER_ASSIGNMENTS"].includes(props.moduleKey);
  if (!needsAcademicOptions) return;
  if (props.moduleKey === "STUDENTS" && !page.value.canCreate && !page.value.canUpdate) return;
  const [classesRes, subjectsRes, periodsRes, studentsRes, teachersRes, guardiansRes] = await Promise.all([
    tenantSession.hasPermission("classes.read") ? getTenantClasses() : Promise.resolve({ data: { data: [] } }),
    tenantSession.hasPermission("courses.read") ? getTenantCourses() : Promise.resolve({ data: { data: [] } }),
    tenantSession.hasPermission("periods.read") ? getTenantPeriods() : Promise.resolve({ data: { data: [] } }),
    props.moduleKey === "ENROLLMENTS" && tenantSession.hasPermission("students.read") ? getTenantStudents() : Promise.resolve({ data: { data: [] } }),
    props.moduleKey === "TEACHER_ASSIGNMENTS" ? getTenantTeachers() : Promise.resolve({ data: { data: [] } }),
    props.moduleKey === "STUDENTS" && tenantSession.hasPermission("students.update") ? getTenantGuardians() : Promise.resolve({ data: { data: [] } }),
  ]);
  classOptions.value = (classesRes.data.data || []).map((item) => ({
    label: item.code ? `${item.name} (${item.code})` : item.name,
    value: item.class_id,
  }));
  subjectOptions.value = (subjectsRes.data.data || []).map((item) => ({
    label: item.code ? `${item.name} (${item.code})` : item.name,
    value: item.subject_id,
  }));
  periodOptions.value = (periodsRes.data.data || []).map((item) => ({
    label: item.code ? `${item.name} (${item.code})` : item.name,
    value: item.period_id,
  }));
  studentOptions.value = (studentsRes.data.data || []).map((item) => ({
    label: item.external_ref ? `${item.full_name} (${item.external_ref})` : item.full_name,
    value: item.student_id,
  }));
  teacherOptions.value = (teachersRes.data.data || []).map((item) => ({
    label: `${item.display_name} - ${item.email}`,
    value: item.user_id,
  }));
  guardianOptions.value = (guardiansRes.data.data || []).map((item) => ({
    label: `${item.display_name} - ${item.email}`,
    value: item.user_id,
  }));
}

function openCreate() {
  editingRow.value = null;
  resetForm();
  createDialog.value = true;
}

function openEdit(row) {
  detailOpen.value = false;
  editingRow.value = row;
  resetForm();
  for (const field of page.value.form || []) {
    if (row[field.name] !== undefined && row[field.name] !== null) {
      form[field.name] = Array.isArray(row[field.name]) ? [...row[field.name]] : row[field.name];
    }
  }
  createDialog.value = true;
}

function openGuardianDialog(row) {
  detailOpen.value = false;
  selectedStudent.value = row;
  guardianForm.guardianUserId = "";
  guardianForm.relationshipType = "guardian";
  guardianDialog.value = true;
}

function openMoveStudent(row) {
  detailOpen.value = false;
  selectedStudent.value = row;
  moveStudentForm.classId = row.primaryClassId || "";
  moveStudentForm.movedAt = "";
  moveStudentDialog.value = true;
}

function openAssignSubjects(row) {
  detailOpen.value = false;
  selectedStudent.value = row;
  assignSubjectsForm.subjectIds = [...(row.subjectIds || [])];
  assignSubjectsForm.assignedAt = "";
  assignSubjectsForm.replace = false;
  assignSubjectsDialog.value = true;
}

async function loadRows() {
  loading.value = true;
  try {
    await loadOptions();
    const res = await page.value.loader();
    rows.value = (res.data.data || []).map(page.value.normalize);
    if (selectedRow.value) {
      selectedRow.value = rows.value.find((row) => row.id === selectedRow.value.id) || null;
      detailOpen.value = Boolean(selectedRow.value);
    }
  } finally {
    loading.value = false;
  }
}

async function submitCreate() {
  if (!page.value.creator && !page.value.updater) return;
  saving.value = true;
  try {
    if (editingRow.value && page.value.updater) {
      await page.value.updater(editingRow.value.id, { ...form });
    } else {
      await page.value.creator({ ...form });
    }
    createDialog.value = false;
    await loadRows();
  } finally {
    saving.value = false;
  }
}

async function submitGuardianLink() {
  if (!selectedStudent.value?.id || !guardianForm.guardianUserId) return;
  saving.value = true;
  try {
    await linkTenantGuardian(selectedStudent.value.id, { ...guardianForm });
    guardianDialog.value = false;
    await loadRows();
  } finally {
    saving.value = false;
  }
}

async function submitMoveStudent() {
  if (!selectedStudent.value?.id || !moveStudentForm.classId) return;
  saving.value = true;
  try {
    await moveTenantStudentToClass(selectedStudent.value.id, { ...moveStudentForm });
    moveStudentDialog.value = false;
    await loadRows();
  } finally {
    saving.value = false;
  }
}

async function submitAssignSubjects() {
  if (!selectedStudent.value?.id || !assignSubjectsForm.subjectIds.length) return;
  saving.value = true;
  try {
    await assignTenantStudentSubjects(selectedStudent.value.id, { ...assignSubjectsForm });
    assignSubjectsDialog.value = false;
    await loadRows();
  } finally {
    saving.value = false;
  }
}

watch(() => props.moduleKey, loadRows);
onMounted(loadRows);
</script>

<style scoped lang="scss">
.tenant-module-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 48%),
    var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: 28px;
  box-shadow: var(--shadow-md);
  grid-template-columns: 1fr auto;
  overflow: hidden;
  padding: var(--space-8);
  position: relative;

  > * {
    position: relative;
    z-index: 1;
  }
}

.header-actions {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.module-search {
  min-width: min(320px, 42vw);

  :deep(.q-field__control) {
    background: var(--color-surface-strong);
    border-radius: var(--radius-full);
  }
}

.entity-card-grid {
  display: grid;
  gap: var(--space-4);
}

.module-context-strip {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.context-pill {
  align-items: center;
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  display: inline-flex;
  gap: var(--space-2);
  min-height: 36px;
  padding: 0 var(--space-3);

  span {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-extrabold);
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.entity-card-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.entity-card {
  cursor: pointer;
  overflow: hidden;
  transition: var(--transition-fast);

  &:hover {
    border-color: color-mix(in srgb, var(--color-primary) 26%, var(--color-border-default));
    box-shadow: var(--shadow-md);
    transform: translate3d(0, -2px, 0);
  }
}

.entity-card-visual {
  background: var(--gradient-primary);
  min-height: 132px;
  overflow: hidden;
  position: relative;
}

.visual-1 {
  background:
    radial-gradient(circle at 22% 22%, rgba(255, 255, 255, 0.38), transparent 18%),
    linear-gradient(135deg, #2517f2 0%, #2f8cff 100%);
}

.visual-2 {
  background:
    radial-gradient(circle at 78% 20%, rgba(255, 255, 255, 0.28), transparent 18%),
    linear-gradient(135deg, #0aa6c2 0%, #10a976 100%);
}

.visual-3 {
  background:
    radial-gradient(circle at 78% 28%, rgba(255, 255, 255, 0.3), transparent 18%),
    linear-gradient(135deg, #cf3f8e 0%, #5f29ff 100%);
}

.visual-4 {
  background:
    radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.34), transparent 18%),
    linear-gradient(135deg, #14243a 0%, #0aa6c2 100%);
}

.visual-5 {
  background:
    radial-gradient(circle at 76% 22%, rgba(255, 255, 255, 0.28), transparent 18%),
    linear-gradient(135deg, #d99014 0%, #df4646 100%);
}

.entity-type-badge {
  align-items: center;
  background: rgba(16, 20, 38, 0.56);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--radius-full);
  display: inline-flex;
  gap: var(--space-1);
  font-size: 10px;
  font-weight: var(--font-weight-extrabold);
  left: var(--space-4);
  max-width: calc(100% - 32px);
  overflow: hidden;
  padding: 5px var(--space-2);
  position: absolute;
  text-overflow: ellipsis;
  text-transform: uppercase;
  top: var(--space-4);
  white-space: nowrap;
  z-index: 1;
}

.entity-watermark {
  bottom: -20px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 126px;
  position: absolute;
  right: -10px;
  transform: rotate(-8deg);
}

.entity-card-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.entity-card-title {
  color: var(--color-text-primary);
  font-size: 1.05rem;
  font-weight: var(--font-weight-extrabold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-card-caption {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
  min-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-card-meta {
  display: grid;
  gap: var(--space-1);
  border-top: 1px solid var(--color-border-subtle);
  margin-top: var(--space-4);
  padding-top: var(--space-4);

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
  }
}

.table-card {
  overflow: hidden;
  box-shadow: none;
}

.tenant-table,
.tenant-table :deep(.q-table__middle) {
  max-height: calc(100vh - 260px);
}

.tenant-table :deep(.q-table__middle) {
  overflow: auto;
}

.entity-cell {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  min-width: 260px;

  strong,
  span {
    display: block;
    max-width: 420px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }
}

.entity-icon {
  flex: 0 0 auto;
  height: 42px;
  width: 42px;
}

.chips-line {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  min-width: 220px;
}

.empty-state {
  align-items: center;
  color: var(--color-text-secondary);
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  padding: var(--space-8);
  text-align: center;
  width: 100%;

  strong {
    color: var(--color-text-primary);
  }
}

.module-card-title {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-extrabold);
}

.privacy-note {
  border-color: rgba(245, 158, 11, 0.35);
}

.form-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-drawer {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.detail-shell {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-6);
}

.detail-head {
  align-items: flex-start;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto 1fr auto;

  h2 {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-extrabold);
    line-height: var(--line-height-tight);
    margin: 0;
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: var(--space-1) 0 0;
  }
}

.detail-icon {
  height: 48px;
  width: 48px;
}

.detail-status {
  justify-self: start;
}

.detail-grid {
  display: grid;
  gap: var(--space-3);
}

.detail-item {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3);

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }
}

.detail-block {
  display: grid;
  gap: var(--space-2);
}

.detail-block-label {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.detail-chips {
  flex-wrap: wrap;
  min-width: 0;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

@media (max-width: 700px) {
  .page-header,
  .form-grid,
  .entity-card-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .module-search {
    min-width: 0;
    width: 100%;
  }

  .tenant-table,
  .tenant-table :deep(.q-table__middle) {
    max-height: calc(100vh - 320px);
  }
}
</style>
