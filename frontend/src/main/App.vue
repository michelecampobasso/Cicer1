<template>
  <div id="app">
    <div class="header" role="banner">
      <router-link to="/"><img src="../assets/cicer1icon.png" class="icon" alt="cicerone logo"/></router-link>
      <p class="title">Cicerone</p>
      <p class="subtitle">La guida per i tuoi viaggi</p>
    </div>
    <router-view :poilist="poilist" :gps="gps" :modalData="modalData" :tags="tags" :map="map"></router-view>
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
      map : {
        content : null,
        directionsDisplay : null,
        directionsService : null,
        markers : [],
        infowindow : null
      }
    }
  }
}
</script>

<style src="./app.sass" lang="sass"/>
