<template>
<div id="main">
  <div id="container">
    <div id="map"></div>
    
    <div id="instructions"></div>

  </div>
    
  <div id="list">
    <ul>
    <li v-for="item in points">
      {{item.properties.nome}} - {{item.properties.provincia}}  
    </li>   
    </ul>
  </div>

</div>
</template>
<script>
export default {
  name: 'main',
  data () {
    return {
        points : []
    }
  },
  methods: {
    
    initMap: function(){
      
    var point1 = {
                  "_id" : "1",
                  "id" : "19039",
                  "properties" : {
                      "nome" : "Chiesa della Vergine",
                      "provincia" : "Bologna",
                      "comune" : "MONZUNO",
                      "frazione" : "Campagne",
                      "tipologie_cronologie" : "Chiesa",
                      "categoria" : "Edifici religiosi",
                      "tipologia" : "Chiesa",
                      "eta" : ""
                  },
                  "coordinates" : [
                      12.2418846,
                      44.1394082,
                  ]   
              };

    var point2 = {
                  "_id" : "1",
                  "id" : "19039",
                  "properties" : {
                      "nome" : "San Mercuriale",
                      "provincia" : "Forlì",
                      "comune" : "MONZUNO",
                      "frazione" : "Campagne",
                      "tipologie_cronologie" : "Chiesa",
                      "categoria" : "Edifici religiosi",
                      "tipologia" : "Chiesa",
                      "eta" : ""
                  },
                  "coordinates" : [
                      12.2430853,
                      44.1383596
                  ]   
              };

      var point3 = {
                  "_id" : "1",
                  "id" : "19039",
                  "properties" : {
                      "nome" : "Torre Eiffel",
                      "provincia" : "Cesena",
                      "comune" : "MONZUNO",
                      "frazione" : "Campagne",
                      "tipologie_cronologie" : "Chiesa",
                      "categoria" : "Edifici religiosi",
                      "tipologia" : "Chiesa",
                      "eta" : ""
                  },
                  "coordinates" : [
                     12.243359,
                     44.140697
                  ]   
              };          

    this.points = [point1, point2, point3];
    
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: new google.maps.LatLng(44.1400338,12.2412768),
        mapTypeId: 'terrain'
    });
    
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('instructions'));

    
    var control = document.getElementById('container');
    control.style.display = "block";
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

    var firstPoint = new google.maps.LatLng(this.points[0].coordinates[1], this.points[0].coordinates[0]);
    for (var i = 0; i < this.points.length; i++) {
        var latLng = new google.maps.LatLng(this.points[i].coordinates[1], this.points[i].coordinates[0]);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map
        });
    }

    var waypoints = []
    for(var i = 1; i < this.points.length; i++){
      waypoints.push({
          location: new google.maps.LatLng(this.points[i].coordinates[1], this.points[i].coordinates[0]),
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
            directionsDisplay.setDirections(response);
            
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });       
  }




    
  },
  mounted() {
    this.initMap()
  }
}
</script>
<style>
#main {
  position : absolute;
}
  #container {
    position : relative;
    left: 25%;
    z-index: 5;
    background-color: #fff;
    padding: 5px;
    border: 1px solid #999;
    padding-left: 10px;
  }
  #map {
    width : 1300px;
    height : 800px;
    position : relative;
  }

  #instructions {
    font-family: 'Roboto','sans-serif';
    line-height: 30px;
    padding-left: 10px;
  }

  #list {
    width : 1300 px;
    height : 1000 px;
    position : relative;
  }
</style>