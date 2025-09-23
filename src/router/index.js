import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';

const routes = [
  {
    path: '/',
    redirect: '/cn', // 默认重定向到中文页面
  },
  {
    path: '/cn',
    component: App,
    meta: { language: 'cn' },
  },
  {
    path: '/en',
    component: App,
    meta: { language: 'en' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
