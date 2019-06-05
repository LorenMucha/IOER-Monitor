const lupe={
    selector:"#lupe",
    info_leave:0,
    getDOMContainer:function(){
     $elem = $(`${this.selector}`);
     return $elem;
   },
    set:false,
    magnifyingGlass: L.magnifyingGlass({
        layers: [
            layer = additiveLayer.baselayer.getBaseLayers_rgb()["TopPlus-Web-Open"]
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
        if(this.info_leave===0){
            alert_manager.leaveESCInfo();
            this.info_leave=1;
        }
        $('.toolbar').toggleClass("toolbar_close",500);
        this.magnifyingGlass.addTo(map);
        this.set=true;
    },
    remove:function(){
        lupe.magnifyingGlass.remove();
        lupe.set=false;
    }
};
