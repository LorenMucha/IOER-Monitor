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
        //Bootsrap
        "frontend/lib/bootstrap/bootstrap.min.js",
        "frontend/lib/bootstrap-tour/bootstrap-tour-standalone.js",
        "frontend/lib/bootstrap/bootstrapvalidator.min.js",
        //JQuery UI
        "frontend/lib/jquery/jquery-ui.min.js",
        "frontend/lib/jquery/jquery.ui.touch-punch.js",
        "frontend/lib/jquery/jquery-ui-slider-pips.min.js",
        //underscore
        "frontend/lib/underscore/underscore-min.js",
        //leaflet plugins
        "frontend/lib/leaflet/plugin/cloneLayer.js",
        "frontend/lib/leaflet/plugin/TileLayer.Grayscale.js",
        "frontend/lib/leaflet/plugin/leaflet-measure.js",
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
        //monitor src
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
        "frontend/src/models/farbschema.js",
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
        //map
        "frontend/src/map/layer_control.js",
        "frontend/src/map/indikator_json.js",
        "frontend/src/map/indikator_json_group.js",
        "frontend/src/map/indikator_raster_group.js",
        "frontend/src/map/grundakt_layer.js",
        "frontend/src/map/start_map.js",
        "frontend/src/map/map_header.js",
        "frontend/src/map/map.js",
        "frontend/src/map/legende.js",
        "frontend/src/map/map_reset.js",
        "frontend/src/map/map_infos.js",
        "frontend/src/map/manipulate/glaetten.js",
        "frontend/src/map/manipulate/raster_split.js",
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
        "frontend/src/language_manager.js",
        "frontend/src/urlparamter.js",
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
        $.each(loader.scripts, function (key, value) {

            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = value;
            // Use any selector
            $("body").append(s);
        });
        init.call(this);
    }
};
