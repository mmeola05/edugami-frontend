<template>
  <q-page class="page-shell-premium settings-page">
    <section class="tenant-page-head settings-hero">
      <div class="hero-copy">
        <div class="tenant-section-kicker hero-kicker">
          <q-icon name="settings" size="18px" />
          {{ t("tenant.layout.nav_settings") }}
        </div>
        <h1 class="text-page-title">{{ t("tenant.modules.settings.title") }}</h1>
        <p class="text-page-subtitle">{{ t("tenant.modules.settings.subtitle") }}</p>
      </div>

      <div class="tenant-head-actions hero-actions">
        <q-btn
          color="primary"
          icon="save"
          :label="t('common.save')"
          no-caps
          unelevated
          :loading="saving"
          class="shadow-btn"
          @click="submitSettings"
        />
      </div>
    </section>

    <div class="settings-layout">
      <div class="settings-main">
        <!-- Identity Section -->
        <q-card class="card-saas settings-card">
          <div class="card-head">
            <q-icon name="business" color="primary" size="24px" />
            <h3>{{ t("tenant.modules.settings.section_identity") }}</h3>
          </div>
          <div class="card-body grid-form">
            <q-input
              v-model="form.name"
              :label="t('tenant.modules.settings.fields.center_name')"
              outlined
              dense
              class="col-12"
            />
            <q-input
              v-model="form.slug"
              :label="t('tenant.modules.settings.fields.center_slug')"
              outlined
              dense
              disable
              class="col-6"
            >
              <template #append>
                <q-icon name="lock" size="16px" />
              </template>
            </q-input>
            <q-select
              v-model="form.timezone"
              :options="timezoneOptions"
              :label="t('tenant.modules.settings.fields.timezone')"
              outlined
              dense
              class="col-6"
            />
          </div>
        </q-card>

        <!-- Academic Policies -->
        <q-card class="card-saas settings-card q-mt-lg">
          <div class="card-head">
            <q-icon name="gavel" color="primary" size="24px" />
            <h3>{{ t("tenant.modules.settings.section_policies") }}</h3>
          </div>
          <div class="card-body">
            <div class="policy-list">
              <div class="policy-item">
                <div class="policy-info">
                  <strong>{{ t("tenant.modules.settings.policies.guardians_see_notes") }}</strong>
                  <p>Permite que los padres consulten calificaciones actualizadas.</p>
                </div>
                <q-toggle v-model="form.academicPolicies.guardians_can_see_notes" color="primary" />
              </div>
              <q-separator inset />
              <div class="policy-item">
                <div class="policy-info">
                  <strong>{{ t("tenant.modules.settings.policies.guardians_see_attendance") }}</strong>
                  <p>Visibilidad inmediata de faltas de asistencia y retrasos.</p>
                </div>
                <q-toggle v-model="form.academicPolicies.guardians_can_see_attendance" color="primary" />
              </div>
              <q-separator inset />
              <div class="policy-item">
                <div class="policy-info">
                  <strong>{{ t("tenant.modules.settings.policies.guardians_see_history") }}</strong>
                  <p>Acceso al historial de años anteriores y expedientes cerrados.</p>
                </div>
                <q-toggle v-model="form.academicPolicies.guardians_can_see_history" color="primary" />
              </div>
              <q-separator inset />
              <div class="policy-item">
                <div class="policy-info">
                  <strong>{{ t("tenant.modules.settings.policies.auto_enroll_subjects") }}</strong>
                  <p>Al mover a un alumno de clase, asignarle automáticamente las materias de la nueva clase.</p>
                </div>
                <q-toggle v-model="form.academicPolicies.auto_enroll_subjects_on_class_change" color="primary" />
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <div class="settings-side">
        <!-- Branding -->
        <q-card class="card-saas branding-card">
          <div class="card-head">
            <q-icon name="palette" color="primary" size="24px" />
            <h3>{{ t("tenant.modules.settings.section_branding") }}</h3>
          </div>
          <div class="card-body">
            <div class="branding-preview" :style="{ backgroundColor: form.branding.primary_color }">
              <q-icon name="school" color="white" size="42px" />
            </div>
            <div class="q-mt-md">
              <q-input
                v-model="form.branding.primary_color"
                :label="t('tenant.modules.settings.fields.primary_color')"
                outlined
                dense
              >
                <template #append>
                  <div
                    class="color-indicator"
                    :style="{ backgroundColor: form.branding.primary_color }"
                  />
                </template>
              </q-input>
            </div>
            <div class="q-mt-md">
              <q-input
                v-model="form.branding.logo_url"
                :label="t('tenant.modules.settings.fields.logo_url')"
                outlined
                dense
                placeholder="https://..."
              />
            </div>
          </div>
        </q-card>

        <q-card class="card-saas info-card q-mt-lg">
          <div class="card-body">
            <div class="info-alert">
              <q-icon name="info" color="info" size="24px" />
              <p>Los cambios en las políticas afectan a todos los usuarios vinculados al tenant de forma inmediata.</p>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { getTenantSettings } from "src/utils/api/get";
