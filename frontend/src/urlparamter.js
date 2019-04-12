const urlparamter={
    getAllUrlParameter:function(){
        let url = window.location.href,
            url_string = url.toString(),
            param_arr = url_string.split('?');
        return param_arr[1];
    },
    setUrlParameter:function(key, value){
        if(typeof value !== "undefined") {
            let url = window.location.href;
            //add the ? if not allready set
            if (url.toString().indexOf("?") <= 0) {
                url += "?";
            }
            //add the & if not exists
            if (url[url.length - 1] !== '&' && url[url.length - 1] !== '?') {
                url += "&";
            }
            window.history.pushState(key, value, url + key + "=" + value + "&");
        }
    },
    removeUrlParameter:function(key_rm){
        let url = window.location.href,
            url_string = url.toString(),
            //concentrate the url
            param_arr = url_string.split('?'),
            //get the parameters spitted by &
            param_split = param_arr[1].split('&'),
            return_arary = [],
            //check if parameter exists
            param = this.getUrlParameter(key_rm);
            //if exists remove the key by creating a new array and add it to the url
        if(param) {
            for (let i = 0; i<param_split.length; i++) {
                if (param_split[i].indexOf(key_rm) === -1) {
                    return_arary.push(param_split[i]);
                }
            }
        }else{
            return_arary = param_split;
        }
        let value = return_arary.join("&");
        window.history.pushState('','',param_arr[0]+"?"+value);
    },
    getUrlParameter:function(key) {
        let sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&');

        for (let i = 0; i < sURLVariables.length; i++) {
            let sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0]=== key) {
                return sParameterName[1];
            }
        }
    },
    updateURLParameter:function(param, paramVal){
        if(typeof paramVal !== "undefined") {
            let url = window.location.href,
                string_setted = param + "=" + this.getUrlParameter(param),
                new_set = param + "=" + paramVal,
                new_url = url.toString().replace(string_setted, new_set);
            window.history.pushState(param, paramVal, new_url);
        }
    },
    getURLMonitor:function(){
        if(view_state.getProductionState() || location.hostname === "localhost"){
            return "https://monitor.ioer.de/monitor_test/";
        }else{
            return "https://monitor.ioer.de/";
        }
    },
    getURL_RASTER:function(){
        return "https://maps.ioer.de/monitor_raster/";
    }
};