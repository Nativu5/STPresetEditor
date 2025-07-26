import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import './style.css';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(FloatingVue);
app.mount('#app');
