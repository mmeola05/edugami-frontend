<template>
  <q-page class="page-shell-premium modules-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">Catalogo de modulos</h1>
        <p class="text-page-subtitle">
          Arbol global con padres, hijos y activacion por scope.
        </p>
      </div>

      <q-btn
        flat
        round
        dense
        icon="refresh"
        :loading="loading"
        @click="loadModules"
      >
        <q-tooltip>Actualizar</q-tooltip>
      </q-btn>
    </div>

    <q-banner v-if="error" class="bg-negative text-white">{{ error }}</q-banner>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="metric-card q-pa-md">
        <div class="row items-center justify-between">
          <div :class="`icon-tile bg-soft-${stat.color}`">
            <q-icon :name="stat.icon" :color="stat.color" size="20px" />
          </div>
          <div class="column items-end">
            <span class="text-mini-label text-grey-6">{{ stat.label }}</span>
            <span class="metric-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <q-card class="card-saas info-card">
      <q-card-section class="info-row">
        <div>
          <div class="section-title">Regla de apagado efectivo</div>
          <p class="text-secondary q-mt-sm">
            Un hijo puede estar activado en su fila, pero si su padre esta
            apagado queda bloqueado de forma efectiva.
          </p>
        </div>
        <q-badge color="info" label="catalogo unico modules" />
      </q-card-section>
    </q-card>

    <q-card class="card-saas">
      <q-card-section class="toolbar">
        <q-tabs
          v-model="scopeFilter"
          dense
          no-caps
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="ALL" label="Todos" />
          <q-tab name="ROOT" label="ROOT" />
          <q-tab name="SUPPORT" label="SUPPORT" />
          <q-tab name="TENANT" label="TENANT" />
        </q-tabs>

        <q-input
          v-model="moduleSearch"
          dense
          outlined
          class="module-search"
          placeholder="Buscar modulo"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator opacity="0.1" />

      <q-card-section class="tree-section">
        <div v-if="loading" class="loading-state">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else class="scope-grid">
          <section
            v-for="group in visibleScopeGroups"
            :key="group.scope"
            class="scope-column"
          >
            <div class="scope-heading">
              <div>
                <q-badge
                  :color="scopeColor(group.scope)"
                  :label="group.scope"
                />
                <span
                  >{{ group.roots.length }} raiz · {{ group.total }} total</span
                >
              </div>
              <q-badge
                :color="group.disabled > 0 ? 'warning' : 'positive'"
                :label="`${group.disabled} apagados`"
              />
            </div>

            <div class="module-tree">
              <article
                v-for="root in group.roots"
                :key="root.module_key"
                class="module-node root-node"
              >
                <div class="module-row">
                  <div
                    :class="`node-icon bg-soft-${moduleEffective(root) ? 'positive' : 'negative'}`"
                  >
                    <q-icon
                      :name="
                        root.children.length ? 'account_tree' : 'extension'
                      "
                      :color="moduleEffective(root) ? 'positive' : 'negative'"
                      size="18px"
                    />
                  </div>

                  <div class="node-copy">
                    <strong>{{ root.name || root.module_key }}</strong>
                    <span>{{ root.module_key }}</span>
                    <small v-if="root.description">{{
                      root.description
                    }}</small>
                  </div>

                  <q-space />
                  <q-badge
                    :color="moduleEffective(root) ? 'positive' : 'negative'"
                    :label="moduleEffective(root) ? 'activo' : 'apagado'"
                  />
                  <q-toggle
                    v-if="canManageModules"
                    :model-value="root.is_enabled"
                    color="positive"
                    :disable="savingKey === root.module_key"
                    @update:model-value="toggleModule(root, $event)"
                  />
                  <q-badge v-else color="grey-7" label="solo lectura" />
                </div>

                <div v-if="root.children.length" class="children-list">
                  <article
                    v-for="child in root.children"
                    :key="child.module_key"
                    class="module-node child-node"
                  >
                    <div class="module-row">
                      <div
                        :class="`node-icon bg-soft-${childEffective(child, root) ? 'info' : 'warning'}`"
                      >
                        <q-icon
                          name="subdirectory_arrow_right"
                          :color="
                            childEffective(child, root) ? 'info' : 'warning'
                          "
                          size="18px"
                        />
                      </div>

                      <div class="node-copy">
                        <strong>{{ child.name || child.module_key }}</strong>
                        <span
                          >hijo de {{ root.module_key }} ·
                          {{ child.module_key }}</span
                        >
                        <small v-if="child.description">{{
                          child.description
                        }}</small>
                      </div>

                      <q-space />
                      <q-badge
                        v-if="!root.is_enabled"
                        color="warning"
                        label="padre apagado"
                      />
                      <q-badge
                        v-else
                        :color="child.is_enabled ? 'positive' : 'negative'"
                        :label="child.is_enabled ? 'activo' : 'apagado'"
                      />
                      <q-toggle
                        v-if="canManageModules"
                        :model-value="child.is_enabled"
                        color="positive"
                        :disable="savingKey === child.module_key"
                        @update:model-value="toggleModule(child, $event)"
                      />
                      <q-badge v-else color="grey-7" label="solo lectura" />
                    </div>
                  </article>
                </div>
              </article>
            </div>
          </section>

          <div v-if="visibleScopeGroups.length === 0" class="empty-state">
            <q-icon name="extension_off" size="42px" />
            <span>No hay modulos con ese filtro.</span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getPlatformModules } from "src/utils/api/get";
