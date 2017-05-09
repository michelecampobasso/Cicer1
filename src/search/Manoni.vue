<template>
  <div id="manoni">
  {{ poilist.list }}
  </div>
</template>

<script>
export default {
  name: 'manoni',
  props: ['poilist'],
  data () {
    return {
      // poilist: {
      //   list: [
      //     "no"
      //   ]
      // }
    }
  },
  mounted() {
    // this.poilist = this.$poilist.list
	}
}
</script>