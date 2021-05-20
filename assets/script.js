let myMap = L.map("map").setView([46.57638889, 8.89263889], 20);
let popup = document.getElementById("myPopup");

let chosenPoint = null;
let currentMarker = null;
let pathLayer = null;
let points = [[8.89241667, 46.57608333], [8.89252778, 46.57619444], [8.89266667, 46.57641667], 
[8.89280556, 46.57650000], [8.89280556, 46.57638889], [8.89322222, 46.57652778], [8.89344444, 46.57661111]];
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 25,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoieXVyaXktc29sb2Rvdm5payIsImEiOiJja293dXdqYXcwOXZhMnJvMnozYzA3bHVmIn0.ANOZVZmuCfs4iJ9IU-_Org'
}).addTo(myMap);

displayPath(points);

function replacePoint(oldPoint, newPoint)
{
    var index = points.indexOf(oldPoint);

    if (index !== -1) {
        points[index] = newPoint;
    }
}

function displayPath(points)
{
    let path = turf.lineString(points);
    pathLayer = L.geoJSON(path).addTo(myMap);
    pathLayer.on('click', onClick);
}

function onClick(e)
{
    findNearestPoint([e.latlng.lng, e.latlng.lat]);
    if(currentMarker===null)
    {
        currentMarker = new L.Marker([chosenPoint[1], chosenPoint[0]]);
    }
    currentMarker.addTo(myMap);
    document.getElementById("latitude").value = chosenPoint[1];
    document.getElementById("longitude").value = chosenPoint[0];
    popup.style.display = "block";
}

function findNearestPoint(lnglat)
{
    let nearWay = Infinity;
    for (point of points) 
    {
        let currentWay = getDistanceFromLatLonInKm(point[1], point[0],lnglat[1],lnglat[0]);
        if(currentWay < nearWay)
        {
            nearWay = currentWay;
            chosenPoint = point;
        }
    }
}

function clearPopup()
{
    document.getElementById("longitude").value = null;
    document.getElementById("latitude").value = null;
    popup.style.display = "none";
    myMap.removeLayer(currentMarker);
    currentMarker = null;
}
function changeLocation()
{
    replacePoint(chosenPoint, [document.getElementById("longitude").value, document.getElementById("latitude").value])
    myMap.removeLayer(pathLayer);
    clearPopup();
    displayPath(points);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) 
{
    let R = 6371;
    let dLat = deg2rad(lat2-lat1);
    let dLon = deg2rad(lon2-lon1); 
    let a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c;
    return d;
  }
  
  function deg2rad(deg) 
  {
    return deg * (Math.PI/180)
  }