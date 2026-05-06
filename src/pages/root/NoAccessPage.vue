<template>
  <q-page class="page-shell-premium no-access-page">
    <section class="no-access-panel card-saas">
      <div class="icon-tile bg-soft-warning no-access-icon">
        <q-icon name="lock" color="warning" size="34px" />
      </div>

      <div class="no-access-copy">
        <p class="text-mini-label text-grey-6">ACCESO_LIMITADO</p>
        <h1 class="text-page-title">No tienes modulos disponibles</h1>
        <p class="text-page-subtitle">
          Tu cuenta esta autenticada, pero ahora mismo no tiene ningun modulo
          ROOT activo asignado. Pide a un administrador que revise tus permisos
          o el estado del catalogo de modulos.
        </p>
      </div>

      <div class="no-access-actions">
        <q-btn
          unelevated
          color="primary"
          icon="refresh"
          label="Reintentar acceso"
          no-caps
          @click="refreshAccess"
        />
        <q-btn
          flat
          color="primary"
          icon="logout"
          label="Cerrar sesion"
          no-caps
          @click="logout"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const moduleRoutes = [
  ["ROOT_DASHBOARD", "/root/dashboard"],
  ["TENANTS", "/root/tenants"],
  ["PLATFORM_ACCOUNTS", "/root/platform-accounts"],
  ["ALERTS", "/root/alerts"],
  ["SERVICES", "/root/services"],
  ["METRICS", "/root/metrics"],
  ["AUDIT", "/root/audit"],
  ["RBAC", "/root/rbac"],
  ["GLOBAL_MODULES", "/root/modules"],
];

async function refreshAccess() {
  await userStore.fetchAccess();
  const target = moduleRoutes.find(([moduleKey]) =>
    userStore.hasModule(moduleKey),
  )?.[1];
  if (target) await router.replace(target);
}

function logout() {
  userStore.logout();
  router.replace("/auth/login");
}
</script>

<style scoped lang="scss">
.no-access-page {
  display: grid;
  place-items: center;
}

.no-access-panel {
  align-items: center;
  display: grid;
  gap: var(--space-5);
  justify-items: center;
  max-width: 620px;
  padding: var(--space-8);
  text-align: center;
  width: min(100%, 620px);
}

.no-access-icon {
  height: 72px;
  width: 72px;
}

.no-access-copy {
  display: grid;
  gap: var(--space-3);
}

.no-access-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
}
</style>
