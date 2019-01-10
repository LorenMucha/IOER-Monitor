const main_view = {
    splitter:'',
    splitter_width:null,
    initializeFirstView:function(){
        map_infos.hide();
        start_map.set();
    },
    restoreView:function(){
        legende.resize();
        if (this.getWidth() <= 1280) {
            this.initResponsiveView();
        }
        else if (this.getWidth() <= 1400) {
            this.initSplitterView();
            toolbar.close();
            right_view.close();
        }
        else {
            this.initSplitterView();
            right_view.close();
        }

    },
    setSplitter:function(){
        const object = this;
        //QUELLLE: https://github.com/jcubic/jquery.splitter
        object.splitter = $('#mapwrap')
            .height('100%')
            .split({
                orientation: 'vertical',
                limit: 10,
                onDrag: function(event) {
                    legende.close();
                    toolbar.close();
                },
                onDragEnd: function (event) {
                    table.reinitializeStickyTableHeader();
                    map_infos.resize();
                    legende.resize();
                    //map._onResize();
                }
            });
    },
    resizeSplitter:function(_width){
        const object = this;
        if(view_state.getViewState()==='mw') {
            let width = (object.getWidth()-_width),
                min_width = (object.getWidth()-450);

            if(width >= min_width){
                width= min_width;
            }
            object.splitter.position(width);
            if(table.isExpand()){
                legende.close();
            }
            legende.resize();
            table.reinitializeStickyTableHeader();
            map_infos.resize();
        }
    },
    initSplitterView:function(){
        const object = this;
        view_state.setViewState("mw");
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="gebiete"){
            let width = object.getWidth();
            $('#table_ags').addClass("collapsing");
            $('.left_content').show();
            //divider
            object.setSplitter();
            //set the splitter position
            if(object.splitter_width==null) {
                if (width <= 1024) {
                    object.splitter.position(width / 2);
                    $('.indikator_header').css("right", "20%");
                    $('#legende').css({"right": $('#rightPane').width() + 10, 'display': ''}).hide();
                    $('#legende_close').css("right", $('#rightPane').width() + 30);
                    $('#legende_button').css("right", $('#rightPane').width()).show();
                }
                else {
                    object.splitter.position(45 + width / 100 + "%");
                    $('#legende').css({"right": $('#rightPane').width() + 10, 'display': ''});
                    $('#legende_close').css("right", $('#rightPane').width() + 30);
                }
            }else{
                object.splitter.position(splitter_width);
            }

            object.splitter_width = $('.vsplitter').css('left');
        }
        //set the slider width
        $('.content').css("overflow-y","");
        $('#overflow_content').css("height","99%");
        //reset the bootom padding of the time slider
        table.getScrollableAreaDOMObject().css("height","85%");
        indikatorauswahl.fill();
        indikatorauswahl.getDOMObject()
            .dropdown('refresh');
    },
    getWidth:function(){
        return $(window).width();
    },
    getHeight:function(){
        return $(window).height();
    },
    initResponsiveView:function(){
        view_state.setViewState("responsive");
        main_view.getWidth();
        if(main_view.getWidth()<=500) {
            $('#overflow_content').css("height", "");
            $('.content')
                .css("overflow-y","auto");
            indikatorauswahl.getDOMObject()
                .dropdown('refresh');
        }else {
            $('#overflow_content').css("height", "90%");
        }
        //set the Legende
        legende.close();
        //resize
        indikatorauswahl.fill();
        table.getScrollableAreaDOMObject().css("height","90%");
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete'){
            panner.init();
            //bind the scroll handeler
            //reset the bootom padding of the time slider
            $('#rightPane').css("width","");
            $('#table_ags').removeClass("collapsing");
            $('#mapwrap').removeClass('splitter_panel');
        }
        //CSS settings
        $('.right_content').css("display","none");
    },
    getMobileState:function(){
        return this.getWidth() < 500;
    }
};