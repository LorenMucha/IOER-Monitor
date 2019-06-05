const rasterweite_slider={
    steps:'',
    parameter: 'rasterweite',
    getParameter:function(){
        return urlparamter.getUrlParameter(this.parameter);
    },
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.parameter,_value);
    },
    updateParameter:function(_value){
        urlparamter.updateURLParameter(this.parameter,_value);
    },
    getDOMObject:function(){
        $elem = $("#raum_slider");
        return $elem;
    },
    getSelectText: function(){
        return this.steps[this.getParameter()];
    },
    init:function(steps){
        const obj = this;
        let raumgl_param = obj.getParameter(),
            value_set = raumgl_param,
            labels = [],
            slider=obj.getDOMObject();

        obj.steps = steps;

        if(!raumgl_param){
            value_set = 0;
            obj.setParameter(value_set);
        }

        slider.slider({
            orientation: "horizontal",
            min: 0,
            max: steps.length-1,
            value: value_set,
            step: 1,
            stop: function (event, ui) {
                obj.updateParameter(ui.value);
                indikator_raster.init();
            }
        });
        //disable slider for one possibility
        if(steps.length>1){
            helper.enableElement("#"+obj.getDOMObject().attr("id"),"");
            slider.slider('enable');
        }else{
            helper.disableElement("#"+obj.getDOMObject().attr("id"),`Der Indikator steht nur für die Rasterweite ${rasterweite_slider.getSelectText()} zur Verfügung.`);
            slider.slider('disable');
        }

        try{
            $.each(steps,function(key,value){labels.push(value.replace('Raster','').replace('m',''));});
            pips.set(obj.getDOMObject(),labels);
        }catch(err){
            console.log(err);
        }
    }
};