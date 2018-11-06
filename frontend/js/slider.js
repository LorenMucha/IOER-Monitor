const opacity_slider = {
    param:'opacity',
    getDOMObject:function(){
      $elem = $("#opacity_slider");
      return $elem;
    },
    getParam:function(){
      return urlparamter.getUrlParameter(this.param);
    },
    setParam:function(_value){
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
            object.setParam(0.8);
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
                        layer_control.init();
                    }
                    //reset the baselayer
                    else if(layer_control.getState()==='rgb'){
                        layer_control.remove();
                        layer_control.init();
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
            map.eachLayer(function(layer){
                try {
                    if (typeof layer.feature.properties.ags !== 'undefined') {
                        layer.setStyle({fillOpacity:value_set});
                    }
                }catch(err){}
            });
        }else if(raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster'){
            raster_group.eachLayer(function(layer){
                layer.setOpacity(value_set);
            });
        }
    }
};
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
    setParam:function(_value){
        urlparamter.setUrlParameter(this.parameter,_value);
    },
    updateParam:function(_value){
        urlparamter.updateURLParameter(this.parameter,_value);
    },
    init:function(jahre) {
          const object = this;
          let time_param = this.getTimeSet(),
              value_set=jahre.length-1,
              slider = this.getSliderDOMObject();

        //show the time container
        object.jahre= jahre;
        object.show();

      if(!time_param){
          object.setParam(jahre[value_set]);
      }
      //time param is set
      else{
          if(jahre.length == 1){
              object.updateParam(jahre[value_set]);
              alertOneTimeShift();
             object.hide();
          }
          else if($.inArray(parseInt(time_param),jahre)!= -1){
              object.updateParam(jahre[$.inArray(parseInt(time_param),jahre)]);
              value_set = $.inArray(parseInt(time_param),jahre);
          }
          else{
              if($.inArray(parseInt(time_param),jahre) == -1){
                  object.updateParam(jahre[value_set]);
                  alertNotInTimeShift();
              }
          }
      }

      //initializeFirstView the slider by given values
      slider
          .unbind()
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
                          stt = $('#Raumgliederung option[value="stt"]'),
                          g50 = $('#Raumgliederung option[value="g50"]');

                      if (time < 2014) {
                          stt.prop('disabled', true);
                          g50.prop('disabled', true);
                      } else {
                          stt.prop('disabled', false);
                          g50.prop('disabled', false);
                      }
                      //get the json and table
                      if (gebietsauswahl.countTags()==0) {
                          indikatorJSON.init();
                      }
                      else {
                          indikatorJSON.init(raumgliederung.getSelectedId());
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
    },
    show:function(){
        this.getContainerDOMObject().show();
    },
    hide:function(){
        this.getContainerDOMObject().hide();
    },
    getTimeSet:function(){
        return urlparamter.getUrlParameter(this.parameter);
    }
};
const pips = {
    set:function(slider,labels){
        // Then you can give it pips and labels!
        slider.slider('pips', {
            first: 'label',
            last: 'label',
            rest: 'pip',
            labels: labels,
            prefix: "",
            suffix: ""
        });

        // And finally can add floaty numbers (if desired)
        slider.slider('float', {
            handle: true,
            pips: true,
            labels: labels,
            prefix: "",
            suffix: ""
        });
    }
};