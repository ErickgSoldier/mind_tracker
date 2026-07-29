import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/history', name: 'History', component: () => import('./views/History.vue') },
  { path: '/analysis', name: 'Analysis', component: () => import('./views/Analysis.vue') },
  { path: '/settings', name: 'Settings', component: () => import('./views/Settings.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
