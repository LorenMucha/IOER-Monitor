const main_view = {
    splitter:'',
    splitter_width:false,
    initializeFirstView:function(){
        start_map.set();
    },
    restoreView:function(){
        legende.resize();
        if (this.getWidth() <= 1000 || this.getHeight()<=750) {
            this.initResponsiveView();
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
                    TableHelper.reinitializeStickyTableHeader();
                    legende.resize();
                    map.invalidateSize();
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
            if(TableHelper.isTableExpand()){
                legende.close();
            }
            legende.resize();
            TableHelper.reinitializeStickyTableHeader();
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
                if (width <= 1000) {
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
        //reset the bootom padding of the time slider
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
        console.clear();
        console.warn("init Responsive View");
        view_state.setViewState("responsive");
        main_view.getWidth();
        if(main_view.getWidth()<=500 || main_view.getHeight() <=700) {
            $('.content')
                .css("overflow-y","auto");
            indikatorauswahl.getDOMObject()
                .dropdown('refresh');
        }
        //set the Legende
        legende.close();
        //resize
        indikatorauswahl.fill();
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