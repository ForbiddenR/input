import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './components/LoginPage.vue'
import Base64Page from './components/Base64Page.vue'
import { useAuthStore } from './store/auth'

const routes = [
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/base64', name: 'base64', component: Base64Page, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/base64' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated.value && to.meta.requiresAuth) {
        return { name: 'login' }
    }

    if (isAuthenticated.value && to.name === 'login') {
        return { name: 'base64' }
    }
})

export default router
