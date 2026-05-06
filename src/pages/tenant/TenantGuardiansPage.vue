<template>
  <q-page class="page-shell-premium guardians-page">
    <section class="tenant-page-head guardians-head">
      <div>
        <div class="tenant-section-kicker section-kicker">
          <q-icon name="family_restroom" size="18px" />
          {{ t("tenant.layout.group_people") || "PERSONAS" }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.guardians.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.guardians.subtitle") }}</p>
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
          v-if="canManage"
          color="primary"
          icon="add"
          :label="t('tenant.admin.new_user')"
          no-caps
          unelevated
          @click="openCreate"
        />
      </div>
    </section>

    <section class="guardians-workspace tenant-workspace-card">
      <div v-if="loading" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredGuardians.length" class="guardian-grid">
        <article
          v-for="guardian in filteredGuardians"
          :key="guardian.id"
          class="guardian-card"
        >
          <div class="guardian-card-hero">
            <div class="guardian-avatar bg-soft-primary text-primary">
              <q-icon name="face" size="32px" />
            </div>
            <div class="guardian-status">
              <q-badge :color="guardian.status === 'active' ? 'positive' : 'warning'" text-color="white">
                {{ guardian.status === 'active' ? t("common.active") : t("tenant.modules.status.suspended") }}
              </q-badge>
            </div>
          </div>
          
          <div class="guardian-card-content">
            <h3 class="ellipsis">{{ guardian.displayName || guardian.email }}</h3>
            <p class="ellipsis">{{ guardian.email }}</p>
            
            <div class="guardian-load">
              <div class="load-stat">
                <strong>{{ guardian.linkedStudentsCount }}</strong>
                <span>{{ t("tenant.modules.guardians.linked_students") }}</span>
              </div>
            </div>
          </div>

          <div class="guardian-card-actions">
            <q-btn flat round dense icon="visibility" color="primary" @click="openDetail(guardian)">
              <q-tooltip>{{ t("tenant.modules.view_detail") }}</q-tooltip>
            </q-btn>
            <q-btn v-if="canManage" flat round dense icon="link" color="primary" @click="openLink(guardian)">
              <q-tooltip>{{ t("tenant.modules.students.link_guardian") }}</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>

      <div v-else class="state-box">
        <q-icon name="family_restroom" color="primary" size="42px" />
        <strong>{{ searchQuery ? t("tenant.modules.no_results") : t("tenant.modules.guardians.empty_title") }}</strong>
        <span>{{ searchQuery ? t("tenant.modules.no_results_text") : t("tenant.modules.guardians.empty_text") }}</span>
      </div>
    </section>

    <!-- Detail Drawer -->
    <q-drawer
      v-model="detailOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="guardian-detail-drawer"
    >
      <div v-if="selectedGuardian" class="detail-shell">
        <div class="detail-hero bg-primary text-white text-center q-pa-lg">
          <q-btn flat round dense icon="close" class="absolute-top-right q-ma-sm" @click="detailOpen = false" />
          <q-avatar size="72px" font-size="32px" color="white" text-color="primary" class="q-mb-md">
            {{ selectedGuardian.displayName?.substring(0, 1).toUpperCase() || 'G' }}
          </q-avatar>
          <h2 class="text-h6 text-weight-bold">{{ selectedGuardian.displayName || selectedGuardian.email }}</h2>
          <p class="text-caption opacity-80">{{ selectedGuardian.email }}</p>
        </div>

        <div class="q-pa-md">
          <section class="detail-block q-mb-lg">
            <h3 class="text-overline text-muted q-mb-sm">{{ t("tenant.modules.guardians.linked_students") }}</h3>
            <div v-if="selectedGuardian.linkedStudents?.length" class="student-links-list">
              <q-item v-for="student in selectedGuardian.linkedStudents" :key="student.student_id" class="q-px-none">
                <q-item-section avatar>
                  <q-avatar color="soft-primary" text-color="primary" icon="school" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ student.full_name }}</q-item-label>
                  <q-item-label caption>{{ student.relationship_type }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <p v-else class="text-muted text-center q-pa-md">{{ t("tenant.modules.students.no_students") }}</p>
          </section>

          <q-btn
            v-if="canManage"
            color="primary"
            icon="link"
            :label="t('tenant.modules.students.link_guardian')"
            no-caps
            unelevated
            class="full-width"
            @click="openLink(selectedGuardian)"
          />
        </div>
      </div>
    </q-drawer>

    <!-- Editor Drawer -->
    <q-drawer
      v-model="editorOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer"
    >
      <aside class="editor-shell">
        <div class="editor-head q-pa-md border-bottom flex items-center justify-between">
          <div class="flex items-center gap-sm">
            <q-avatar color="soft-primary" text-color="primary" icon="person_add" />
            <div>
              <h2 class="text-h6">{{ t("tenant.admin.new_user") }}</h2>
              <p class="text-caption text-muted">{{ t("tenant.admin.dialog_subtitle") }}</p>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="q-pa-md" @submit.prevent="submitGuardian">
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
            :rules="[(val) => Boolean(val) || t('common.required')]"
          />
          <q-input
            v-model="form.password"
            :label="t('tenant.admin.password')"
            type="password"
            outlined
            dense
            :rules="[(val) => (val && val.length >= 8) || t('rules.min_length', { len: 8 })]"
          />
          
          <div class="flex justify-end gap-sm q-mt-lg">
            <q-btn flat :label="t('common.cancel')" no-caps @click="editorOpen = false" />
            <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated type="submit" />
          </div>
        </q-form>
      </aside>
    </q-drawer>

    <!-- Link Drawer -->
    <q-drawer
      v-model="linkOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer"
    >
      <aside class="editor-shell">
        <div class="editor-head q-pa-md border-bottom flex items-center justify-between">
          <div class="flex items-center gap-sm">
            <q-avatar color="soft-primary" text-color="primary" icon="link" />
            <div>
              <h2 class="text-h6">{{ t("tenant.modules.students.link_guardian") }}</h2>
              <p class="text-caption text-muted">{{ selectedGuardian?.displayName }}</p>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="linkOpen = false" />
        </div>

        <q-form class="q-pa-md" @submit.prevent="submitLink">
          <q-select
            v-model="linkForm.studentId"
            :options="studentOptions"
            :label="t('tenant.modules.students.title')"
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
            placeholder="Padre, Madre, Tutor Legal..."
            :rules="[(val) => Boolean(val) || t('common.required')]"
          />
          
          <div class="flex justify-end gap-sm q-mt-lg">
            <q-btn flat :label="t('common.cancel')" no-caps @click="linkOpen = false" />
            <q-btn color="primary" icon="save" :label="t('common.save')" no-caps :loading="saving" unelevated type="submit" />
          </div>
        </q-form>
      </aside>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { getTenantGuardians, getTenantStudents } from "src/utils/api/get";
import { createTenantAdminUser, linkTenantGuardian } from "src/utils/api/post";

const { t } = useI18n();
const tenantSession = useTenantSessionStore();

const loading = ref(false);
const saving = ref(false);
const guardians = ref([]);
const students = ref([]);
const searchQuery = ref("");

const detailOpen = ref(false);
const editorOpen = ref(false);
const linkOpen = ref(false);
const selectedGuardian = ref(null);

const form = reactive({
  email: "",
  password: "",
  displayName: "",
  status: "active",
});

const linkForm = reactive({
  studentId: null,
  relationshipType: "",
});

const canManage = computed(() => tenantSession.hasPermission("tenant_users.manage"));

const filteredGuardians = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  if (!needle) return guardians.value;
  
  return guardians.value.filter((item) => {
    const haystack = `${item.displayName} ${item.email}`.toLowerCase();
    return haystack.includes(needle);
  });
});

