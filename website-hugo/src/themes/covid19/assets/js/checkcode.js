function trackEvent(action,name,value) {
    if (_paq && _paq.push) {
        _paq.push(['trackEvent', 'checkcode', action, name, value]);
    }
}

function checkCode(){
    let token = document.getElementById('token').value;
    if (token.length != 6) {
        document.getElementById('checking').innerHTML = '{{ i18n "fail_code_not_valid" }}'
        trackEvent('click','valid', false);
        return;
    }
    trackEvent('click','valid', true);
    document.getElementById('checking').innerHTML = '{{ i18n "checking" }}'
    setTimeout(function() {
        document.getElementById('checking').innerHTML = '{{ i18n "no_match" }}'
    }, 1000);
}