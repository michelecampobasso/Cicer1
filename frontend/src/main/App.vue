<template>
  <div id="app">
    <router-view :poilist="poilist" :gps="gps" :modalData="modalData"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      poilist: {
        list: [],
      },
      gps: {
        coordinates: {},
      },
      modalData : {
        header : "",
        body : ""
      }
    }
  }
}
</script>

<style src="./app.sass" lang="sass"/>
