<template>
  <div id="app-wrapper">
    <div v-if="store.isOffline" style="background: var(--danger); color: white; text-align: center; padding: 5px; font-weight: 500; font-size: 0.9rem;">
      Você está offline. Os registros serão salvos localmente.
    </div>

    <div class="container">
      <router-view />
    </div>

    <!-- Bottom Navigation -->
    <nav class="navbar">
      <router-link to="/" class="nav-link">Hoje</router-link>
      <router-link to="/history" class="nav-link">Histórico</router-link>
      
      <!-- Central Quick Add Button -->
      <button @click="showForm = true" class="nav-link" style="background:var(--primary);color:#fff;border-radius:50%;width:50px;height:50px;display:flex;justify-content:center;align-items:center;opacity:1;border:none;box-shadow:var(--shadow);cursor:pointer;margin-top:-20px;">
        <span style="font-size:24px;line-height:1;">+</span>
      </button>

      <router-link to="/analysis" class="nav-link">Análise</router-link>
      <router-link to="/settings" class="nav-link">Config</router-link>
    </nav>

    <!-- Global Form Modal -->
    <FormModal v-if="showForm" @close="showForm = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useMindStore } from './store';
import FormModal from './components/FormModal.vue';

const store = useMindStore();
const showForm = ref(false);

const handleOnline = () => {
  store.setOfflineStatus(false);
  store.syncOfflineRecords();
};

const handleOffline = () => {
  store.setOfflineStatus(true);
};

let notificationTimer: any = null;

const checkNotification = () => {
  if (!store.settings.notificationsEnabled) return;
  const nextTimeStr = localStorage.getItem('nextNotification');
  if (nextTimeStr) {
    const nextTime = new Date(nextTimeStr);
    if (new Date() >= nextTime) {
      if (Notification.permission === 'granted') {
        new Notification('Mind Tracker', { body: 'Hora de registrar seu estado mental!' });
      } else {
        console.log("Lembrete: Registre seu estado mental!");
      }
      showForm.value = true;
      store.scheduleNextNotification();
    }
  } else {
    store.scheduleNextNotification();
  }
};

onMounted(async () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  await store.fetchSettings();
  store.updatePendingCount();
  store.syncOfflineRecords();
  
  // Detecção de "Perdi notificação enquanto fechado?"
  const nextTimeStr = localStorage.getItem('nextNotification');
  if (nextTimeStr && new Date() >= new Date(nextTimeStr)) {
    // App foi reaberto e uma notificação foi perdida
    showForm.value = true;
    store.scheduleNextNotification();
  }
  
  notificationTimer = setInterval(checkNotification, 60000);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  if (notificationTimer) clearInterval(notificationTimer);
});
</script>

<style>
#app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.container {
  flex-grow: 1;
  padding-bottom: 80px; /* space for navbar */
}
</style>
