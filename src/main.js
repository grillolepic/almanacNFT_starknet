import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vue3TouchEvents from "vue3-touch-events";

let app = createApp(App);
app.use(Vue3TouchEvents);
app.use(store).use(router).mount('#app');

store.dispatch('argent/init');