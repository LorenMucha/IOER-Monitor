const left_view ={
    getDOMObject:function(){
        $elem = $('.left_content');
        return $elem;
    },
    hide:function(){
        this.getDOMObject().hide();
    },
    getWidth:function(){
        return this.getDOMObject().width();
    },
    show:function(){
        this.getDOMObject().show();
    },
    setMapView:function(lat,lng,zoom){
        let zoom_set,
            lat_set,
            lng_set;

        //Zoom
        if(!zoom){
            var zoom_param = urlparamter.getUrlParameter('zoom');
            if(!zoom_param) {
                urlparamter.setUrlParameter('zoom', 8);
                zoom_set = 8;
            }else{
                zoom_set = zoom_param;
            }
        }else{
            urlparamter.updateURLParameter('zoom',zoom);
            zoom_set = zoom;
        }
        //lat
        if(!lat){
            var lat_param = urlparamter.getUrlParameter('lat');
            if(!lat_param) {
                urlparamter.setUrlParameter('lat', 50.9307);
                lat_set = 50.9307;
            }else{
                lat_set = lat_param;
            }
        }else{
            urlparamter.updateURLParameter('lat',lat);
            lat_set = lat;
        }
        //lng
        if(!lng){
            var lng_param = urlparamter.getUrlParameter('lng');
            if(!lng_param){
                urlparamter.setUrlParameter('lng',9.7558);
                lng_set = 9.7558;
            }else{
                lng_set = lng_param;
            }
        }else{
            urlparamter.updateURLParameter('lng',lng);
        }
        map.setView(new L.LatLng(lat_set, lng_set), zoom_set);
        map.attributionControl.addAttribution('<a href="http://www.ioer-monitor.de" target="_blank">IÖR-Monitor@Leibniz-Institut für ökologische Raumentwicklung</a>');
    }
};