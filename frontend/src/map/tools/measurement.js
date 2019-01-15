const measurement={
    selector:"#measure",
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
                activeColor: farbschema.getColorActive(),
                completedColor: farbschema.getColorMain(),
                position: 'topleft',
                localization: 'de',
                collapsed: false
            });
            alertLeafveFunction();
            $('.toolbar').toggleClass("toolbar_close", 500);
            this.getDOMContainer().css('background-color', farbschema.getColorActive());
            elementM.addTo(map);
            $('.leaflet-control-measure-toggle ')
                .animate({"width": "80px", "height": "80px"}, 1000,
                    function () {
                        $(this).css({"width": "40px", "height": "40px"})
                    });
            this.set = true;
            this.surveyElement = elementM;
            indikator_json.hover=false;
        }catch(err){}
    },
    remove:function(){
        try {
            this.surveyElement.remove();
        }catch(err){}
        this.getDOMContainer().css('background-color','#4E60AA;');
        this.set=false;
        indikator_json.hover=true;
    }
};