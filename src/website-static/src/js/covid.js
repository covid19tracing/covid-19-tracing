
var filterDays = 15;
var filteredLocations = [];

function sendData(data) {

    console.log("start upload");

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/?token=test', true);
    
    xhr.onload = function (e) {
      console.log(e.target.response);
    };
    
    xhr.send(data);

}

function handleFileSelect(evt) {

    document.getElementById('information').innerHTML = "PROCESSING...";

    var tested = document.getElementById('tested').value;
    var f = evt.target.files[0];

    const reader = new FileReader();  
    reader.onload = function(evt) {

        console.log('filter for '+tested+' - '+filterDays+' days');

        var toTimestamp = new Date(tested+' 23:59:59').getTime();
        var fromTimestamp = toTimestamp-(filterDays*24*60*60*1000);

        var locationData = JSON.parse(reader.result);
        console.log('locations loaded: '+locationData.locations.length);

        filteredLocations = [];
        locationData.locations.forEach(loc => {
            if (loc.timestampMs <= toTimestamp && loc.timestampMs >= fromTimestamp) {
                filteredLocations.push(loc);
            }
        });

        console.log('locations filtered: '+filteredLocations.length);

        var info =
            filteredLocations.length+' of '+locationData.locations.length+' locations filtered'
            + ' between '+new Date(fromTimestamp).toDateString()+' and '+new Date(toTimestamp).toDateString();
        document.getElementById('information').innerHTML = info;

        locationData = null;

        sendData(JSON.stringify(filteredLocations));

    };

    reader.readAsText(f);

}

document.getElementById('file').addEventListener('change', handleFileSelect, false);