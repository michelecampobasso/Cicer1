    <template>
      <div id="search">
        <input type="checkbox" id="checkbox" v-model="use_gps" @change="fetchGeolocation()">
        <label for="checkbox">Usa la tua posizione <span>{{ location_msg }}</span> </label>
        
        <br>

        <span>Seleziona la città:</span>    
        <div>
          <input v-model="city" placeholder="Città">
          <ul>
            <li v-for="city_suggestion in city_suggestions" v-bind:value="city_suggestion" @click="selectCity(city_suggestion)">
              {{ city_suggestion }}
            </li>
          </ul>
        </div>
        
        <br>
        
        <span>Durata del percorso:</span>
        <div v-for="duration in durations">
          <input type="radio" :id="duration.id" :value="duration.id" v-model="picked_duration">
          <label :for="duration.id">{{duration.value}}</label>
        </div>
        
        <br>

        <span>Categorie dei POI:</span>
        <div v-for="category in categories">
          <input type="checkbox" id="checkbox" v-model="category.is_selected">
          <label for="checkbox"></span> {{ category.cat_emoji }} ({{category.cat_string}})</label>
        </div>
        <span @click="searchPOI">CERCAAAAAAAAA</span>
        <router-link to="/map"><span @click="searchPOI"> Cerca 🔎 </span></router-link>              
        <router-link to="/search/manual"><span @click="sendEvent"> Fa a manoni 2 👏 </span></router-link>
        
      {{poilist}}
      </div>
    </template>

    <script>
    import _ from 'lodash'
    
    export default {
      name: 'search',
      props: ['poilist'],
      data() {
        return {
          msg: 'I am getting ready to fire an event.',
          use_gps: false,
          location_msg: "Usa la tua posizione",
          position: {
            longitude: "",
            latitude: ""
          },
          city: "",
          city_suggestions: [],
          city_selected: "",
          city_with_gps: "",
          categories: [
            {
              cat_id: 0,
              cat_string: "Edifici religiosi",
              cat_emoji: "⛪",
              is_selected: true
            },
            {
              cat_id: 1,
              cat_string: "Parchi e piazze",
              cat_emoji: "⛲",
              is_selected: true
            },
            {
              cat_id: 2,
              cat_string: "Elemento architettonico puntuale",
              cat_emoji: "🗼",
              is_selected: true
            },
            {
              cat_id: 3,
              cat_string: "Teatri e cinema",
              cat_emoji: "📽",
              is_selected: true
            },
            {
              cat_id: 4,
              cat_string: "Strutture rinascimentali e tardo-rinascimentali",
              cat_emoji: "🎨",
              is_selected: true
            },
            {
              cat_id: 5,
              cat_string: "Strutture medievali",
              cat_emoji: "🏰",
              is_selected: true
            },
            {
              cat_id: 6,
              cat_string: "Strutture romane",
              cat_emoji: "🗿",
              is_selected: true
            }
          ],
          durations: [
            {
              id: "oneday",
              value: "1 GG"
            },
            {
              id: "halfaday",
              value: "1/2 GG"
            }
          ],
          picked_duration: "oneday",
          msg: "niente"
        }
      },
      methods: {
        fetchGeolocation: function() {
          if (this.use_gps == true) {
            // this.position.longitude = 11.332179
            // this.position.latitude = 44.497449 
            // this.reverseCoord(this.position)
            // this.location_msg = ""

            if(navigator.geolocation){
              this.location_msg = "(ti sto cercando...)"
              navigator.geolocation.getCurrentPosition(position => {
                this.position.longitude = position.coords.longitude
                this.position.latitude = position.coords.latitude
                
                this.reverseCoord(this.position)
                this.location_msg = ""
              })
            } else {
              this.location_msg = "(funzionalità non supportata)"
            }
          } else {
            this.position.longitude = ""
            this.position.latitude = ""
          }
        },
        reverseCoord: function(position) {
          console.log("chiamata reverseCoord con coord ")
          console.log(position.longitude, position.latitude)
          var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.latitude + "," + position.longitude
          this.$http.get(url).then(response => {

            this.city = response.body.results[0].address_components[2].long_name
            this.city_with_gps = this.city

            var url = "http://138.68.79.145:3000/city/poi/" + this.city
            this.$http.get(url, { 'Access-Control-Allow-Origin': true }).then(response => {
              console.log(response)
              if (response.body.length == 0) {
                this.city = ""
                this.location_msg = "(vaffanculo non sei in romagna)"
              }
            }, response => {
              console.log("non andato")
              console.log(response)
            })
          }, response => {
          });
        },
        sendEvent: function() {
          this.$poilist.list = "era spiaggia ma vabè"
          this.$router.push("/search/manual/")
        },
        autocomplete: _.debounce(
          function() {
            var url = "http://138.68.79.145:3000/city/poi/" + this.city
            this.$http.get(url, { 'Access-Control-Allow-Origin': true }).then(response => {
              if (response.body.length == 0) {
              } else {
                this.city_suggestions = response.body
              }
            }, response => {
              console.log("non andato")
              console.log(response)
            })
        }, 500),
        selectCity: function(city_string) {
          this.city_selected = city_string
          this.city_suggestions = []
          var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + city_string
          this.$http.get(url).then(response => {
            console.log(response)
            // console.log(response.body.results[0])
            this.position.longitude = response.body.results[0].geometry.location.lng
            this.position.latitude = response.body.results[0].geometry.location.lat
            console.log(this.position)
          }, response => {
            console.log("mica trovato " + this.city)            
          });
        },
        searchPOI: function() {
          var url = "http://138.68.79.145:3000/poi"
          var post = {}
          post.collection_name = "poi"
          post.categories = []
          for (var i = 0; i < this.categories.length; i++) {
            if (this.categories[i].is_selected) {
              post.categories.push(this.categories[i].cat_string)
            }
          }

          if (!this.use_gps) {
            console.log("arrivato qua")
            this.selectCity(this.city_selected)
          }
          post.coordinates = [this.position.latitude, this.position.longitude]
          console.log(post.coordinates)
          post.radius = 1000
          post.max_results = 5
          // console.log(post)
          console.log(post)
          this.$http.post(url, post, {
            headers: {
                'Content-Type': 'application/json'
            }
          }).then(response => {
            console.log(response)
            // this.welcome = response.body
            // console.log(this.welcome)
            this.poilist.list = response.body
            console.log(this.poilist)
            // this.$poilist.list = response.body
            this.$router.push("/map")
          }, response => {
          });
        }
      },
      watch: {
        city: function(val) {
          if (this.city != this.city_selected && this.city != this.city_with_gps && this.city.length > 2) {
            this.autocomplete()
            this.use_gps = false
          }
        },
        city_selected: function(val) {
          this.city = this.city_selected
          this.use_gps = false
        }
      },
      mounted() {
        this.fetchGeolocation()
      }
    }
    </script>