var mymap = L.map('mapid').setView([38.7436214, -9.1953085], 13);
var accessToken = "pk.eyJ1IjoidGlhZ29yYmYiLCJhIjoiY2s4bmUybTRoMDg1bDNsbHZxNjZtZWVubCJ9.2E1KHgavQ9HeTV_aoTxGRw";
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + accessToken, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

var searchControl = new L.esri.Controls.Geosearch().addTo(mymap);

var results = new L.LayerGroup().addTo(mymap);

searchControl.on('results', function(data){
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
        mymap.setView(data.results[i].latlng, 8);
    }
});

var markers = {};

function onMapClick(e) {
    var mp = new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(mymap);
    mp.bindPopup('<a style="cursor:pointer" onclick=\'removeMarker("' + mp._leaflet_id + '")\'>Remove</a>');
    markers[mp._leaflet_id] = mp;
}

function removeMarker(e){
    mymap.removeLayer(markers[e]);
    delete markers[parseInt(e)];
}

mymap.on('click', onMapClick);

var locationHistory = []
function sendCoordinates(){
    for (var key of Object.keys(markers)) {
        locationHistory.push(markers[key].getLatLng())
    }
    alert("coordinates sent")
}