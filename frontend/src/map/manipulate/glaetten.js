const glaetten = {
    control:'',
    parameter:'glaettung',
    getButtonObject:function(){
        $elem =  $('#rasterize');
        return $elem;
    },
    setParamter:function(_value){
        urlparamter.setUrlParameter(this.parameter,_value);
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.parameter);
    },
    removeParamter:function(){
        urlparamter.removeUrlParameter(this.parameter);
    },
    upateParameter:function(_value){
        urlparamter.updateURLParameter(this.parameter,_value);
    },
    getState:function(){
        let parameter_set = this.getParamter(),
            mode = "RESAMPLE=NEAREST";

        if(parameter_set==1){
            mode="RESAMPLE=BILINEAR";
            this.getButtonObject().css('background-color', farbschema.getColorActive());
        }else{
            this.getButtonObject().css('background-color', farbschema.getColorMain());
        }

        return mode;
    },
    getController:function(){
        return this.control;
    },
    setController:function(_controller){
        this.control = _controller;
    },
    init:function(){
        const controller = this;
        //the raster View Control
        if(!controller.getParamter()){
            this.setParamter(0);
        }
        let object = new L.control({position: 'topright'});
        object.onAdd = function () {
            let div = L.DomUtil.create('div');
            div.title='Die Karte glätten';
            div.innerHTML = '<div id="rasterize" class="rasterize btn_map"></div>';
            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function(){
                    if(controller.getParamter()==0) {
                        controller.upateParameter(1);
                    }else{
                        controller.upateParameter(0);
                    }
                    indikator_raster.init();
                    if(raster_split.getState()){
                        indikator_raster.init(null,null,"rechts",raster_split.dialogObject.getSettings())
                    }
                });

            return div;
        };
        try{
            setTimeout(function(){
                object.addTo(map);
                controller.setController(object);
            },100);
        }catch(err){}

    },
    remove:function(){
        map.removeControl(this.control);
    }
};