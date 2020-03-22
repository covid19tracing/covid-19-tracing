
var filterDays = 10;
var filteredLocations = [];
var startDate;
var endDate;

function sendData(data) {

    console.log("start upload" + data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://europe-west3-covid-19-tracing.cloudfunctions.net/uploadLocation?token=Qua0Fi', true);
    
    xhr.onload = function (e) {
      console.log(e.target.response);
      document.getElementById('uploadinformation').innerHTML = e.target.response;
    };
    
    xhr.send(JSON.stringify(data));

}

function showArea(areaID) {
    document.getElementById(areaID).classList.remove("hidden");
    window.scrollTo(0,document.body.scrollHeight);
}

function showInformation(areaID,toShow) {
    document.getElementById(areaID).innerHTML = toShow;
    showArea(areaID);
}

function handleFileSelect(evt) {

    showInformation('filteredinformation',"PROCESSING...");
    var f = evt.target.files[0];

    const reader = new FileReader();  
    reader.onload = function(evt) {

        var fromTimestamp = startDate.getTime();
        var toTimestamp = endDate.getTime();        

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
            locationData.locations.length+' locations filtered, '+filteredLocations.length
            + ' locations between '+new Date(fromTimestamp).toDateString()+' and '+new Date(toTimestamp).toDateString()+' found';
        
        showInformation('filteredinformation',info);

        locationData = null;

        if (filteredLocations.length == 0) {
            document.getElementById('filteredinformation').innerHTML =
                document.getElementById('filteredinformation').innerHTML + " ... sorry, nothing to upload.";
        } else {
            showArea('upload');
            document.getElementById('cf-submit').innerHTML = "Upload "+filteredLocations.length+" location data to server..."
        }

    };

    reader.readAsText(f);

}

function handleUpload() {
    showArea('upload');
    showInformation('uploadinformation',"UPLOADING...");

    let symptoms = getSymptomsDate();

    sendData({
        "locations": filteredLocations,
        "tested": getTestedDate().getTime(),
        "symptoms": (symptoms !== null ? symptoms.getTime() : null)
    });
}

function getTestedDate() {
    return new Date(document.getElementById('testedDate').value + ' 00:00:00');
}

function getSymptomsDate() {
    if (document.getElementById('nosymptoms').checked) {
        return null;
    } else {
        return new Date(document.getElementById('symptomsDate').value + ' 00:00:00');
    }
}

function handleTested(evt) {
    let testedDate = getTestedDate();
    let now = new Date();
    if (testedDate > now) {
        alert("Sorry, you can't be tested in the future");
    } else {
        showArea('symptoms');
    }
}

function handleSymptoms() {
    let testedDate = getTestedDate();
    let symptomsDate = getSymptomsDate();
    let now = new Date();
    if (symptomsDate !== null && symptomsDate > now) {
        alert("Sorry, symptoms in the future? Check your symptoms date, please.");
    }
    endDate = new Date(testedDate);
    startDate = new Date(testedDate);
    if (symptomsDate !== null && testedDate > symptomsDate) {
        startDate = symptomsDate;
    }
    startDate.setDate(startDate.getDate() - filterDays);

    showInformation('daterangeinfo',"We will upload your data between "+startDate+" and "+endDate);
    showArea('uploadfield');
}

document.getElementById('testedDate').addEventListener('change', handleTested, false);
document.getElementById('symptomsDate').addEventListener('change', handleSymptoms, false);
document.getElementById('nosymptoms').addEventListener('change', handleSymptoms, false);
document.getElementById('file').addEventListener('change', handleFileSelect, false);
document.getElementById('cf-submit').addEventListener('click', handleUpload, false);