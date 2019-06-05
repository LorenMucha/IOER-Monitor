const raeumliche_visualisierung = {
    param:'raeumliche_gliederung',
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.param,_value);
    },
    getParameter:function(){
        return urlparamter.getUrlParameter(this.param);
    },
    upateParameter:function(_value){
        urlparamter.updateURLParameter(this.param,_value);
    },
    getDOMObject:function(){
        $elem = $('#spatial_choice_checkbox_container');
        return $elem;
    },
    init:function(){
        indikatorauswahl.init();
        this.controller.set();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='raster'){
            this.setChecked();
        }
    },
    setRaster:function(){
        this.upateParameter('raster');
        main_view.restoreView();
        right_view.close();
        indikator_json_group.clean();
        indikatorauswahl.fill();
        indikatorauswahl.checkAvability(false,true);
        legende.init(true);
        $('#spatial_range_raster').show();
        $('#spatial_range_gebiete').hide();
        $('#gebiete_label').css("color","black");
        $('#raster_label').css("color",farbschema.getColorHexMain());
        exclude.setSpatialExtendelements();
    },
    setGebiete:function(){
        this.upateParameter('gebiete');
        main_view.restoreView();
        indikator_raster_group.clean();
        indikatorauswahl.fill();
        indikatorauswahl.checkAvability(false,true);
        $('#panRight').show();
        $('#spatial_range_raster').hide();
        $('#spatial_range_gebiete').show();
        $('#gebiete_label').css("color",farbschema.getColorHexMain());
        $('#raster_label').css("color","black");
        raster_split.remove();
        exclude.setSpatialExtendelements();
        panner.init();
    },
    setChecked:function(){
        this.getDOMObject()
            .checkbox('check');
    },
    setUnchecked:function(){
        this.getDOMObject()
            .checkbox('set unchecked');
    },
    getRaeumlicheGliederung:function(){
        let parameter =  this.getParameter();
        if(!parameter){
            this.setParameter('gebiete');
        }
        return this.getParameter();
    },
    controller:{
        set:function(){
            raeumliche_visualisierung.getDOMObject()
                .checkbox('enable')
                .checkbox({
                    onChecked: function () {
                        raeumliche_visualisierung.setRaster();
                    },
                    onUnchecked: function() {
                        raeumliche_visualisierung.setGebiete();
                    }
                });
        }
    }
};