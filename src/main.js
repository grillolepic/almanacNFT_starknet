import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3TouchEvents from 'vue3-touch-events'
import { useStarknetStore } from '@/store/starknet'
import { useAlmanacStore } from '@/store/almanac'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Vue3TouchEvents)
app.mount('#app')

const starknetStore = useStarknetStore()
starknetStore.init()

const almanacStore = useAlmanacStore()
almanacStore.init()
