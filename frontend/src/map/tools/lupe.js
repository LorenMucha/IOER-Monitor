const lupe={
    selector:"#lupe",
   getDOMContainer:function(){
     $elem = $(`${this.selector}`);
     return $elem;
   },
    set:false,
    magnifyingGlass: L.magnifyingGlass({
        layers: [
            layer = layer_control.baselayer.getBaseLayers_sw()["WebAtlas_DE"]
        ]
    }),
    init:function(){
        lupe.controller.set();
    },
    controller:{
        set:function(){
            $(document).on("click",lupe.selector,function () {
               if(!lupe.set){
                   lupe.show();
               }else{
                   lupe.remove();
               }
            });

            //leave the function with escape
            $(document).keyup(function(e) {
                if (e.keyCode === 27) {
                    lupe.remove();
                }
            });


        }
    },
    show:function(){
        alertLeafveFunction();
        $('.toolbar').toggleClass("toolbar_close",500);
        this.getDOMContainer().css('background-color',farbschema.getColorActive());
        this.magnifyingGlass.addTo(map);
        this.set=true;
    },
    remove:function(){
        this.magnifyingGlass.remove();
        this.getDOMContainer().css('background-color','#4E60AA;');
        this.set=false;
    }
};
