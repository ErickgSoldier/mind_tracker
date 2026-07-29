import { defineStore } from 'pinia';
import axios from 'axios';
import { openDB } from 'idb';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Inicializa o banco IndexedDB
const initDB = async () => {
  return openDB('mind-tracker-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const useMindStore = defineStore('mind', {
  state: () => ({
    pendingSyncCount: 0,
    isOffline: !navigator.onLine,
    settings: {
      notificationsEnabled: true,
      intervalHours: 3,
      startTime: '08:00',
      endTime: '20:00'
    }
  }),
  actions: {
    setOfflineStatus(status: boolean) {
      this.isOffline = status;
    },
    async updatePendingCount() {
      try {
        const db = await initDB();
        const count = await db.count('sync-queue');
        this.pendingSyncCount = count;
      } catch (e) {
        console.error("Erro ao contar fila offline", e);
      }
    },
    async fetchSettings() {
      try {
        const res = await axios.get(`${API_URL}/settings`);
        if (res.data && Object.keys(res.data).length > 0) {
          // Merge defaults with fetched
          this.settings = { ...this.settings, ...res.data };
          // For retrocompatibility if notificationsEnabled was not in DB yet
          if (res.data.notificationsEnabled === undefined) {
             this.settings.notificationsEnabled = true;
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings, using defaults.', err);
      }
    },
    async saveSettings(settings: any) {
      try {
        await axios.put(`${API_URL}/settings`, settings);
        this.settings = settings;
        this.scheduleNextNotification();
      } catch (err) {
        console.error('Failed to save settings to server, saving locally.', err);
        this.settings = settings;
        this.scheduleNextNotification();
      }
    },
    async addRecord(record: any) {
      try {
        // Tenta enviar pro servidor
        await axios.post(`${API_URL}/records`, record);
        this.scheduleNextNotification();
      } catch (err) {
        // Tratamento Offline
        console.log("Servidor indisponível, salvando no IndexedDB...");
        const db = await initDB();
        await db.add('sync-queue', record);
        this.updatePendingCount();
        this.scheduleNextNotification();
      }
    },
    async syncOfflineRecords() {
      const db = await initDB();
      const allPending = await db.getAll('sync-queue');
      const allKeys = await db.getAllKeys('sync-queue');
      
      if (allPending.length === 0) {
        this.pendingSyncCount = 0;
        return;
      }

      for (let i = 0; i < allPending.length; i++) {
        const record = allPending[i];
        const key = allKeys[i];
        
        try {
          await axios.post(`${API_URL}/records`, record);
          // Sucesso, remove da fila
          await db.delete('sync-queue', key);
        } catch (err) {
          // Continua offline ou erro no servidor, aborta e deixa na fila
          console.error("Erro ao sincronizar registro", err);
          break; // Stop syncing if connection is still failing
        }
      }
      this.updatePendingCount();
    },
    scheduleNextNotification() {
      if (!this.settings.notificationsEnabled) return;
      
      const { intervalHours, startTime, endTime } = this.settings;
      const now = new Date();
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      let nextTime = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
      
      const startOfToday = new Date(now);
      startOfToday.setHours(startH, startM, 0, 0);
      const endOfToday = new Date(now);
      endOfToday.setHours(endH, endM, 0, 0);
      
      if (nextTime > endOfToday) {
        nextTime = new Date(now);
        nextTime.setDate(now.getDate() + 1);
        nextTime.setHours(startH, startM, 0, 0);
      } else if (nextTime < startOfToday) {
        nextTime = new Date(now);
        nextTime.setHours(startH, startM, 0, 0);
      }
      
      localStorage.setItem('nextNotification', nextTime.toISOString());
    }
  }
});
