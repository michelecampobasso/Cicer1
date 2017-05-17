<template>
  <div id="app">
    <md-toolbar>
      <h1 class="md-title">My Title</h1>
    </md-toolbar>
    
    <router-link to="/search">Search</router-link>
    <router-link to="/map">Maps</router-link>
     <router-view :poilist="poilist"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      poilist: {
        list: [],
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  text-align: center;
}
</style>
