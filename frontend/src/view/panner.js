const panner = {
    getObject:function(){
        $elem = $('.panner');
        return $elem;
    },
    getContainer:function(){return $('.panner')},
    hide:function(){
        this.getContainer().hide();
    },
    show:function(){
        this.getContainer().show();
    },
    create:function(){
      $('#Modal').append(`
        <div id="panRight" 
            class="panner tablebackground checker cursor ${exclude.class_gebiete}" 
            data-scroll-modifier='1' data-title="öffnen Sie die Tabellenansicht" 
            title="öffnen Sie die Tabellenansicht"></div>
      `);
    },
    init:function(){
        this.create();
        this.controller.set();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()!=='raster') {
            if(this.getObject().hasClass('mapbackground')){
                this.getObject().removeClass('mapbackground').addClass('tablebackground');
            }
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
    },
    controller:{
        set:function(){
            //bind the click functionality
            panner.getObject()
                .click(function(){
                    if(raeumliche_visualisierung.getRaeumlicheGliederung()==="gebiete") {
                        right_view.open();
                    }
                });
        }
    }
};