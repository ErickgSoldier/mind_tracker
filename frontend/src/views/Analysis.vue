<template>
  <div>
    <h1>Análise e Insights</h1>
    
    <div v-if="analytics">
      <div class="card" v-if="analytics.insights.length > 0">
        <h2>Insights Automáticos</h2>
        <ul>
          <li v-for="(insight, idx) in analytics.insights" :key="idx" style="margin-bottom: 10px;">
            {{ insight }}
          </li>
        </ul>
      </div>

      <div class="card" v-if="analytics.correlations.length > 0">
        <h2>Ranking de Fatores (Correlação com Impulso)</h2>
        <div v-for="c in analytics.correlations" :key="c.factor" style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="text-transform: capitalize;">{{ c.factor.replace('_', ' ') }}</span>
            <span :style="{ color: c.correlationImpulso > 0 ? 'var(--danger)' : 'var(--success)' }">
              {{ c.correlationImpulso > 0 ? '+' : '' }}{{ c.correlationImpulso.toFixed(2) }}
            </span>
          </div>
          <div style="background: var(--border); height: 8px; border-radius: 4px; margin-top: 4px; overflow: hidden;">
            <div :style="{ width: `${Math.abs(c.correlationImpulso) * 100}%`, background: c.correlationImpulso > 0 ? 'var(--danger)' : 'var(--success)', height: '100%' }"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Gráficos</h2>
        <div style="margin-bottom: 20px;">
          <Line v-if="chartData1" :data="chartData1" :options="chartOptions" />
        </div>
        <div>
          <Bar v-if="chartData2" :data="chartData2" :options="chartOptions" />
        </div>
      </div>
    </div>
    
    <div v-else style="text-align: center; padding: 40px; opacity: 0.5;">
      Carregando...
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
};

onMounted(async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.get(`${API_URL}/analytics/insights`);
    analytics.value = res.data;
    
    if (analytics.value.charts.labels.length > 0) {
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
  }
});
</script>
<style scoped>
canvas {
  max-height: 300px;
}
</style>
