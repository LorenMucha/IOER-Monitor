const farbliche_darstellungsart = {
    paramter:'darstellung',
    getDOMObject:function(){
        $elem = $('#menu_darstellung');
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
    getSelectionId:function(){
        const object = this;
        let parameter = object.getParamter();
        if(!parameter){
            object.setParamter('auto');
        }
        return object.getParamter();

    },
    resetSelection:function(){
        this.updateParamter('auto');
        $('#farbreihe_auto').prop('checked', true);
    },
    init:function(){
        this.constroller.set();
    },
    constroller:{
        set:function(){
            //art of the vizualization
            farbliche_darstellungsart.getDOMObject()
                .find('input')
                .unbind()
                .change(function () {
                    let value = $(this).val();
                    farbliche_darstellungsart.updateParamter(value);
                    if(value==="auto"){
                        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete'){
                            indikator_json.init()
                        }else{
                            indikator_raster.init();
                        }
                    }
                });
        }
    }
};