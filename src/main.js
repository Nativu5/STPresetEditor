import { createApp } from 'vue';
import { createPinia } from 'pinia';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import './style.css';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(FloatingVue);
app.mount('#app');
