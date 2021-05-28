let myMap = L.map("map").setView([47.563, 24.1130], 3);
myMap.on('click', mapClick);
let editPopup = document.getElementById("editPopup");
let deletePopup = document.getElementById("deletePopup");
let addNewPointPopup = document.getElementById("newPointPopup");
let saveBtn = document.getElementById("save");
let xmlFile;
let addNewPoint = false, deleteSomePoint = false, addPointToMap = false;
let chosenPoint = null;
let currentMarker = null, baseMarker = null;
let pathLayer = null;
let tempPoints = [];
let points = [];
let currentWayIndexOffset = -1;

let baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 25,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoieXVyaXktc29sb2Rvdm5payIsImEiOiJja293dXdqYXcwOXZhMnJvMnozYzA3bHVmIn0.ANOZVZmuCfs4iJ9IU-_Org'
    }).addTo(myMap);
baseLayer.myId = "Base";

saveBtn.disabled = true;

function cancelDelete()
{
    deletePopup.style.display = "none";
    document.getElementById("addPointBtn").disabled = false;
    deleteSomePoint = false;
}

function cancelAdding()
{
    addNewPointPopup.style.display = "none";
    document.getElementById("deletePointBtn").disabled = false;
    document.getElementById("addPointBtn").disabled = false;
    document.getElementById("addText").textContent = "Выберите опорную точку";
    if(baseMarker!=null)
    {
        myMap.removeLayer(baseMarker);
        baseMarker=null;
    }
    addNewPoint = false;
    addPointToMap = false;
}

function addPoint()
{
    if(points != null)
    {
        addNewPoint = true;
        let button = document.getElementById("addPointBtn");
        button.disabled = true;
        addNewPointPopup.style.display = "block";
        document.getElementById("deletePointBtn").disabled = true;
    }
}


function deletePoint()
{
    if(points != null)
    {
        deleteSomePoint = true;
        deletePopup.style.display = "block";
        document.getElementById("addPointBtn").disabled = true;
    }
}

function replacePoint(oldPoint, newPoint)
{
    let index = points.indexOf(oldPoint);
    if (index !== -1) 
    {
        points[index] = newPoint;
    }
}

function displayPath(points)
{
    let path = turf.lineString(points);
    pathLayer = L.geoJSON(path).addTo(myMap);
    document.getElementById("distance").textContent = (turf.length(path, {units: 'kilometers'})).toFixed(3);
}

function getScale(a, b, c)
{
    let p = (a + b + c)/2;
    return Math.sqrt(p*(p-a)*(p-b)*(p-c));
}

function addPointToArray(lnglat)
{
    points.splice(points.indexOf(chosenPoint) + 1, 0, lnglat);
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
    for (let i = 0; i < points.length; i++) 
    {
        let currentWay = getDistance(points[i][1], points[i][0], lnglat[1],lnglat[0]);
        if(currentWay < nearWay)
        {
            nearWay = currentWay;
            chosenPoint = points[i];
            addIndex = i;
        }
    }
}

function showWayPoint(location)
{
    let wayPoint  = new L.Marker([location[1], location[0]], {
        icon: L.icon({
            
            iconUrl: "assets/images/myMarker.png",
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
        })}).addTo(myMap);
    wayPoint.on('click', wayPointClick);
}
function showMarker(location)
{
    currentMarker = new L.Marker([location[1], location[0]], {icon: L.icon({
                
        iconUrl: "assets/images/currentMarker.png",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    }), draggable: true});
    currentMarker.on('dragend', dragendMarker);
    editPopup.style.display = "block";
    currentMarker.addTo(myMap);
}
function deleteMarker()
{
    if(!deleteSomePoint && currentMarker!==null)
    {
        let currentPoint = currentMarker.getLatLng();
        showWayPoint([currentPoint.lng, currentPoint.lat]);
        myMap.removeLayer(currentMarker);
    }
    currentMarker = null;
    editPopup.style.display = "none";
    let button = document.getElementById("addPointBtn");
    button.innerHTML = "Добавить  точку";
    button.disabled = false;
}

function displayPoints()
{
    for (let i = 0; i < points.length; i++)
    {
        showWayPoint(points[i]);
    }
}

