const exclude={
    areas:["gem","stt","vwg"],
    class_performance:"disbale_performance",
    class_raster:"gebiete_disable",
    class_gebiete:"raster_disable",
    checkPerformanceAreas:function(){
        return $.inArray(base_raumgliederung.getBaseRaumgliederungId(), this.areas) === -1;
    },
    setPerformanceElements:function(){
        let elements = $(`.${this.class_performance}`);
        if(this.checkPerformanceAreas()){
           elements.each(function() {
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
            });
        }else{
            elements.each(function() {
                helper.disableElement(`#${$(this).attr("id")}`, "Für die gewählte Raumgliederung nicht verfügbar");
            });
        }
    },
    setSpatialExtendelements:function(){
        let elements_raster = $(`.${this.class_raster}`),
            elements_gebiete= $(`.${this.class_gebiete}`);
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster"){
            elements_raster.each(function() {
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
            });
            elements_gebiete.each(function() {
                console.log($(this).attr("id"));
                helper.disableElement(`#${$(this).attr("id")}`, "Für die gewählte Raumgliederung nicht verfügbar");
            });
        }else{
            elements_raster.each(function() {
                helper.disableElement(`#${$(this).attr("id")}`, "Für die gewählte Raumgliederung nicht verfügbar");
            });
            elements_gebiete.each(function() {
                console.log($(this).attr("id"));
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
            });
        }
    }
};