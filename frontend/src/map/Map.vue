<template>
<div id="main">
  <modal :modalData="modalData" v-if="showModal" @close="showModal = false">ciaone</modal>
  <div id="container">
    <div id="map"></div>
    <div id="list"> 
      <ul>
      <li v-for="item in poilist.list" @click="showDetails(item)">
        {{item.properties.nome}} 
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

          <div class="modal-header">
            <slot id="m-header" name="header">
              {{modalData.header}}
            </slot>
          </div>

          <div class="modal-body">
            <slot id="m-body" name="body">
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              - 
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
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
  props: ['poilist', 'modalData'],  
  name: 'main',
  data () {
    return {
        showModal: false,
      }
  },
  watch: {
    'modalData.header': function () {
      console.log("modal data changed in " + this.modalData.header );
    }
  },
  methods: {
    initMap: function(){
              
    if(this.poilist.list.length == 0){
        
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
          console.log("odio la vita");  
        }
        }(curr));
      }
      
        /*self.$http.get('//it.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&titles=' + name + ' &inprop=url&intestactions=&origin=*').then(response => {
          var json = JSON.parse(JSON.stringify(response.body));
          var id = Object.keys(response.body.query.pages)[0];
          /*infowindow.setContent('<div id="content">'+
            '<h1 id="firstHeading" class="firstHeading">' + name + ' </h1>');
            
          infowindow.open(map, this); 
          //Se id è a -1 la pagina non esiste
          if(id != -1){  
            var object =  json["query"]["pages"][id];
            url = object["canonicalurl"];
            extract = object["extract"];
             infowindow.setContent('<div id="content">'+
            '<h1 id="firstHeading" class="firstHeading">' + name + ' </h1>'+
            '<div id="bodyContent">'+
            extract +
            url + 
            ''+
            '</div>'+
            '</div>');
            infowindow.open(map, this); 
          }
        });
        }
      }(name));*/
    

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
    this.modalData.header =  item.properties.nome);
    console.log("qui? " + item.properties.nome);
    this.$http.get('//it.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&titles=' + item.properties.nome + ' &inprop=url&intestactions=&origin=*').then(response => {
          var json = JSON.parse(JSON.stringify(response.body));
          var id = Object.keys(response.body.query.pages)[0];
          if(id != -1){
            var object =  json["query"]["pages"][id];
            //url = object["canonicalurl"];
            var extract = object["extract"];
            //self.modalBody = extract;
          }
      });
    this.showModal = true;  
    }, 


  },
  computed: function() {
  },
  mounted() {
        this.initMap()    

  }, created() {
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
  width: 300px;
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