import { updateTenantSettings } from "src/utils/api/patch";

const { t } = useI18n();
const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);

const form = reactive({
  name: "",
  slug: "",
  timezone: "Europe/Madrid",
  academicPolicies: {
    guardians_can_see_notes: true,
    guardians_can_see_attendance: true,
    guardians_can_see_history: true,
    auto_enroll_subjects_on_class_change: false,
  },
  branding: {
    primary_color: "#2415f2",
    logo_url: "",
  },
});

const timezoneOptions = [
  "Europe/Madrid",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

async function loadSettings() {
  loading.value = true;
  try {
    const res = await getTenantSettings();
    const data = res.data.data;
    form.name = data.name;
    form.slug = data.slug;
    form.timezone = data.timezone || "Europe/Madrid";
    if (data.academicPolicies) form.academicPolicies = data.academicPolicies;
    if (data.branding) form.branding = data.branding;
  } finally {
    loading.value = false;
  }
}

async function submitSettings() {
  saving.value = true;
  try {
    await updateTenantSettings({
      name: form.name,
      timezone: form.timezone,
      academicPolicies: form.academicPolicies,
      branding: form.branding,
    });
    $q.notify({
      type: "positive",
      message: t("common.success_update"),
      position: "top",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(loadSettings);
</script>

<style scoped lang="scss">
.settings-page {
  display: grid;
  gap: var(--space-6);
}

.settings-hero {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr auto;
}

.hero-kicker {
  align-items: center;
  color: var(--color-primary);
  display: inline-flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  gap: var(--space-2);
  text-transform: uppercase;
}

.shadow-btn {
  box-shadow: 0 8px 20px rgba(36, 21, 242, 0.22);
}

.settings-layout {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr 340px;
}

.card-head {
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);

  h3 {
    font-size: 1.1rem;
    font-weight: var(--font-weight-extrabold);
    margin: 0;
  }
}

.card-body {
  padding: var(--space-6);
}

.grid-form {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(12, 1fr);
}

.policy-list {
  display: grid;
}

.policy-item {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-4) 0;

  &:first-child { padding-top: 0; }
  &:last-child { padding-bottom: 0; }
}

.policy-info {
  strong {
    display: block;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
  }
  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    margin: var(--space-1) 0 0;
  }
}

.branding-preview {
  align-items: center;
  border-radius: var(--tenant-radius-md);
  display: flex;
  height: 120px;
  justify-content: center;
  width: 100%;
}

.color-indicator {
  border-radius: 4px;
  border: 1px solid var(--color-border-subtle);
  height: 24px;
  width: 24px;
}

.info-alert {
  align-items: flex-start;
  background: color-mix(in srgb, var(--color-info) 8%, var(--color-surface));
  border-radius: var(--tenant-radius-md);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }
}

@media (max-width: 1024px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .settings-side {
    order: -1;
  }
}

@media (max-width: 768px) {
  .settings-hero {
    grid-template-columns: 1fr;
  }
  .grid-form {
    grid-template-columns: 1fr;
    .col-6 { grid-column: span 12; }
  }
}
</style>
