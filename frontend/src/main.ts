import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

// Request notification permission on load if not already requested
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
