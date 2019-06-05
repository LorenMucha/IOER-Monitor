const glaetten = {
    control:'',
    parameter:'glaettung',
    selector:"#btn_glaetten",
    getButtonObject:function(){
        $elem =  $('#rasterize');
        return $elem;
    },
    setParamter:function(_value){
        urlparamter.setUrlParameter(glaetten.parameter,_value);
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(glaetten.parameter);
    },
    removeParamter:function(){
        urlparamter.removeUrlParameter(glaetten.parameter);
    },
    upateParameter:function(_value){
        urlparamter.updateURLParameter(glaetten.parameter,_value);
    },
    getState:function(){
        let parameter_set = this.getParamter(),
            mode = "RESAMPLE=NEAREST";

        if(parameter_set==1){
            mode="RESAMPLE=BILINEAR";
            this.getButtonObject().css('background-color', farbschema.getColorHexActive());
        }else{
            this.getButtonObject().css('background-color', farbschema.getColorHexMain());
        }

        return mode;
    },
    init:function(){
        const controller = this,
            btn = $(`${this.selector}`);
        //the raster View Control
        controller.controller.set();

    },
    disable:function(){
        helper.disableElement(`${this.selector}`,"Funktion steht nur für Rasterkarten zur Verfügung.");
        this.removeParamter();
    },
    enable:function() {
        helper.enableElement(`${this.selector}`,"Glätten Sie die Rasterkarte");
    },
    controller:{
        set:function(){
            const controller = glaetten;
            if(!controller.getParamter() || typeof controller.getParamter()==="undefined"){
                controller.setParamter(0);
            }
            $(document)
                .on("click",glaetten.selector,function() {
                        if(controller.getParamter()==0) {
                            controller.upateParameter(1);
                            $(this).css('background-color',farbschema.getColorHexActive());
                            $(this).attr("title","Entfernen Sie die Glättung");
                        }else{
                            controller.upateParameter(0);
                            $(this).css('background-color',farbschema.getColorHexMain());
                            $(this).attr("title","Glätten Sie die Rasterkart")
                        }
                        indikator_raster.init();
                        if(raster_split.getState()){
                            indikator_raster.init(null,null,"rechts",raster_split.dialog.getSettings())
                        }
                    });
                }
        }
};
