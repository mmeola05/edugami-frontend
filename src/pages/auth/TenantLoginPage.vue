<template>
  <div class="form-content-wrapper">
    <div class="form-header">
      <div class="text-eyebrow">ACCESO TENANT</div>
      <h1 class="text-page-title">Entrar a EduGami</h1>
      <p class="text-page-subtitle">
        Usa tu correo y contrasena. El centro y los alumnos autorizados se
        resolveran despues de iniciar sesion.
      </p>
    </div>

    <q-form class="form-stack" @submit="handleLogin">
      <div class="input-group">
        <label class="input-label">Email</label>
        <q-input
          v-model="email"
          outlined
          placeholder="tu@email.com"
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
        <label class="input-label">Contrasena</label>
        <q-input
          v-model="password"
          outlined
          :type="showPassword ? 'text' : 'password'"
          placeholder="Contrasena"
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
          label="Entrar"
          type="submit"
          class="btn-industrial-submit"
          size="lg"
          :loading="loading"
        >
          <template #loading>
            <q-spinner-dots color="white" />
          </template>
        </q-btn>

        <q-btn flat no-caps label="Entrar como ROOT" to="/auth/login" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { notifyError, notifySuccess } from "src/utils/utils";

const router = useRouter();
const tenantSession = useTenantSessionStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    await tenantSession.login(email.value, password.value);
    notifySuccess("Sesion tenant iniciada");
    router.push(
      tenantSession.hasMultipleContexts ? "/auth/tenant-context" : "/tenant/dashboard",
    );
  } catch (error) {
    notifyError(
      error.response?.data?.error?.message || "No se pudo iniciar sesion tenant",
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

.input-group,
.form-actions {
  display: grid;
  gap: var(--space-3);
}
</style>
