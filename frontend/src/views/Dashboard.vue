<template>
  <div>
    <h1>Dashboard (Hoje)</h1>
    
    <div v-if="stats" class="card">
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px; text-align: center;">
        {{ stats.count }} registros hoje
      </div>
      
      <div v-if="store.pendingSyncCount > 0" style="text-align: center; color: var(--danger); font-size: 0.9rem; margin-bottom: 15px; font-weight: bold;">
        {{ store.pendingSyncCount }} registro(s) aguardando sincronização
      </div>
      <div v-else style="margin-bottom: 15px;"></div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="card" style="margin-bottom: 0; text-align: center;">
          <div style="font-size: 0.9rem; opacity: 0.7;">Energia Média</div>
          <div style="font-size: 1.5rem; font-weight: bold;">{{ stats.avgEnergia.toFixed(1) }}</div>
        </div>
        <div class="card" style="margin-bottom: 0; text-align: center;">
          <div style="font-size: 0.9rem; opacity: 0.7;">Clareza Média</div>
          <div style="font-size: 1.5rem; font-weight: bold;">{{ stats.avgClareza.toFixed(1) }}</div>
        </div>
        <div class="card" style="margin-bottom: 0; text-align: center;">
          <div style="font-size: 0.9rem; opacity: 0.7;">Impulso Médio</div>
          <div style="font-size: 1.5rem; font-weight: bold;">{{ stats.avgImpulso.toFixed(1) }}</div>
        </div>
        <div class="card" style="margin-bottom: 0; text-align: center;">
          <div style="font-size: 0.9rem; opacity: 0.7;">Cedeu (Vezes)</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: var(--danger);">{{ stats.cedeuCount }}</div>
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
import { useMindStore } from '../store';

const store = useMindStore();
const stats = ref<any>(null);

onMounted(async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.get(`${API_URL}/analytics/dashboard`);
    stats.value = res.data;
  } catch (err) {
    console.error(err);
  }
});
</script>
