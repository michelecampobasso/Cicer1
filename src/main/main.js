import Vue from 'vue'

import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

import App from './App.vue'
import Search from '../search/Search.vue'
import Results from '../map/Map.vue'

Vue.use(VueRouter)
Vue.use(VueResource);

// alternatvely use this to import modules:
// const Search = resolve => require(['../search/Search.vue'], resolve)
// const Results = resolve => require(['../map/Map.vue'], resolve)

const routes = [
  { path: '/', component: Search },
  { path: '/search', component: Search },
  { path: '/map', component: Results }
]

const router = new VueRouter({
  routes // short for routes: routes
})


new Vue({
  router,
  el: '#app',
  // http: {
  //   headers: { 'Access-Control-Allow-Origin': true }
  // },
  render: h => h(App)
}).$mount('#app')