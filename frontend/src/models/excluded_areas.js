const excluded_areas={
    areas:["gem","stt","vwg"],
    checkPerformanceAreas:function(){
        return $.inArray(base_raumgliederung.getBaseRaumgliederungId(), this.areas) === -1;
    },
    setPerformanceElements:function(){
        let elements = $('.disbale_performance');
        if(this.checkPerformanceAreas()){
           elements.each(function() {
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
            });
        }else{
            elements.each(function() {
                helper.disableElement(`#${$(this).attr("id")}`, "Für die gewählte Raumgliederung nicht verfügbar");
            });
        }
    }
};