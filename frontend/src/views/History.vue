<template>
  <div>
    <h1>Histórico</h1>
    
    <div style="margin-bottom: 20px;">
      <select v-model="filter" @change="fetchRecords" class="form-control">
        <option value="today">Hoje</option>
        <option value="7days">Últimos 7 dias</option>
        <option value="30days">Últimos 30 dias</option>
        <option value="all">Todo o período</option>
      </select>
    </div>
    
    <div class="card" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border);">
            <th style="padding: 10px;">Data/Hora</th>
            <th style="padding: 10px;">Energia</th>
            <th style="padding: 10px;">Estresse</th>
            <th style="padding: 10px;">Tédio</th>
            <th style="padding: 10px;">Clareza</th>
            <th style="padding: 10px;">Impulso</th>
            <th style="padding: 10px;">Cedeu?</th>
            <th style="padding: 10px;">Obs</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id" style="border-bottom: 1px solid var(--border);">
            <td style="padding: 10px;">{{ new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</td>
            <td style="padding: 10px;">{{ r.energia }}</td>
            <td style="padding: 10px;">{{ r.estresse }}</td>
            <td style="padding: 10px;">{{ r.tedio }}</td>
            <td style="padding: 10px;">{{ r.clareza_mental }}</td>
            <td style="padding: 10px;">{{ r.impulso }}</td>
            <td style="padding: 10px;">
              <span v-if="r.cedeu" style="color: var(--danger); font-weight: bold;">Sim</span>
              <span v-else style="color: var(--success);">Não</span>
            </td>
            <td style="padding: 10px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="r.observacao">
              {{ r.observacao || '-' }}
            </td>
          </tr>
          <tr v-if="records.length === 0">
            <td colspan="8" style="padding: 20px; text-align: center; opacity: 0.5;">Nenhum registro encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const filter = ref('7days');
const records = ref<any[]>([]);

const fetchRecords = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.get(`${API_URL}/records?filter=${filter.value}`);
    records.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchRecords();
});
</script>
