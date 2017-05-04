<template>
  <div id="search">
    {{joke}}
  </div>
</template>

<script>
export default {
  name: 'search',
  data () {
    return {
      joke: []
    }
  },
  methods: {
    fetchData: function() {
        // it has to https otherwise it will incur in CORS
        this.$http.get('https://api.chucknorris.io/jokes/random').then(response => {
        this.joke = response.body;
      }, response => {
        console.log("Received error. ")
        console.log(response)
      });
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>