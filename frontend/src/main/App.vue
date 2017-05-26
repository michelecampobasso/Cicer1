<template>
  <div id="app">
    <router-view :poilist="poilist" :modalData="modalData" :tags="tags"></router-view>
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
