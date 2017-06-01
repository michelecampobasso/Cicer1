<template>
  <div id="app">
    <div class="header" role="intestazione">
      <router-link to="/"><img src="../assets/cicer1icon.png" class="icon" alt="cicerone logo"/></router-link>
      <p class="title">Cicerone</p>
      <p class="subtitle">La guida per i tuoi viaggi</p>
    </div>
    <router-view :poilist="poilist" :gps="gps" :modalData="modalData" :tags="tags"></router-view>
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
        name : "",
        body : "",
        tags : [],
        likes : ""
      },
      tags : {
        list : []
      }, 
    }
  }
}
</script>

<style src="./app.sass" lang="sass"/>
