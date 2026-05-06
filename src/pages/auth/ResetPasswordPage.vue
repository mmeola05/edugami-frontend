<template>
  <div class="form-content-wrapper">
    <div class="form-header">
      <div class="text-eyebrow">{{ $t("auth.reset_title") }}</div>
      <h1
        class="text-page-title"
        v-html="$t('auth.reset_title').replace(' ', '<br/>')"
      ></h1>
      <p class="text-page-subtitle">{{ $t("auth.reset_subtitle") }}</p>
    </div>

    <q-form @submit="handleReset" class="form-stack">
      <div class="input-group">
        <label class="input-label">{{ $t("auth.reset_new_password") }}</label>
        <q-input
          v-model="password"
          outlined
          :placeholder="$t('auth.reset_new_password')"
          :type="showPassword ? 'text' : 'password'"
          class="glass-input"
          :rules="[
            (val) => !!val || $t('rules.required'),
            (val) => val.length >= 8 || $t('rules.min_length', { len: 8 }),
          ]"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="lock_outline" class="input-icon" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer input-icon hover-glow"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>

      <div class="input-group">
        <label class="input-label">{{
          $t("auth.reset_confirm_password")
        }}</label>
        <q-input
          v-model="confirmPassword"
          outlined
          :placeholder="$t('auth.reset_confirm_password')"
          :type="showPassword ? 'text' : 'password'"
          class="glass-input"
          :rules="[(val) => val === password || $t('rules.password_match')]"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="check_circle_outline" class="input-icon" />
          </template>
        </q-input>
      </div>

      <div class="form-actions">
        <q-btn
          :label="$t('auth.reset_btn')"
          type="submit"
          class="btn-industrial-submit"
          size="lg"
          :loading="loading"
        >
          <template #loading>
            <q-spinner-cube color="white" />
          </template>
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { resetPassword } from "src/utils/api/post";
import { notifySuccess, notifyError, notifyWarning } from "src/utils/utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const loading = ref(false);
const token = ref("");

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    notifyWarning(t("auth.reset_token_error"), t("notifications.warning"));
    router.push("/auth/login");
  }
});

async function handleReset() {
  try {
    loading.value = true;
    await resetPassword(token.value, password.value);
    notifySuccess(t("auth.reset_success"), t("notifications.success"));
    router.push("/auth/login");
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
</style>
