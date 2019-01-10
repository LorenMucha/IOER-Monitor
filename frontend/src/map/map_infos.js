const map_infos={
    hide:function(){
        map_header.hide();
        zeit_slider.hide();
    },
    resize:function(){
        let margin_left_open ={"left": "500px","right":""},
            margin_left_close = {"left": "20%","right":""},
            right_margin = {"left":left_view.getWidth()*0.25};
        if(toolbar.isOpen()){
            map_header.getDOMObject().animate(margin_left_open);
            zeit_slider.getContainerDOMObject().animate(margin_left_open);
        }
        else if(right_view.isVisible()){
            map_header.getDOMObject().css(right_margin);
            zeit_slider.getContainerDOMObject().css(right_margin);
        }
    },
    show:function(){
        map_header.show();
        zeit_slider.show();
    }
};