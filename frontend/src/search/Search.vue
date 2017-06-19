    <template>
      <div id="search" role="main">
        <div v-bind:class="[use_gps ? 'selected' : '', 'gps']" @click="fetchGeolocation()" tabindex="1">
             <i class="material-icons">{{gps_icon}}</i> {{ location_msg }}
        </div>
        
        <div class="city-input" role="search">
          <md-input-container>
            <label>Città:</label>
            <md-input class="city-input-form" v-model="city" placeholder="Seleziona la città da visitare" tabindex="2" label="Cerca"></md-input>
          </md-input-container> 
          <div class="city-suggestions">
            <ul>
              <li v-for="city_suggestion in city_suggestions" v-bind:value="city_suggestion" @click="selectCity(city_suggestion)" tabindex="3">
                {{ city_suggestion }}
              </li>
            </ul>
          </div>
        </div>
        
        <div class="trip-length-container">
          <span class="section_title">Quanto tempo hai a disposizione?</span>
          <div class="length-container">
            <div v-for="duration in durations">
              <div v-bind:class="[duration.is_selected ? 'selected' : '', 'length']" @click="selectTripLength(duration)" tabindex="4">
                {{duration.string}}
              </div>
            </div>
          </div>
        </div>

        <div class="category-container">
          <span class="section_title">Cosa ti interessa di più?</span>
          <div v-for="category in categories" v-bind:class="[category.is_selected ? 'selected' : '', 'category']" @click="selectCategory(category.cat_id)" tabindex="5">
              {{category.cat_string_short}} {{category.cat_emoji}} 
          </div>
        </div>

        <div class="cta-buttons-container" v-if="city_selected != '' || city_with_gps != ''" role="navigation">
          <div  @click="searchPOI('/map')" class="cta-button cta-1" tabindex="6">
            <i class="material-icons">search</i> Vai alla mappa
          </div>
          <div @click="searchPOI('/search/manual')" class="cta-button cta-2" tabindex="7">
            <i class="material-icons">filter_list</i> Filtra a mano
          </div>
        </div>
        <br>
      </div>
    </template>

    <script>
    import _ from 'lodash'
    
    export default {
      name: 'search',
      props: ['poilist', 'gps'],
      data() {
        return {
          use_gps: false,
          gps_icon: "gps_not_fixed",
          location_msg: "Usa la tua posizione",
          city: "",
          city_with_gps: "",
          city_selected: "",
          city_suggestions: [],
          picked_duration: 1,          
          position: {
            longitude: "",
            latitude: ""
          },
          categories: [
            {
              cat_id: 0,
              cat_string: "Parchi e piazze",
              cat_string_short: "ALL'APERTO",
              cat_emoji: "⛲",
              is_selected: true
            },
            {
              cat_id: 1,
              cat_string: "Edifici religiosi",
              cat_string_short: "CHIESE",
              cat_emoji: "⛪",
              is_selected: true
            },
            {
              cat_id: 2,
              cat_string: "Elemento architettonico puntuale",
              cat_string_short: "TORRI",
              cat_emoji: "🗼",
              is_selected: true
            },
            {
              cat_id: 3,
              cat_string: "Teatri e cinema",
              cat_string_short: "LUDICI",
              cat_emoji: "📽",
              is_selected: true
            },
            {
              cat_id: 4,
              cat_string: "Strutture rinascimentali e tardo-rinascimentali",
              cat_string_short: "RINASCIMENTALI",
              cat_emoji: "🎨",
              is_selected: true
            },
            {
              cat_id: 5,
              cat_string: "Strutture medievali",
              cat_string_short: "MEDIEVALI",
              cat_emoji: "🏰",
              is_selected: true
            },
            {
              cat_id: 6,
              cat_string: "Strutture romane",
              cat_string_short: "ROMANI",
              cat_emoji: "⚔️",
              is_selected: true
            }
          ],
          durations: [
            {
              id: 0,
              string: "Poco",
              value: 5,
              is_selected: false
            },
            {
              id: 1,
              string: "Abbastanza",
              value: 10,
              is_selected: true
            },
            {
              id: 2,
              string: "Molto",
              value: 15,
              is_selected: false
            }
          ]
        }
      },
      methods: {
        selectTripLength: function(duration) {
          for (var i = 0; i < this.durations.length; i++) {
              this.durations[i].is_selected = false
          }
          this.durations[duration.id].is_selected = true
          this.picked_duration = duration.id
        },
        selectCategory: function(category_id) {
          this.categories[category_id].is_selected = !this.categories[category_id].is_selected
        },
        fetchGeolocation: function() {
          this.use_gps = !this.use_gps
          if (this.use_gps == true) {
            // this.position.longitude = 11.332179
            // this.position.latitude = 44.497449 
            // this.reverseCoord(this.position)
            // this.location_msg = "Sto usando la tua posizione"
            if(navigator.geolocation){
              this.location_msg = "🔎 Ti sto cercando..."
              navigator.geolocation.getCurrentPosition(position => {
                this.location_msg = "👌 Sto usando la tua posizione"
                this.position.longitude = position.coords.longitude
                this.position.latitude = position.coords.latitude
                this.reverseCoord(this.position)
              }, position => {
                  this.location_msg = "C'è stato un problema"
              }, {maximumAge:100000, timeout:10000, enableHighAccuracy:true})
            } else {
              this.location_msg = "😐 Funzionalità non supportata"
            }
          } else {
            this.location_msg = "🌏 Usa la tua posizione"
            this.position.longitude = ""
            this.position.latitude = ""
          }
        },
        reverseCoord: function(position) {
          var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.latitude + "," + position.longitude
          this.$http.get(url).then(response => {

            this.city = response.body.results[0].address_components[2].long_name
            this.city_with_gps = this.city

            var url = "http://138.68.79.145:3000/city/poi/" + this.city
            this.$http.get(url, { 'Access-Control-Allow-Origin': true }).then(response => {
              if (response.body.length == 0) {
                this.city = ""
                this.location_msg = "Peccato, non sei in Emilia Romagna"
              }
            }, response => {
            })
          }, response => {
          });
        },
        autocomplete: _.debounce(
          function() {
            var url = "http://138.68.79.145:3000/city/poi/" + this.city
            if (this.city.length <= 2) {
              this.city_suggestions = []
            } else {
            this.$http.get(url, { 'Access-Control-Allow-Origin': true }).then(response => {
              if (response.body.length == 0) {
              } else {
                this.city_suggestions = response.body
              }
            }, response => {
            })
          }
        }, 500),
        selectCity: function(city_string) {
          this.city_selected = city_string
          this.city_suggestions = []
          var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + city_string
          this.$http.get(url).then(response => {
            this.position.longitude = response.body.results[0].geometry.location.lng
            this.position.latitude = response.body.results[0].geometry.location.lat
          }, response => {
          });
        },
        searchPOI: function(address) {
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
            this.selectCity(this.city_selected)
          }
          post.coordinates = [this.position.latitude, this.position.longitude]
          if (this.use_gps) {
            this.gps.coordinates = this.position
          }
          post.radius = 1000
          post.max_results = this.durations[this.picked_duration].value
          this.$http.post(url, post, {
            headers: {
                'Content-Type': 'application/json'
            }
          }).then(response => {
            this.poilist.list = response.body
            this.$router.push(address)
          }, response => {
          });
        },
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
        },
        use_gps: function(val) {
          if (this.use_gps == false) {
            this.location_msg = "Usa la tua posizione"
            this.gps_icon = "gps_not_fixed"
          } else {
            this.gps_icon = "gps_fixed"
          }
        },
      },
      mounted() {
        // this.fetchGeolocation()
      }
    }
    </script>

    <style src="./search.sass" lang="sass"/>