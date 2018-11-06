$(function(){
    $(window).on('resize', function() {
        if($(".jq_dialog").is(":hidden")){
            map._onResize();
            page_init = true;
            mainView.restoreView();
        }
    });
});

$(document).ready(function() {
    //set the Unit test
    //Touch support
    if(!viewState.getUnitTestState()) {
        raeumliche_visualisierung.init();
        farbschema.init();
        webTour.init();
        toolbar.init();
        opacity_slider.init();
        klassifzierung.init();
        klassenanzahl.init();
        farbliche_darstellungsart.init();
        $.when(mainView.restoreView())
            .then(leftView.setMapView())
            .then(function () {
                if (urlparamter.getUrlParameter('rid')) {
                    loadRID(urlparamter.getUrlParameter('rid'));
                    return false;
                }
                else if (indikatorauswahl.getSelectedIndikator()) {
                    indikatorauswahl.setIndicator(indikatorauswahl.getSelectedIndikator());
                    layer_control.init();
                }
                else {
                    mainView.initializeFirstView();
                }
            });

    }else {
        $.when($('body')
            .append('<div id="qunit"></div>')
            .find("#Modal")
            .css("display", "none"))
            .then($('head').append('<script src="frontend/lib/qunit/qunit-2.6.2.js"></script><link rel="stylesheet" href="frontend/lib/qunit/qunit-2.6.2.css">'))
            .then(
                QUnit.test("init map", function (assert) {
                    assert.equal(raeumliche_visualisierung.init());
                    assert.equal(farbschema.init());
                    assert.equal(webTour.init());
                    assert.equal(opacity_slider.init());
                    assert.equal(mainView.restoreView());
                    assert.equal(leftView.setMapView());
                }));
        }
});
const mainView = {
    splitter:'',
    splitter_width:null,
    initializeFirstView:function(){
        map_indikator_infos.hide();
        startMap.set();
    },
    restoreView:function(){
        legende.resize();
        if (this.getWidth() <= 1280) {
            this.initResponsiveView();
        }
        else if (this.getWidth() <= 1400) {
            this.initSplitterView();
            toolbar.close();
            rightView.close();
        }
        else {
            this.initSplitterView();
            rightView.close();
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
                map_indikator_infos.resize();
                legende.resize();
                //map._onResize();
            }
        });
    },
    resizeSplitter:function(_width){
        const object = this;
        if(viewState.getViewState()==='mw') {
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
            map_indikator_infos.resize();
        }
    },
    initSplitterView:function(){
        const object = this;
        viewState.setViewState("mw");
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
        viewState.setViewState("responsive");
        mainView.getWidth();
        if(mainView.getWidth()<=500) {
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
const leftView ={
    getDOMObject:function(){
      $elem = $('.left_content');
      return $elem;
    },
    hide:function(){
        this.getDOMObject().hide();
    },
    getWidth:function(){
        return this.getDOMObject().width();
    },
    show:function(){
        this.getDOMObject().show();
    },
    setMapView:function(lat,lng,zoom){
        let zoom_set,
            lat_set,
            lng_set;

        //Zoom
        if(!zoom){
            var zoom_param = urlparamter.getUrlParameter('zoom');
            if(!zoom_param) {
                urlparamter.setUrlParameter('zoom', 8);
                zoom_set = 8;
            }else{
                zoom_set = zoom_param;
            }
        }else{
            urlparamter.updateURLParameter('zoom',zoom);
            zoom_set = zoom;
        }
        //lat
        if(!lat){
            var lat_param = urlparamter.getUrlParameter('lat');
            if(!lat_param) {
                urlparamter.setUrlParameter('lat', 50.9307);
                lat_set = 50.9307;
            }else{
                lat_set = lat_param;
            }
        }else{
            urlparamter.updateURLParameter('lat',lat);
            lat_set = lat;
        }
        //lng
        if(!lng){
            var lng_param = urlparamter.getUrlParameter('lng');
            if(!lng_param){
                urlparamter.setUrlParameter('lng',9.7558);
                lng_set = 9.7558;
            }else{
                lng_set = lng_param;
            }
        }else{
            urlparamter.updateURLParameter('lng',lng);
        }
        map.setView(new L.LatLng(lat_set, lng_set), zoom_set);
        map.attributionControl.addAttribution('<a href="http://www.ioer-monitor.de" target="_blank">IÖR-Monitor@Leibniz-Institut für ökologische Raumentwicklung</a>');
    }
};
const rightView = {
    getDOMObject: function(){
        $elem = $('.right_content');
        return $elem;
    },
    getCloseIconObject:function(){
        $elem= $('#table_close');
        return $elem;
    },
    open:function(){
        const view = this;
        //show only the table view, if the user set a indicator
        if(typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
            //set the mobile view
            if (viewState.getViewState() === "responsive") {
                if (!this.isVisible()) {
                    view.show();
                    leftView.hide();
                    view.getCloseIconObject().hide();
                    legende.remove();
                    panner.setMapBackground();
                } else {
                    view.hide();
                    leftView.show();
                    legende.getShowButtonObject().show();
                    panner.setTableBackground();
                    panner.init();
                }
            } else {
                $('#mapwrap').addClass('splitter_panel');
                view.show();
                panner.hide();
                view.getCloseIconObject().show();
                mainView.resizeSplitter(table.getWidth());
            }
        }else{
            alertNoIndicatorChosen();
        }
        //bind the close icon

        //disable divider
        view.getCloseIconObject()
            .unbind()
            .click(function(){
                view.close();
            });
    },
    close:function(){
        this.hide();
        $('#mapwrap').removeClass('splitter_panel');
        panner.init();
        legende.resize();
        map_indikator_infos.resize();
    },
    isVisible:function(){
        let state = true;
        if(this.getDOMObject().is(':hidden')){
            state = false;
        }
        return state;
    },
    hide:function(){
        this.getDOMObject().hide();
    },
    show:function(){
        indikatorJSONGroup.fitBounds();
        this.getDOMObject().show();
    },
    getWidth:function(){
       return this.getDOMObject().width();
    }
};
const viewState = {
    state: "mw",
    test_system:true,
    unit:false,
    getUnitTestState:function(){
        if(urlparamter.getUrlParameter('test')){
            this.unit=true;
        }
      return this.unit;
    },
    setUnitTestState:function(_value){
      this.unit=_value;
    },
    setProductionState:function(_state){
      this.test_system = _state;
    },
    getProductionState:function(){
      return this.test_system;
    },
    setViewState:function(_state){
      this.state = _state;
    },
    getViewState:function(){
      return this.state;
    }
};
//panner to open the left View
const panner = {
    getObject:function(){
        $elem = $('.panner');
        return $elem;
    },
    getContainer:function(){return $('.panner')},
    hide:function(){
        this.getContainer().hide();
    },
    show:function(){
        this.getContainer().show();
    },
    init:function(){
        if(raeumliche_visualisierung.getRaeumlicheGliederung()!=='raster') {
            this.show();
            if(this.getObject().hasClass('mapbackground')){
                this.getObject().removeClass('mapbackground').addClass('tablebackground');
            }
            //bind the click functionality
            this.getObject()
                .unbind()
                .click(function(){
                    rightView.open();
                });
        }else{
            this.hide();
        }
    },
    setTableBackground:function(){
        this.getObject().removeClass('mapbackground').addClass('tablebackground');
    },
    setMapBackground:function(){
        $('.tablebackground').toggleClass('mapbackground');
    },
    isVisible:function(){
        let state = false;
        if(this.getObject().is(":visible")){
            state = true;
        }
        return state;
    }
};
const progressbar ={
    active: false,
    getContainer:function(){return $('#progress_div');},
    getTextContainer:function(){return $('#progress_header');},
    init:function(){
        const object = this;
        if(this.active===false) {
            $('body').append('<div id="progress_div"><h2 id="progress_header"></h2><div class="progress"></div><hr/><button type="button" class="btn btn-primary" id="abort_btn">Abbrechen</button></div>');
            this.getContainer().show();
            modal_layout.init();
            this.active = true;
        }
        $(document).on("click","#abort_btn",function(){
            ajax_call.abort();
            object.remove();
        });
    },
    remove:function(callback){
        modal_layout.remove();
        this.active = false;
        this.getContainer().remove();
        if(callback)callback();
    },
    setHeaderText:function(html_string){
        this.getTextContainer()
            .empty()
            .text(html_string)
    }
};
const modal_layout ={
    getJQueryObject:function(){return $('#Modal');},
    init:function(){
        this.getJQueryObject().css(
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
        this.getJQueryObject().css(
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