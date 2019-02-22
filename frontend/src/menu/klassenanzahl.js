const klassenanzahl = {
    paramter:'klassenanzahl',
    getDOMObject:function(){
        $elem = $('#Klassenanzahl');
        return $elem;
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.paramter);
    },
    setParamter:function(_value){
        urlparamter.setUrlParameter(this.paramter,_value);
    },
    updateParamter:function(_value){
        urlparamter.updateURLParameter(this.paramter,_value);
    },
    removeParameter:function(){
        urlparamter.removeUrlParameter(this.paramter);
    },
    getSelection:function(){
        const object = this;
        let parameter = object.getParamter();
        if(!parameter){
            object.setParamter(7);
        }else{
            $('#klassi_'+parameter).prop("selected",true);
        }
        return parseInt(object.getParamter());

    },
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            klassenanzahl .getDOMObject()
                .unbind()
                .change(function(){
                    farbliche_darstellungsart.resetSelection();
                    let value =$(this).val(),
                        param = klassenanzahl.getParamter();
                    if(!param){
                        klassenanzahl .setParamter(value);
                    }else{
                        klassenanzahl .updateParamter(value);
                    }
                    if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete'){
                        if(typeof raumgliederung.getSelectionId() !=='undefined'){
                            indikator_json.init(raumgliederung.getSelectionId());
                        }else{
                            indikator_json.init();
                        }
                    }else{
                        indikator_raster.init();
                    }
                });
        }
    }
};