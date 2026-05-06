<template>
  <q-page class="page-shell-premium alerts-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">{{ $t("alerts.title") }}</h1>
        <p class="text-page-subtitle">
          {{ $t("alerts.subtitle") }}
        </p>
      </div>

      <q-btn flat round dense icon="refresh" :loading="loading" @click="refreshAll">
        <q-tooltip>{{ $t("alerts.refresh") }}</q-tooltip>
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

    <div class="report-grid">
      <q-card class="card-saas report-card">
        <q-card-section>
          <div class="panel-title">{{ $t("alerts.report_op_load") }}</div>
          <div class="report-list">
            <div
              v-for="item in report.assignmentLoad || []"
              :key="item.owner"
              class="report-row"
            >
              <span>{{ item.owner }}</span>
              <q-badge color="dark" :label="item.active_alerts" />
            </div>
            <div v-if="!(report.assignmentLoad || []).length" class="text-secondary text-sm">
              {{ $t("alerts.report_no_load") }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="card-saas report-card">
        <q-card-section>
          <div class="panel-title">{{ $t("alerts.report_top_rules") }}</div>
          <div class="report-list">
            <div
              v-for="item in report.topRules || []"
              :key="item.rule_key"
              class="report-row"
            >
              <span>{{ item.rule_key }}</span>
              <q-badge color="primary" :label="item.total" />
            </div>
            <div v-if="!(report.topRules || []).length" class="text-secondary text-sm">
              {{ $t("alerts.report_no_rules") }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="card-saas report-card">
        <q-card-section>
          <div class="panel-title">{{ $t("alerts.report_slow_resolutions") }}</div>
          <div class="report-list">
            <div
              v-for="item in report.slowResolutions || []"
              :key="`${item.title}-${item.created_at}`"
              class="report-row report-row-stacked"
            >
              <strong>{{ item.title }}</strong>
              <span class="text-secondary text-sm">
                {{ item.hours }} h - {{ item.severity }}
              </span>
            </div>
            <div v-if="!(report.slowResolutions || []).length" class="text-secondary text-sm">
              {{ $t("alerts.report_no_resolutions") }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-card class="card-saas">
      <q-card-section class="toolbar">
        <q-tabs v-model="statusFilter" dense no-caps active-color="primary" indicator-color="primary">
          <q-tab name="ALL" :label="$t('alerts.filter_all')" />
          <q-tab name="PENDIENTE" :label="$t('alerts.filter_pending')" />
          <q-tab name="EN_INVESTIGACION" :label="$t('alerts.filter_investigating')" />
          <q-tab name="MITIGADO" :label="$t('alerts.filter_mitigated')" />
          <q-tab name="RESUELTO" :label="$t('alerts.filter_resolved')" />
          <q-tab name="CERRADO" :label="$t('alerts.filter_closed')" />
        </q-tabs>

        <q-select
          v-model="severityFilter"
          :options="severityOptions"
          dense
          outlined
          emit-value
          map-options
          class="severity-select"
        />
      </q-card-section>

      <q-card-section v-if="selectedRows.length" class="bulk-toolbar">
        <div>
          <strong>{{ selectedRows.length }} alertas seleccionadas</strong>
          <span>Ejecuta una accion rapida sobre todas ellas.</span>
        </div>
        <div class="bulk-actions">
          <q-btn
            v-if="canManageAlerts"
            outline
            color="warning"
            icon="manage_search"
            label="Investigar"
            no-caps
            :loading="bulkActionId === 'EN_INVESTIGACION'"
            @click="bulkSetStatus('EN_INVESTIGACION')"
          />
          <q-btn
            v-if="canManageAlerts"
            outline
            color="positive"
            icon="check_circle"
            label="Resolver"
            no-caps
            :loading="bulkActionId === 'RESUELTO'"
            @click="bulkSetStatus('RESUELTO')"
          />
          <q-btn
            v-if="canManageAlerts"
            flat
            color="primary"
            icon="restart_alt"
            label="Reabrir"
            no-caps
            :loading="bulkActionId === 'PENDIENTE'"
            @click="bulkSetStatus('PENDIENTE')"
          />
          <q-btn flat icon="close" label="Limpiar" no-caps @click="selectedRows = []" />
        </div>
      </q-card-section>

      <q-separator opacity="0.1" />

      <q-table
        :rows="filteredAlerts"
        :columns="columns"
        :loading="loading"
        row-key="alert_id"
        :selected="selectedRows"
        @update:selected="selectedRows = $event"
        selection="multiple"
        flat
        class="table-premium"
        :rows-per-page-options="[0]"
        hide-pagination
      >
        <template #no-data>
          <div class="table-empty-state">
            <div class="icon-tile bg-soft-positive table-empty-icon">
              <q-icon name="verified_user" color="positive" size="28px" />
            </div>
            <div>
              <div class="font-bold">{{ $t("alerts.table_no_data") }}</div>
              <div class="text-secondary text-sm">
                {{ $t("alerts.table_no_data_desc") }}
              </div>
            </div>
          </div>
        </template>

        <template #body-cell-title="props">
          <q-td :props="props">
            <button class="alert-row-button" @click="openAlert(props.row.alert_id)">
              <div class="alert-title-cell">
                <div :class="`icon-tile bg-soft-${severityColor(props.row.severity)}`">
                  <q-icon :name="severityIcon(props.row.severity)" :color="severityColor(props.row.severity)" size="18px" />
                </div>
                <div>
                  <div class="font-bold row items-center q-gutter-sm alert-title-line">
                    <span class="ellipsis">{{ props.row.title }}</span>
                    <q-badge v-if="props.row.is_overdue" color="negative" :label="$t('alerts.sla_overdue')" />
                  </div>
                  <div class="text-secondary text-sm ellipsis-2-lines">{{ props.row.message }}</div>
                </div>
              </div>
            </button>
          </q-td>
        </template>

        <template #body-cell-severity="props">
          <q-td :props="props" align="center">
            <q-badge :color="severityColor(props.value)" :label="props.value" />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props" align="center">
            <q-badge :color="statusColor(props.value)" :label="statusLabel(props.value)" />
          </q-td>
        </template>

        <template #body-cell-assigned_email="props">
          <q-td :props="props" align="center">
            <span class="text-secondary text-sm">{{ props.value || $t("alerts.unassigned") }}</span>
          </q-td>
        </template>

        <template #body-cell-sla_due_at="props">
          <q-td :props="props" align="center">
            <span :class="props.row.is_overdue ? 'text-negative text-weight-bold' : ''">
              {{ formatDateTime(props.value) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-occurrences="props">
          <q-td :props="props" align="center">
            <q-badge color="grey-8" :label="props.value" />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" align="right">
            <div class="table-actions">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="primary"
                @click="openAlert(props.row.alert_id)"
              >
                <q-tooltip>{{ $t("alerts.action_view") }}</q-tooltip>
              </q-btn>

              <q-btn
                v-if="canManageAlerts && props.row.status === 'PENDIENTE'"
                flat
                round
                dense
                icon="manage_search"
                color="warning"
                :loading="quickActionId === `${props.row.alert_id}:EN_INVESTIGACION`"
                @click="quickSetStatus(props.row, 'EN_INVESTIGACION')"
              >
                <q-tooltip>{{ $t("alerts.action_investigate") }}</q-tooltip>
              </q-btn>

              <q-btn
                v-if="canManageAlerts && ['PENDIENTE', 'EN_INVESTIGACION', 'MITIGADO'].includes(props.row.status)"
                flat
                round
                dense
                icon="check_circle"
                color="positive"
                :loading="quickActionId === `${props.row.alert_id}:RESUELTO`"
                @click="quickSetStatus(props.row, 'RESUELTO')"
              >
                <q-tooltip>{{ $t("alerts.action_resolve") }}</q-tooltip>
              </q-btn>

              <q-btn
                v-if="canManageAlerts && ['RESUELTO', 'CERRADO'].includes(props.row.status)"
                flat
                round
                dense
                icon="restart_alt"
                color="secondary"
                :loading="quickActionId === `${props.row.alert_id}:PENDIENTE`"
                @click="quickSetStatus(props.row, 'PENDIENTE')"
              >
                <q-tooltip>{{ $t("alerts.action_reopen") }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppDialog
      v-model="detailOpen"
      maximized
      wide
      icon="notification_important"
      :title="selectedAlert?.title || $t('alerts.detail_title')"
      :subtitle="selectedAlert?.message || ''"
    >
      <div v-if="selectedAlert" class="detail-dialog-body">
        <div class="detail-status-row">
          <q-badge :color="severityColor(selectedAlert.severity)" :label="selectedAlert.severity" />
          <q-badge :color="statusColor(selectedAlert.status)" :label="statusLabel(selectedAlert.status)" />
          <q-badge
            v-if="selectedAlert.sla_due_at"
            :color="selectedAlert.is_overdue ? 'negative' : 'dark'"
            :label="selectedAlert.is_overdue ? $t('alerts.sla_overdue') : `SLA ${formatDateTime(selectedAlert.sla_due_at)}`"
          />
        </div>

        <div class="detail-grid">
          <div class="detail-panel">
            <div class="panel-title">{{ $t("alerts.radar_title") }}</div>

            <div class="overview-strip">
              <div class="overview-chip">
                <span class="overview-label">{{ $t("alerts.radar_rule") }}</span>
                <strong>{{ selectedAlert.rule_key }}</strong>
              </div>
              <div class="overview-chip">
                <span class="overview-label">{{ $t("alerts.radar_source") }}</span>
                <strong>{{ selectedAlert.source_type }}</strong>
              </div>
              <div class="overview-chip">
                <span class="overview-label">{{ $t("alerts.radar_owner") }}</span>
                <strong>{{ selectedAlert.assigned_email || $t("alerts.unassigned") }}</strong>
              </div>
              <div class="overview-chip">
                <span class="overview-label">{{ $t("alerts.radar_occurrences") }}</span>
                <strong>{{ selectedAlert.occurrences }}</strong>
              </div>
            </div>

            <div class="context-grid">
              <div class="context-card">
                <span class="overview-label">{{ $t("alerts.radar_first_seen") }}</span>
                <strong>{{ formatDateTime(selectedAlert.first_seen_at) }}</strong>
              </div>
              <div class="context-card">
                <span class="overview-label">{{ $t("alerts.radar_last_seen") }}</span>
                <strong>{{ formatDateTime(selectedAlert.last_seen_at) }}</strong>
              </div>
              <div class="context-card">
                <span class="overview-label">{{ $t("alerts.radar_sla") }}</span>
                <strong :class="selectedAlert.is_overdue ? 'text-negative' : ''">
                  {{ formatDateTime(selectedAlert.sla_due_at) }}
                </strong>
              </div>
              <div class="context-card">
                <span class="overview-label">{{ $t("alerts.radar_status") }}</span>
                <strong>{{ statusLabel(selectedAlert.status) }}</strong>
              </div>
            </div>

            <div v-if="(selectedAlert.deliveries || []).length" class="panel-subtitle">{{ $t("alerts.radar_deliveries") }}</div>
            <div v-if="(selectedAlert.deliveries || []).length" class="delivery-list">
              <div
                v-for="delivery in selectedAlert.deliveries"
                :key="delivery.alert_delivery_id"
                class="delivery-chip"
              >
                <q-badge :color="delivery.delivery_status === 'sent' ? 'positive' : 'negative'">
                  {{ delivery.channel_type }}
                </q-badge>
                <span class="text-secondary text-sm">
                  {{ delivery.target_value || delivery.error_message || "Sin destino" }}
                </span>
              </div>
            </div>

            <div class="panel-subtitle">{{ $t("alerts.radar_technical_summary") }}</div>
            <pre class="json-box json-box-compact">{{ formatJson(selectedAlert.summary_json) }}</pre>

            <div class="panel-subtitle">{{ $t("alerts.radar_technical_context") }}</div>
            <pre class="json-box json-box-compact">{{ formatJson(selectedAlert.context_json) }}</pre>
          </div>

          <div class="detail-panel">
            <div class="panel-title">{{ $t("alerts.orch_title") }}</div>

            <div class="control-panel">
              <div class="assignment-grid">
                <q-select
                  v-model="assignmentDraft.assignedPlatformAccountId"
                  :options="assigneeOptions"
                  outlined
                  emit-value
                  map-options
                  :label="$t('alerts.orch_owner_label')"
                  :disable="!canManageAlerts || saving"
                />
                <q-input
                  v-model="assignmentDraft.slaDueAt"
                  outlined
                  type="datetime-local"
                  :label="$t('alerts.orch_sla_label')"
                  :disable="!canManageAlerts || saving"
                />
              </div>

              <div class="row justify-end q-mt-sm">
                <q-btn
                  color="primary"
                  unelevated
                  :label="$t('alerts.orch_save_assignment')"
                  :loading="saving"
                  :disable="!canManageAlerts || saving"
                  @click="saveAssignment"
                />
              </div>
            </div>

            <div class="panel-subtitle">{{ $t("alerts.table_col_actions") }}</div>
            <div class="action-grid">
              <q-btn color="warning" outline :label="$t('alerts.action_investigate')" @click="setStatus('EN_INVESTIGACION')" :disable="!canManageAlerts || saving" />
              <q-btn color="secondary" outline :label="$t('alerts.action_mitigate')" @click="setStatus('MITIGADO')" :disable="!canManageAlerts || saving" />
              <q-btn color="positive" outline :label="$t('alerts.action_resolve')" @click="setStatus('RESUELTO')" :disable="!canManageAlerts || saving" />
              <q-btn color="dark" outline :label="$t('alerts.action_close')" @click="setStatus('CERRADO')" :disable="!canManageAlerts || saving" />
              <q-btn color="primary" flat :label="$t('alerts.action_reopen')" @click="setStatus('PENDIENTE')" :disable="!canManageAlerts || saving" />
            </div>

            <q-input
              v-model="noteDraft"
              type="textarea"
              autogrow
              outlined
              :label="$t('alerts.orch_note_label')"
              class="q-mt-md"
            />

            <div class="row justify-end q-mt-sm">
              <q-btn color="primary" unelevated :label="$t('alerts.orch_save_note')" :loading="saving" :disable="!canManageAlerts || !noteDraft.trim()" @click="saveNote" />
            </div>

            <div class="activity-shell">
              <div>
                <div class="panel-subtitle">{{ $t("alerts.history_title") }}</div>
                <q-timeline color="primary" layout="dense" class="timeline-shell">
                  <q-timeline-entry
                    v-for="event in selectedAlert.events || []"
                    :key="event.alert_event_id"
                    :title="beautifyEventType(event.event_type)"
                    :subtitle="formatDateTime(event.created_at)"
                  >
                    <div class="text-secondary text-sm">
                      {{ event.note_text || buildStatusCopy(event) }}
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </div>

              <div>
                <div class="panel-subtitle">{{ $t("alerts.notes_title") }}</div>
                <div v-if="!(selectedAlert.notes || []).length" class="empty-note-state">
                  {{ $t("alerts.notes_empty") }}
                </div>
                <div v-for="note in selectedAlert.notes || []" :key="note.incident_note_id" class="note-card">
                  <div class="row items-center justify-between">
                    <strong>{{ note.author_email || "Sistema" }}</strong>
                    <span class="text-secondary text-xs">{{ formatDateTime(note.created_at) }}</span>
                  </div>
                  <div class="text-secondary text-sm q-mt-xs">{{ note.body }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppDialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { date } from "quasar";
import AppDialog from "src/components/common/AppDialog.vue";
import { useConfirmDialog } from "src/composables/useConfirmDialog";
import { useUserStore } from "src/stores/userStore";
import { getAlertDetail, getAlerts, getAlertsReport, getPlatformAccounts } from "src/utils/api/get";
import { addAlertNote, assignAlert, updateAlertStatus } from "src/utils/api/post";
import { notifyError, notifySuccess } from "src/utils/utils";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const { t } = useI18n();
const { confirmAction } = useConfirmDialog();
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const alerts = ref([]);
const report = ref({});
const platformAccounts = ref([]);
const statusFilter = ref("ALL");
const severityFilter = ref("ALL");
const detailOpen = ref(false);
const selectedAlert = ref(null);
const selectedRows = ref([]);
const noteDraft = ref("");
const severityOptions = computed(() => [
  { label: t("alerts.severity_all"), value: "ALL" },
  { label: t("alerts.severity_info"), value: "info" },
  { label: t("alerts.severity_warning"), value: "warning" },
  { label: t("alerts.severity_error"), value: "error" },
  { label: t("alerts.severity_fatal"), value: "fatal" },
]);

const quickActionId = ref("");
const bulkActionId = ref("");
const assignmentDraft = ref({
  assignedPlatformAccountId: null,
  slaDueAt: "",
});

const columns = computed(() => [
  {
    name: "title",
    label: t("alerts.table_col_alert"),
    field: "title",
    align: "left",
    sortable: true,
    style: "min-width: 340px; max-width: 520px; width: 42%;",
    headerStyle: "min-width: 340px; width: 42%;",
  },
  {
    name: "severity",
    label: t("alerts.table_col_severity"),
    field: "severity",
    align: "center",
    sortable: true,
    style: "width: 92px;",
    headerStyle: "width: 92px;",
  },
  {
    name: "status",
    label: t("alerts.table_col_status"),
    field: "status",
    align: "center",
    sortable: true,
    style: "width: 112px;",
    headerStyle: "width: 112px;",
  },
  {
    name: "assigned_email",
    label: t("alerts.table_col_owner"),
    field: "assigned_email",
    align: "center",
    sortable: true,
    style: "width: 128px; max-width: 128px;",
    headerStyle: "width: 128px;",
  },
  {
    name: "sla_due_at",
    label: t("alerts.table_col_sla"),
    field: "sla_due_at",
    align: "center",
    sortable: true,
    style: "width: 132px;",
    headerStyle: "width: 132px;",
  },
  {
    name: "occurrences",
    label: t("alerts.table_col_occurrences"),
    field: "occurrences",
    align: "center",
    sortable: true,
    style: "width: 88px;",
    headerStyle: "width: 88px;",
  },
  {
    name: "actions",
    label: t("alerts.table_col_actions"),
    field: "actions",
    align: "right",
    style: "width: 132px;",
    headerStyle: "width: 132px;",
  },
]);

const canManageAlerts = computed(() => userStore.hasPermission("alerts.manage"));
const assigneeOptions = computed(() => [
  { label: t("alerts.unassigned"), value: null },
  ...platformAccounts.value
    .filter((item) => item.status === "active")
    .map((item) => ({
      label: `${item.email} - ${item.role}`,
      value: item.platform_account_id,
    })),
]);

const filteredAlerts = computed(() =>
  alerts.value.filter((alert) => {
    const statusOk = statusFilter.value === "ALL" || alert.status === statusFilter.value;
    const severityOk = severityFilter.value === "ALL" || alert.severity === severityFilter.value;
    return statusOk && severityOk;
  }),
);

const stats = computed(() => [
  {
    label: t("alerts.filter_pending"),
    value: report.value.summary?.pending ?? alerts.value.filter((item) => item.status === "PENDIENTE").length,
    icon: "notifications_active",
    color: "warning",
  },
  {
    label: t("alerts.stats_unassigned"),
    value: report.value.summary?.unassigned_active ?? alerts.value.filter((item) => !item.assigned_email && isActiveStatus(item.status)).length,
    icon: "person_off",
    color: "orange",
  },
  {
    label: t("alerts.stats_overdue"),
    value: report.value.summary?.overdue_active ?? alerts.value.filter((item) => item.is_overdue).length,
    icon: "timer_off",
    color: "negative",
  },
  {
    label: t("alerts.stats_avg_resolution"),
    value: report.value.summary?.avg_resolution_hours ? `${report.value.summary.avg_resolution_hours} h` : "-",
    icon: "schedule",
    color: "info",
  },
]);

async function loadAlerts() {
  const res = await getAlerts();
  alerts.value = res.data.data || [];
}

async function loadReport() {
  const res = await getAlertsReport();
  report.value = res.data.data || {};
}

async function loadPlatformAccounts() {
  const res = await getPlatformAccounts();
  platformAccounts.value = res.data.data || [];
}

async function refreshAll() {
  loading.value = true;
  error.value = null;
  try {
    await Promise.all([loadAlerts(), loadReport(), loadPlatformAccounts()]);
  } catch {
    error.value = t("alerts.load_error");
  } finally {
    loading.value = false;
  }
}

async function openAlert(alertId) {
  detailOpen.value = true;
  selectedAlert.value = null;
  noteDraft.value = "";

  try {
    const res = await getAlertDetail(alertId);
    selectedAlert.value = hydrateDetail(res.data.data || null);
    syncAssignmentDraft();
  } catch {
    detailOpen.value = false;
    notifyError(t("alerts.notify_detail_error"));
  }
}

async function refreshSelected() {
  if (!selectedAlert.value?.alert_id) return;
  const res = await getAlertDetail(selectedAlert.value.alert_id);
  selectedAlert.value = hydrateDetail(res.data.data || null);
  syncAssignmentDraft();
}

async function setStatus(status) {
  if (!selectedAlert.value?.alert_id) return;
  saving.value = true;
  try {
    await updateAlertStatus(selectedAlert.value.alert_id, status, noteDraft.value.trim());
    notifySuccess(t("alerts.notify_status_success"));
    noteDraft.value = "";
    await Promise.all([refreshAll(), refreshSelected()]);
  } catch {
    notifyError(t("alerts.notify_status_error"));
  } finally {
    saving.value = false;
  }
}

async function saveNote() {
  if (!selectedAlert.value?.alert_id || !noteDraft.value.trim()) return;
  saving.value = true;
  try {
    await addAlertNote(selectedAlert.value.alert_id, noteDraft.value.trim());
    notifySuccess(t("alerts.notify_note_success"));
    noteDraft.value = "";
    await Promise.all([refreshAll(), refreshSelected()]);
  } catch {
    notifyError(t("alerts.notify_note_error"));
  } finally {
    saving.value = false;
  }
}

async function saveAssignment() {
  if (!selectedAlert.value?.alert_id) return;
  saving.value = true;
  try {
    await assignAlert(
      selectedAlert.value.alert_id,
      assignmentDraft.value.assignedPlatformAccountId,
      assignmentDraft.value.slaDueAt ? toIsoFromLocalInput(assignmentDraft.value.slaDueAt) : null,
      noteDraft.value.trim(),
    );
    notifySuccess(t("alerts.notify_assignment_success"));
    await Promise.all([refreshAll(), refreshSelected()]);
  } catch {
    notifyError(t("alerts.notify_assignment_error"));
  } finally {
    saving.value = false;
  }
}

async function quickSetStatus(alert, status) {
  quickActionId.value = `${alert.alert_id}:${status}`;
  try {
    await updateAlertStatus(alert.alert_id, status, "");
    notifySuccess(t("alerts.notify_quick_success", { status: statusLabel(status).toLowerCase() }));
    await Promise.all([refreshAll(), selectedAlert.value?.alert_id === alert.alert_id ? refreshSelected() : Promise.resolve()]);
  } catch {
    notifyError(t("alerts.notify_quick_error"));
  } finally {
    quickActionId.value = "";
  }
}

async function bulkSetStatus(status) {
  if (!selectedRows.value.length || !canManageAlerts.value) return;
  const confirmed = await confirmAction({
    title: "Confirmar accion masiva",
    message: `Vas a cambiar ${selectedRows.value.length} alertas a ${statusLabel(status)}. Esta accion quedara registrada en el historial de alertas.`,
    okLabel: "Aplicar cambio",
    cancelLabel: "Cancelar",
    color: status === "RESUELTO" ? "positive" : "warning",
    icon: status === "RESUELTO" ? "check_circle" : "published_with_changes",
  });
  if (!confirmed) return;

  bulkActionId.value = status;
  try {
    await Promise.all(
      selectedRows.value.map((alert) =>
        updateAlertStatus(alert.alert_id, status, ""),
      ),
    );
    notifySuccess(`${selectedRows.value.length} alertas actualizadas`);
    selectedRows.value = [];
    await Promise.all([refreshAll(), selectedAlert.value?.alert_id ? refreshSelected() : Promise.resolve()]);
  } catch {
    notifyError("No se pudieron actualizar todas las alertas");
  } finally {
    bulkActionId.value = "";
  }
}

function hydrateDetail(alert) {
  if (!alert) return null;
  return {
    ...alert,
    is_overdue: Boolean(
      alert.sla_due_at
      && new Date(alert.sla_due_at).getTime() < Date.now()
      && isActiveStatus(alert.status),
    ),
  };
}

function syncAssignmentDraft() {
  assignmentDraft.value = {
    assignedPlatformAccountId: selectedAlert.value?.assigned_platform_account_id || null,
    slaDueAt: toLocalDateTimeInput(selectedAlert.value?.sla_due_at),
  };
}

function isActiveStatus(status) {
  return ["PENDIENTE", "EN_INVESTIGACION", "MITIGADO"].includes(status);
}

function severityColor(severity) {
  if (severity === "fatal" || severity === "error") return "negative";
  if (severity === "warning") return "warning";
  return "info";
}

function severityIcon(severity) {
  if (severity === "fatal" || severity === "error") return "report";
  if (severity === "warning") return "warning";
  return "info";
}

function statusColor(status) {
  if (status === "PENDIENTE") return "warning";
  if (status === "EN_INVESTIGACION") return "info";
  if (status === "MITIGADO") return "secondary";
  if (status === "RESUELTO") return "positive";
  if (status === "CERRADO") return "grey-7";
  return "grey-6";
}

function statusLabel(status) {
  if (!status) return "-";
  const key = `alerts.filter_${status.toLowerCase()}`;
  const label = t(key);
  return label !== key ? label : String(status).replaceAll("_", " ");
}

function formatDateTime(value) {
  return value ? date.formatDate(value, "DD/MM/YYYY HH:mm") : "-";
}

function formatJson(value) {
  return JSON.stringify(value || {}, null, 2);
}

function buildStatusCopy(event) {
  if (!event?.from_status && event?.to_status) return `Estado inicial: ${statusLabel(event.to_status)}`;
  if (event?.from_status || event?.to_status) return `${statusLabel(event.from_status)} -> ${statusLabel(event.to_status)}`;
  return "Actualizacion registrada";
}

function beautifyEventType(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toLocalDateTimeInput(value) {
  if (!value) return "";
  return date.formatDate(value, "YYYY-MM-DDTHH:mm");
}

function toIsoFromLocalInput(value) {
  return new Date(value).toISOString();
}

onMounted(refreshAll);
</script>

<style scoped lang="scss">
.alerts-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.stats-grid,
.report-grid {
  display: grid;
  gap: var(--space-4);
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.report-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.report-card {
  min-height: 100%;
}

.report-list {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.report-row {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
}

.report-row-stacked {
  align-items: flex-start;
  flex-direction: column;
}

.toolbar {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
}

.bulk-toolbar {
  align-items: center;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);

  div:first-child {
    display: grid;
    gap: var(--space-1);

    span {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
  }
}

.bulk-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.severity-select {
  min-width: 220px;
}

.alert-row-button {
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
  text-align: left;
  width: 100%;
}

.alert-title-cell {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  max-width: 100%;
  min-width: 0;

  > div:last-child {
    min-width: 0;
  }
}

.alert-title-line {
  flex-wrap: nowrap;
  max-width: 100%;
  min-width: 0;
}

.table-actions {
  align-items: center;
  display: inline-flex;
  gap: var(--space-1);
  justify-content: flex-end;
}

.ellipsis-2-lines {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.table-empty-state {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  min-height: 180px;
  padding: var(--space-8);
  width: 100%;
}

.table-empty-icon {
  flex: 0 0 auto;
  height: 56px;
  width: 56px;
}

.detail-dialog-body {
  display: grid;
  gap: var(--space-4);
}

.detail-status-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.detail-grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
}

.detail-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);
}

.panel-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
}

.panel-subtitle {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  margin-top: var(--space-3);
}

.detail-kv {
  color: var(--color-text-secondary);
}

.overview-strip,
.context-grid,
.delivery-list,
.activity-shell {
  display: grid;
  gap: var(--space-3);
}

.overview-strip {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-chip,
.context-card,
.control-panel,
.empty-note-state {
  background:
    linear-gradient(180deg, rgba(79, 70, 229, 0.04), rgba(15, 23, 42, 0.04)),
    var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.overview-label {
  color: var(--color-text-secondary);
  display: block;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.context-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.delivery-list {
  grid-template-columns: 1fr;
}

.delivery-chip {
  align-items: center;
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
}

.json-box {
  background: #101522;
  border-radius: var(--radius-lg);
  color: #d7e4ff;
  font-size: 12px;
  margin: 0;
  overflow: auto;
  padding: var(--space-4);
}

.json-box-compact {
  max-height: 220px;
}

.assignment-grid,
.action-grid {
  display: grid;
  gap: var(--space-3);
}

.assignment-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.activity-shell {
  gap: var(--space-5);
}

.timeline-shell {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  margin-top: var(--space-2);
  padding: var(--space-3);
}

.note-card {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

:global(body.body--dark) .json-box {
  background: #0b1220;
  color: #d9e7ff;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

@media (max-width: 1200px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1100px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .overview-strip,
  .context-grid,
  .assignment-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-grid,
  .page-header {
    grid-template-columns: 1fr;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .severity-select {
    min-width: 0;
    width: 100%;
  }
}
</style>
