<template>
  <div id="selectpois">
    <div class="pois-container">
      <div v-for="el in newpoilist">
        <div class="name">
          {{el.properties.nome}}
        </div>
        <div class="type">
          {{el.properties.tipologia}}
        </div>
        <div class="rating">
          {{el.rating}}
        </div>
        <div class="popularity">
          {{el.popularity}}
        </div>
        <input type="checkbox" id="checkbox" v-model="el.isSelected">
      </div>
      <div class="cta-buttons-container">
        <div  @click="goToMap()" class="cta-button">🔎 Cerca!</div>
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
      newpoilist: this.poilist.list
    }
  },
  methods: {
    addFields: function() {
      console.log("fata roba")
      console.log(this.newpoilist.length)
      for (var i = 0; i < this.newpoilist.length; i++) {
        this.newpoilist[i].isSelected = true
      } 
    },
    goToMap: function() {
      this.poilist.list = []
      for (var i = 0; i < this.newpoilist.length; i++) {
        if (this.newpoilist[i].isSelected) {
            this.poilist.list.push(this.newpoilist[i])
        }
      }
      console.log(this.poilist.list.length)
      this.$router.push("/map")
    }
  },
  created() {
    this.addFields()
  }
}
</script>

<style src="./selectpois.sass" lang="sass"/>