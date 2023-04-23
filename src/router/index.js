import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/mint',
      name: 'mint',
      component: () => import('../views/Mint.vue')
    },
    ,
    {
      path: '/random',
      name: 'random',
      component: () => import('../views/Random.vue')
    },
    {
      path: '/gallery/:id?',
      name: 'gallery',
      component: () => import('../views/Gallery.vue')
    }
  ]
})

export default router