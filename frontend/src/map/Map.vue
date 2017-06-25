<template>
<div id="main" role="main">
  <modal :modalData="modalData" v-if="showModalPoi" @close="showModalPoi = false">
    <div slot="header">{{modalData.name}}</div>
    <div class="m-tags" slot="tags">
      <ul class="tagList">
        <li v-for="tag in modalData.tags"><i class="material-icons">{{tag.icon}}</i> {{tag.value}}</li>
      </ul>
    </div>
    <div class="m-body" v-html="modalData.body" slot="body"></div>
  </modal>

  <modalTag :currentPoi="currentPoi" :tags="tags" v-if="showModalTag" @close="showModalTag = false">
    <div slot="t-header">Aggiungi tag per {{currentPoi.properties.nome}}</div>
    <div slot="t-body">
      <ul class="tagList">
        <li v-for="tag in tags.list" @click="selectTag(tag)" v-bind:class="[tag.selected ? 'selected-tag' : '', 'tag-button']" tabindex="1">
          {{tag.name}}&nbsp;<i class="material-icons">{{tag.icon}}</i>
        </li>
      </ul>
      <button @click="updateTags()" tabindex="2">Conferma</button>
    </div>
  </modalTag>

  <div id="container">
    <div id="map"></div>
  <div id="tabContainer" role="navigation">
    <button id="showList" v-bind:class="[poiTab ? 'selected' : '', 'tab']" v-on:click="showList" tabindex="1">Punti di interesse</button>
    <button id="showInst" v-bind:class="[!poiTab ? 'selected' : '', 'tab']" v-on:click="showInst" tabindex="2">Indicazioni </button>
  </div>
    <div id="list"> 
      <ul>
      <li class="poiItem" v-for="(item, index) in poilist.list" tabindex="3">
        <p @click="showDetails(item)">{{item.properties.nome}} </p>
        <button v-bind:id="['like-btn' + index]" @click="addLike(index, item, true)" tabindex="3">
          <i v-bind:class="[item.liked == 1 ? 'selected-like' : '', 'material-icons']" >thumb_up</i>️
        </button>
        <button v-bind:id="['dislike-btn' + index]" @click="addLike(index, item, false)" tabindex="3">
          <i  v-bind:class="[item.liked == -1 ? 'selected-dislike' : '', 'material-icons']" >thumb_down</i>️
        </button>
        &nbsp; Punteggio: <b>{{item.popularity}}</b>
        <button @click="openModalTag(item, index)" style="text-transform: uppercase; margin: 10px; font-size: 12px" tabindex="3">
          Aggiungi tag
        </button>
      </li>   
      </ul>
    </div>
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
                <i class="material-icons" style="color: black">close</i>
              </button>
            </slot>
          </div>
          
          <div class="modal-header">
            <slot id="m-header" name="header"/>
          </div>

          <div class="lower"> 
            <slot name="likes"/>
            <div class="modal-tags">
              <slot name="tags"/>
            </div>
          </div>

          <slot id="m-body" name="body"/>
          
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
                <i class="material-icons" style="color: black">close</i>
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
  props: ['poilist', 'modalData', 'gps', 'tags', 'map'],  
  name: 'main',
  data () {
    return {
      poiTab: true,
      showModalPoi: false,      
      showModalTag: false,
      currentPoi : [],
    }
  },
  methods: {
    initMap: function(){          
    
    if(this.map.content == null){
      this.map.content = new google.maps.Map(document.getElementById('map'), {
          zoom: 17,
          center: new google.maps.LatLng(this.poilist.list[0].coordinates[1], this.poilist.list[0].coordinates[0]),
          mapTypeId: 'terrain'
      });
      this.map.directionsDisplay = new google.maps.DirectionsRenderer({map: this.map.content, suppressMarkers : true});
      this.map.directionsDisplay.setMap(this.map.content);
      this.map.directionsDisplay.setPanel(document.getElementById('instructions'));
      this.map.directionsService = new google.maps.DirectionsService;
      this.map.infowindow = new google.maps.InfoWindow();

    } else {
      for (var i = 0; i < this.map.markers.length; i++) {
        this.map.markers[i].setMap(null);
      }
      this.map.markers = []
    }
    var extract;
    var url;
    var start; 
    
    var control = document.getElementById('container');
    control.style.display = "block";
    this.map.content.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    
    if(Object.keys(this.gps.coordinates).length == 0){
      var firstPoint = new google.maps.LatLng(this.poilist.list[0].coordinates[1], this.poilist.list[0].coordinates[0]);
      start = 1
    } else {
      var firstPoint = new google.maps.LatLng(this.gps.coordinates.latitude, this.gps.coordinates.longitude);
      var markerAs = new google.maps.Marker({
          position: firstPoint,
          map: this.map.content,
          label: '👤'
      });
      this.map.markers.push(markerAs)
      start = 0
    }
    var self = this
    for (var i = 0; i < this.poilist.list.length; i++) {
      var name = this.poilist.list[i].properties.nome;
      var latLng = new google.maps.LatLng(this.poilist.list[i].coordinates[1], this.poilist.list[i].coordinates[0]);
      var marker = new google.maps.Marker({
          position: latLng,
          map: this.map.content,
      });
      this.map.markers.push(marker)
      var curr = this.poilist.list[i];
      google.maps.event.addListener(marker, 'click', function(curr) { 
        return function(){
          self.showDetails(curr);
        }
        }(curr));
      }

    var waypoints = [] 
    for(var i = start; i < this.poilist.list.length; i++){
      waypoints.push({
          location: new google.maps.LatLng(this.poilist.list[i].coordinates[1], this.poilist.list[i].coordinates[0]),
          stopover: true
      });
    }
    
    this.map.directionsService.route({
          origin: firstPoint,
          destination: firstPoint,
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: 'WALKING'
        }, function(response, status) {
          // Route the directions and pass the response to a function to create
          // markers for each step.
          if (status === 'OK') {
            self.map.directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
            this.$router.push('/');
          }

        });

     
  },
  initTags : function() {
      var keys = Object.keys(this.poilist.list[0].tags);
      var temp_tags = []
      for(var i = 0; i < keys.length; i++){      
        temp_tags[i] = {'id' : i, 'name' : keys[i], 'selected' : false }
        if (temp_tags[i].name == "wifi") temp_tags[i].icon = "wifi"
        else if (temp_tags[i].name == "bambini") temp_tags[i].icon = "child_friendly"
        else if (temp_tags[i].name == "disabili") temp_tags[i].icon = "accessible"
        else if (temp_tags[i].name == "visita guidata") temp_tags[i].icon = "live_help"
        else if (temp_tags[i].name == "silenzio") temp_tags[i].icon = "volume_off"
      }
      this.tags.list = temp_tags;
  },
  showList : function() {
    this.poiTab = true
    document.getElementById("list").style.display='flex';
    document.getElementById("instructions").style.display='none';
  },
  showInst : function() {
    this.poiTab = false
    document.getElementById("list").style.display='none';
    document.getElementById("instructions").style.display='block';
  },

  showDetails: function(item){
    var self = this
    this.modalData.name = item.properties.nome
    this.modalData.likes = item.popularity
    this.modalData.tags = [];
    for(var i = 0; i < Object.keys(item.tags).length; i++){
      var tag = {};
      tag.name = Object.keys(item.tags)[i]
      tag.value = item.tags[tag.name]
      if (tag.name == "wifi") tag.icon = "wifi"
        else if (tag.name == "bambini") tag.icon = "child_friendly"
        else if (tag.name == "disabili") tag.icon = "accessible"
        else if (tag.name == "visita guidata") tag.icon = "live_help"
        else if (tag.name == "silenzio") tag.icon = "volume_off"
      this.modalData.tags.push(tag);    
    }
    this.$http.get('//it.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&titles=' + item.properties.nome +  ' &inprop=url&intestactions=&origin=*').then(response => {
          var json = JSON.parse(JSON.stringify(response.body));
          var id = Object.keys(response.body.query.pages)[0];
          if(id != -1){
            var object =  json["query"]["pages"][id];
            //url = object["canonicalurl"];
            var extract = object["extract"];
            self.modalData.body = extract;
          } else {
            self.modalData.body = "";
          }
          this.showModalPoi = true;  

      });
    }, 
  addLike : function(index, item, liked){
    var url = "http://138.68.79.145:3000/popularity"
    var post = {}
    var likeicon = document.getElementById("like-icon")
    var dislikeicon = document.getElementById("dislike-icon")
    post.collection_name = "poi"
    post.id = item.id
    if (liked){
      document.getElementById("dislike-btn" + index).disabled = false;
      document.getElementById("like-btn" + index).disabled = true;
    } else {
      document.getElementById("dislike-btn" + index).disabled = true;
      document.getElementById("like-btn" + index).disabled = false;
    }
    this.$forceUpdate();
    var like = liked ? 1 : -1 
    this.poilist.list[index].liked = like;
    post.rating = like
    this.$http.post(url, post, {
      headers: {
            'Content-Type': 'application/json'
            }
     }).then(response => {
     }, response => {});
     this.poilist.list[index].popularity += like;
  },
  selectTag : function(tag){
    this.tags.list[tag.id].selected = !this.tags.list[tag.id].selected
  },
  updateTags : function(){
    var url = "http://138.68.79.145:3000/tags"
    var post = {}
    post.collection_name = "poi"
    post.id = this.currentPoi.id   
    for(var i = 0; i < Object.keys(this.tags.list).length; i++ ){ 
      if(this.tags.list[i].selected){
        var name = this.tags.list[i].name
        post.tag = name;
        this.$http.post(url, post, {
          headers: {
            'Content-Type': 'application/json'
            }
          }).then(response => {
          }, response => {
          });
        this.poilist.list[this.currentPoi.index].tags[name] += 1;
      }
    }
    this.showModalTag = false
  },
    openModalTag : function(item, index){
      this.showModalTag = true;
      this.currentPoi = item;
      this.currentPoi.index = index
    }
  },
  mounted() {
    if(this.poilist.list.length == 0){
        this.$router.push('/');
    } else {
      this.initTags()   
      this.initMap()
    }
  }
}
</script>


<style src="./map.sass" lang="sass"/>
