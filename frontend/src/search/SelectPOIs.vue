<template>
  <div id="selectpois">
    <div class="pois-container">
      <div v-for="poi in pois">
        <div class="poi" @click="clickOnPoi(poi.id_cicer1)">
          <div v-bind:class="[poi.is_selected ? 'selected' : '', '']">
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
      pois: this.poilist.list
    }
  },
  methods: {
    addFields: function() {
      for (var i = 0; i < this.pois.length; i++) {
        this.pois[i].is_selected = false
        this.pois[i].id_cicer1 = i
      } 
    },
    clickOnPoi: function(poi_id) {
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
  created() {
    this.cose="super vaffanculo"
    console.log("created")
    this.addFields()
  } 
}
</script>

<style src="./selectpois.sass" lang="sass"/>