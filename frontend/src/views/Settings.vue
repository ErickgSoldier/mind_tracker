<template>
  <div>
    <h1>Configurações</h1>
    
    <div class="card">
      <h2>Notificações</h2>
      
      <div style="margin-bottom: 20px; font-size: 0.9rem; padding: 10px; background: var(--bg-color); border-radius: 8px;">
        <strong>Status de Permissão:</strong> {{ permissionStatus }}
        <button v-if="permissionStatus !== 'granted'" @click="requestPermission" class="btn" style="margin-left: 10px; padding: 5px 10px; font-size: 0.8rem;">Solicitar Permissão</button>
      </div>

      <div style="margin-bottom: 20px; font-size: 0.8rem; opacity: 0.8;">
        <em>Para lembretes funcionarem melhor, abra o app ocasionalmente ou mantenha-o em segundo plano. Devido a limitações dos sistemas, caso force o encerramento do app, os alarmes automáticos podem não despertar sem um servidor externo.</em>
      </div>

      <form @submit.prevent="save">
        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="notif" v-model="form.notificationsEnabled" style="width: 20px; height: 20px;"/>
          <label for="notif" style="margin-bottom: 0;">Ativar Notificações</label>
        </div>
        
        <div class="form-group">
          <label>Intervalo de Lembrete</label>
          <select v-model.number="form.intervalHours" class="form-control" :disabled="!form.notificationsEnabled">
            <option :value="1">1 hora</option>
            <option :value="2">2 horas</option>
            <option :value="3">3 horas</option>
            <option :value="4">4 horas</option>
            <option :value="6">6 horas</option>
            <option :value="8">8 horas</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Horário de Início (Não incomodar antes)</label>
          <input type="time" v-model="form.startTime" class="form-control" :disabled="!form.notificationsEnabled" />
        </div>
        
        <div class="form-group">
          <label>Horário de Término (Não incomodar depois)</label>
          <input type="time" v-model="form.endTime" class="form-control" :disabled="!form.notificationsEnabled" />
        </div>
        
        <button type="submit" class="btn btn-block">Salvar Configurações</button>
      </form>
      
      <button @click="testNotification" class="btn btn-block" style="margin-top: 10px; background: var(--border); color: var(--text-color);" :disabled="permissionStatus !== 'granted'">Testar Notificação</button>
    </div>

    <div class="card">
      <h2>Sincronização Offline</h2>
      <div style="margin-bottom: 15px;">
        Registros pendentes: <strong>{{ store.pendingSyncCount }}</strong>
      </div>
      <button @click="forceSync" class="btn btn-block" style="background: var(--success); margin-bottom: 10px;" :disabled="store.pendingSyncCount === 0 || store.isOffline">
        Forçar Sincronização Agora
      </button>
    </div>
    
    <div class="card">
      <h2>Exportar Dados</h2>
      <button @click="exportJson" class="btn btn-block" style="background: var(--text-color); margin-bottom: 10px;">Exportar para JSON</button>
      <button @click="backupDb" class="btn btn-block" style="background: var(--text-color);">Fazer Backup do Banco de Dados (SQLite)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useMindStore } from '../store';

const store = useMindStore();
const form = ref({
  notificationsEnabled: store.settings.notificationsEnabled,
  intervalHours: store.settings.intervalHours,
  startTime: store.settings.startTime,
  endTime: store.settings.endTime
});

const permissionStatus = ref('Desconhecido');

onMounted(() => {
  if ('Notification' in window) {
    permissionStatus.value = Notification.permission;
  }
});

watch(() => store.settings, (newVal) => {
  form.value = { ...newVal };
}, { deep: true });

const requestPermission = async () => {
  if ('Notification' in window) {
    const perm = await Notification.requestPermission();
    permissionStatus.value = perm;
  }
};

const testNotification = () => {
  if (permissionStatus.value === 'granted') {
    new Notification('Mind Tracker', { body: 'Isto é um teste de notificação local.' });
  }
};

const forceSync = async () => {
  await store.syncOfflineRecords();
  alert('Tentativa de sincronização concluída.');
};

const save = async () => {
  await store.saveSettings(form.value);
  alert('Configurações salvas!');
  
  if (form.value.notificationsEnabled && permissionStatus.value !== 'granted') {
    requestPermission();
  }
};

const exportJson = () => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  window.open(`${API_URL}/export/json`, '_blank');
};

const backupDb = () => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  window.open(`${API_URL}/export/backup`, '_blank');
};
</script>
