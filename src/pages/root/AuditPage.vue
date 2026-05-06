<template>
  <q-page class="page-shell-premium audit-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">Auditoria operativa</h1>
        <p class="text-page-subtitle">
          Trazabilidad de cambios criticos en modulos, RBAC y accesos de
          plataforma.
        </p>
      </div>

      <q-btn
        flat
        round
        dense
        icon="refresh"
        :loading="loading"
        @click="loadEvents"
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

    <q-card class="card-saas">
      <q-card-section class="toolbar">
        <q-input
          v-model="search"
          dense
          outlined
          class="audit-search"
          placeholder="Buscar actor, entidad o evento"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="eventTypeFilter"
          :options="eventTypeOptions"
          dense
          outlined
          emit-value
          map-options
          class="event-select"
        />

        <q-select
          v-model="actorFilter"
          :options="actorOptions"
          dense
          outlined
          emit-value
          map-options
          class="actor-select"
        />

        <q-input
          v-model="dateFrom"
          dense
          outlined
          type="date"
          label="Desde"
          class="date-filter"
        />

        <q-input
          v-model="dateTo"
          dense
          outlined
          type="date"
          label="Hasta"
          class="date-filter"
        />
      </q-card-section>

      <q-card-section class="toolbar-summary">
        <div class="results-copy">
          <span class="results-title"
            >{{ filteredEvents.length }} eventos visibles</span
          >
          <span class="results-subtitle">{{ summaryText }}</span>
        </div>

        <q-btn
          v-if="hasActiveFilters"
          flat
          dense
          icon="filter_alt_off"
          label="Limpiar filtros"
          @click="resetFilters"
        />
      </q-card-section>

      <q-separator opacity="0.1" />

      <q-card-section>
        <div v-if="loading" class="loading-state">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else-if="filteredEvents.length === 0" class="empty-state">
          <div class="icon-tile bg-soft-positive empty-icon">
            <q-icon name="verified_user" color="positive" size="30px" />
          </div>
          <div>
            <div class="section-title">Sin eventos para este filtro</div>
            <p class="text-secondary q-mt-sm">{{ emptyStateCopy }}</p>
            <q-btn
              v-if="hasActiveFilters"
              flat
              color="primary"
              icon="restart_alt"
              label="Restablecer vista"
              class="q-mt-md"
              @click="resetFilters"
            />
          </div>
        </div>

        <div v-else class="audit-timeline">
          <article
            v-for="event in filteredEvents"
            :key="event.audit_event_id"
            class="audit-item"
          >
            <div :class="`audit-icon bg-soft-${eventColor(event.event_type)}`">
              <q-icon
                :name="eventIcon(event.event_type)"
                :color="eventColor(event.event_type)"
                size="20px"
              />
            </div>

            <div class="audit-content">
              <div class="audit-head">
                <div>
                  <div class="audit-title">{{ eventTitle(event) }}</div>
                  <div class="audit-meta">
                    <span>{{
                      event.actor_email ||
                      event.actor_platform_account_id ||
                      "sistema"
                    }}</span>
                    <span>{{ formatDate(event.created_at) }}</span>
                    <span>{{ event.actor_scope || "platform" }}</span>
                  </div>
                </div>
                <q-badge
                  :color="eventColor(event.event_type)"
                  :label="event.action || 'sin accion'"
                />
              </div>

              <div class="audit-grid">
                <div>
                  <span>Evento</span>
                  <strong>{{ event.event_type }}</strong>
                </div>
                <div>
                  <span>Entidad</span>
                  <strong>{{ event.entity_type }}</strong>
                </div>
                <div>
                  <span>Modulo</span>
                  <strong>{{ event.module_key || "-" }}</strong>
                </div>
                <div>
                  <span>ID</span>
                  <strong>{{ event.entity_id || "-" }}</strong>
                </div>
              </div>

              <div class="audit-tags">
                <q-badge outline color="primary" :label="scopeLabel(event)" />
                <q-badge
                  outline
                  :color="eventColor(event.event_type)"
                  :label="event.action || 'sin accion'"
                />
                <q-badge
                  v-if="hasBefore(event)"
                  outline
                  color="warning"
                  label="antes"
                />
                <q-badge
                  v-if="hasAfter(event)"
                  outline
                  color="positive"
                  label="despues"
                />
                <q-badge
                  v-if="metadataCount(event)"
                  outline
                  color="info"
                  :label="`${metadataCount(event)} meta`"
                />
              </div>

              <div v-if="eventSummary(event).length" class="summary-grid">
                <div
                  v-for="item in eventSummary(event)"
                  :key="`${event.audit_event_id}-${item.label}`"
                  class="summary-chip"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>

              <div class="audit-actions">
                <span class="text-meta-mono"
                  >Registrado {{ relativeDate(event.created_at) }}</span
                >
                <div class="audit-actions-group">
                  <q-btn
                    v-if="relatedRoute(event)"
                    flat
                    dense
                    color="primary"
                    icon="open_in_new"
                    label="Abrir vista"
                    @click="goToRelated(event)"
                  />
                  <q-btn
                    flat
                    dense
                    color="info"
                    icon="content_copy"
                    label="Copiar metadata"
                    @click="copyJson(event.metadata_json, 'Metadata copiada')"
                  />
                </div>
              </div>

              <q-expansion-item
                dense
                expand-separator
                icon="difference"
                label="Ver cambio registrado"
                class="audit-detail"
              >
                <div class="diff-shell">
                  <div class="diff-toolbar">
                    <div>
                      <div class="diff-title">Comparacion JSON</div>
                      <div class="diff-subtitle">
                        {{ diffSummary(event) }}
                      </div>
                    </div>
                    <div class="diff-copy-actions">
                      <q-btn
                        flat
                        dense
                        icon="content_copy"
                        label="Antes"
                        no-caps
                        @click="copyJson(event.before_json, 'Snapshot anterior copiado')"
                      />
                      <q-btn
                        flat
                        dense
                        icon="content_copy"
                        label="Despues"
                        no-caps
                        @click="copyJson(event.after_json, 'Snapshot posterior copiado')"
                      />
                      <q-btn
                        flat
                        dense
                        icon="content_copy"
                        label="Metadata"
                        no-caps
                        @click="copyJson(event.metadata_json, 'Metadata copiada')"
                      />
                    </div>
                  </div>

                  <div v-if="jsonDiffRows(event).length" class="diff-table">
                    <div class="diff-header">
                      <span>Campo</span>
                      <span>Antes</span>
                      <span>Despues</span>
                    </div>

                    <div
                      v-for="row in jsonDiffRows(event)"
                      :key="`${event.audit_event_id}-${row.key}`"
                      :class="['diff-row', `is-${row.type}`]"
                    >
                      <div class="diff-key">
                        <q-icon :name="diffIcon(row.type)" :color="diffColor(row.type)" size="18px" />
                        <span>{{ row.key }}</span>
                      </div>
                      <pre class="diff-value diff-before">{{ row.before }}</pre>
                      <pre class="diff-value diff-after">{{ row.after }}</pre>
                    </div>
                  </div>

                  <div v-else class="diff-empty">
                    No hay diferencias estructurales entre antes y despues.
                  </div>

                  <div v-if="metadataCount(event)" class="metadata-strip">
                    <div class="metadata-head">
                      <q-icon name="data_object" color="info" size="18px" />
                      <span>Metadata operativa</span>
                    </div>
                    <pre>{{ pretty(event.metadata_json) }}</pre>
                  </div>
                </div>
              </q-expansion-item>
            </div>
          </article>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { date, copyToClipboard } from "quasar";
