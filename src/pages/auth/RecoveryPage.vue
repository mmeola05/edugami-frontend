<template>
  <div class="form-content-wrapper">
    <div class="form-header">
      <q-btn
        flat
        dense
        icon="arrow_back"
        color="primary"
        to="/auth/login"
        class="back-link"
        :label="$t('auth.back_login')"
        no-caps
      />
      <div class="text-eyebrow">{{ $t("auth.recovery_title") }}</div>
      <h1
        class="text-page-title"
        v-html="$t('auth.recovery_title').replace(' ', '<br/>')"
      ></h1>
      <p class="text-page-subtitle">{{ $t("auth.recovery_subtitle") }}</p>
    </div>

    <q-form v-if="!submitted" @submit="handleRecovery" class="form-stack">
      <div class="input-group">
        <label class="input-label">{{ $t("auth.recovery_email_label") }}</label>
        <q-input
          v-model="email"
          outlined
          :placeholder="$t('auth.email_label')"
          class="glass-input"
          :rules="[
            (val) => !!val || $t('rules.required'),
            (val) => /.+@.+\..+/.test(val) || $t('rules.email'),
          ]"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="mail_outline" class="input-icon" />
          </template>
        </q-input>
      </div>

      <div class="form-actions">
        <q-btn
          :label="$t('auth.recovery_send_btn')"
          type="submit"
          class="btn-industrial-submit"
          size="lg"
          :loading="loading"
        >
          <template #loading>
            <q-spinner-orbit color="white" />
          </template>
        </q-btn>
      </div>
    </q-form>

    <div v-else class="success-state">
      <q-icon name="mark_email_read" size="56px" color="primary" />
      <h2>{{ $t("auth.recovery_success_title") }}</h2>
      <p>{{ $t("auth.recovery_success_msg", { email }) }}</p>
      <q-btn
        unelevated
        color="primary"
        to="/auth/login"
        class="btn-premium"
        :label="$t('auth.understood')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { requestRecovery } from "src/utils/api/post";
import { notifySuccess, notifyError } from "src/utils/utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const email = ref("");
const loading = ref(false);
const submitted = ref(false);

async function handleRecovery() {
  try {
    loading.value = true;
    await requestRecovery(email.value);
    submitted.value = true;
    notifySuccess(t("auth.recovery_success_title"), t("notifications.success"));
  } catch (err) {
    notifyError(
      err.response?.data?.error?.message || t("notifications.error"),
      t("notifications.error"),
    );
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.form-content-wrapper {
  width: 100%;
}

.form-header {
  margin-bottom: var(--space-8);
}

.input-group {
  display: grid;
  gap: var(--space-2);
}

.back-link {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-4);
}

.success-state {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  text-align: center;

  h2 {
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-extrabold);
    line-height: var(--line-height-tight);
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
  }
}
</style>
