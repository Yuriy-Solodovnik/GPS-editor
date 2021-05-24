let myMap = L.map("map").setView([47.563, 24.1130], 3);
let popup = document.getElementById("myPopup");
let addIndex;
let addNewPoint = false;
let chosenPoint = null;
let currentMarker = null;
let pathLayer = null;
let tempPoints;
let points = null;
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 25,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoieXVyaXktc29sb2Rvdm5payIsImEiOiJja293dXdqYXcwOXZhMnJvMnozYzA3bHVmIn0.ANOZVZmuCfs4iJ9IU-_Org'
}).addTo(myMap);



function addPoint()
{
    addNewPoint = true;
    let button = document.getElementById("addPointBtn");
    button.innerHTML = "Выберите место";
    button.disabled = true;
}

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
    pathLayer.on('click', onPathClick);
    document.getElementById("distance").textContent = (turf.lineDistance(path) * 1.60934).toFixed(3);
}

function onPathClick(e)
{
    if(addNewPoint)
    {
        addPointToArray([e.latlng.lng, e.latlng.lat]);
        if(currentMarker===null)
        {
            currentMarker = new L.Marker([chosenPoint[1], chosenPoint[0]], {draggable: true});
            currentMarker.on('dragend', dragendMarker);
            popup.style.display = "block";
            currentMarker.addTo(myMap);
        }
        addNewPoint = false;
    }
    else
    {
        findNearestPoint([e.latlng.lng, e.latlng.lat]);
        if(currentMarker===null)
        {
            currentMarker = new L.Marker([chosenPoint[1], chosenPoint[0]], {draggable: true});
            currentMarker.on('dragend', dragendMarker);
            popup.style.display = "block";
            currentMarker.addTo(myMap);
        }
    }   
}

function getScale(a, b, c)
{
    let p = (a + b + c)/2;
    return Math.sqrt(p*(p-a)*(p-b)*(p-c));
}

function addPointToArray(lnglat)
{
    let nearWay = Infinity;
    for (let i = 0; i < points.length; i++) 
    {
        let currentWay = getDistanceFromLatLonInKm(points[i][1], points[i][0],lnglat[1],lnglat[0]);
        if(currentWay < nearWay)
        {
            nearWay = currentWay;
            chosenPoint = points[i];
            addIndex = i;
        }
    }
    if(addIndex < points.length - 1 && addIndex > 0)
    {
        let fromPrevious = getScale(
                                getDistanceFromLatLonInKm(points[addIndex - 1][1], points[addIndex - 1][0], chosenPoint[1], chosenPoint[0]),
                                getDistanceFromLatLonInKm(chosenPoint[1], chosenPoint[0], lnglat[1], lnglat[0]),
                                getDistanceFromLatLonInKm(points[addIndex - 1][1], points[addIndex - 1][0], lnglat[1], lnglat[0])
                                );
        let fromNext = getScale(
                            getDistanceFromLatLonInKm(points[addIndex + 1][1], points[addIndex + 1][0], chosenPoint[1], chosenPoint[0]),
                            getDistanceFromLatLonInKm(chosenPoint[1], chosenPoint[0], lnglat[1], lnglat[0]), 
                            getDistanceFromLatLonInKm(points[addIndex + 1][1], points[addIndex + 1][0], lnglat[1], lnglat[0])
                            );
        fromNext < fromPrevious ? addIndex = 1 : addIndex = 0;
    }
    else
    {
        addIndex == 0 ? addIndex = 1 : addIndex = 0;
    }
    points.splice(points.indexOf(chosenPoint) + addIndex, 0, lnglat);
    chosenPoint = lnglat;
}

function dragendMarker(e)
{
    let marker = e.target;
    let position = marker.getLatLng();
    replacePoint(chosenPoint, [position.lng, position.lat]);
    changeLocation();
    let button = document.getElementById("addPointBtn");
    button.innerHTML = "Добавить  точку";
    button.disabled = false;
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

function deleteMarker()
{
    myMap.removeLayer(currentMarker);
    currentMarker = null;
    popup.style.display = "none";
}

function changeLocation()
{
    myMap.removeLayer(pathLayer);
    deleteMarker();
    displayPath(points);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) 
{
    let R = 6378.14;
    let dLat = degToRad(lat2-lat1);
    let dLon = degToRad(lon2-lon1); 
    let a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c;
    return d;
}
  
function degToRad(deg) 
{
    return deg * (Math.PI/180)
}

function readFromFile(input)
{
    let file = input.files[0];
  
    let reader = new FileReader();
  
    try
    {
    reader.readAsText(file);
    }
    catch
    {
        alert("Не удалось прочитать файл");
    }
  
    reader.onload = function() 
    {
        let parser = new DOMParser();
        fillArray(parser.parseFromString(reader.result, "text/xml"));
        setLocation()
    };
}

function fillArray(xmlDoc)
{
    let rows = xmlDoc.getElementsByTagName("trkpt")
    points = new Array(rows.length);
    for (let i = 0; i < rows.length; i++)
    {
        points[i] = [Number(rows[i].getAttribute("lon")), Number(rows[i].getAttribute("lat"))];
    }
}

function setLocation()
{
    try
    {
        if(pathLayer!=null)
        {
            myMap.removeLayer(pathLayer);
        }
        myMap.setView([points[0][1], points[0][0]], 18);
        document.getElementById("editBox").style.display = "block";
        displayPath(points);
    }
    catch
    {
        alert("Не удалось загрузить данные");
    }
}

function save()
{
   
}