import { useRouter } from "vue-router";
import { getAuditEvents } from "src/utils/api/get";
import { notifyError, notifySuccess } from "src/utils/utils";

const router = useRouter();
const loading = ref(false);
const error = ref(null);
const events = ref([]);
const search = ref("");
const eventTypeFilter = ref("ALL");
const actorFilter = ref("ALL");
const dateFrom = ref("");
const dateTo = ref("");

const eventTypeOptions = computed(() => [
  { label: "Todos los eventos", value: "ALL" },
  ...Array.from(new Set(events.value.map((event) => event.event_type)))
    .sort()
    .map((type) => ({ label: type, value: type })),
]);

const actorOptions = computed(() => [
  { label: "Todos los actores", value: "ALL" },
  ...Array.from(
    new Set(
      events.value
        .map((event) => event.actor_email || event.actor_platform_account_id || "sistema")
        .filter(Boolean),
    ),
  )
    .sort()
    .map((actor) => ({ label: actor, value: actor })),
]);

const filteredEvents = computed(() => {
  const needle = search.value.trim().toLowerCase();
  return events.value.filter((event) => {
    const typeOk =
      eventTypeFilter.value === "ALL" ||
      event.event_type === eventTypeFilter.value;
    const actor =
      event.actor_email || event.actor_platform_account_id || "sistema";
    const actorOk = actorFilter.value === "ALL" || actor === actorFilter.value;
    const dateOk = eventMatchesDateRange(event);
    const text = [
      event.event_type,
      event.entity_type,
      event.entity_id,
      event.action,
      event.actor_email,
      event.actor_platform_account_id,
      event.actor_scope,
      JSON.stringify(event.metadata_json || {}),
    ]
      .join(" ")
      .toLowerCase();
    return typeOk && actorOk && dateOk && (!needle || text.includes(needle));
  });
});