import { updatePlatformModule } from "src/utils/api/put";
import { useUserStore } from "src/stores/userStore";
import { notifyError, notifySuccess } from "src/utils/utils";
import { useConfirmDialog } from "src/composables/useConfirmDialog";

const { confirmAction } = useConfirmDialog();
const userStore = useUserStore();
const loading = ref(false);
const error = ref(null);
const modules = ref([]);
const scopeFilter = ref("ALL");
const moduleSearch = ref("");
const savingKey = ref(null);
const canManageModules = computed(() =>
  userStore.hasPermission("platform_modules.manage"),
);

const criticalRootModules = new Set(["ROOT_DASHBOARD", "RBAC", "GLOBAL_MODULES"]);

const stats = computed(() => [
  {
    label: "Total",
    value: modules.value.length,
    icon: "extension",
    color: "primary",
  },
  {
    label: "Activos",
    value: modules.value.filter((item) => item.is_enabled).length,
    icon: "toggle_on",
    color: "positive",
  },
  {
    label: "Padres",
    value: modules.value.filter((item) => !item.parent_module_key).length,
    icon: "account_tree",
    color: "info",
  },
  {
    label: "Hijos",
    value: modules.value.filter((item) => item.parent_module_key).length,
    icon: "subdirectory_arrow_right",
    color: "warning",
  },
]);

const visibleScopeGroups = computed(() => {
  const scopes =
    scopeFilter.value === "ALL"
      ? ["ROOT", "SUPPORT", "TENANT"]
      : [scopeFilter.value];
  const needle = moduleSearch.value.trim().toLowerCase();

  return scopes
    .map((scope) => {
      const allByScope = modules.value.filter((item) => item.scope === scope);
      const matches = (item) =>
        `${item.module_key} ${item.name || ""} ${item.description || ""} ${item.parent_module_key || ""}`
          .toLowerCase()
          .includes(needle);
      const rootKeysFromMatchingChildren = new Set(
        needle
          ? allByScope
              .filter((item) => item.parent_module_key && matches(item))
              .map((item) => item.parent_module_key)
          : [],
      );
      const roots = allByScope
        .filter((item) => !item.parent_module_key)
        .filter(
          (root) =>
            !needle ||
            matches(root) ||
            rootKeysFromMatchingChildren.has(root.module_key),
        )
        .map((root) => ({
          ...root,
          children: allByScope
            .filter((item) => item.parent_module_key === root.module_key)
            .filter((child) => !needle || matches(root) || matches(child))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        }))
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      const visibleKeys = new Set([
        ...roots.map((item) => item.module_key),
        ...roots.flatMap((item) =>
          item.children.map((child) => child.module_key),
        ),
      ]);

      return {
        scope,
        roots,
        total: visibleKeys.size,
        disabled: [...visibleKeys].filter((key) => {
          const mod = allByScope.find((item) => item.module_key === key);
          if (!mod) return false;
          if (!mod.is_enabled) return true;
          const parent = mod.parent_module_key
            ? allByScope.find(
                (item) => item.module_key === mod.parent_module_key,
              )
            : null;
          return parent ? !parent.is_enabled : false;
        }).length,
      };
    })
    .filter((group) => group.roots.length > 0);
});

