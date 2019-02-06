const main_view = {
    splitter:'',
    splitter_width:false,
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
        //QUELLLE: https://github.com/jcubic/jquery.splitter
        this.splitter = $('#mapwrap')
            .height('100%')
            .split({
                orientation: 'vertical',
                limit: 10,
                onDrag: function(event) {
                    legende.close();
                    toolbar.close();
                },
                onDragEnd: function (event) {
                    table.controller.reinitializeStickyTableHeader();
                    map_infos.resize();
                    legende.resize();
                    map.invalidateSize()
                }
            });
    },
    resizeSplitter:function(_width){
        if(view_state.getViewState()==='mw') {
            let width = (this.getWidth()-_width),
                min_width = (this.getWidth()-450);

            if(width >= min_width){
                width= min_width;
            }
            //set max width to prevent overflow the map content
            else if((this.getWidth()-_width)<=470){
                width= 470;
            }
            this.splitter.position(width);
            if(table.isExpand()){
                legende.close();
            }
            legende.resize();
            table.controller.reinitializeStickyTableHeader();
            map_infos.resize();
            map.invalidateSize();
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
            if(!this.splitter_width || this.splitter_width.indexOf('undefined')) {
                if (width <= 1024) {
                    this.splitter.position(width / 2);
                    $('.indikator_header').css("right", "20%");
                    $('#legende').css({"right": $('#rightPane').width() + 10, 'display': ''}).hide();
                    $('#legende_close').css("right", $('#rightPane').width() + 30);
                    $('#legende_button').css("right", $('#rightPane').width()).show();
                }
                else {
                    this.splitter.position(45 + width / 100 + "%");
                    $('#legende').css({"right": $('#rightPane').width() + 10, 'display': ''});
                    $('#legende_close').css("right", $('#rightPane').width() + 30);
                }
            }else{
                this.splitter.position(splitter_width);
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