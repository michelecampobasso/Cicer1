<template>
<div id="main">
  <modal :modalData="modalData" v-if="showModalPoi" @close="showModalPoi = false">
    <div slot="header">{{modalData.header}}</div>
    <div  v-html="modalData.body" slot="body"></div>
  </modal>
  <modalTag :currentPoi="currentPoi" :tags="tags" v-if="showModalTag" @close="showModalTag = false">
    <div slot="t-header">Aggiungi tag per {{currentPoi.properties.nome}}</div>
    <div slot="t-body">
      <ul>
      <li v-for="tag in tags.list" @click="selectTag(tag)" >{{tag.name}}</li>
      </ul>
      <button @click="updateTags()">Conferma</button>
    </div>
  </modalTag>
  <div id="container">
    <div id="map"></div>
    {{modalData.header}}
    <div id="list"> 
      <ul>
      <li v-for="item in poilist.list" >
        <p @click="showDetails(item)">{{item.properties.nome}} </p>
        <button @click="addLike(item, true)">👍🏻</button>
        <button @click="addLike(item, false)">👎🏻</button>
        <button @click="openModalTag(item)">Aggiungi tag</button>
      </li>   
      </ul>
    </div><button id="showList" v-on:click="showList">LIST</button>
    <button id="showInst" v-on:click="showInst">instructions</button>
    <div id="instructions"></div>
    
  </div>

  <script type="text/x-template" id="modal-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
        <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">
                X
              </button>
            </slot>
          </div>

          <div class="modal-header">
            <slot id="m-header" name="header"/>
          </div>

          <div class="modal-body">
            <slot id="m-body" name="body"/>
          </div>

          
        </div>
      </div>
    </div>
  </transition>
</script>

<script type="text/x-template" id="modal-tag-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
        <div class="modal-footer">
            <slot name="t-footer">
              <button class="modal-default-button" @click="$emit('close')">
                X
              </button>
            </slot>
          </div>

          <div class="modal-header">
            <slot id="m-header" name="t-header"/>
          </div>

          <div class="modal-body">
            <slot id="m-body" name="t-body"/>            
          </div>
      
        </div>
      </div>
    </div>
  </transition>
</script>
</div>
</template>

<script>
export default {
  props: ['poilist', 'modalData', 'tags'],  
  name: 'main',
  data () {
    return {
      showModalPoi: false,      
      showModalTag: false,
      currentPoi : [],
    }
  },
  methods: {
    initMap: function(){
              
    if(this.poilist.list.length == 0){
        //ERRORE
    }
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: new google.maps.LatLng(this.poilist.list[0].coordinates[1], this.poilist.list[0].coordinates[0]),
        mapTypeId: 'terrain'
    });
    
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map, suppressMarkers : true});
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('instructions'));

    var infowindow = new google.maps.InfoWindow();
    var control = document.getElementById('container');
    var extract;
    var url;
    control.style.display = "block";
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    var firstPoint = new google.maps.LatLng(this.poilist.list[0].coordinates[1], this.poilist.list[0].coordinates[0]);

    for (var i = 0; i < this.poilist.list.length; i++) {
      var name = this.poilist.list[i].properties.nome;
      var latLng = new google.maps.LatLng(this.poilist.list[i].coordinates[1], this.poilist.list[i].coordinates[0]);
      var marker = new google.maps.Marker({
          position: latLng,
          map: map,
          //label: 'A'
      });
      var self = this
      var curr = this.poilist.list[i];
      google.maps.event.addListener(marker, 'click', function(curr) { 
        return function(){
          self.showDetails(curr);
        }
        }(curr));
      }

    var waypoints = [] 
    for(var i = 1; i < this.poilist.list.length; i++){
      waypoints.push({
          location: new google.maps.LatLng(this.poilist.list[i].coordinates[1], this.poilist.list[i].coordinates[0]),
          stopover: true
      });
    }
    
    directionsService.route({
          origin: firstPoint,
          destination: firstPoint,
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: 'WALKING'
        }, function(response, status) {
          // Route the directions and pass the response to a function to create
          // markers for each step.
          if (status === 'OK') {
            directionsDisplay.set
            directionsDisplay.setDirections(response);
            
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
     
  },
  initTags : function() {
      var keys = Object.keys(this.poilist.list[0].tags);
      var temp_tags = []
      for(var i = 0; i < keys.length; i++){      
        temp_tags[i] = {'id' : i, 'name' : keys[i], 'selected' : false }
      }
      this.tags.list = temp_tags;
      //console.log(JSON.stringify(this.tags.list));
  },
  showList : function() {
    document.getElementById("list").style.visibility='visible';
    document.getElementById("instructions").style.visibility='hidden';
  },
  showInst : function() {
    document.getElementById("list").style.visibility='hidden';
    document.getElementById("instructions").style.visibility='visible';
  },

  showDetails: function(item){
    var self = this
    this.modalData.header =  item.properties.nome;
    console.log("qui? " + item.properties.nome);
    this.$http.get('//it.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&titles=' + item.properties.nome +  ' &inprop=url&intestactions=&origin=*').then(response => {
          var json = JSON.parse(JSON.stringify(response.body));
          var id = Object.keys(response.body.query.pages)[0];
          console.log("ciao");
          if(id != -1){
            var object =  json["query"]["pages"][id];
            //url = object["canonicalurl"];
            var extract = object["extract"];
            self.modalData.body = extract;
          } else {
            self.modalData.body = "";
          }

      });
    this.showModalPoi = true;  
    }, 
  addLike : function(item, liked){
    console.log("liked " + liked + " on item" + item.properties.nome );
    var url = "http://138.68.79.145:3000/popularity"
    var post = {}
    post.collection_name = "poi"
    post.id = this.currentPoi.id   
    if(liked){
        post.rating = 1
    } else {
        post.rating = -1      
    }
    this.$http.post(url, post, {
      headers: {
            'Content-Type': 'application/json'
            }
          }).then(response => {
            console.log("ok")
          }, response => {
          });
  },
  selectTag : function(tag){
    this.tags.list[tag.id].selected = !this.tags.list[tag.id].selected
    console.log(this.tags.list[tag.id].selected);
  },
  updateTags : function(){
    var url = "http://138.68.79.145:3000/tags"
    var post = {}
    post.collection_name = "poi"
    post.id = this.currentPoi.id   
    for(var i = 0; i < Object.keys(this.tags.list).length; i++ ){ 
      if(this.tags.list[i].selected){
        post.tag = this.tags.list[i].name
        this.$http.post(url, post, {
          headers: {
            'Content-Type': 'application/json'
            }
          }).then(response => {
            console.log(response)
          }, response => {
          });
      }
    }
    this.showModalTag = false
  },
    openModalTag : function(item){
      this.showModalTag = true;
      this.currentPoi = item;
      console.log(JSON.stringify(this.currentPoi.popularity))
    }
  },
  mounted() {
        this.initMap()
  }, 
  created() {
    this.initTags()   
  }
}
</script>


<style src="./map.sass" lang="sass"/>
<style lang="css">


.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 1000px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

</style>