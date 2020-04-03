function trackEvent(action,name,value) {
    if (_paq && _paq.push) {
        _paq.push(['trackEvent', 'checkcode', action, name, value]);
    }
}

function checkCode(){
    let token = document.getElementById('token').value;
    let infoBox = document.getElementById('checking');
    infoBox.classList.remove("hidden");
    if (token.length != 6) {
        infoBox.innerHTML = '{{ i18n "fail_code_not_valid" }}'
        trackEvent('click','valid', false);
    } else {
        trackEvent('click','valid', true);
        infoBox.innerHTML = '{{ i18n "checking" }}'
        setTimeout(function() {
            infoBox.innerHTML = '{{ i18n "no_match" }}'
        }, 1000);
    }
}