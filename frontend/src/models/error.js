const error = {
    error_code: false,
    error_color: '',
    setErrorCode:function(_error_code){this.error_code = _error_code;},
    getErrorCode:function(){return this.error_code;},
    setErrorColor:function(_error_color){this.error_color = _error_color;},
    getErrorColor:function(){return this.error_color;},
    getErrorMessage:function(_bem){
        let operation = "not set";
        if(_bem){
            operation = _bem;
        }
        return {name:"IÖR-Monitor",
            sender:"ErrorImMonitor",
            message:`
            Indikator: ${indikatorauswahl.getSelectedIndikator()} (${indikatorauswahl.getSelectedIndikatorText()})
            URL: ${window.location.href}
            Browser: ${window.navigator.userAgent}
            error:${operation}`
        };
    }
};