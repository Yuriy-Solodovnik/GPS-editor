let myMap = L.map('map').setView([46.57638889, 8.89263889], 18);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 25,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoieXVyaXktc29sb2Rvdm5payIsImEiOiJja293dXdqYXcwOXZhMnJvMnozYzA3bHVmIn0.ANOZVZmuCfs4iJ9IU-_Org'
}).addTo(myMap);
let path = turf.lineString([[8.89241667, 46.57608333], [8.89252778, 46.57619444], [8.89266667, 46.57641667], 
[8.89280556, 46.57650000], [8.89280556, 46.57638889], [8.89322222, 46.57652778], [8.89344444, 46.57661111]]);
L.geoJSON(path).addTo(myMap);
myMap.on('click', onClick);
function onClick(e)
{
    alert(e.latlng)
}