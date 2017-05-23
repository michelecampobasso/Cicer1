<template>
  <div id="app">
    <router-view :poilist="poilist" :modalData="modalData"></router-view>
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
      modalData : {
        header : "",
        body : ""
      }
    }
  }
}
</script>

<style src="./app.sass" lang="sass"/>
