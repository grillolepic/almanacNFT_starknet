import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Mint from '../views/Mint.vue'
import Owner from '../views/Owner.vue'
import Gallery from '../views/Gallery.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/mint',
    name: 'mint',
    component: Mint
  },
  {
    path: '/gallery/:id?',
    name: 'gallery',
    component: Gallery
  },
  {
    path: '/owner',
    name: 'owner',
    component: Owner
  },
  /*
  {
    path: '/FAQ',
    name: 'FAQ',
    component: FAQ
  }
  */
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router