const hasActiveFilters = computed(
  () =>
    search.value.trim().length > 0 ||
    eventTypeFilter.value !== "ALL" ||
    actorFilter.value !== "ALL" ||
    Boolean(dateFrom.value) ||
    Boolean(dateTo.value),
);

const uniqueActors = computed(
  () =>
    new Set(
      events.value
        .map((event) => event.actor_email || event.actor_platform_account_id)
        .filter(Boolean),
    ).size,
);

const stats = computed(() => [
  {
    label: "Eventos",
    value: events.value.length,
    icon: "fact_check",
    color: "primary",
  },
  {
    label: "Modulos",
    value: events.value.filter((event) => event.entity_type === "module")
      .length,
    icon: "extension",
    color: "info",
  },
  {
    label: "RBAC",
    value: events.value.filter(
      (event) =>
        event.event_type.includes("role") ||
        event.event_type.includes("permissions"),
    ).length,
    icon: "admin_panel_settings",
    color: "warning",
  },
  {
    label: "Actores",
    value: uniqueActors.value,
    icon: "person_search",
    color: "positive",
  },
]);

const summaryText = computed(() => {
  if (!events.value.length) {
    return "Aun no hay trazas registradas para cambios criticos de plataforma.";
  }

  if (!hasActiveFilters.value) {
    return `Mostrando el historial mas reciente de ${events.value.length} eventos.`;
  }

  const typeLabel =
    eventTypeFilter.value === "ALL" ? "todos los tipos" : eventTypeFilter.value;
  const actorLabel =
    actorFilter.value === "ALL" ? "todos los actores" : actorFilter.value;
  const searchLabel = search.value.trim()
    ? ` y busqueda "${search.value.trim()}"`
    : "";
  const dateLabel =
    dateFrom.value || dateTo.value
      ? ` entre ${dateFrom.value || "inicio"} y ${dateTo.value || "hoy"}`
      : "";
  return `Filtro activo: ${typeLabel}, ${actorLabel}${dateLabel}${searchLabel}.`;
});

const emptyStateCopy = computed(() => {
  if (!events.value.length) {
    return "Todavia no hay cambios criticos registrados en modulos, roles o permisos de plataforma.";
  }

  return "No hay coincidencias con la busqueda o el tipo de evento seleccionado.";
});

async function loadEvents() {
  loading.value = true;
  error.value = null;
  try {
    const res = await getAuditEvents({ limit: 150 });
    events.value = res?.data?.data || [];
  } catch {
    error.value = "No se pudo cargar la auditoria.";
  } finally {
    loading.value = false;
  }
}

function formatDate(value) {
  if (!value) return "-";
  return date.formatDate(value, "DD/MM/YYYY HH:mm:ss");
}

