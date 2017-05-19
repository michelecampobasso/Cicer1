<template>
<div id="main">
  <div id="container">
    <div id="map"></div>
    <button id="showList" v-on:click="showList">LIST</button>
      <button id="showInst" v-on:click="showInst">instructions</button>
     <div id="list">  
      <ul>
      <li v-for="item in poilist.list" v-on:click="showDetails(item)">
        {{item.properties.nome}} - {{item.properties.provincia}}  
      </li>   
      </ul>
    </div>
    <div id="instructions"></div>

  </div>

</div>
</template>
<script>

export default {
  props: ['poilist'],  
  name: 'main',
  data () {
    return {
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
        label: 'A'
    }); 
      var self = this
      google.maps.event.addListener(marker, 'click', function(name) { 
        return function(){
        map.panTo(marker.getPosition());
        console.log(marker.getPosition());    
        self.$http.get('//it.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&titles=' + name + ' &inprop=url&intestactions=&origin=*').then(response => {
          var json = JSON.parse(JSON.stringify(response.body));
          var id = Object.keys(response.body.query.pages)[0];
           infowindow.setContent('<div id="content">'+
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
      }(name));
      this.poilist.list[i].marker = marker;
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
    console.log(item.properties.nome);
    this.$http.get('//it.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&titles=' + item.properties.nome + ' &inprop=url&intestactions=&origin=*').then(response => {
          var json = JSON.parse(JSON.stringify(response.body));
          var id = Object.keys(response.body.query.pages)[0];
          console.log(id);
          if(id != -1){
            console.log("ciao");
            var object =  json["query"]["pages"][id];
            url = object["canonicalurl"];
            extract = object["extract"];
            console.log(url);
          }
        });
    }

  },
  computed: function() {
  },
  mounted() {
    this.initMap()
  }
}
</script>

<style src="./map.sass" lang="sass"/>