<template>
  <div id="app">
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

<style src="./app.sass" lang="sass"/>
