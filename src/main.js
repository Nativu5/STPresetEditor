import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// Create Vue application instance
const app = createApp(App);

// Create Pinia store instance for state management
const pinia = createPinia();

// Add persistence plugin to Pinia for localStorage integration
pinia.use(piniaPluginPersistedstate);

// Register plugins with the Vue app
app.use(pinia); // State management
app.use(FloatingVue); // Tooltip and popover functionality

// Mount the application to the DOM
app.mount('#app');
