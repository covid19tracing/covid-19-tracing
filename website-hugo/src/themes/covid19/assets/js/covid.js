
var filterDays = 15;
var filteredLocations = [];
var startDate;
var endDate;
var formState = {};

function sendData(data) {

    let token = getToken();

    console.log("start upload" + data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://europe-west3-covid-19-tracing.cloudfunctions.net/uploadLocation?token='+token, true);
    
    xhr.onload = function (e) {
      console.log(e.target.response);
      let msg = '{{ i18n "upload_data_sucess" }}';
      if (xhr.status == 403) {
          msg = '{{ i18n "upload_token_fail" }}';
      }
      if (xhr.status == 400) {
          msg = '{{ i18n "upload_data_fail" }}';
      }
      showInformation('uploadinformation',msg);
    };

    xhr.onerror = function() {
        alert('{{ i18n "upload_data_fail_network" }}');
        showInformation('uploadinformation','{{ i18n "upload_failed" }}');
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

function isTokenValid(token) {
    return token.length === 6;
}

function handleFileSelect(evt) {

    showInformation('filteredinformation','{{ i18n "processing" }}');
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
            locationData.locations.length+' {{ i18n "locations_filtered" }}, '+filteredLocations.length
            + ' {{ i18n "locations_between" }} '+new Date(fromTimestamp).toDateString()+' {{ i18n "and" }} '+new Date(toTimestamp).toDateString()+' {{ i18n "found" }}';
        
        showInformation('filteredinformation',info);

        locationData = null;

        if (filteredLocations.length == 0) {
            document.getElementById('filteredinformation').innerHTML =
                document.getElementById('filteredinformation').innerHTML + ' {{ i18n "nothing_to_upload" }}';
        } else {
            showArea('upload');
            document.getElementById('cf-submit').innerHTML = '{{ i18n "upload" }} '+filteredLocations.length+' {{ i18n "share_data" }}'
        }

    };

    reader.readAsText(f);

}

function handleUpload() {
    showArea('upload');
    showInformation('uploadinformation','{{ i18n "uploading" }}');

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
        alert('{{ i18n "fail_test_future" }}');
    } else {
        showArea('symptoms');
    }
}

function getToken() {
    let token = document.getElementById('token').value;
    return token.replace(/[^a-zA-Z0-9]/g, '');
}

function handleToken() {
    let token = getToken();
    if (!isTokenValid(token)) {
        alert('{{ i18n "fail_code_not_valid" }}');
    }
}

function handleSymptoms() {
    let testedDate = getTestedDate();
    let symptomsDate = getSymptomsDate();
    let now = new Date();
    if (symptomsDate !== null && symptomsDate > now) {
        alert('{{ i18n "fail_symptoms_in_future" }}');
    }
    endDate = new Date(testedDate);
    startDate = new Date(testedDate);
    if (symptomsDate !== null && testedDate > symptomsDate) {
        startDate = symptomsDate;
    }
    startDate.setDate(startDate.getDate() - filterDays);

    let info = '{{ i18n "upload_your_between" }} ' + startDate.toDateString() + ' {{ i18n "and" }} ' + endDate.toDateString();

    showInformation('daterangeinfo',info);
    showArea('uploadfield');
}











function getFormElement(name) {
    return document.getElementById('uploadform').elements[name];
}

function getDateField(name) {
    return new Date(getFormElement(name).value);
}

function getRadioState(name) {
    let element = getFormElement(name).value || undefined;
    let result = undefined;
    if (element === "yes") {
        result = true;
    } else if (element === "no") {
        result = false;
    }
    return result;
}

function setVisibility(name, visible) {
    let el = document.getElementById(name).closest("div.question");
    if (el && el.classList) {  
        if (visible) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    }
}

function updateFormVisibility() {
    setVisibility("testedDate", formState["tested"]);
    setVisibility("positiveoptions", formState["tested"]);
    setVisibility("code", formState["tested"]);
    setVisibility("symptomsDate", formState["symptoms"]);
}

function fetchFormState() {
    formState["tested"] = getRadioState("tested");
    formState["testedDate"] = getDateField("testedDate");
    formState["positive"] = getRadioState("positive");
    formState["code"] = getFormElement("code").value;

    formState["symptoms"] = getRadioState("symptoms");    
    formState["symptomsDate"] = getDateField("symptomsDate");    
    formState["healthy"] = getRadioState("healthy");
    
    formState["email"] = getFormElement("email").value;
}

function formChangedHandler() {
    fetchFormState();
    updateFormVisibility();
}

document.querySelectorAll("input").forEach(function(el) {
    el.addEventListener("change",formChangedHandler);
});