function relativeDate(value) {
  if (!value) return "sin fecha";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

function eventColor(type = "") {
  if (type.includes("deleted") || type.includes("revoked")) return "negative";
  if (type.includes("permissions") || type.includes("module")) return "warning";
  if (type.includes("created") || type.includes("assigned")) return "positive";
  return "info";
}

function eventIcon(type = "") {
  if (type.includes("module")) return "extension";
  if (type.includes("permissions")) return "key";
  if (type.includes("role")) return "admin_panel_settings";
  if (type.includes("account")) return "manage_accounts";
  return "fact_check";
}

function eventTitle(event) {
  const label = event.entity_id
    ? `${event.entity_type} - ${event.entity_id}`
    : event.entity_type;
  return `${event.event_type} sobre ${label}`;
}

function scopeLabel(event) {
  return `scope ${event.actor_scope || "platform"}`;
}

function metadataCount(event) {
  return Object.keys(event?.metadata_json || {}).length;
}

function hasBefore(event) {
  return Boolean(event?.before_json && Object.keys(event.before_json).length);
}

function hasAfter(event) {
  return Boolean(event?.after_json && Object.keys(event.after_json).length);
}

function eventMatchesDateRange(event) {
  if (!dateFrom.value && !dateTo.value) return true;
  if (!event.created_at) return false;

  const eventTime = new Date(event.created_at).getTime();
  const fromTime = dateFrom.value
    ? new Date(`${dateFrom.value}T00:00:00`).getTime()
    : Number.NEGATIVE_INFINITY;
  const toTime = dateTo.value
    ? new Date(`${dateTo.value}T23:59:59.999`).getTime()
    : Number.POSITIVE_INFINITY;

  return eventTime >= fromTime && eventTime <= toTime;
}

function eventSummary(event) {
  const metadata = event?.metadata_json || {};
  const candidates = [
    {
      label: "Motivo",
      value: metadata.reason || metadata.comment || metadata.note,
    },
    { label: "Scope destino", value: metadata.scope || metadata.target_scope },
    { label: "Modulo", value: event.module_key || metadata.module_key || metadata.moduleKey },
    {
      label: "Rol",
      value: metadata.role_key || metadata.roleId || metadata.role_id,
    },
    {
      label: "Permiso",
      value:
        metadata.permission_key ||
        metadata.permission ||
        metadata.permission_id,
    },
    { label: "Request", value: event.request_id || metadata.request_id },
    { label: "Correlation", value: event.correlation_id || metadata.correlation_id },
    {
      label: "Cuenta",
      value:
        metadata.account_email ||
        metadata.account_id ||
        metadata.platform_account_id,
    },
  ];

  return candidates.filter((item) => item.value).slice(0, 4);
}

function relatedRoute(event) {
  if (event.entity_type === "module" || event.event_type.includes("module"))
    return "/root/modules";
  if (
    event.event_type.includes("role") ||
    event.event_type.includes("permissions")
  )
    return "/root/rbac";
  if (
    event.event_type.includes("account") ||
    event.entity_type.includes("account")
  )
    return "/root/platform-accounts";
  return null;
}

function goToRelated(event) {
  const route = relatedRoute(event);
  if (!route) return;
  router.push(route);
}

function pretty(value) {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0))
    return "-";
  return JSON.stringify(value, null, 2);
}

function flattenJson(value, prefix = "") {
  if (!value || typeof value !== "object") {
    return prefix ? { [prefix]: serializeDiffValue(value) } : {};
  }

  return Object.entries(value).reduce((acc, [key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      child &&
      typeof child === "object" &&
      !Array.isArray(child) &&
      Object.keys(child).length
    ) {
      return { ...acc, ...flattenJson(child, path) };
    }

    acc[path] = serializeDiffValue(child);
    return acc;
  }, {});
}

function serializeDiffValue(value) {
  if (value === undefined) return "-";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function jsonDiffRows(event) {
  const before = flattenJson(event.before_json || {});
  const after = flattenJson(event.after_json || {});
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();

  return keys
    .map((key) => {
      const hasBeforeValue = Object.prototype.hasOwnProperty.call(before, key);
      const hasAfterValue = Object.prototype.hasOwnProperty.call(after, key);
      const beforeValue = hasBeforeValue ? before[key] : "-";
      const afterValue = hasAfterValue ? after[key] : "-";
      let type = "same";

      if (!hasBeforeValue && hasAfterValue) type = "added";
      else if (hasBeforeValue && !hasAfterValue) type = "removed";
      else if (beforeValue !== afterValue) type = "changed";

      return { key, before: beforeValue, after: afterValue, type };
    })
    .filter((row) => row.type !== "same");
}

function diffSummary(event) {
  const rows = jsonDiffRows(event);
  if (!rows.length) return "Sin cambios visibles en los snapshots.";

  const added = rows.filter((row) => row.type === "added").length;
  const removed = rows.filter((row) => row.type === "removed").length;
  const changed = rows.filter((row) => row.type === "changed").length;
  const parts = [
    added ? `${added} anadidos` : "",
    removed ? `${removed} eliminados` : "",
    changed ? `${changed} modificados` : "",
  ].filter(Boolean);

  return parts.join(" / ");
}

function diffIcon(type) {
  if (type === "added") return "add_circle";
  if (type === "removed") return "remove_circle";
  return "published_with_changes";
}

function diffColor(type) {
  if (type === "added") return "positive";
  if (type === "removed") return "negative";
  return "warning";
}

async function copyJson(value, successMessage) {
  try {
    await copyToClipboard(pretty(value));
    notifySuccess(successMessage);
  } catch {
    notifyError("No se pudo copiar al portapapeles");
  }
}

function resetFilters() {
  search.value = "";
  eventTypeFilter.value = "ALL";
  actorFilter.value = "ALL";
  dateFrom.value = "";
  dateTo.value = "";
}

onMounted(loadEvents);
</script>

<style scoped lang="scss">
.audit-page,
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

.toolbar {
  align-items: center;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(240px, 1.4fr) minmax(180px, 0.8fr) minmax(180px, 0.9fr) 130px 130px;
  padding: var(--space-4) var(--space-5);
}

.toolbar-summary {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: 0 var(--space-5) var(--space-4);
}

.results-copy {
  display: grid;
  gap: var(--space-1);
}

.results-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
}

