var zoom_out,
    zoom_in,
    layercontrol;

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
                indikatorJSONGroup.fitBounds();
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
        if(lupe_click == 0){
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
const layer_control={
    control:'',
    state:'sw',
    baselayer:{
        paramter:'baselayer',
        baselayer_sw:{
            topplus:L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_topplus_web_open', {
                layers: 'web_grau',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "topplus",
                attribution: '<a href="http://www.bkg.bund.de">TopPlus © GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            webatlas:L.tileLayer.wms('https://sg.geodatenzentrum.de/wms_webatlasde.light_grau?', {
                layers: 'webatlasde.light_grau',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "webatlas",
                attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            noBackground: L.tileLayer('',{name:"noBackground",id: 'baselayer'}),
            satellite: L.tileLayer.grayscale('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri',name: "satellite",id: 'baselayer'}),
            osm : L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',name: "osm",id: 'baselayer'})
        },
        baselayer_rgb:{
            flaechenschema:new L.tileLayer.wms("https://maps.ioer.de/cgi-bin/mapserv_dv?map=/mapsrv_daten/detailviewer/wms_mapfiles/flaechenschema.map", {
                layers: "Flaechenschema",
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "flaechenschema",
                id: 'baselayer'
            }),
            webatlas:L.tileLayer.wms('https://sg.geodatenzentrum.de/wms_webatlasde.light?', {
                layers:'webatlasde.light',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "webatlas",
                attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            topplus:L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_topplus_web_open', {
                layers: 'web',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "topplus",
                attribution: '<a href="http://www.bkg.bund.de">TopPlus © GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri',name: "satellite",id: 'baselayer'}),
            osm : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',name: "osm",id: 'baselayer'})
        },
        getParameter:function(){
            if(!urlparamter.getUrlParameter(this.paramter)){
                this.setParamter('webatlas');
            }
            return urlparamter.getUrlParameter(this.paramter);
        },
        setParamter:function(_value){
            urlparamter.setUrlParameter(this.paramter,_value);
        },
        updateParamter:function(_value){
            urlparamter.updateURLParameter(this.paramter,_value);
        },
        removeParamter:function(){
            urlparamter.removeUrlParameter(this.paramter);
        },
        getBaseLayers_sw:function(){
            return {
                "WebAtlas_DE": this.baselayer_sw.webatlas,
                "TopPlus-Web-Open": this.baselayer_sw.topplus,
                "Satellit": this.baselayer_sw.satellite,
                "OSM": this.baselayer_sw.osm,
                "kein Hintergrund": this.baselayer_sw.noBackground
            }
        },
        getBaseLayers_rgb:function(){
            return {
                "WebAtlas_DE": this.baselayer_rgb.webatlas,
                "kein Hintergrund": this.baselayer_sw.noBackground,
                "TopPlus-Web-Open": this.baselayer_rgb.topplus,
                "Satellit":this.baselayer_rgb.satellite,
                "OSM": this.baselayer_rgb.osm
            }
        },
        getAllBaseLayers:function(){
            return $.extend({},this.baselayer_sw,this.baselayer_rgb);
        },
        getBaseLayers_set:function(){
          if(opacity_slider.getOpacity()==0){
              layer_control.state='rgb';
              return this.getBaseLayers_rgb();
          }else{
              layer_control.state='sw';
              return this.getBaseLayers_sw();
          }
        },
        clear:function(){
            map.eachLayer(function(layer){
                let id = layer.options.id;
                if(id) {
                    if(id==='baselayer'){
                        layer.removeFrom(map);
                    }
                }
            });
        }
    },
    zusatzlayer:{
        style:'',
        layer:'',
        parameter:'overlays',
        state:false,
        overlays_set : new L.FeatureGroup().on("mouseover",function(){
            this.eachLayer(function(layer){
                layer.bringToBack();
            })}),
        grenze_laender:new L.GeoJSON('',{
            name: 'laendergrenzen'
        }),
        grenze_kreise:new L.GeoJSON('',{
            name: 'kreisgrenzen'
        }),
        grenze_gemeinden:new L.GeoJSON('',{
            name: 'gemeindegrenzen'
        }),
        autobahn:new L.GeoJSON('',{
            name: 'autobahn'
        }),
        fernbahnnetz:new L.GeoJSON('',{
            name: 'fernbahnnetz'
        }),
        gew_haupt:new L.GeoJSON('',{
            name: 'gewaesser'
        }),
        getState:function(){
            if(this.getLayerGroup_set().length==0){
                return false
            }else{
                return true;
            }
        },
        getParameter:function(){
            return urlparamter.getUrlParameter(this.parameter);
        },
        setParam:function(){
            let array = [],
                object = this;
            this.overlays_set.eachLayer(function (layer) {
                array.push(layer.options.name);
            });

            if(array.length==0){
                object.removeParamter();
            }
            else if (!this.getParameter()) {
                urlparamter.setUrlParameter(this.parameter, array.toString());
            } else {
                urlparamter.updateURLParameter(this.parameter, array.toString());
            }
        },
        removeParamter:function(){
            urlparamter.removeUrlParameter(this.parameter);
        },
        setStyleSet:function(_style){
            this.style = _style;
        },
        getStyleSet:function(){
            return this.style;
        },
        setForward:function(){
            this.overlays_set.eachLayer(function(layer){
                layer.bringToFront();
            });
        },
        getOverlayLayers:function(){
            return {
                "Ländergrenzen":this.grenze_laender,
                "Kreisgrenzen":this.grenze_kreise,
                "Gemeindegrenzen":this.grenze_gemeinden,
                "Autobahnnetz (Stand 2015)":this.autobahn,
                "Fernbahnnetz (Stand 2016)":this.fernbahnnetz,
                "Hauptfließgewässer": this.gew_haupt
            };
        },
        getLayerGroup_set:function(){
          return this.overlays_set;
        }
    },
    getState:function(){
      return this.state;
    },
    init:function(){
        const controller = this;
        //the layercontrol
        try{controller.remove();}catch(err){}
        controller.control = L.control.layers(controller.baselayer.getBaseLayers_set(),controller.zusatzlayer.getOverlayLayers());
        map.addControl(controller.control);
        //expand the layer control with close icon
        $('.leaflet-control-layers-list').prepend('<div style="float: right; cursor: pointer;" id="close_layerlist">X</div>');
        //add the close option
        $('body').on("click","#close_layerlist",function(){$('.leaflet-control-layers').removeClass('leaflet-control-layers-expanded')});

        //set the baselayer
        if (controller.baselayer.getParameter()) {
            $.each(controller.baselayer.getBaseLayers_set(), function (key, value) {
                if (controller.baselayer.getParameter().indexOf(value.options.name) >= 0) {
                    value.addTo(map);
                }
            });
        }
        //set the zusatzlayer if set
        if(controller.zusatzlayer.getParameter()){
            let array = controller.zusatzlayer.getParameter().split(',');
            $.each(controller.zusatzlayer.getOverlayLayers(),function(key,value){
                $.each(array,function(key_a,value_a){
                    if(value_a === value.options.name){
                        map.addLayer(value);
                    }
                });
            });
        }
    },
    remove:function(){
        this.baselayer.clear();
        try {map.removeControl(this.control);} catch (err) {}
    }
};
const glaetten = {
    control:'',
    parameter:'glaettung',
    getButtonObject:function(){
      $elem =  $('#rasterize');
      return $elem;
    },
    setParamter:function(_value){
      urlparamter.setUrlParameter(this.parameter,_value);
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.parameter);
    },
    removeParamter:function(){
      urlparamter.removeUrlParameter(this.parameter);
    },
    upateParameter:function(_value){
        urlparamter.updateURLParameter(this.parameter,_value);
    },
    getState:function(){
        let parameter_set = this.getParamter(),
            mode = "RESAMPLE=NEAREST";

        if(parameter_set==1){
            mode="RESAMPLE=BILINEAR";
            this.getButtonObject().css('background-color', farbschema.getColorActive());
        }else{
            this.getButtonObject().css('background-color', farbschema.getColorMain());
        }

        return mode;
    },
    getController:function(){
        return this.control;
    },
    setController:function(_controller){
        this.control = _controller;
    },
    init:function(){
        const controller = this;
        //the raster View Control
        if(!controller.getParamter()){
            this.setParamter(0);
        }
        let object = new L.control({position: 'topright'});
        object.onAdd = function () {
            let div = L.DomUtil.create('div');
            div.title='Die Karte glätten';
            div.innerHTML = '<div id="rasterize" class="rasterize btn_map"></div>';
            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function(){
                    if(controller.getParamter()==0) {
                        controller.upateParameter(1);
                    }else{
                        controller.upateParameter(0);
                    }
                    indikator_raster.init();
                    if(raster_split.getState()){
                        indikator_raster.init(null,null,"rechts",raster_split.dialogObject.getSettings())
                    }
                });

            return div;
        };
        try{
            setTimeout(function(){
                object.addTo(map);
                controller.setController(object);
            },100);
        }catch(err){}

    },
    remove:function(){
        map.removeControl(this.control);
    }
};
const raster_split={
    control:'',
    button:'',
    dialogObject:
        {
            jahre:'',
            raumgliederung:'',
            jahre_set:'',
            raumgliederung_set:'',
            getContainerObject:function(){
                $elem=  $('#vergleich_dialog');
                return $elem;
            },
            getDropdownDOMObject:function(){
              $elem=$('#indicator_ddm_vergleich');
              return $elem;
            },
            getTimeSliderDOMObject:function(){
                $elem = $("#zeit_slider_vergleich");
                return $elem;
            },
            getSpatialSliderDOMObject:function(){
              $elem = $("#raum_slider_vergleich");
              return $elem;
            },
            openDialog:function(){
              const dialog = this,
                  controller = raster_split;
                let dialog_container = dialog.getContainerObject(),
                    button_map = controller.getButtonObject(),
                    dropdown_ind =  dialog.getDropdownDOMObject(),
                    close_container = $('.close_vergleich');

                //open the dialog
                dialog.show();
                button_map.css("background-color",farbschema.getColorActive());

                if ($('#kat_auswahl_vergleich').length === 1) {
                    indikatorauswahl.cloneMenu('kat_auswahl_vergleich', 'ink_kat_vergleich', 'right',["X","G"],false);
                }

                dropdown_ind.dropdown({
                    onChange: function (value, text, $choice) {
                        dialog.initElements(value);
                        $('.ind_content').slideDown();
                    }
                });

                //pre select the set indicator
                if(!dropdown_ind.dropdown('get value')||typeof dropdown_ind.dropdown('get value') ==='undefined') {
                    dropdown_ind.dropdown('set selected',indikatorauswahl.getSelectedIndikator());
                }

                //klassifizierungsmenu
                $('#menu_klassifizierung_vergleich').find('input').change(function () {
                    dialog.setLegende();
                });

                //change the number of classes
                $('#Klassenanzahl_vergleich').change(function(){
                    dialog.setLegende();
                });

                //destroy the function
                close_container
                    .find('.destroy')
                    .unbind()
                    .click(function(){
                        raster_split.remove();
                        dialog.hide();
                        button_map.css("background-color",farbschema.getColorMain());
                    });

                //close the dialog
                close_container
                    .find('.close')
                    .unbind()
                    .click(function () {
                        dialog.hide();
                    });

                $('#create_vergleichskarte_button').click(function(){
                    const settings = dialog.getSettings();
                    indikator_raster.init(null,null,"rechts",settings);
                    dialog.hide();
                    $('#indikator_header_rechts')
                        .show();
                    $('#header_rechts').text(settings[0].ind_text+" ("+settings[0].time+")");
                    $('#header_raumgl_rechts').text(settings[0].raumgl);
                });

                $("#kennblatt_vergleich").click(function(){
                    openKennblatt($('#indicator_ddm_vergleich').dropdown('get value'));
                });
            },
            initElements:function(indikator_id){
                const dialog = this;
                let def = $.Deferred();
                function defCalls(){
                    let requests = [
                        request_manager.getJahre(indikator_id),
                        request_manager.getRaumgliederung(indikator_id)
                    ];
                    $.when.apply($,requests).done(function(){
                        def.resolve(arguments);
                    });
                    return def.promise();
                }
                defCalls().done(function(arr) {
                    //now we have access to array of data
                    dialog.jahre = arr[0][0];
                    dialog.raumgliederung = arr[1][0];
                    dialog.getTimeSliderDOMObject()
                        .unbind()
                        .slider({
                            orientation: "horizontal",
                            min: 0,
                            max: (dialog.jahre).length - 1,
                            step: 1,
                            value: 0,
                            stop: function (event, ui) {
                                dialog.setLegende();
                                dialog.jahre_set = dialog.jahre[(ui.value)];
                            }
                        });
                    dialog.jahre_set = dialog.jahre[0];
                    pips.set(dialog.getTimeSliderDOMObject(), dialog.jahre);

                    let labels = [];
                    dialog.getSpatialSliderDOMObject()
                        .unbind()
                        .slider({
                            orientation: "horizontal",
                            min: 0,
                            max: (dialog.raumgliederung).length - 1,
                            value: 0,
                            step: 1,
                            stop: function (event, ui) {
                                dialog.setLegende();
                                dialog.raumgliederung_set = dialog.raumgliederung[(ui.value)];
                            }
                        });
                    dialog.raumgliederung_set = dialog.raumgliederung[0];
                    try {
                        $.each(dialog.raumgliederung, function (key, value) {
                            labels.push(value.replace('Raster', '').replace('m', ''));
                        });
                    } catch (err) {
                    }
                    pips.set(dialog.getSpatialSliderDOMObject(), labels);
                    dialog.setLegende();
                });
            },
            setLegende:function(){
                const dialog = this;
                let settings = dialog.getSettings(),
                    ind = settings[0].ind,
                    time = settings[0].time,
                    kat = settings[0].kat,
                    raumgl_set = settings[0].raumgl,
                    klassifizierung = settings[0].klassifizierung,
                    klassenanzahl = settings[0].klassenanzahl;

                $.when(getRasterMap(time, ind, raumgl_set, klassifizierung, klassenanzahl, farbliche_darstellungsart.getSelectionId()))
                    .done(function (data) {
                        let txt = data;
                        let x = txt.split('##');

                        let legende = x[1];
                        let legende_schraffur ="https://maps.ioer.de/cgi-bin/mapserv_dv?map=/mapsrv_daten/detailviewer/mapfiles/mapserv_raster.map&MODE=legend&layer=schraffur&IMGSIZE=150+30";

                        let einheit = x[10];
                        if(einheit==='proz'){einheit='%'}

                        $('#legende_vergleich_i').empty().load(legende, function () {
                            let elements = $(this).find('img');
                            elements.each(function (key, value) {
                                let src = $(this).attr('src');
                                $(this).attr('src', "https://maps.ioer.de" + src);
                            });
                        });

                        $('.iconlegende_schraffur').load(legende_schraffur, function () {
                            let elements = $(this).find('img');
                            elements.each(function (key, value) {
                                let src = $(this).attr('src');
                                $(this).attr('src', "https://maps.ioer.de" + src);
                            });
                        });

                        if (einheit.length >= 1) {
                            $('#legende_vergleich_einheit').show().text(' ' + einheit);
                        } else {
                            $('#legende_vergleich_einheit').hide();
                        }

                        $.ajax({
                            type:"GET",
                            url :urlparamter.getURL_RASTER() + "php/histogramm.php?Jahr=" + time + "&Kategorie=" + kat + "&Indikator=" + ind + "&Raumgliederung=" + raumgl_set + "&Klassifizierung=" + klassifizierung + "&AnzKlassen=" + klassenanzahl,
                            success:function(data){
                                $('#histogramm_pic_vergleich').empty().append('<img style="width:100%;" src="'+data+'"/>');
                            }
                        });

                        $.when(request_manager.getIndZusatzinformationen(ind,time)).done(function(data){
                            let datengrundlage = data[0]["datengrundlage"];
                            if (datengrundlage.length >= 3) {
                                datengrundlage = datengrundlage + "</br>";
                            }
                            let atkis = data[0]["atkis"];
                            $('#indikator_info_text_vergleich').text(data[0]["info"]);
                            $('#datengrundlage_content_vergleich').html(datengrundlage + atkis);
                        });
                    });
            },
            getSettings:function(){
                let ind = this.getDropdownDOMObject().dropdown('get value'),
                    ind_text = this.getDropdownDOMObject().dropdown('get text'),
                    time = this.jahre_set,
                    raumgl_set = this.raumgliederung_set,
                    kat = $('#kat_auswahl_vergleich #'+indikatorauswahl.getSelectedIndikator()+"_item").attr("data-kat"),
                    klassifizierung = $('#menu_klassifizierung_vergleich').find('input:checked').val(),
                    klassenanzahl = $('#menu_klassenanzahl_vergleich').find('select').val(),
                    settings = [];
                settings.push({"kat":kat,"ind":ind,"ind_text":ind_text,"time":time,"raumgl":raumgl_set,"klassifizierung":klassifizierung,"klassenanzahl":klassenanzahl});
                return settings;
            },
            show:function(){
                this.getContainerObject().slideDown();
            },
            hide:function(){
                this.getContainerObject().slideUp();
            }
        },
    getButtonObject:function(){
      $elem = $('#vergleich_btn');
      return $elem;
    },
    getSplitterContainer:function(){
        $elem = $('.leaflet-sbs');
        return $elem;
    },
    init:function(){
        const controller = this;
        //the comperative Map
        let vergleichcontrol = new L.control({position:'topright'});
        controller.button = vergleichcontrol;
        vergleichcontrol.onAdd = function(map){
            var div = L.DomUtil.create('div');
            div.title="Zwei Indikatorkarten miteinander Vergleichen";
            div.innerHTML = '<div class="vergleich btn_map" id="vergleich_btn"></div>';
            let timer;
            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function(){
                    controller.dialogObject.openDialog();
                    sideByside = L.control.sideBySide(indikator_raster.raster_layer.addTo(map), null);
                    raster_split.setController(sideByside);
                    if(!raster_split.getState()){
                        sideByside.addTo(map);
                    }
                })
                .on(div,'mouseover',function () {
                    if(raster_split.getState()){
                        timer = setTimeout(function(){
                            controller.dialogObject.openDialog();
                        },100);
                    }
                })
                .on(div,'mouseleave',function() {
                    clearTimeout(timer);
                });

            return div;
        };
        try{
            setTimeout(function(){
                if(!mainView.getMobileState()) {
                    vergleichcontrol.addTo(map);
                }
            },1000);
        }catch(err){}
    },
    getController:function(){
      return this.control;
    },
    setController:function(_controller){
      this.control = _controller;
    },
    getButton:function(){
      return this.button;
    },
    remove:function(){
        const object = this;
        object.getSplitterContainer().remove();
        $('#indicator_ddm_vergleich').dropdown('clear');
        $('.ind_content').hide();
        $('#indikator_header_rechts')
            .hide();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster"){
            indikator_raster.init();
        }else{
            map.removeControl(object.getButton());
        }
    },
    getState:function(){
        return this.getSplitterContainer().length >= 1;
    }
};