function wayPointClick(e)
{
    if(addNewPoint)
    {
        findNearestPoint([e.latlng.lng, e.latlng.lat]);
        addPointToMap = true;
        if(baseMarker===null)
        baseMarker = new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(myMap);
        document.getElementById("addText").textContent = "Веберите место на карте";
    }
    else if(deleteSomePoint)
    {
        deletePopup.style.display = "none";
        myMap.removeLayer(e.target);
        findNearestPoint([e.latlng.lng, e.latlng.lat]);
        var index = points.indexOf(chosenPoint);
        if (index !== -1)
        {
            points.splice(index, 1);
        }
        changeLocation();
        deleteSomePoint = false;
        document.getElementById("addPointBtn").disabled = false;
    }
    else
    {
        if(currentMarker===null)
        {
            findNearestPoint([e.latlng.lng, e.latlng.lat]);
            showMarker(chosenPoint);
            currentMarker.on('dragend', dragendMarker);
            editPopup.style.display = "block";
            currentMarker.addTo(myMap);
            myMap.removeLayer(e.target);
        } 
    }
}

function mapClick(e)
{
    if(addPointToMap)
    {
        addPointToArray([e.latlng.lng, e.latlng.lat]);
        addNewPoint = false;
        addPointToMap = false;
        chosenPoint = null;
        myMap.removeLayer(baseMarker);
        baseMarker=null;
        addNewPointPopup.style.display = "none";
        document.getElementById("addText").textContent = "Выберите опорную точку";
        document.getElementById("deletePointBtn").disabled = false;
        changeLocation();
    }
}

function next()
{
    let currentIndex = tempPoints.length + (currentWayIndexOffset + 1);
    if (tempPoints[currentIndex] !== undefined)
    {
        points = tempPoints[currentIndex].slice();
        changeLocation();
        tempPoints.pop();
        currentWayIndexOffset++;
    }
}

function back()
{
    let currentIndex = tempPoints.length + (currentWayIndexOffset - 1);
    if (tempPoints[currentIndex] !== undefined)
    {
        points = tempPoints[currentIndex].slice();
        changeLocation();
        tempPoints.pop();
        currentWayIndexOffset--;
    }
}

function clearMap()
{
    myMap.eachLayer(function (layer) 
    {
        if(layer.myId != "Base")
        myMap.removeLayer(layer);
    });
}

function changeLocation()
{
    tempPoints.push(points.slice());
    deleteMarker();
    clearMap();
    displayPath(points);
    displayPoints();
}

function getDistance(lat1,lon1,lat2,lon2) 
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
    clearMap();
    let file = input.files[0];
  
    let reader = new FileReader();
  
    try
    {
    reader.readAsText(file);
    }
    catch
    {
        alert("Не удалось прочитать файл");
        tempPoints = [];
        points = [];
        document.getElementById("editBox").style.display = "none";
    }
  
    reader.onload = function() 
    {
        let parser = new DOMParser();
        xmlFile = parser.parseFromString(reader.result, "text/xml");
        fillArray(xmlFile);
        setLocation();
        saveBtn.disabled = false;
    };
}

function fillArray(xmlDoc)
{
    let rows = xmlDoc.getElementsByTagName("trkpt");
    points = new Array(rows.length);
    for (let i = 0; i < rows.length; i++)
    {
        points[i] = [Number(rows[i].getAttribute("lon")), Number(rows[i].getAttribute("lat"))];
    }
    displayPoints();
    tempPoints = [];
    tempPoints.push(points.slice());
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
        document.getElementById("editBox").style.display = "none";
    }
}

function save()
{
    let content = "";
    for(point of points)
    {
        content += `\n<trkpt lat="${point[1]}" lon="${point[0]}">\n
                        <ele>0</ele>\n
                    </trkpt>\n`;
    }
    xmlFile.getElementsByTagName("trkseg")[0].innerHTML = content;
    download(); 
}

function download() 
{
    let serializer = new XMLSerializer();
    let stringXML = serializer.serializeToString(xmlFile);
    let filename = "[Updated]" + document.getElementById("gpx-file").files[0].name;
    let pom = document.createElement('a');
    let bb = new Blob([stringXML], {type: 'text/plain'});
    
    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);
    
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true; 
    pom.classList.add('dragout');
    
    pom.click();
}
