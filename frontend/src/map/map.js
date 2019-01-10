var map= L.map('map',{
    zoomControl:false,
    twoFingerZoom:true
});
//TODO rewrite
$(function(){
    //make map and conatining elemnts touchable
    $('#widget').draggable();
    /*
    Callbacks on map interactions
     */
    map.on('moveend',         function () {

        let centerPoint = map.getSize().divideBy(2),
            targetLatLng = map.containerPointToLatLng(centerPoint);
        urlparamter.updateURLParameter('lat',targetLatLng.lat);
        urlparamter.updateURLParameter('lng',targetLatLng.lng);

    });
    map.on('zoomend',function () {
        let zoom = map.getZoom();
        urlparamter.updateURLParameter('zoom',zoom);
    });

    map.on('overlayremove',function (e) {
        layer_control.zusatzlayer.overlays_set.eachLayer(function(layer){
            if(layer.options.name === e.layer.options.name){
                layer_control.zusatzlayer.overlays_set.removeLayer(layer);
            }
        });
        //remove from legend
        $('.zusatzlayer').each(function(){
            if($(this).text()===e.name){
                $(this).remove();
            }
        });
        setTimeout(function(){
            layer_control.zusatzlayer.setParameter();
        },500)
    });

    map.on('baselayerchange', function (e) {
        $('.leaflet-control-attribution').find('a').each(function(){$(this).attr("target","_blank")});
        //track the choice
        let param_layer = layer_control.baselayer.getParameter();
        layer =e.layer.options.name;
        if(!param_layer){
            layer_control.baselayer.setParamter(layer);
        }else{
            layer_control.baselayer.updateParamter(layer);
        }
        if (raeumliche_visualisierung.getParameter()==="raster") {
            raster_group.eachLayer(function (layer) {
                layer.bringToFront();
            });
        }
    });


    if(!main_view.getMobileState()) {
        $('.leaflet-bottom').show();
        map.attributionControl.addAttribution('<a href="http://www.ioer-monitor.de" target="_blank">IÖR-Monitor@Leibniz-Institut für ökologische Raumentwicklung</a>');
    }else{
        $('.leaflet-bottom').hide();
    }
    //scalebar
    L.control.scale({
        metric:true,
        imperial: false,
        maxWidth: 200
    }).addTo(map);

});
var zoom_out,
    zoom_in;
