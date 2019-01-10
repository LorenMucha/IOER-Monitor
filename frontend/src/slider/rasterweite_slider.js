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
        const object = this;
        let raumgl_param = object.getParameter(),
            value_set = raumgl_param,
            labels = [];

        object.steps = steps;

        if(!raumgl_param){
            value_set = 0;
            object.setParameter(value_set);
        }

        object.getDOMObject().slider({
            orientation: "horizontal",
            min: 0,
            max: steps.length-1,
            value: value_set,
            step: 1,
            stop: function (event, ui) {
                object.updateParameter(ui.value);
                indikator_raster.init();
            }
        });
        try{
            $.each(steps,function(key,value){labels.push(value.replace('Raster','').replace('m',''));});
        }catch(err){
            console.log(err);
        }
        pips.set(object.getDOMObject(),labels);
    }
};