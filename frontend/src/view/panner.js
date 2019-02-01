const panner = {
    getObject:function(){
        $elem = $('.panner');
        return $elem;
    },
    getContainer:function(){return $('.panner')},
    disable:function(){
       helper.disableElement(".panner","In der gewählten Ansicht nicht verfügbar");
    },
    enable:function(){
        helper.enableElement(".panner","Zeige Tabelle");
    },
    hide:function(){
        this.getContainer().hide();
    },
    show:function(){
        this.getContainer().show();
    },
    init:function(){
        if(raeumliche_visualisierung.getRaeumlicheGliederung()!=='raster') {
            this.show();
            if(this.getObject().hasClass('mapbackground')){
                this.getObject().removeClass('mapbackground').addClass('tablebackground');
            }
            //bind the click functionality
            this.getObject()
                .unbind()
                .click(function(){
                    right_view.open();
                });
        }else{
            this.hide();
        }
    },
    setTableBackground:function(){
        this.getObject().removeClass('mapbackground').addClass('tablebackground');
    },
    setMapBackground:function(){
        $('.tablebackground').toggleClass('mapbackground');
    },
    isVisible:function(){
        let state = false;
        if(this.getObject().is(":visible")){
            state = true;
        }
        return state;
    }
};