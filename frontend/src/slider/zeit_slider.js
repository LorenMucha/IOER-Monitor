const zeit_slider={
    jahre:'',
    parameter:'time',
    getContainerDOMObject:function(){
        $elem = $('#slider_zeit_container');
        return $elem;
    },
    getSliderDOMObject:function(){
        $elem = $( "#zeit_slider" );
        return $elem;
    },
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.parameter,_value);
    },
    updateParam:function(_value){
        urlparamter.updateURLParameter(this.parameter,_value);
    },
    init:function(jahre) {
        const object = this;
        let time_param = this.getTimeSet(),
            value_set=jahre.length-1,
            slider = this.getSliderDOMObject(),
            oneTimeClasses = $('.oneTime');

        //show the time container
        object.jahre= jahre;
        if(!time_param){
            object.setParameter(jahre[value_set]);
        }
        //time param is set
        else{
            if(jahre.length=== 1){
                object.updateParam(jahre[value_set]);
            }
            else if($.inArray(parseInt(time_param),jahre)!== -1){
                object.updateParam(jahre[$.inArray(parseInt(time_param),jahre)]);
                value_set = $.inArray(parseInt(time_param),jahre);
            }
            else{
                if($.inArray(parseInt(time_param),jahre) === -1){
                    object.updateParam(jahre[value_set]);
                    alert_manager.alertNotInTimeShift();
                }
            }
        }

        //initializeFirstView the slider by given values
        slider
            .slider({
                orientation: "horizontal",
                min: 0,
                max: jahre.length-1,
                step: 1,
                value: value_set,
                stop: function (event, ui) {
                    object.updateParam(jahre[ui.value]);
                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                        var time = object.getTimeSet(),
                            //disable SST and g50
                            stt_id = "stt_raumgl",
                            g50_id = "g50_raumgl",
                            stt_state = document.getElementById("stt_raumgl").dataset.state,
                            raumgl_test = parseInt(gebietsauswahl.countTags());

                        if(stt_state!=="disabled") {
                            if (time < 2014) {
                                helper.disableElement("#" + stt_id, exclude.disable_text);
                                helper.disableElement("#" + g50_id, exclude.disable_text);
                            } else {
                                helper.enableElement("#" + stt_id, "");
                                helper.enableElement("#" + g50_id, "");
                            }
                        }
                        switch(raumgl_test){
                            case raumgl_test===0:
                                indikator_json.init();
                                break;
                            default:
                                indikator_json.init(raumgliederung.getSelectionId());
                                break;
                        }
                    }else{
                        indikator_raster.init();
                    }
                    map.dragging.enable();
                }
            })
            .mouseenter(function () {
                map.dragging.disable();
            })
            .mouseleave(function() {
                map.dragging.enable();
            });
        pips.set(slider,jahre);

        //disable chart for single time shift
        if(zeit_slider.getTimes().length===1){
            helper.disableElement("#"+object.getContainerDOMObject().attr("id"),`Der Indikator steht nur für den Zeitschnitt ${zeit_slider.getTimeSet()} zur Verfügung.`);
            slider.slider('disable');
        }else{
            helper.enableElement("#"+object.getContainerDOMObject().attr("id"),"");
            slider.slider('enable');
        }
    },
    show:function(){
        this.getContainerDOMObject().show();
    },
    hide:function(){
        this.getContainerDOMObject().hide();
    },
    getTimeSet:function(){
        return parseInt(urlparamter.getUrlParameter(this.parameter));
    },
    getTimes:function(){
      return this.jahre;
    }
};