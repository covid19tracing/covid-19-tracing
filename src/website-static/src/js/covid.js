
var filterDays = 15;

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

        var filteredLocations = [];

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

    };

    reader.readAsText(f);

}

document.getElementById('file').addEventListener('change', handleFileSelect, false);