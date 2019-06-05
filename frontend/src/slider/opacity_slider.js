const opacity_slider = {
    param:'opacity',
    getDOMObject:function(){
        $elem = $("#opacity_slider");
        return $elem;
    },
    getParam:function(){
        return urlparamter.getUrlParameter(this.param);
    },
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.param,_value);
    },
    updateParam:function(_value){
        urlparamter.updateURLParameter(this.param,_value);
    },
    getOpacity:function(){
        const object = this;
        let opacity = object.getParam(),
            value = opacity;
        if(!opacity){
            object.setParameter(0.8);
            value = 0.8;
        }
        return value;
    },
    init:function(){
        const object = this;
        object.getDOMObject()
            .slider({
                orientation: "horizontal",
                range: "min",
                min: 0,
                max: 100,
                value:object.getOpacity()*100,
                step: 10,
                stop: function (event, ui) {
                    let slider_value = ui.value / 100;

                    $('.legende_line').find('i').css('opacity', slider_value);
                    //If null set colored backlayer
                    object.updateParam(slider_value);
                    object.setOpacity(slider_value);
                    //set the baselayer to rgb
                    if(slider_value===0) {
                        additiveLayer.init();
                    }
                    //reset the baselayer
                    else if(additiveLayer.getState()==='rgb'){
                        additiveLayer.remove();
                        additiveLayer.init();
                    }
                }
            });
    },
    setOpacity:function(_value){
        let value_set = this.getOpacity();
        if(_value){
            value_set = _value;
        }
        if(raeumliche_visualisierung.getRaeumlicheGliederung()=== 'gebiete'){
            jsongroup.eachLayer(function(layer){
                try {
                    layer.setStyle({fillOpacity:value_set});
                }catch(err){}
            });
        }else if(raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster'){
            raster_group.eachLayer(function(layer){
                layer.setOpacity(value_set);
            });
        }
    }
};