.results-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.audit-search {
  min-width: 320px;
}

.event-select {
  min-width: 0;
}

.actor-select {
  min-width: 0;
}

.date-filter {
  min-width: 0;
}

.loading-state {
  display: grid;
  min-height: 280px;
  place-items: center;
}

.empty-state {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  min-height: 240px;
  padding: var(--space-8);
}

.empty-icon {
  flex: 0 0 auto;
  height: 64px;
  width: 64px;
}

.audit-timeline {
  display: grid;
  gap: var(--space-4);
}

.audit-item {
  align-items: flex-start;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: auto 1fr;
}

.audit-icon {
  align-items: center;
  border-radius: var(--radius-lg);
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.audit-content {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.audit-head,
.audit-actions {
  align-items: flex-start;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
}

.audit-title {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-extrabold);
}

.audit-meta {
  color: var(--color-text-tertiary);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
}

.audit-grid,
.summary-grid {
  display: grid;
  gap: var(--space-3);
}

.audit-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));

  div {
    background: var(--color-surface-strong);
    border-radius: var(--radius-lg);
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3);
  }

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    overflow-wrap: anywhere;
  }
}

.audit-tags,
.audit-actions-group {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.summary-chip {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3);

  span {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    overflow-wrap: anywhere;
  }
}

.audit-detail {
  background: var(--color-surface-strong);
  border-radius: var(--radius-lg);
}

.diff-shell {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.diff-toolbar {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
}

.diff-title {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-extrabold);
}

.diff-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

.diff-copy-actions,
.metadata-head {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.diff-table {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.diff-header,
.diff-row {
  display: grid;
  grid-template-columns: minmax(170px, 0.8fr) minmax(0, 1fr) minmax(0, 1fr);
}

.diff-header {
  background: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  padding: var(--space-3) var(--space-4);
  text-transform: uppercase;
}

.diff-row {
  border-top: 1px solid var(--color-border-subtle);
}

.diff-row.is-added {
  border-left: 4px solid var(--q-positive);
}

.diff-row.is-removed {
  border-left: 4px solid var(--q-negative);
}

.diff-row.is-changed {
  border-left: 4px solid var(--q-warning);
}

.diff-key {
  align-items: flex-start;
  color: var(--color-text-primary);
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-3) var(--space-4);

  span {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    overflow-wrap: anywhere;
  }
}

.diff-value {
  border-left: 1px solid var(--color-border-subtle);
}

.diff-before {
  background: rgba(223, 70, 70, 0.1);
  color: #b42318;
}

.diff-after {
  background: rgba(16, 169, 118, 0.1);
  color: #067647;
}

.diff-empty,
.metadata-strip {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.metadata-strip {
  display: grid;
  gap: var(--space-3);
}

.metadata-head {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
}

pre {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  margin: 0;
  max-height: 260px;
  overflow: auto;
  padding: var(--space-3);
  white-space: pre-wrap;
}

@media (max-width: 900px) {
  .stats-grid,
  .audit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .diff-header,
  .diff-row {
    grid-template-columns: minmax(140px, 0.7fr) minmax(0, 1fr) minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .page-header,
  .stats-grid,
  .audit-grid {
    grid-template-columns: 1fr;
  }

  .toolbar,
  .toolbar-summary,
  .empty-state,
  .audit-head,
  .audit-actions,
  .diff-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .audit-search,
  .event-select,
  .actor-select,
  .date-filter {
    min-width: 0;
    width: 100%;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .audit-item {
    grid-template-columns: 1fr;
  }

  .diff-header {
    display: none;
  }

  .diff-row {
    grid-template-columns: 1fr;
  }

  .diff-value {
    border-left: 0;
    border-top: 1px solid var(--color-border-subtle);
  }
}
</style>
