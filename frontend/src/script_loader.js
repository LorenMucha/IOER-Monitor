const script_loader={
    scripts:[
        //JQuery Plugins
        "frontend/lib/jquery/plugin/jquery.tablesort.js",
        "frontend/lib/jquery/plugin/jquery.searchable.js",
        "frontend/lib/jquery/plugin/scroll-into-view.js",
        "frontend/lib/jquery/plugin/jquery.stickytableheaders.min.js",
        "frontend/lib/jquery/plugin/jquery.progressTimer.js",
        "frontend/lib/jquery/plugin/jquery.splitter.js",
        "frontend/lib/jquery/plugin/jquery.tabletoCSV.js",
        "frontend/lib/jquery/plugin/he.js",
        //spectrum
        "frontend/lib/spectrum/spectrum.js",
        //Bootsrap
        "frontend/lib/bootstrap/bootstrap.min.js",
        "frontend/lib/bootstrap-tour/bootstrap-tour-standalone.js",
        "frontend/lib/bootstrap/bootstrapvalidator.min.js",
        //JQuery UI
        "frontend/lib/jquery/jquery.ui.touch-punch.js",
        "frontend/lib/jquery/jquery-ui-slider-pips.min.js",
        //underscore
        "frontend/lib/underscore/underscore-min.js",
        //leaflet plugins
        "frontend/lib/leaflet/plugin/cloneLayer.js",
        "frontend/lib/leaflet/plugin/TileLayer.Grayscale.js",
        "frontend/lib/leaflet/plugin/L.Control.ZoomBox.js",
        "frontend/lib/leaflet/plugin/leaflet.magnifyingglass.js",
        "frontend/lib/leaflet/plugin/leaflet-side-by-side.js",
        "frontend/lib/leaflet/plugin/Control.MiniMap.js",
        "frontend/lib/leaflet/plugin/togeojson.js",
        "frontend/lib/leaflet/plugin/leaflet.filelayer.js",
        "frontend/lib/leaflet/plugin/leaflet-image.js",
        //Semantic UI
        "frontend/lib/semanticUi/semantic.min.js",
        "frontend/lib/semanticUi/components/transition.js",
        "frontend/lib/semanticUi/components/dropdown.js",
        "frontend/lib/semanticUi/components/transition.js",
        "frontend/lib/semanticUi/components/dropdown.js",
        //D3
        "frontend/lib/d3/d3.min.js",
        "frontend/lib/d3/canvas-toBlob.js",
        "frontend/lib/d3/FileSaver.min.js",
        //Sweet Alert
        "frontend/lib/sweetalert/sweetalert-dev.js",
        //Export2PDF
        "frontend/lib/export/jspdf.min.js",
        "frontend/lib/export/html2canvas.js",
        "frontend/lib/export/html2pdf.bundle.min.js",
        //monitor src--------------------------------
        "frontend/src/language_manager.js",
        "frontend/src/urlparamter.js",
        //view
        "frontend/src/view/panner.js",
        "frontend/src/view/progressbar.js",
        "frontend/src/view/modal_layout.js",
        "frontend/src/view/right_view.js",
        "frontend/src/view/left_view.js",
        "frontend/src/view/main_view.js",
        //models
        "frontend/src/models/styles.js",
        "frontend/src/models/klassengrenzen.js",
        "frontend/src/models/error_code.js",
        "frontend/src/models/pips.js",
        "frontend/src/models/view_state.js",
        //menu
        "frontend/src/menu/raeumliche_visualisierung.js",
        "frontend/src/menu/raeumliche_analyseebene.js",
        "frontend/src/menu/raumgliederung.js",
        "frontend/src/menu/gebietsauswahl.js",
        "frontend/src/menu/toolbar.js",
        "frontend/src/menu/indikatorauswahl.js",
        "frontend/src/menu/klassifzierung.js",
        "frontend/src/menu/klassenanzahl.js",
        "frontend/src/menu/farbliche_darstellungsart.js",
        "frontend/src/menu/navbar.js",
        "frontend/src/menu/farbschema.js",
        //map
        "frontend/src/map/layer_control.js",
        "frontend/src/map/map_controller.js",
        "frontend/src/map/indikator_json.js",
        "frontend/src/map/indikator_raster.js",
        "frontend/src/map/indikator_json_group.js",
        "frontend/src/map/indikator_raster_group.js",
        "frontend/src/map/grundakt_layer.js",
        "frontend/src/map/start_map.js",
        "frontend/src/map/map_header.js",
        "frontend/src/map/legende.js",
        "frontend/src/map/map_reset.js",
        "frontend/src/map/map_infos.js",
        //map tool
        "frontend/src/map/tools/lupe.js",
        "frontend/src/map/tools/measurement.js",
        "frontend/src/map/tools/glaetten.js",
        "frontend/src/map/tools/raster_split.js",
        "frontend/src/map/tools/zoom_in.js",
        "frontend/src/map/tools/zoom_out.js",
        "frontend/src/map/tools/file_loader.js",
        "frontend/src/map/tools/center_map.js",
        //table
        "frontend/src/table/table.js",
        "frontend/src/table/expand_panel.js",
        "frontend/src/table/filter_panel.js",
        "frontend/src/table/csv_export.js",
        //slider
        "frontend/src/slider/opacity_slider.js",
        "frontend/src/slider/rasterweite_slider.js",
        "frontend/src/slider/zeit_slider.js",
        //dialog
        "frontend/src/dialog/dialog_manager.js",
        "frontend/src/dialog/dev_chart.js",
        "frontend/src/dialog/feedback.js",
        "frontend/src/dialog/ogc_export.js",
        "frontend/src/dialog/kennblatt.js",
        //TODO: needs to be removed if Reini is finished
        "frontend/src/dialog/dialog.js",
        //other elements
        "frontend/src/ajax.js",
        "frontend/src/config.js",
        "frontend/src/helper.js",
        "frontend/src/alert.js",
        "frontend/src/export.js",
        "frontend/src/search.js",
        "frontend/src/webtour.js"
    ],
    include:function() {
        const loader = this;
        $.getMultiScripts = function(arr) {
            var _arr = $.map(arr, function(scr) {
                return $.getScript(  scr );
            });

            _arr.push($.Deferred(function( deferred ){
                $( deferred.resolve );
            }));

            return $.when.apply($, _arr);
        };

        $.getMultiScripts(loader.scripts).done(function() {
            try {
                script_loader.init.call(this);
            }catch(err){
                console.log(err);
                /*setTimeout(function(){
                    history.go(0);
                },500);*/
            }

        });
    },
    init:function() {
        //set the Unit test
        if(!view_state.getUnitTestState()) {
            //load the config data
            $.when($.ajax({
                async:true,
                url:"frontend/data/config.json",
                dataType:"json",
                cache:false,
                success:function(data){
                    config.setData(data);
                    config.checkVersion();
                }
            }))
            //set the menu data
                .then(toolbar.init())
                .then(map_controller.set())
                .then(navbar.init())
                .then(search.init())
                .then(raeumliche_visualisierung.init())
                .then(webTour.init())
                .then(opacity_slider.init())
                .then(klassifzierung.init())
                .then(klassenanzahl.init())
                .then(farbliche_darstellungsart.init());
            //set the Views
            $.when(main_view.restoreView())
                .then(left_view.setMapView())
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
                        main_view.initializeFirstView();
                    }
                })
                .then(farbschema.init());
        }else{
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
                        assert.equal(main_view.restoreView());
                        assert.equal(left_view.setMapView());
                    }));
        }
    }
};
