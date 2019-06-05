class ScriptLoader{
    constructor() {
        this.scripts = [
            //JQuery Plugins
            "frontend/lib/jquery/plugin/jquery.tablesort.js",
            "frontend/lib/jquery/plugin/jquery.searchable.js",
            "frontend/lib/jquery/plugin/jquery.stickytableheaders.min.js",
            "frontend/lib/jquery/plugin/jquery.progressTimer.js",
            "frontend/lib/jquery/plugin/jquery.splitter.js",
            "frontend/lib/jquery/plugin/he.js",
            // Data Tables
            "frontend/lib/dataTables/datatables.min.js",
            //spectrum
            "frontend/lib/spectrum/spectrum.js",
            //Bootstrap
            "frontend/lib/bootstrap/bootstrap.min.js",
            "frontend/lib/bootstrap-tour/bootstrap-tour-standalone.js",
            "frontend/lib/bootstrap/bootstrapvalidator.min.js",
            //JQuery UI
            "frontend/lib/jquery/jquery.ui.touch-punch.js",
            "frontend/lib/jquery/jquery-ui-slider-pips.min.js",
            //underscore
            "frontend/lib/underscore/underscore-min.js",
            //leaflet plugins
            "frontend/lib/leaflet/plugin/leaflet-measure.js",
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
            //Export
            "frontend/lib/export/Blob.js",
            "frontend/lib/export/FileSaver.js",
            "frontend/lib/export/tableexport.min.js",
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
            "frontend/src/models/error.js",
            "frontend/src/models/pips.js",
            "frontend/src/models/view_state.js",
            "frontend/src/models/base_raumgliederung.js",
            "frontend/src/models/exclude.js",
            "frontend/src/auto_complete.js",
            "frontend/src/models/MigrationValue.js",
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
            "frontend/src/menu/NavBar.js",
            "frontend/src/menu/farbschema.js",
            "frontend/src/menu/MenuHelper.js",
            //map
            "frontend/src/map/additive_layer.js",
            "frontend/src/map/map_controller.js",
            "frontend/src/map/indikator_json.js",
            "frontend/src/map/indikator_raster.js",
            "frontend/src/map/indikator_json_group.js",
            "frontend/src/map/indikator_raster_group.js",
            "frontend/src/map/grundakt_layer.js",
            "frontend/src/map/start_map.js",
            "frontend/src/map/map_header.js",
            "frontend/src/map/legende.js",
            "frontend/src/map/MapHelper.js",
            //map tool
            "frontend/src/map/tools/lupe.js",
            "frontend/src/map/tools/measurement.js",
            "frontend/src/map/tools/glaetten.js",
            "frontend/src/map/tools/raster_split.js",
            "frontend/src/map/tools/zoom_in.js",
            "frontend/src/map/tools/zoom_out.js",
            "frontend/src/map/tools/center_map.js",
            "frontend/src/map/tools/geolocate.js",
            //table
            "frontend/src/table/TableSelection.js",
            "frontend/src/table/table.js",
            "frontend/src/table/expand_panel.js",
            "frontend/src/table/filter_panel.js",
            "frontend/src/table/csv_export.js",
            "frontend/src/table/TableHelper.js",
            //slider
            "frontend/src/slider/opacity_slider.js",
            "frontend/src/slider/rasterweite_slider.js",
            "frontend/src/slider/zeit_slider.js",
            //dialog
            "frontend/src/dialog/dialog_manager.js",
            "frontend/src/dialog/dev_chart.js",
            "frontend/src/dialog/kennblatt.js",
            "frontend/src/dialog/DialogHelper.js",
            "frontend/src/dialog/statistics.js",
            "frontend/src/dialog/AdditiveLayerControl.js",
            "frontend/src/dialog/area_info.js",
            //export
            "frontend/src/export/ogc_export.js",
            "frontend/src/export/map_link.js",
            "frontend/src/export/map_print.js",
            "frontend/src/export/Export_Helper.js",
            //other elements
            "frontend/src/RequestManager.js",
            "frontend/src/alert_manager.js",
            "frontend/src/config.js",
            "frontend/src/search.js",
            "frontend/src/webtour.js",
            "frontend/src/track.js",
            "frontend/app.js",
            "frontend/src/map/tools/ToolLoader.js"
        ];
    }
    includeScripts(){
        const loader = this;
        $.getMultiScripts = function(arr) {
            var _arr = $.map(arr, function(scr) {
                return $.getScript(  scr,function(){
                });
            });

            _arr.push($.Deferred(function( deferred ){
                $( deferred.resolve);
            }));

            return $.when.apply($, _arr);
        };

        $.getMultiScripts(loader.scripts).done(function() {
            try {
                localStorage.setItem("rel","false");
                //init the map with all there Functions
                App.main.call(this);
                ToolLoader.initTools();
            }catch(err){
                //IE is not supportet, otherwise there is an real error
                if(helper.checkIE()){
                    alert_manager.alertIE();
                }else{
                    //reload only one time
                    if(localStorage.getItem("rel")==="false") {
                        window.location.reload(true);
                        localStorage.setItem("rel", "true");
                    }else{
                        let message = error.getErrorMessage(err);
                        alert_manager.alertError();
                        RequestManager.sendMailError(message.name, message.message);
                        localStorage.setItem("rel","false");
                    }
                }
            }

        });
    }
}