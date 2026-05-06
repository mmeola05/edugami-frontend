<template>
  <q-page class="page-shell-premium reports-page">
    <div class="page-header">
      <div>
        <h1 class="text-page-title">{{ t('tenant.reports.title', 'Informes y Analítica') }}</h1>
        <p class="text-page-subtitle">{{ t('tenant.reports.subtitle', 'Métricas reales y estado de salud del ecosistema del centro.') }}</p>
      </div>
      <q-btn
        color="primary"
        icon="refresh"
        label="Actualizar"
        flat
        round
        dense
        :loading="loading"
        @click="loadData"
      />
    </div>

    <div v-if="loading && !dashboardData" class="loading-state">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <div v-else-if="dashboardData" class="dashboard-grid">
      <!-- KPIs -->
      <q-card class="kpi-card bg-gradient-blue text-white">
        <q-card-section>
          <div class="kpi-header">
            <q-icon name="groups" size="28px" />
            <span>Alumnos Activos</span>
          </div>
          <div class="kpi-value">{{ dashboardData.kpis.students }}</div>
          <div class="kpi-footer">Matriculados en el periodo actual</div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card bg-gradient-pink text-white">
        <q-card-section>
          <div class="kpi-header">
            <q-icon name="class" size="28px" />
            <span>Clases Abiertas</span>
          </div>
          <div class="kpi-value">{{ dashboardData.kpis.classes }}</div>
          <div class="kpi-footer">Ratio: {{ dashboardData.kpis.studentClassRatio }} alumnos/clase</div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card bg-gradient-cyan text-white">
        <q-card-section>
          <div class="kpi-header">
            <q-icon name="school" size="28px" />
            <span>Personal Docente</span>
          </div>
          <div class="kpi-value">{{ dashboardData.kpis.teachers }}</div>
          <div class="kpi-footer">Profesores activos en el tenant</div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card bg-gradient-dark text-white">
        <q-card-section>
          <div class="kpi-header">
            <q-icon name="menu_book" size="28px" />
            <span>Asignaturas & Matrículas</span>
          </div>
          <div class="kpi-value">{{ dashboardData.kpis.subjects }} / {{ dashboardData.kpis.enrollments }}</div>
          <div class="kpi-footer">Total de materias y asociaciones</div>
        </q-card-section>
      </q-card>

      <!-- Charts Section -->
      <q-card class="chart-card glass-panel" style="grid-column: 1 / -1">
        <q-card-section>
          <h3 class="chart-title">Actividad Reciente del Ecosistema</h3>
          <p class="chart-subtitle">Eventos del historial académico (matrículas, bajas, altas) de los últimos 6 meses</p>
          
          <div class="css-chart-container" v-if="dashboardData.trends && dashboardData.trends.length">
            <div 
              v-for="(trend, i) in dashboardData.trends" 
              :key="i"
              class="bar-wrapper"
            >
              <div class="bar-value">{{ trend.value }}</div>
              <div 
                class="bar-fill" 
                :style="{ height: getBarHeight(trend.value) + '%' }"
              ></div>
              <div class="bar-label">{{ formatDate(trend.date) }}</div>
            </div>
          </div>
          
          <div v-else class="empty-chart">
            <q-icon name="auto_graph" size="40px" color="grey-4" />
            <p>No hay suficientes eventos académicos para trazar una tendencia.</p>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTenantReportsDashboard } from 'src/utils/api/get';
import { date } from 'quasar';

const { t } = useI18n();
const loading = ref(false);
const dashboardData = ref(null);

const maxTrendValue = computed(() => {
  if (!dashboardData.value || !dashboardData.value.trends.length) return 1;
  return Math.max(...dashboardData.value.trends.map(t => t.value), 10); // Minimum scale of 10
});

function getBarHeight(value) {
  return (value / maxTrendValue.value) * 100;
}

function formatDate(isoString) {
  return date.formatDate(isoString, 'MMM YYYY');
}

async function loadData() {
  loading.value = true;
  try {
    const res = await getTenantReportsDashboard();
    dashboardData.value = res.data.data;
  } catch (err) {
    console.error('Failed to load dashboard', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.reports-page,
.page-header {
  display: grid;
  gap: var(--space-6);
}

.page-header {
  align-items: center;
  grid-template-columns: 1fr auto;
}

.loading-state {
  align-items: center;
  display: flex;
  height: 40vh;
  justify-content: center;
}

.dashboard-grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.kpi-card {
  border-radius: var(--tenant-radius-xl);
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.kpi-header {
  align-items: center;
  display: flex;
  font-size: 0.85rem;
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  letter-spacing: 0.05em;
  opacity: 0.9;
  text-transform: uppercase;
}

.kpi-value {
  font-size: 3.5rem;
  font-weight: var(--font-weight-extrabold);
  line-height: 1.1;
  margin: var(--space-3) 0;
}

.kpi-footer {
  font-size: 0.8rem;
  font-weight: var(--font-weight-medium);
  opacity: 0.8;
}

.bg-gradient-blue { background: var(--tenant-blue-card); }
.bg-gradient-pink { background: var(--tenant-pink-card); }
.bg-gradient-cyan { background: var(--tenant-cyan-card); }
.bg-gradient-dark { background: var(--tenant-dark-card); }

/* Chart Styling */
.chart-card {
  border-radius: var(--tenant-radius-xl);
  margin-top: var(--space-4);
}

.glass-panel {
  background: var(--eg-surface);
  border: 1px solid var(--eg-border);
  box-shadow: var(--shadow-sm);
}

.chart-title {
  font-size: 1.4rem;
  font-weight: var(--font-weight-extrabold);
  margin: 0;
}

.chart-subtitle {
  color: var(--eg-muted);
  font-size: 0.9rem;
  margin-top: var(--space-1);
}

.css-chart-container {
  align-items: flex-end;
  display: flex;
  gap: var(--space-4);
  height: 250px;
  justify-content: space-around;
  margin-top: var(--space-6);
  padding: 0 var(--space-4);
}

.bar-wrapper {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
  max-width: 60px;
}

.bar-value {
  color: var(--eg-text);
  font-size: 0.85rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2);
}

.bar-fill {
  background: linear-gradient(180deg, var(--eg-primary) 0%, var(--eg-primary-2) 100%);
  border-radius: 6px 6px 0 0;
  box-shadow: 0 -4px 12px rgba(36, 21, 242, 0.15);
  transition: height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
}

.bar-wrapper:hover .bar-fill {
  filter: brightness(1.2);
}

.bar-label {
  color: var(--eg-muted);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--space-3);
  text-align: center;
}

.empty-chart {
  align-items: center;
  color: var(--eg-muted);
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: center;
  text-align: center;
}
</style>
