<template>
  <div>
    <h1>Análise e Insights</h1>
    
    <div v-if="loading" style="text-align: center; padding: 20px;">
      Carregando dados...
    </div>

    <div v-else-if="error" style="text-align: center; padding: 20px; color: var(--danger); background: var(--bg-color); border-radius: 8px;">
      {{ error }}
    </div>

    <div v-else-if="analytics">
      <div class="card" v-if="analytics.insights && analytics.insights.length > 0">
        <h2>Insights Automáticos</h2>
        <ul>
          <li v-for="(insight, idx) in analytics.insights" :key="idx" style="margin-bottom: 10px;">
            {{ insight }}
          </li>
        </ul>
      </div>

      <div class="card" v-if="analytics.correlations && analytics.correlations.length > 0">
        <h2>Ranking de Fatores (Correlação com Impulso)</h2>
        <div v-for="c in analytics.correlations" :key="c.factor" style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="text-transform: capitalize;">{{ c.factor.replace('_', ' ') }}</span>
            <span :style="{ color: (c.correlationImpulso ?? 0) > 0 ? 'var(--danger)' : 'var(--success)' }">
              {{ (c.correlationImpulso ?? 0) > 0 ? '+' : '' }}{{ (c.correlationImpulso ?? 0).toFixed(2) }}
            </span>
          </div>
          <div style="background: var(--border); height: 8px; border-radius: 4px; margin-top: 4px; overflow: hidden;">
            <div :style="{ width: `${Math.abs(c.correlationImpulso ?? 0) * 100}%`, background: (c.correlationImpulso ?? 0) > 0 ? 'var(--danger)' : 'var(--success)', height: '100%' }"></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="chartData1 || chartData2">
        <h2>Gráficos</h2>
        <div style="margin-bottom: 20px;">
          <Line v-if="chartData1" :data="chartData1" :options="chartOptions" />
        </div>
        <div>
          <Bar v-if="chartData2" :data="chartData2" :options="chartOptions" />
        </div>
      </div>
      
      <div v-if="!chartData1 && !analytics.insights?.length && !analytics.correlations?.length" style="text-align: center; padding: 20px; opacity: 0.5;">
        Ainda não há dados suficientes para gerar gráficos e insights.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const analytics = ref<any>(null);
const chartData1 = ref<any>(null);
const chartData2 = ref<any>(null);
const loading = ref(true);
const error = ref('');

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
};

onMounted(async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.get(`${API_URL}/analytics/insights`);
    analytics.value = res.data;
    
    if (analytics.value?.charts?.labels?.length > 0) {
      chartData1.value = {
        labels: analytics.value.charts.labels,
        datasets: [
          {
            label: 'Clareza Mental',
            borderColor: '#4ae27b',
            backgroundColor: '#4ae27b',
            data: analytics.value.charts.clareza
          },
          {
            label: 'Impulso',
            borderColor: '#e24a4a',
            backgroundColor: '#e24a4a',
            data: analytics.value.charts.impulso
          }
        ]
      };
      
      chartData2.value = {
        labels: analytics.value.charts.labels,
        datasets: [
          {
            label: 'Vezes que cedeu',
            backgroundColor: '#e24a4a',
            data: analytics.value.charts.cedeu
          }
        ]
      };
    }
  } catch (err) {
    console.error(err);
    error.value = 'Falha ao carregar a análise. Verifique a conexão com o servidor.';
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
canvas {
  max-height: 300px;
}
</style>
