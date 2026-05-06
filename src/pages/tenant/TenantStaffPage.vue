<template>
  <q-page class="page-shell-premium staff-page">
    <section class="tenant-page-head staff-hero">
      <div class="hero-copy">
        <div class="tenant-section-kicker hero-kicker">
          <q-icon name="badge" size="18px" />
          {{ t("tenant.layout.nav_staff") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.staff.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.staff.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions hero-actions">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          class="tenant-search staff-search"
          :placeholder="t('tenant.modules.search_placeholder')"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>

        <q-btn
          color="primary"
          icon="person_add"
          :label="t('tenant.modules.staff.new_staff')"
          no-caps
          unelevated
          class="shadow-btn"
          @click="openCreate"
        />
      </div>
    </section>

    <section class="staff-grid">
      <div v-if="loading" class="loading-state col-12">
        <q-spinner-dots color="primary" size="42px" />
      </div>

      <div v-else-if="filteredStaff.length" class="staff-cards-container col-12">
        <div class="staff-cards-row">
          <q-card
            v-for="member in filteredStaff"
            :key="member.user_id"
            class="card-saas staff-entity-card"
          >
            <div class="staff-card-content">
              <div class="staff-avatar-box">
                <div class="icon-tile bg-soft-primary">
                  <q-icon name="badge" color="primary" size="24px" />
                </div>
                <q-badge
                  v-if="member.status !== 'active'"
                  color="grey"
                  floating
                  class="status-badge"
                >
                  {{ t("tenant.admin.suspended") }}
                </q-badge>
              </div>

              <div class="staff-info">
                <h3 class="staff-name">{{ member.display_name }}</h3>
                <span class="staff-email">{{ member.email }}</span>
                <div class="staff-roles q-mt-sm">
                  <q-chip
                    v-for="role in member.roles"
                    :key="role.code"
                    dense
                    outline
                    color="primary"
                    class="role-chip"
                  >
                    {{ role.name || role.code }}
                  </q-chip>
                </div>
              </div>

              <div class="staff-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="openEdit(member)"
                >
                  <q-tooltip>{{ t("common.edit") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="mail"
                  color="secondary"
                  :href="'mailto:' + member.email"
                >
                  <q-tooltip>{{ t("common.send_email") }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <div v-else class="empty-state col-12">
        <div class="empty-glass">
          <q-icon name="badge" size="48px" color="primary" />
          <strong>{{ t("tenant.modules.staff.empty_title") }}</strong>
          <span>{{ t("tenant.modules.staff.empty_text") }}</span>
          <q-btn
            outline
            color="primary"
            icon="add"
            :label="t('tenant.modules.staff.new_staff')"
            class="q-mt-md"
            @click="openCreate"
          />
        </div>
      </div>
    </section>

    <!-- Editor Drawer -->
    <q-drawer
      v-model="editorOpen"
      side="right"
      overlay
      bordered
      :width="440"
      class="tenant-editor-drawer"
    >
      <div class="tenant-editor-shell">
        <div class="tenant-editor-head">
          <div class="tenant-editor-icon">
            <q-icon name="badge" size="24px" />
          </div>
          <div>
            <h2>{{ editingStaff ? t('tenant.modules.staff.edit_staff') : t('tenant.modules.staff.new_staff') }}</h2>
            <p>{{ t('tenant.admin.dialog_subtitle') }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="editorOpen = false" />
        </div>

        <q-form class="tenant-editor-form" @submit.prevent="submitStaff">
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
            :disable="Boolean(editingStaff)"
            :rules="[(val) => Boolean(val) || t('common.required')]"
          />
          <q-input
            v-if="!editingStaff"
            v-model="form.password"
            :label="t('tenant.admin.password')"
            type="password"
            outlined
            dense
            :rules="[(val) => Boolean(val) || t('common.required')]"
          />
          <q-select
            v-model="form.roleCodes"
            :options="staffRoleOptions"
            :label="t('tenant.admin.roles')"
            multiple
            use-chips
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => (val && val.length > 0) || t('common.required')]"
          />
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('tenant.admin.status')"
            emit-value
            map-options
            outlined
            dense
          />
        </q-form>

        <div class="tenant-editor-actions">
          <q-btn flat :label="t('common.cancel')" no-caps @click="editorOpen = false" />
          <q-btn
            color="primary"
            icon="save"
            :label="t('common.save')"
            no-caps
            unelevated
            :loading="saving"
            @click="submitStaff"
          />
        </div>
      </div>
    </q-drawer>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getTenantAdminUsers, getTenantAdminRoles } from "src/utils/api/get";
import { createTenantAdminUser } from "src/utils/api/post";
import { updateTenantAdminUser } from "src/utils/api/patch";

const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const editorOpen = ref(false);
const editingStaff = ref(null);
const searchQuery = ref("");

const staff = ref([]);
const allRoles = ref([]);

const form = reactive({
  email: "",
  password: "",
  displayName: "",
  status: "active",
  roleCodes: [],
});

const staffRoleOptions = computed(() => {
  // We exclude core academic roles to focus on staff
  const excluded = ["TEACHER", "STUDENT", "GUARDIAN"];
  return allRoles.value
    .filter((r) => !excluded.includes(r.code))
    .map((r) => ({
      label: r.name || r.code,
      value: r.code,
    }));
});

const statusOptions = [
  { label: t("tenant.admin.active"), value: "active" },
  { label: t("tenant.admin.suspended"), value: "suspended" },
];

const filteredStaff = computed(() => {
  const needle = searchQuery.value.trim().toLowerCase();
  // We filter out users that only have teacher/student/guardian roles
  return staff.value.filter((user) => {
    const isAcademicOnly = user.roles.every((r) => ["TEACHER", "STUDENT", "GUARDIAN"].includes(r.code));
    if (isAcademicOnly) return false;

    if (!needle) return true;
    return (
      user.display_name.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle)
    );
  });
});

async function loadData() {
  loading.value = true;
  try {
    const [usersRes, rolesRes] = await Promise.all([
      getTenantAdminUsers(),
      getTenantAdminRoles(),
    ]);
    staff.value = usersRes.data.data || [];
    allRoles.value = rolesRes.data.data || [];
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.email = "";
  form.password = "";
  form.displayName = "";
  form.status = "active";
  form.roleCodes = [];
}

function openCreate() {
  editingStaff.value = null;
  resetForm();
  editorOpen.value = true;
}

function openEdit(member) {
  editingStaff.value = member;
  form.email = member.email;
  form.displayName = member.display_name;
  form.status = member.status;
  form.roleCodes = member.roles.map((r) => r.code);
  editorOpen.value = true;
}

async function submitStaff() {
  saving.value = true;
  try {
    const payload = {
      displayName: form.displayName,
      status: form.status,
      roleCodes: form.roleCodes,
    };
    if (editingStaff.value) {
      await updateTenantAdminUser(editingStaff.value.user_id, payload);
    } else {
      await createTenantAdminUser({
        ...payload,
        email: form.email,
        password: form.password,
      });
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
.staff-page {
  display: grid;
  gap: var(--space-6);
}

.staff-hero {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr auto;
}

.hero-actions {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.staff-search {
  min-width: 320px;
}

.staff-grid {
  display: grid;
  gap: var(--space-6);
}

.staff-cards-row {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
}

.staff-entity-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
}

.staff-card-content {
  align-items: center;
  display: grid;
  gap: var(--space-5);
  grid-template-columns: auto 1fr auto;
  padding: var(--space-5);
}

.staff-avatar-box {
  position: relative;
}

.staff-info {
  min-width: 0;

  .staff-name {
    font-size: 1.1rem;
    font-weight: var(--font-weight-extrabold);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .staff-email {
    color: var(--color-text-secondary);
    display: block;
    font-size: var(--font-size-xs);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.staff-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.empty-glass {
  align-items: center;
  background: var(--eg-glass-surface);
  border: 1px solid var(--eg-glass-border);
  border-radius: var(--tenant-radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-10);
  text-align: center;
}

@media (max-width: 768px) {
  .staff-hero {
    grid-template-columns: 1fr;
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .staff-search {
    min-width: 0;
  }
  .staff-cards-row {
    grid-template-columns: 1fr;
  }
}
</style>
