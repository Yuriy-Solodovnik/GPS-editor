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