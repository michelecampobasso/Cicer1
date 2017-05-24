<template>
  <div id="selectpois">
    <div class="pois-container">
    <!-- metodo 1 -->
      <!--<div v-for="poi in pois" v-bind:class="[poi.is_selected ? 'selected' : '', 'poi']" @click="clickOnPoi(poi.id_cicer1)">-->
    <!-- metodo 2 -->
      <div v-for="poi in pois_ar" v-bind:class="[poi.is_selected ? 'selected' : '', 'poi']" @click="clickOnPoi(poi.id_cicer1)">
          <div class="left">
            <div class="name">
              {{poi.properties.nome}}
            </div>
            <span class="type">
              {{poi.properties.tipologia}}
            </span>
          </div>
          <div class="right">
            <div class="rating">
              {{poi.rating}} ⭐️
            </div>
            <div class="popularity">
              {{poi.popularity}} ✔️
            </div>
          </div>
      </div>
      <div class="cta-buttons-container">
        <div  @click="goToMap()" class="cta-button">🔎 Vai alla mappa</div>
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
      pois: this.poilist.list, //metodo 1
      pois_ar: [] // metodo 2
    }
  },
  methods: {
    addFields: function() {
      for (var i = 0; i < this.pois.length; i++) {

        // 1
        this.pois[i].is_selected = true
        this.pois[i].id_cicer1 = i

        // 2
        this.pois_ar.push(this.pois[i])
      
      } 
    },
    clickOnPoi: function(poi_id) {
      console.log(poi_id, this.pois[poi_id].is_selected, !this.pois[poi_id].is_selected)
      // 1
      // this.pois[poi_id].is_selected = !this.pois[poi_id].is_selected
      // 1 bis
      // this.poilist.list[poi_id].is_selected = !this.poilist.list[poi_id].is_selected
      
      // 2
      this.pois_ar[poi_id].is_selected = !this.pois_ar[poi_id].is_selected
    },
    goToMap: function() {
    //   this.poilist.list = []
    //   for (var i = 0; i < this.pois.length; i++) {
    //     if (this.pois[i].is_selected) {
    //         this.poilist.list.push(this.pois[i])
    //     }
    //   }
    //   this.$router.push("/map")
    }
  },
  watch: {
  },
  created() {
    this.addFields()
  } 
}
</script>

<style src="./selectPOIs.sass" lang="sass"/>