<template>
  <div class="form-content-wrapper">
    <div class="form-header">
      <div class="text-eyebrow">{{ $t("auth.gateway") }}</div>
      <h1
        class="text-page-title"
        v-html="$t('auth.id_required').replace(' ', '<br/>')"
      ></h1>
      <p class="text-page-subtitle">{{ $t("auth.login_subtitle") }}</p>
    </div>

    <q-form @submit="handleLogin" class="form-stack">
      <div class="input-group">
        <label class="input-label">{{ $t("auth.email_label") }}</label>
        <q-input
          v-model="email"
          outlined
          :placeholder="$t('auth.email_label')"
          class="glass-input"
          :rules="[(val) => !!val || $t('rules.required')]"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="alternate_email" class="input-icon" />
          </template>
        </q-input>
      </div>

      <div class="input-group">
        <div class="input-header row justify-between items-center">
          <label class="input-label q-mb-none">{{
            $t("auth.password_label")
          }}</label>
          <q-btn
            flat
            dense
            no-caps
            :label="$t('auth.forgot_password')"
            to="/auth/recovery"
            class="forgot-link"
          />
        </div>

        <q-input
          v-model="password"
          outlined
          :placeholder="$t('auth.password_label')"
          :type="showPassword ? 'text' : 'password'"
          class="glass-input"
          :rules="[(val) => !!val || $t('rules.required')]"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="fingerprint" class="input-icon" />
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

      <div class="form-actions">
        <q-btn
          :label="$t('auth.login_btn')"
          type="submit"
          class="btn-industrial-submit"
          size="lg"
          :loading="loading"
        >
          <template #loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>

        <q-btn
          v-if="isDev"
          flat
          no-caps
          icon="visibility"
          :label="$t('auth.preview_btn')"
          class="preview-btn"
          @click="handlePreview"
        />

      </div>
    </q-form>

    <div v-if="contextOptions.length" class="context-picker">
      <div class="form-header compact">
        <div class="text-eyebrow">{{ $t("auth.choose_context_title") }}</div>
        <p class="text-page-subtitle">{{ $t("auth.choose_context_subtitle") }}</p>
      </div>

      <button
        v-for="context in contextOptions"
        :key="context.id"
        class="context-option"
        :disabled="loading"
        @click="selectContext(context)"
      >
        <div class="icon-tile bg-soft-primary">
          <q-icon :name="contextIcon(context)" color="primary" size="20px" />
        </div>
        <div>
          <strong>{{ context.label }}</strong>
          <span>{{ contextSubtitle(context) }}</span>
        </div>
        <q-icon name="chevron_right" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { unifiedLogin } from "src/utils/api/post";
import { notifySuccess, notifyError } from "src/utils/utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();
const tenantSession = useTenantSessionStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const contextOptions = ref([]);
const isDev = import.meta.env.DEV;

async function handleLogin() {
  try {
    loading.value = true;
    contextOptions.value = [];
    const res = await unifiedLogin(email.value, password.value);
    const data = res.data.data;
    if (data.requiresContextSelection) {
      contextOptions.value = data.contexts || [];
      return;
    }
    await applyResolvedSession(data);
  } catch (err) {
    notifyError(
      err.response?.data?.error?.message || t("auth.login_error"),
      t("notifications.error"),
    );
  } finally {
    loading.value = false;
  }
}

async function applyResolvedSession(data) {
  if (data.scope === "platform") {
    await userStore.applyPlatformSession(data);
    notifySuccess(t("auth.login_welcome"), t("notifications.success"));
    router.push("/root/dashboard");
    return;
  }

  if (data.scope === "tenant") {
    tenantSession.applySession(data);
    notifySuccess(t("auth.login_welcome"), t("notifications.success"));
    router.push(tenantSession.hasMultipleContexts ? "/auth/tenant-context" : "/tenant/dashboard");
    return;
  }

  notifyError("Este contexto aun no tiene pantalla activa", t("notifications.warning"));
}

async function selectContext(context) {
  try {
    loading.value = true;
    if (context.scope === "platform") {
      await userStore.login(email.value, password.value);
      notifySuccess(t("auth.login_welcome"), t("notifications.success"));
      router.push("/root/dashboard");
      return;
    }

    if (context.scope === "tenant") {
      await tenantSession.login(email.value, password.value, { tenantId: context.tenantId });
      notifySuccess(t("auth.login_welcome"), t("notifications.success"));
      router.push("/tenant/dashboard");
      return;
    }

    notifyError("Este contexto aun no tiene pantalla activa", t("notifications.warning"));
  } catch (err) {
    notifyError(
      err.response?.data?.error?.message || t("auth.login_error"),
      t("notifications.error"),
    );
  } finally {
    loading.value = false;
  }
}

function contextIcon(context) {
  if (context.scope === "platform") return "admin_panel_settings";
  if (context.scope === "tenant") return "school";
  return "person";
}

function contextSubtitle(context) {
  if (context.scope === "platform") return `${t("auth.platform_context")} / ${context.role}`;
  if (context.scope === "tenant") {
    const roles = (context.roles || []).map((role) => role.name || role.code).join(", ");
    return `${t("auth.tenant_context")} / ${roles || context.tenantSlug}`;
  }
  return t("auth.public_context");
}

function handlePreview() {
  userStore.previewLogin();
  router.push("/root/dashboard");
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

.input-header {
  gap: var(--space-2);
}

.forgot-link {
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
  margin-top: calc(var(--space-1) * -1);
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-accent);
  }
}

.form-actions {
  display: grid;
  gap: var(--space-3);
}

.preview-btn {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  justify-self: center;
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    background: rgba(79, 70, 229, 0.08);
  }
}

.context-picker {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.form-header.compact {
  margin-bottom: 0;
}

.context-option {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: var(--space-4);
  text-align: left;
  transition: var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transform: translate3d(0, -2px, 0);
  }

  strong,
  span {
    display: block;
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
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
}
</style>
