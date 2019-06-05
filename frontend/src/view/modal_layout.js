const modal_layout ={
    getJDOMObject:function(){return $('#Modal');},
    init:function(){
        this.getJDOMObject().css(
            {
                "position":"absolute",
                "width":"100%",
                "height":"100%",
                "background-color":"#000000",
                "filter":"alpha(opacity=60)",
                "opacity":"0.1",
                "-moz-opacity":"0.6",
                "z-index":"5000 !important",
                "text-align":"center",
                "vertical-align":"middle",
                "user-select": "none"
            }
        );
    },
    remove:function(){
        this.getJDOMObject().css(
            {
                "position":"",
                "width":"",
                "height":"",
                "background-color":"",
                "filter":"",
                "opacity":"",
                "-moz-opacity":"",
                "z-index":"",
                "text-align":"",
                "vertical-align":"",
                "pointer-events": ""
            }
        );
    }
};