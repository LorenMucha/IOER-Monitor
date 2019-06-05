const measurement={
    selector:"#measure",
    info_leave:0,
    getDOMContainer:function(){
        $elem = $(`${this.selector}`);
        return $elem;
    },
    set:false,
    surveyElement: "",
    init:function(){
        measurement.controller.set();
    },
    controller:{
        set:function(){
            $(document).on("click",measurement.selector,function () {
                if(!measurement.set){
                    measurement.show();
                }else{
                    measurement.remove();
                }
            });

            //leave the function with escape
            $(document).keyup(function(e) {
                if (e.keyCode === 27) {
                    measurement.remove();
                }
            });
        }
    },
    show:function(){
        try {
            let elementM = L.control.measure({
                primaryLengthUnit: 'kilometers',
                secondaryLengthUnit: 'meters',
                captureZIndex: 10000,
                primaryAreaUnit: 'hectares',
                activeColor: farbschema.getColorHexActive(),
                completedColor: farbschema.getColorHexMain(),
                position: 'topleft',
                localization: 'de',
                collapsed: false
            });
            if(this.info_leave<=2){
                alert_manager.leaveESCInfo("Starten Sie mit dem setzen der Messpunkte","Verlassen Sie die Funktion mit ESC");
                this.info_leave+=1;
            }
            $('.toolbar').toggleClass("toolbar_close", 500);
            elementM.addTo(map);
            this.set = true;
            this.surveyElement = elementM;
            indikator_json.hover=false;
            elementM. _startMeasure();
            $('.leaflet-control-measure-toggle.js-toggle').remove();
            $('.leaflet-control-measure-interaction.js-interaction').show();
        }catch(err){}
    },
    remove:function(){
        try {
            this.surveyElement.remove();
        }catch(err){}
        measurement.set=false;
        indikator_json.hover=true;
    }
};