async function loadModules() {
  loading.value = true;
  error.value = null;
  try {
    const res = await getPlatformModules();
    modules.value = res.data.data || [];
  } catch {
    error.value = "No se pudo cargar el catalogo de modulos.";
  } finally {
    loading.value = false;
  }
}

async function toggleModule(module, enabled) {
  if (!canManageModules.value) return;
  const confirmed = await confirmModuleChange(module, enabled);
  if (!confirmed) return;

  const previous = module.is_enabled;
  module.is_enabled = enabled;
  savingKey.value = module.module_key;
  try {
    await updatePlatformModule({
      moduleKey: module.module_key,
      isEnabled: enabled,
    });
    notifySuccess("Modulo actualizado");
  } catch {
    module.is_enabled = previous;
    notifyError("No se pudo actualizar el modulo");
  } finally {
    savingKey.value = null;
  }
}

function confirmModuleChange(module, enabled) {
  if (enabled) return Promise.resolve(true);

  const isCritical =
    module.scope === "ROOT" && criticalRootModules.has(module.module_key);
  const hasChildren = modules.value.some(
    (item) => item.parent_module_key === module.module_key && item.is_enabled,
  );

  if (!isCritical && !hasChildren) return Promise.resolve(true);

  const message = isCritical
    ? "Este modulo es critico para la administracion ROOT. El backend puede bloquear el cambio si deja la plataforma sin administracion."
    : "Este modulo tiene hijos activos. Al apagar el padre, esos hijos quedaran bloqueados de forma efectiva.";

  return confirmAction({
    title: "Confirmar apagado de modulo",
    message,
    okLabel: "Apagar modulo",
    color: "negative",
    icon: "power_settings_new",
  });
}

function scopeColor(scope) {
  if (scope === "ROOT") return "primary";
  if (scope === "SUPPORT") return "info";
  return "warning";
}

function moduleEffective(module) {
  return Boolean(module.is_enabled);
}

function childEffective(child, parent) {
  return Boolean(child.is_enabled && parent.is_enabled);
}

onMounted(loadModules);
</script>

<style scoped lang="scss">
.modules-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.stats-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.info-row {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
}

.toolbar {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
}

.module-search {
  min-width: 260px;
}

.tree-section {
  min-height: 420px;
}

.loading-state {
  display: grid;
  min-height: 320px;
  place-items: center;
}

.scope-grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.scope-column,
.module-tree,
.children-list {
  display: grid;
  align-content: start;
  gap: var(--space-3);
}

.scope-heading {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  gap: var(--space-3);
  font-weight: var(--font-weight-bold);
  justify-content: space-between;

  > div {
    align-items: center;
    display: flex;
    gap: var(--space-3);
  }
}

.module-node {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.root-node {
  background: var(--color-surface-strong);
}

.child-node {
  background: var(--color-bg-secondary);
  margin-left: var(--space-6);
}

.module-row {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.node-icon {
  align-items: center;
  border-radius: var(--radius-lg);
  display: flex;
  flex: 0 0 auto;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.node-copy {
  display: grid;
  gap: var(--space-1);
  min-width: 0;

  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-extrabold);
  }

  span {
    color: var(--color-text-tertiary);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
  }

  small {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-normal);
  }
}

.children-list {
  margin-top: var(--space-3);
}

.empty-state {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  grid-column: 1 / -1;
  justify-content: center;
  min-height: 220px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid,
  .page-header {
    grid-template-columns: 1fr;
  }

  .child-node {
    margin-left: 0;
  }

  .info-row,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .module-search {
    min-width: 0;
    width: 100%;
  }
}
</style>