//TODO in eigene objecte 'outsourcen'
$(function(){
    let mess_click = 0,
        lupe_click = 0,
        center,
        loader,
        magnifyingGlass,
        measureControl,
        lupe_container = $('#lupe'),
        measure_container = $('#measure');

    //Center Map
    center = L.control({position: 'topright'});
    center.onAdd = function (map) {
        var div = L.DomUtil.create('div');
        div.title="Die Ausdehnung der Karte auf Deutschland setzen";
        div.innerHTML = '<div class="germany btn_map"></div>';

        L.DomEvent
            .on(div, 'dblclick', L.DomEvent.stop)
            .on(div, 'click', L.DomEvent.stop)
            .on(div, 'mousedown', L.DomEvent.stopPropagation)
            .on(div, 'click', function(){
                indikator_json_group.fitBounds();
            });

        return div;
    };
    center.addTo(map);

    zoom_out = L.control({position: 'topright'});
    zoom_out.onAdd = function (map) {
        var div = L.DomUtil.create('div');
        div.title="Aus der Karte herauszoomen";
        div.innerHTML = '<div class="zoomOut btn_map"></div>';

        L.DomEvent
            .on(div, 'dblclick', L.DomEvent.stop)
            .on(div, 'click', L.DomEvent.stop)
            .on(div, 'mousedown', L.DomEvent.stopPropagation)
            .on(div, 'click', function(){
                map.setZoom(map.getZoom()-1);
            });
        return div;
    };
    zoom_out.addTo(map);

    zoom_in = L.control({position: 'topright'});
    zoom_in.onAdd = function (map) {
        var div = L.DomUtil.create('div');
        div.title="In die Karte hineinzoomen";
        div.innerHTML = '<div class="zoomIn btn_map"></div>';

        L.DomEvent
            .on(div, 'dblclick', L.DomEvent.stop)
            .on(div, 'click', L.DomEvent.stop)
            .on(div, 'mousedown', L.DomEvent.stopPropagation)
            .on(div, 'click', function(){
                map.setZoom(map.getZoom()+1);
            });

        return div;
    };
    zoom_in.addTo(map);

    info_l = L.control({position: 'topleft'});
    info_l.onAdd = function (map) {
        var div_l = L.DomUtil.create('div');
        div_l.title="Weiterführende Informationen zum Indikator";
        div_l.innerHTML = '<div class="info_lBtn btn_map"></div>';

        L.DomEvent
            .on(div_l, 'dblclick', L.DomEvent.stop)
            .on(div_l, 'click', L.DomEvent.stop)
            .on(div_l, 'mousedown', L.DomEvent.stopPropagation)
            .on(div_l, 'click', function(){
                $("#info_l").dialog({
                    hide: 'blind',
                    show: 'blind',
                    maxHeight: window.innerHeight - 15,
                    overflow:'scroll',
                    position: {
                        my: "right top",
                        at: "right top",
                        of: ".info_lBtn"
                    }
                });
            });

        return div_l;
    };

    //Tools----------------------------------------
    //Import
    loader =  L.Control.fileLayerLoad({
        layer: L.geoJson,
        // See http://leafletjs.com/reference.html#geojson-options
        layerOptions: {style: {color:'red'}},
        // Add to map after loading (default: true) ?
        addToMap: true,
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 1024,
        // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
        formats: [
            '.geojson',
            '.kml',
            '.gpx'
        ]
    }).addTo(map);

    document.getElementById("import").appendChild(loader.getContainer());

    //style
    $('.leaflet-control-scale-line').css({"border-bottom-color":"black","border-right-color": "black","border-left-color":"black"});

    measureControl = L.control.measure({
        primaryLengthUnit: 'kilometers',
        secondaryLengthUnit: 'meters',
        primaryAreaUnit: 'hectares',
        activeColor: farbschema.getColorActive(),
        completedColor: farbschema.getColorMain(),
        position: 'topright',
        localization: 'de',
        collapsed: false
    });

    measure_container.click(function(){
        if (mess_click === 0) {
            lupe = 0;
            $.when(legende.close())
                .then(measure_container.css('background-color', farbschema.getColorActive()))
                .then(measureControl.addTo(map))
                .then(magnifyingGlass.remove())
                .then(lupe_container.css('background-color', farbschema.getColorMain()))
                .then(function(){
                    if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete') {
                        $('.leaflet-control-measure').attr("style","margin-top : 90px !important;");
                    }
                })
                .then($('.leaflet-control-measure-toggle ')
                    .animate({"width":"80px","height":"80px"},1000,
                        function(){
                            $(this).css({"width":"40px","height":"40px"})
                        }))
                .then($('.leaflet-control-measure-toggle').css("background-color",farbschema.getColorActive()));
            mess_click++;
        } else {
            mess_click = 0;
            $.when(measureControl.remove())
                .then(measure_container.css('background-color', '#4E60AA;'))
                .then(legende.resize());
        }
        return false;
    });

    magnifyingGlass = L.magnifyingGlass({
        layers: [
            layer = L.tileLayer.grayscale('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            })
        ]
    });

    lupe_container.click(function(){
        if(lupe_click== 0){
            $('.toolbar').toggleClass("toolbar_close",500);
            zeit_slider.getContainerDOMObject().toggleClass("slider_zeit_container_toggle",500);
            lupe_container.css('background-color',farbschema.getColorActive());
            magnifyingGlass.addTo(map);
            measureControl.remove();
            measure_container.css('background-color','#4E60AA;');
            mess_click=0;
            lupe_click++;
        }else{
            magnifyingGlass.remove();
            lupe_container.css('background-color','#4E60AA;');
            lupe_click=0;
        }
        return false;
    });
});