const studentOptions = computed(() => 
  students.value.map(s => ({ label: s.displayName, value: s.id }))
);

function normalizeGuardian(item) {
  return {
    id: item.user_id || item.id,
    email: item.email,
    displayName: item.display_name || item.displayName || "",
    status: item.status || "active",
    linkedStudentsCount: item.linked_students_count || 0,
    linkedStudents: item.linked_students || [],
  };
}

function normalizeStudent(item) {
  return {
    id: item.student_id,
    displayName: item.preferred_name || item.full_name,
  };
}

async function loadData() {
  loading.value = true;
  try {
    const [guardiansRes, studentsRes] = await Promise.all([
      getTenantGuardians(),
      getTenantStudents(),
    ]);
    guardians.value = (guardiansRes.data.data || []).map(normalizeGuardian);
    students.value = (studentsRes.data.data || []).map(normalizeStudent);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.email = "";
  form.password = "";
  form.displayName = "";
  editorOpen.value = true;
}

function openDetail(guardian) {
  selectedGuardian.value = guardian;
  detailOpen.value = true;
}

function openLink(guardian) {
  selectedGuardian.value = guardian;
  linkForm.studentId = null;
  linkForm.relationshipType = "";
  linkOpen.value = true;
}

async function submitGuardian() {
  saving.value = true;
  try {
    await createTenantAdminUser({
      ...form,
      roleCodes: ["GUARDIAN"],
    });
    editorOpen.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

async function submitLink() {
  if (!selectedGuardian.value) return;
  saving.value = true;
  try {
    await linkTenantGuardian(linkForm.studentId, {
      guardianUserId: selectedGuardian.value.id,
      relationshipType: linkForm.relationshipType,
    });
    linkOpen.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped lang="scss">
.guardians-page {
  display: grid;
  gap: var(--space-5);
}

.guardians-head {
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

.tenant-search {
  min-width: min(340px, 40vw);
}

.guardians-workspace {
  overflow: hidden;
}

.guardian-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  padding: var(--space-4);
}

.guardian-card {
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

.guardian-card-actions {
  border-top: 1px solid var(--eg-border-soft);
  display: flex;
  gap: var(--space-1);
  justify-content: flex-end;
  padding: var(--space-2) var(--space-3);
  background: rgba(0,0,0,0.015);
}

.guardian-card-hero {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) 0;
}

.guardian-avatar {
  align-items: center;
  border-radius: 20px;
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.guardian-card-content {
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

.guardian-load {
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

.border-bottom {
  border-bottom: 1px solid var(--eg-border-soft);
}

.opacity-80 {
  opacity: 0.8;
}

.student-links-list {
  background: var(--eg-surface-soft);
  border-radius: var(--tenant-radius-md);
  border: 1px solid var(--eg-border-soft);
  padding: var(--space-2);
}
</style>
