<template>
  <div class="context-page">
    <div class="form-header">
      <div class="text-eyebrow">CONTEXTO</div>
      <h1 class="text-page-title">Elige centro</h1>
      <p class="text-page-subtitle">
        Tienes acceso a varios contextos. Selecciona con cual quieres trabajar
        ahora.
      </p>
    </div>

    <div class="context-list">
      <button
        v-for="context in tenantSession.contexts"
        :key="context.tenantId"
        class="context-option"
        :class="{ 'is-active': context.tenantId === tenantSession.activeContext?.tenantId }"
        :disabled="loading"
        @click="selectContext(context)"
      >
        <div class="icon-tile bg-soft-primary">
          <q-icon name="school" color="primary" size="20px" />
        </div>
        <div>
          <strong>{{ context.tenantName }}</strong>
          <span>{{ context.tenantSlug }} / {{ roleSummary(context) }}</span>
        </div>
        <q-icon name="chevron_right" />
      </button>
    </div>

    <q-btn flat no-caps label="Cerrar sesion" class="q-mt-md" @click="logout" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTenantSessionStore } from "src/stores/tenantSessionStore";
import { notifyError, notifySuccess } from "src/utils/utils";

const router = useRouter();
const tenantSession = useTenantSessionStore();
const loading = ref(false);

function roleSummary(context) {
  return (context.roles || []).map((role) => role.name || role.code).join(", ") || "Sin rol";
}

async function selectContext(context) {
  loading.value = true;
  try {
    if (context.tenantId !== tenantSession.activeContext?.tenantId) {
      await tenantSession.switchContext({ tenantId: context.tenantId });
    }
    notifySuccess("Contexto seleccionado");
    router.push("/tenant/dashboard");
  } catch (error) {
    notifyError(error.response?.data?.error?.message || "No se pudo cambiar de contexto");
  } finally {
    loading.value = false;
  }
}

async function logout() {
  await tenantSession.logout();
  router.push("/auth/tenant-login");
}
</script>

<style scoped lang="scss">
.context-page {
  width: 100%;
}

.form-header {
  margin-bottom: var(--space-6);
}

.context-list {
  display: grid;
  gap: var(--space-3);
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

  &:hover,
  &.is-active {
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
