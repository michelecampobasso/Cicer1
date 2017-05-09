import Vue from 'vue'

import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

import App from './App.vue'
import Search from '../search/Search.vue'
import Manoni from '../search/Manoni.vue'
import Results from '../map/Map.vue'

Vue.use(VueRouter)
Vue.use(VueResource);

Object.defineProperty(Vue.prototype, '$poilist', {
  get() {
    return this.$root.poilist;
  }
});

// Vue.component('search', Search)
// Vue.component('results', Results)

// alternatvely use this to import modules:
// const Search = resolve => require(['../search/Search.vue'], resolve)
// const Results = resolve => require(['../map/Map.vue'], resolve)

const routes = [
  { path: '/', component: Search },
  { path: '/search', component: Search},
  { path: '/search/manual', component: Manoni },
  { path: '/map', component: Results }
]

const router = new VueRouter({
  routes
})

// Vue.http.headers.common['Access-Control-Request-Origin'] = '*'

new Vue({
  router,
  el: '#app',
  data: {
    // bus: bus, // Here we bind our event bus to our $root Vue model.
    poilist: {
      list: []
    }
  },
  // http: {
  //   headers: { 'Access-Control-Allow-Origin': true }
  // },
  render: h => h(App)
}).$mount('#app')