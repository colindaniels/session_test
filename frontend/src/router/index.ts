import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/Login.vue';
import AdminPage from '../views/Admin.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


export default router;