import Vue from 'vue'

import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueMaterial from 'vue-material'

import App from './App.vue'
import Search from '../search/Search.vue'
import Manoni from '../search/SelectPOIs.vue'
import Results from '../map/Map.vue'

Vue.use(VueMaterial)
Vue.use(VueRouter)
Vue.use(VueResource)

const routes = [
  { path: '/', component: Search },
  { path: '/search', component: Search},
  { path: '/search/manual', component: Manoni },
  { path: '/map', component: Results }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
}).$mount('#app')