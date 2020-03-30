var filterDays = 15;
var filteredLocations = [];
var startDate = new Date();
var endDate = new Date();
var formState = {};

function sendData(data) {

    console.log("start upload" + data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://europe-west3-covid-19-tracing.cloudfunctions.net/uploadLocation', true);
    
    xhr.onload = function (e) {
      let msg = '{{ i18n "upload_data_sucess" }}';
      let status = '{{ i18n "upload_sucess" }}';
      if (xhr.status == 403) {
          msg = '{{ i18n "upload_token_fail" }}';
          setElementVisibility('upload-btn', true)
          status = '{{ i18n "upload_failed" }}';
      }
      if (xhr.status == 400) {
          msg = '{{ i18n "upload_data_fail" }}';
          setElementVisibility('upload-btn', true);
          status = '{{ i18n "upload_failed" }}';
      }
      showInformation('uploadstatus',status);
      showInformation('uploadinformation',msg);
      if (xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        showArea("code");
        showInformation("codevalue", response["filetoken"]);
      }
    };

    xhr.onerror = function() {
        setElementVisibility('upload-btn', true)
        alert('{{ i18n "upload_data_fail_network" }}');
        showInformation('uploadinformation','{{ i18n "upload_failed" }}');
    };
    
    xhr.send(JSON.stringify(data));

}

function handleFileSelect(evt) {

    showInformation('datafilterinformation','{{ i18n "processing" }}');
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
            '{{ i18n "locations_filtered" }}'
            .replace('{0}',locationData.locations.length)
            .replace('{1}',filteredLocations.length)
            .replace('{2}',new Date(fromTimestamp).toDateString())
            .replace('{3}',new Date(toTimestamp).toDateString());
        
        showInformation('datafilterinformation',info);

        locationData = null;

        if (filteredLocations.length == 0) {
            document.getElementById('datafilterinformation').innerHTML =
                document.getElementById('datafilterinformation').innerHTML + ' {{ i18n "nothing_to_upload" }}';
        } else {
            document.getElementById('upload-btn').innerHTML =
                '{{ i18n "upload_and_share" }} '.replace('{0}',filteredLocations.length);
        } 

    };

    reader.readAsText(f);

}

function handleUpload() {
    if (filteredLocations.length) {
        setElementVisibility('upload-btn', false)
        showArea("response");
        showInformation('uploadstatus','{{ i18n "uploading" }}');

        sendData({
            "locations": filteredLocations,
            "tested" : formState["tested"],
            "testedDate" : formState["testedDate"].getTime() || undefined,
            "positive" : formState["positive"],
            "token" : formState["token"],
            "symptoms" : formState["symptoms"], 
            "symptomsDate" : formState["symptomsDate"].getTime() || undefined,
            "contact" : formState["contact"]
        });
    } else {
        alert('{{ i18n "nothing_to_upload" }}');
    }
}

function validateData() {
    if (formState['symptomsDate'] && formState['symptomsDate'] > new Date()) {
        alert('{{ i18n "fail_symptoms_in_future" }}');
    }
    if (formState['token'].length && formState['token'].replace(/[^a-zA-Z0-9]/g, '').length != 6) {
        alert('{{ i18n "fail_code_not_valid" }}');
    }
    if (formState['testedDate'] && formState['testedDate'] > new Date()) {
        alert('{{ i18n "fail_test_future" }}');
    }
}

function showArea(areaID) {
    document.getElementById(areaID).classList.remove("hidden");
}

function showInformation(areaID,toShow) {
    document.getElementById(areaID).innerHTML = toShow;
    showArea(areaID);
}

function updateLocationFilterDates() {
    let testedDate = !isNaN(formState["testedDate"].getTime()) ? formState["testedDate"] : false;
    let symptomsDate = !isNaN(formState["symptomsDate"].getTime()) ? formState["symptomsDate"] : false;

    if (testedDate) {
        endDate = testedDate;

        if (symptomsDate && testedDate > symptomsDate) {
            endDate = symptomsDate;
        }
    } else {
        if (symptomsDate) {
            endDate = symptomsDate;
        } else {
            endDate = new Date();
        }
    }
    startDate.setTime(endDate.getTime() - (filterDays * 24 * 60 * 60 * 1000));

    if (startDate && endDate) {
        let info = '{{ i18n "upload_your_between" }}'
            .replace('{0}',startDate.toDateString())
            .replace('{1}',endDate.toDateString());
        showInformation("datafilterinformation", info);
    }
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

function setQuestionVisibility(name, visible) {
    let el = document.getElementById(name).closest("div.question");
    setElementVisibility(el, visible);
}

function setElementVisibility(el, visible) {
    if ((typeof el) === 'string') {
        el = document.getElementById(el);
    }
    if (el && el.classList) {  
        if (visible) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    }
}

function updateFormVisibility() {
    setQuestionVisibility("testedDate", formState["tested"]);
    setQuestionVisibility("positiveoptions", formState["tested"]);
    setQuestionVisibility("token", formState["tested"]);
    setQuestionVisibility("symptomsDate", formState["symptoms"]);
}

function fetchFormState() {
    formState["tested"] = getRadioState("tested");
    formState["testedDate"] = getDateField("testedDate");
    formState["positive"] = getRadioState("positive");
    formState["token"] = getFormElement("token").value;

    formState["symptoms"] = getRadioState("symptoms");    
    formState["symptomsDate"] = getDateField("symptomsDate");    
    formState["contact"] = getRadioState("contact");
}

function formChangedHandler() {
    fetchFormState();
    updateFormVisibility();
    updateLocationFilterDates();
    validateData();
}

(function init() {
    document.querySelectorAll("input").forEach(function(el) {
        el.addEventListener("change",formChangedHandler);
    });
    document.getElementById('upload-btn').addEventListener("click",handleUpload);
    document.getElementById('file').addEventListener("change",handleFileSelect);
    formChangedHandler();
})();