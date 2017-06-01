<template>
  <div id="selectpois" role="main">
    <div class="pois-container">
      <span>Queste sono le attrazioni che Cicerone ha scelto per te</span>
      <br>
      <span>Premi su di esse per includerle o meno nella lista</span>
      <div v-for="poi in pois" v-bind:class="[poi.is_selected ? 'selected' : '', 'poi']" @click="clickOnPoi(poi.id_cicer1)" tabindex="1">
          <div class="left">
            <div class="name">
              {{poi.properties.nome}}
            </div>
            <span class="type">
              {{poi.properties.tipologia}}
            </span>
          </div>
          <div class="right">
            <div class="popularity">
              {{poi.popularity}} <i class="material-icons" style="font-size: 18px; //color: #2870EA">thumb_up</i>️
            </div>
            <div class="rating">
              {{poi.rating}} <i class="material-icons" style="font-size: 18px; //color: #FEC654">star</i>
            </div>
          </div>
      </div>
      <div class="cta-buttons-container">
        <div  @click="goToMap()" class="cta-button" tabindex="2" role="navigation">
          <i class="material-icons">search</i> Vai alla mappa
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['poilist'],
  name: 'selectpois',
  data () {
    return {
      pois_temp: this.poilist.list,
      pois: []
    }
  },
  methods: {
    addFields: function() {
      for (var i = 0; i < this.pois_temp.length; i++) {
        this.pois_temp[i].is_selected = true
        this.pois_temp[i].id_cicer1 = i
      }
      this.pois = JSON.parse(JSON.stringify(this.pois_temp))
    },
    clickOnPoi: function(poi_id) {
      console.log("cioane " + poi_id)
      console.log(poi_id, this.pois[poi_id].is_selected, !this.pois[poi_id].is_selected)
      this.pois[poi_id].is_selected = !this.pois[poi_id].is_selected
    },
    goToMap: function() {
      this.poilist.list = []
      for (var i = 0; i < this.pois.length; i++) {
        if (this.pois[i].is_selected) {
            this.poilist.list.push(this.pois[i])
        }
      }
      this.$router.push("/map")
    }
  },
  watch: {
  },
  mounted() {
    this.addFields()
  } 
}
</script>

<style src="./selectPOIs.sass" lang="sass"/>