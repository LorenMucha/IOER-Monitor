var jsongroup = new L.FeatureGroup(),
    jsongroup_grund = new L.FeatureGroup(),
    raster_group = new L.layerGroup(),
    raster;

const indikator_raster = {
    raster_layer:'',
    init:function(hex_min, hex_max, _seite, _settings,callback) {
        const object = this;
        let _darstellung_map = glaetten.getState(),
            _ind = indikatorauswahl.getSelectedIndikator(),
            _time = zeit_slider.getTimeSet(),
            _klassifizierung = klassifzierung.getSelectionId(),
            _klassenanzahl = klassenanzahl.getSelection(),
            _raumgliederung_set = raeumliche_analyseebene.getSelectionId();

        map.off('click', object.onClick);

        //settings for split map request
        if (_seite === 'rechts') {
            _ind = _settings[0].ind;
            _time = _settings[0].time;
            _raumgliederung_set = _settings[0].raumgl;
            _klassifizierung = _settings[0].klassifizierung;
            _klassenanzahl = _settings[0].klassenanzahl;
        }

        $.when(getRasterMap(_time, _ind, _raumgliederung_set, _klassifizierung, _klassenanzahl, _darstellung_map, _seite))
            .then(function (data) {
                let txt = data,
                    x = txt.split('##'),
                    pfad_mapfile = x[0],
                    layername = x[2],
                    einheit = x[10],
                    url = 'https://maps.ioer.de/cgi-bin/mapserv_dv?Map=';

                pfad_mapfile = pfad_mapfile.replace(/^( +)/g, '');

                if (einheit === 'proz') {
                    einheit = '%'
                }
                //store the gloabal Variables

                //set Raster for map
                object.raster_layer = new L.tileLayer.wms(url + pfad_mapfile,
                    {
                        layers: layername,
                        cache: Math.random(),
                        version: '1.3.0',
                        format: 'image/png',
                        srs: "EPSG:3035",
                        transparent: true,
                        group: "ioer",
                        pfadmapfile: pfad_mapfile,
                        layername: layername,
                        einheit: einheit
                    });

                if (_seite) {
                    //removeRasterBySide(_seite);
                    indikatorRasterGroup.clean(_seite);
                    object.raster_layer.setParams({id: _seite}, false);
                    raster_split.getController().setRightLayers(object.raster_layer.addTo(map));
                } else {
                    object.raster_layer.setParams({id: 'links'}, false);
                    if (raster_split.getState()) {
                        indikatorRasterGroup.clean('links');
                        raster_split.getController().setLeftLayers(object.raster_layer.addTo(map));
                    } else {
                        indikatorRasterGroup.clean();
                        indikatorJSONGroup.clean();
                        object.raster_layer.addTo(map);
                    }
                    grundakt_layer.init(x[7]);
                }
               raster_group.addLayer(object.raster_layer);
               object.raster_layer.bringToFront();
               object.raster_layer.setOpacity(opacity_slider.getOpacity());
               map.on('click', object.onClick);
                if (!_seite) {
                    legende.fillContent();
                }
                if (callback) callback();
                indikator_map_header.set();
            });
    },
    onClick:function(e){
        const object = indikator_raster;
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster") {
            let mapOptions = object.getInfos(),
                indikator = indikatorauswahl.getSelectedIndikator(),
                X = map.layerPointToContainerPoint(e.layerPoint).x,
                Y = map.layerPointToContainerPoint(e.layerPoint).y,
                BBOX = map.getBounds().toBBoxString(),
                SRS = 'EPSG:4326',
                WIDTH,
                HEIGHT = map.getSize().y,
                lat = e.latlng.lat,
                lng = e.latlng.lng;

            let windowWidth = $(window).width();

            if (windowWidth > 2045) {
                WIDTH = 2045;
            } else {
                WIDTH = map.getSize().x;
            }

            let devider = $(".leaflet-sbs-divider").offset();

            //the requests
            if(devider) {
                if (X > devider.left) {
                    indikator = $('#indicator_ddm_vergleich').dropdown('get value');
                    mapOptions = object.getInfos('rechts');
                }else{
                    mapOptions = object.getInfos('links');
                }
            }

            let URL = 'https://maps.ioer.de/cgi-bin/mapserv_dv?Map=' +
                mapOptions[0].pfadmapfile + '&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX=' +
                BBOX + '&SRS=' +
                SRS + '&WIDTH=' + WIDTH + '&HEIGHT=' + HEIGHT + '&LAYERS=' + mapOptions[0].layername +
                '&STYLES=&FORMAT=image/png&TRANSPARENT=true&QUERY_LAYERS=' +
                mapOptions[0].layername + '&INFO_FORMAT=html&X=' + X + '&Y=' + Y;

            let URL_WFS = 'https://sg.geodatenzentrum.de/wfs_vg250?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=vg250_gem&BBOX=' +
                lng + ',' + lat + ',' + (lng + 0.000000000000100) + ',' + (lat + 0.000000000000100) +
                '&srsName=' + SRS + '&MAXFEATURES=1';

            let getPixelValue = $.ajax({
                url: URL,
                cache: false,
                datatype: "html",
                type: "GET"
            });
            getPixelValue.done(function (data) {
                let html_value = $(data).text();
                let html_float = parseFloat(html_value);
                let pixel_value = null;
                //get the Ags from the BKG WFS
                let getGem = $.ajax({
                    url: URL_WFS,
                    cache: false,
                    dataType: 'xml',
                    type: "GET"
                });
                getGem.done(function (xml) {
                    let gem = $(xml).find('vg250\\:gen,gen').text();
                    let ags = $(xml).find('vg250\\:ags,ags').text();
                    //query the gem statistic
                    let getGemStat = $.ajax({
                        type: "GET",
                        url: urlparamter.getURL_RASTER() + "php/onClickQuery.php",
                        dataType: 'json',
                        data: {ags: ags, indikator: indikator, jahr: zeit_slider.getTimeSet()}
                    });
                    getGemStat.done(function (json) {
                        let data = JSON.parse(json);
                        let layer = new L.GeoJSON(data)
                            .setStyle({
                                weight: 2,
                                opacity: 1,
                                color: 'black',
                                fillOpacity: 0
                            });
                        let gem_stat = data.features[0].properties.value;

                        if (html_float === -9998) {
                            pixel_value = "nicht Relevant"
                        }
                        else if (html_float < 0) {
                            pixel_value = " keine Daten"
                        }
                        else {
                            pixel_value = (Math.round(html_float * 100) / 100).toFixed(2) + ' ' + mapOptions[0].einheit;
                        }

                        let popup = new L.popup({
                            maxWith: 300
                        });

                        popup.setContent('<b>Pixelwert: </b>' + pixel_value + '</br>' +
                            '<span>Gemeinde: </span>' + gem + '</br>' +
                            '<span>Gemeindewert: </span>' + gem_stat);
                        popup.setLatLng(e.latlng);

                        if (!$('.map').hasClass('devider_move')) {
                            layer.addTo(map).bringToFront();
                            map.openPopup(popup);
                        }

                        map.on('popupclose', function (e) {
                            map.removeLayer(layer);
                        });


                    });
                });
            });
        }
    },
    getInfos:function(_seite){
        let options = [],
            layer_set = {};

        raster_group.eachLayer(function (layer) {
            if (_seite) {
                if (layer.wmsParams.id === _seite) {
                    layer_set = layer;
                }
            }
            else{
                layer_set = layer;
            }
        });
        try {
            options.push({
                pfadmapfile: layer_set.options.pfadmapfile,
                layername: layer_set.options.layername,
                einheit: layer_set.options.einheit
            });
        }catch(err){}
        return options;
    }
};
const indikatorJSON = {
    json_layer : '',
    json_file:'',
    setJSONLayer:function(_layer){
        this.json_layer = _layer;
    },
    getJSONLayer:function(){
        return this.json_layer;
    },
    setJSONFile:function(_json){
        this.json_file=_json;
    },
    getJSONFile:function(){
        return this.json_file;
    },
    init:function(raumgl, callback) {
        const object = this;
        let ind = indikatorauswahl.getSelectedIndikator(),
            raumgliederung_set = raeumliche_analyseebene.getSelectionId(),
            time = zeit_slider.getTimeSet(),
            ags_set = gebietsauswahl.getSelection();

        $.when(progressbar.init())
            .then(indikatorRasterGroup.clean())
            .then(indikatorJSONGroup.clean());

        if (raumgl) {
            raumgliederung_set = raumgl;
        }
        if (gebietsauswahl.countTags() === 0) {
            ags_set = [];
        }

        //info how much geomtries will be created and afterwards stat the creation
        $.when(request_manager.getCountGeometries(raumgliederung_set)).done(function (x) {
            setTimeout(function () {
                progressbar.setHeaderText("Lade " + x[0].count + " Gebiete");
            }, 100)
        });

        $.when(request_manager.getGeoJSON(ind, time, raumgliederung_set, ags_set,klassenanzahl.getSelection(),klassifzierung.getSelectionId()))
            .done(function(arr){
                //now we have access to array of data
                try{
                    object.json_file = JSON.parse(arr);
                }catch(err){
                    object.json_file = arr
                }

                if (farbliche_darstellungsart.getSelectionId() === "auto") {
                    klassengrenzen.setKlassen(object.json_file.classes);
                }

                object.addToMap();
                grundakt_layer.init(raumgliederung_set);
                table.create();
                gebietsauswahl.init();
                legende.fillContent();
                if (callback) callback();
            });

        page_init = false;
    },
    addToMap:function(geoJson_set, klassenJson_set){
        const object = this;
        let geoJson = this.json_file;
        //optional parameter for undependant creation
        if(geoJson_set){
            geoJson = geoJson_set;
        }
        if(klassenJson_set){
            klassengrenzen.setKlassen(klassenJson_set);
        }

        //let einheit = geoJson.feature[0].properties.einheit;
        $.each(geoJson.features, function(key, value) {
            if(key == 0) {
                einheit = String(value.properties.einheit);
            }
        });

        function onEachFeature(feature, layer) {
            try {
                layer.on({
                    mouseover: object.highlightFeatureOnmouseover,
                    mouseout: object.resetHighlight,
                    click: object.setPopUp
                });
            }catch(err){
                console.log('%cError in map.js:46 '+err, 'background: #222; color: #bada55');
            }
        }

        object.json_layer = new L.GeoJSON(geoJson, {
            style: object.setStyle,
            onEachFeature: onEachFeature
        });

        jsongroup.addLayer(object.json_layer).addTo(map);
        indikator_map_header.set();
        if($('.right_content').is(":hidden")){
            progressbar.remove();
        }
        if(layer_control.zusatzlayer.getState()){layer_control.zusatzlayer.setForward()};
    },
    setPopUp:function(e){
        let layer = e.target,
            gen = layer.feature.properties.gen.toString(),
            value_ags = layer.feature.properties.value_comma,
            einheit = layer.feature.properties.einheit,
            ags = layer.feature.properties.ags,
            grundakt = $('#'+ags).find('.td_akt').text(),
            val_d = DotToComma(value_ags),
            //fc = Fehlercode
            fc = layer.feature.properties.fc.toString(),
            div,
            id_popup = ags.toString().replace(".",""),
            gebietsprofil = '<div><img id="pop_up_gebietsprofil_'+id_popup+'" title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" src="frontend/images/icon/indikatoren.png"/><b>  Gebietsprofil</b></div>',
            statistik = '<div><img title="Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators" id="pop_up_diagramm_ags_'+id_popup+'" src="frontend/images/icon/histogramm.png"/><b>  Statistik</b></div>',
            indikatorwertentwicklung = '<div><img id="pop_up_diagramm_ind_ags_'+id_popup+'" title="Veränderung der Indikatorwerte für die Gebietseinheit" src="frontend/images/icon/indikatoren_verlauf.png"/><b>  Indikatorwertentwicklung</b></div>',
            entwicklungsdiagramm = '<div><img id="pop_up_diagramm_entwicklung_ags_'+id_popup+'" title="Veränderung der Indikatorwerte für die Gebietseinheit" src="frontend/images/icon/indikatoren_diagr.png"/><b>  Entwicklungsvergleich</b></div>';

        if(mainView.getMobileState()) {
            entwicklungsdiagramm = '';
            indikatorwertentwicklung = '';
        }

        if(fc !== '0'){
            //get the single values of each fc
            let arr = fc.split("||");
            let text = arr[2];
            let color = arr[1];
            div = $('<div class="PopUp">' +
                '<div>' +
                '<div><b style="color:red">'+text+'</b></div>' +
                '</div>')[0];
        }else if(!grundakt){
            div =  $('<div class="PopUp">' +
                '<div>' +
                '<b>'+gen+': '+'</b>'+val_d+' '+einheit+'' +
                '</div>' +
                '<hr class="hr"/> '+
                '<div id="pop_up_interactions">'+
                gebietsprofil+statistik+indikatorwertentwicklung+entwicklungsdiagramm+
                '</div>'+
                '</div>')[0];
        }
        else{
            div =  $('<div class="PopUp">' +
                '<div>' +
                '<b>'+gen+': '+'</b>'+val_d+' '+einheit+'' +
                '</div>' +
                '<div>Grundaktualität: '+grundakt+'</div>' +
                '<hr class="hr"/> '+
                '<div id="pop_up_interactions">'+
                gebietsprofil+statistik+indikatorwertentwicklung+entwicklungsdiagramm+
                '</div>'+
                '</div>')[0];
        }


        let bounds = layer.getBounds();
        let popup = L.popup()
            .setLatLng(bounds.getCenter())
            .setContent(div)
            .openOn(map);


        $(document).on('click','#pop_up_gebietsprofil_'+id_popup,function(){
            openGebietsprofil(ags,gen);
        });

        $(document).on('click','#pop_up_diagramm_ags_'+id_popup,function(){
            openStatistik(ags,gen,value_ags);
        });
        $(document).on('click','#pop_up_diagramm_entwicklung_ags_'+id_popup,function(){
            //openEntwicklungsdiagramm(ags,gen,indikatorauswahl.getSelectedIndikator(),true);
            dev_chart.chart.settings.ags = ags;
            dev_chart.chart.settings.name=gen;
            dev_chart.chart.settings.ind=indikatorauswahl.getSelectedIndikator();
            dev_chart.chart.settings.ind_vergleich=true;
            dev_chart.open();
        });
        $(document).on('click','#pop_up_diagramm_ind_ags_'+id_popup,function(){
            //openEntwicklungsdiagramm(ags,gen,indikatorauswahl.getSelectedIndikator(),false);
            dev_chart.chart.settings.ags = ags;
            dev_chart.chart.settings.name=gen;
            dev_chart.chart.settings.ind=indikatorauswahl.getSelectedIndikator();
            dev_chart.chart.settings.ind_vergleich=false;
            dev_chart.open();
        });
    },
    setMarker:function(lat,lng,title){
        if(!title){
            title = "<b>"+lat+" "+lon+"</b>"
        }
        let icon = L.icon({iconUrl:"frontend/images/icon/marker-icon.png",shadowUrl:"frontend/images/icon/marker-shadow.png"});
        let popup =L.popup().setLatLng([lat,lng]).setContent(title).openOn(map);
        map.setView(new L.LatLng(lat, lng),urlparamter.getUrlParameter('zoom'));
    },
    setStyle:function(feature) {
        //the error Code
        let fc = feature.properties.fc,
            des = feature.properties.des;
        //init styling
        if (fc === '0') {
            return style.getLayerStyle(feature.properties.value);
        } else {
            let arr = fc.split("||"),
                text = arr[2];
            error_code.setErrorCode(text);
            return style.getErrorStyle();
        }
    },
    highlightFeatureOnmouseover:function(e) {
        const object = this;
        let layer = e.target;
        layer.setStyle(style.getActive());
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        //highlight element in legend
        try {
            let fillcolor = layer.options.fillColor.replace('#', '');
            $('#legende_' + fillcolor + " i").css({
                "width": "20px",
                "height": "15px",
                "border": "2px solid " + farbschema.getColorActive()
            });
        }catch(err){}
    },
    resetHighlight: function(e) {
        let layer = e.target;
        layer.setStyle(style.getLayerStyle(layer.feature.properties.value));
        $('#thead').show();
        $('#'+layer.feature.properties.ags).removeClass("hover");
        layer_control.zusatzlayer.setForward();
        try {
            let fillcolor = layer.options.fillColor.replace('#', '');
            $('#legende_' + fillcolor + " i").css({"width": "15px", "height": "10px", "border": ""});
        }catch(err){
            //console.log(err);
        }
    },
    getStatistikArray:function(){
        let array = [];
        $.each(this.json_file.stat,function(key,value){
            let obj = {};
            obj[key] = value;
            array.push(obj);
        });
        return array;
    }
};
//is both Raster and JSON
const grundakt_layer = {
    klassen:{},
    json_file:{},
    json_layer:'',
    raster_layer:'',
    getMapContainerObject:function(){
      $map = $('#grundaktmap');
      return $map;
    },
    getKlassen:function(){
      return this.klassen;
    },
    getJSONFile:function(){
      return this.json_file;
    },
    init:function(raumgl){
        disableElement('#datenalter','Nicht verfügbar');
        //hole JSON
        const object = this;
        let grundaktmap = $("#grundaktmap");
        if(indikatorauswahl.getSelectedIndiktorGrundaktState()) {
            if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete'
                && raumgliederung.getSelectedId() !== 'vwg'
                && raeumliche_analyseebene.getSelectionId()!=='vwg'
                && raumgliederung.getSelectedId() !== 'gem'
                && raeumliche_analyseebene.getSelectionId()!=='gem'
                && zeit_slider.getTimeSet() > 2000) {
                enableElement('#datenalter', 'Zeige die Karte des Datenalters an.');
                let def = $.Deferred(),
                    raumgliederung_set = raeumliche_analyseebene.getSelectionId();

                if (raumgl) {
                    raumgliederung_set = raumgl;
                }

                $.when(request_manager.getGeoJSON('Z00AG', zeit_slider.getTimeSet(), raumgliederung_set, gebietsauswahl.getSelection(),5,"gleich")).done(function(arr){
                    //now we have access to array of data
                    try{
                        object.json_file = JSON.parse(arr);
                    }catch(err){
                        object.json_file = arr
                    }

                    if (farbliche_darstellungsart.getSelectionId() === "auto") {
                        object.klassen = object.json_file.classes;
                    }

                    //no grunakt avaliable
                    if (typeof object.json_file["error"] !== 'undefined') {
                        $('#datenalter_container').hide();
                    }
                    //avaliable -> create the map isnide the legend
                    else {
                        $('#datenalter_container').show();
                        object.addToMap();
                    }
                });
            } else if(raeumliche_visualisierung.getRaeumlicheGliederung()==='raster'){
                enableElement('#datenalter', 'Zeige die Karte des Datenalters an.');
                $.ajax({
                    type: "GET",
                    url: urlparamter.getURL_RASTER() + 'php/datenalter.php',
                    data: {
                        Jahr: zeit_slider.getTimeSet(),
                        Kategorie: indikatorauswahl.getSelectedIndikatorKategorie(),
                        Indikator: indikatorauswahl.getSelectedIndikator(),
                        Raumgliederung: raeumliche_analyseebene.getSelectionId()
                    },
                    success: function (data) {
                        let txt_datenakt = data;
                        let x_datenakt = txt_datenakt.split('##');
                        let datenalter_mapfile = x_datenakt[0].replace(/^( +)/g, '');
                        let datenalter_legende = x_datenakt[1];
                        let datenalter_layer = x_datenakt[2];

                        $('#datenalter_container').show();
                       grundaktmap.empty();

                        grundaktlayer = new L.tileLayer.wms('https://maps.ioer.de/cgi-bin/mapserv_dv?Map=' + datenalter_mapfile,
                            {
                                layers: datenalter_layer,
                                cache: Math.random(),
                                version: '1.3.0',
                                format: 'image/png',
                                transparent: true,
                                id: "ioer"
                            });
                        let rect1 = {color: "#8CB91B", weight: 3, fillOpacity: 0};
                        let miniMapDiv = new L.Control.MiniMap(grundaktlayer, {
                            toggleDisplay: true,
                            zoomLevelOffset: -3,
                            aimingRectOptions: rect1
                        }).addTo(map);

                        grundaktmap.append(miniMapDiv.getContainer());
                        grundaktmap.find('.leaflet-control-minimap-toggle-display').remove();
                        $('#grundakt_legende').empty().load(datenalter_legende, function () {
                            let elements = $(this).find('img');
                            elements.each(function (key, value) {
                                let src = $(this).attr('src');
                                $(this).attr('src', "https://maps.ioer.de" + src);
                            });
                        });

                        grundaktmap.hover(function () {
                            $('#hover_info_grundaktmap').show();
                        }, function () {
                            setTimeout(function () {
                                $('#hover_info_grundaktmap').hide();
                            }, 2000);
                        });

                        let click = 0;
                        $('.grundaktmap_click').click(function () {
                            let grundaktlayer_set = new L.tileLayer.wms('https://maps.ioer.de/cgi-bin/mapserv_dv?Map=' + datenalter_mapfile,
                                {
                                    layers: datenalter_layer,
                                    cache: Math.random(),
                                    version: '1.3.0',
                                    format: 'image/png',
                                    transparent: true,
                                    id: "ioer"
                                });
                            if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
                                if (click == 0) {
                                    indikatorRasterGroup.clean();
                                    grundaktlayer_set.addTo(map);
                                    grundaktlayer_set.bringToFront();
                                    grundaktlayer_set.setOpacity(opacity_slider.getOpacity());
                                    click++;
                                } else {
                                    indikatorRasterGroup.clean();
                                    map.removeLayer(grundaktlayer_set);
                                    raster.addTo(map);
                                    click = 0;
                                }
                            }
                        });
                    }
                });
            }
        }
    },
    addToMap:function(geoJson,klassen) {
        const object = this;
        let grades = [],
            einheit,
            grundakt_map = object.getMapContainerObject(),
            geoJson_set = geoJson,
            klassen_set = klassen;

        if(!geoJson || typeof geoJson ==='undefined'){
            geoJson_set = object.json_file;
            klassen_set = object.klassen;
        }

        //let einheit = geoJson.feature[0].properties.einheit;
        $.each(geoJson_set.features, function (key, value) {
            if (key== 0) {
                einheit = String(value.properties.einheit);
            }
        });

        function getColor(d) {
            for (let i = 0; i < klassen_set.length; i++) {
                let obj = klassen_set[i],
                    obergrenze = obj.max,
                    untergrenze = obj.min;
                if (d.value <= obergrenze && d.value >= untergrenze) {
                    return obj.color;
                }
            }
        }

        function style(feature) {
            return {
                fillColor: getColor(feature.properties),
                weight: 0.1,
                opacity: 1,
                fillOpacity: 1,
                color: 'black'
            };
        }

        object.json_layer = new L.GeoJSON(geoJson_set, {
            style: style
        });

        jsongroup_grund.removeFrom(map);
        jsongroup_grund.addLayer(object.json_layer);

        $.each(klassen_set, function (key, value) {
            let minus_max = value.max,
                minus_min = value.min,
                round_max = (Math.round(minus_max * 100) / 100).toFixed(2),
                round_min = (Math.round(minus_min * 100) / 100).toFixed(2);
            grades.push({
                "max": round_max,
                "min": round_min,
                "farbe": value.color
            });
        });

        $('#grundakt_titel').text('Datenalter gegenüber ' + zeit_slider.getTimeSet() + ' (Jahren)');

        grades.reverse();
        let last = grades[grades.length - 1];

        $('#grundakt_legende').empty();

        $.each(grades, function (key, value) {
            $('#grundakt_legende').append('<div id="legende_grund_line"><i style="background:' + value.farbe + '"></i>' + '(' + key + ') ' + parseInt(value.max, 10) + '</div>');
        });

        $('#grundakt_leg').attr('src', '');

        //Quelle: https://github.com/Norkart/Leaflet-MiniMap
        //create the Minimap with the grundakt map inside
        let rect1 = {color: "#8CB91B", weight: 3, fillOpacity: 0};
        let miniMapDiv = new L.Control.MiniMap(jsongroup_grund, {
            toggleDisplay: true,
            aimingRectOptions: rect1,
            zoomLevelOffset: -3
        }).addTo(map);

        grundakt_map
            .empty()
            .append(miniMapDiv.getContainer())
            .find('.leaflet-control-minimap-toggle-display')
            .remove();

        //the hover function
        grundakt_map.hover(function () {
            $('#hover_info_grundaktmap').show();
        }, function () {
            setTimeout(function () {
                $('#hover_info_grundaktmap').hide();
            }, 2000);
        });

        let click_grundakt_map = 0;
        $('.grundaktmap_click').click(function () {
            if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                let last_clicked_layer = indikatorJSON.getJSONLayer();
                if (click_grundakt_map== 0) {
                    jsongroup.setStyle(style.disable);
                    jsongroup_grund.addTo(map);
                    jsongroup_grund.setStyle({fillOpacity: opacity_slider.getOpacity()});
                    click_grundakt_map++;
                } else {
                    jsongroup_grund.removeFrom(map);
                    jsongroup.setStyle(last_clicked_layer);
                    click_grundakt_map = 0;
                }
            }
        });
    }
};
/*contains the styling of the json maps*/
const style = {
    startMap:{
        color: "grey",
        weight: 2
    },
    autobahn:{
        weight: 3,
        opacity: 1,
        color: 'yellow'
    },
    fernbahnnetz:{
        weight: 3,
        opacity: 1,
        color: 'grey'
    },
    gewaesser:{
        weight: 1,
        opacity: 1,
        color: 'blue'
    },
    laendergrenzen:{
        weight: 2,
        opacity: 1,
        color: 'black',
        fillOpacity: 0,
        dashArray: '3'
    },
    kreisgrenzen:{
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0
    },
    gemeindegrenzen:{
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0
    },
    disable:{
        weight:0,
        opacity: 0,
        fillOpacity:0
    },
    getStandard:function(){
        return {
            weight: 0.25,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: opacity_slider.getOpacity()
        }
    },
    getActive:function(){
        return {
            weight: 5,
            color: '#8CB91B',
            dashArray: '',
            fillOpacity: opacity_slider.getOpacity()
        }
    },
    getLayerStyle:function(layer_value){
        let fillcolor = {fillColor: klassengrenzen.getColor(layer_value)};
        return $.extend({},fillcolor,this.getStandard());
    },
    getErrorStyle: function(){
        let bigStripes = new L.StripePattern({
            patternContentUnits: 'userSpaceOnUse',
            patternUnits: 'userSpaceOnUse',
            angle: 45,
            color: 'red'
        });
        bigStripes.addTo(map);
        return {
            fillPattern: bigStripes,
            weight: 0.25,
            opacity: 1,
            color: 'black',
            fillOpacity: 0.5
        };
    }
};
const klassengrenzen = {
    klassen: {},
    setKlassen: function(_klassen){this.klassen=_klassen;},
    getKlassen: function(){return this.klassen},
    getMax:function(){
        return Math.max.apply(Math, this.klassen.map(function (o) {
            return o.max;
        }));
    },
    getMin:function(){
        return Math.min.apply(Math, this.klassen.map(function (o) {
            return o.min;}));
    },
    getColor:function(layer_value){
        let klassenJson = this.getKlassen(),
            obergrenze_max = this.getMax(),
            untergrenze_min = this.getMin();

        for (let i = 0; i < klassenJson.length; i++) {
            let obj = klassenJson[i],
                max = klassenJson.length-1,
                obergrenze = obj.max,
                untergrenze = obj.min,
                value_ind = (Math.round(layer_value * 100) / 100).toFixed(2);

            if (value_ind <= obergrenze && value_ind >= untergrenze) {
                return obj.color;
            }
            else if (value_ind < untergrenze_min > 0) {
                return obj.color;
            }
            else if (value_ind === 0) {
                return obj.color;
            }
            else if (value_ind > obergrenze_max) {
                return klassenJson[max].color;
            }
            else if (value_ind === obergrenze_max) {
                return obj.color;
            }
        }
    },
    toString:function(){
        return JSON.stringify(this.klassen);
    }
};
const indikatorJSONGroup = {
    highlight:function(ags, fit_bounds){
        try {
            jsongroup.eachLayer(function (layer) {
                layer.eachLayer(function (layer) {
                    let ags_feature = layer.feature.properties.ags;
                    if (ags === ags_feature) {
                        if (fit_bounds) {
                            let bounds = layer.getBounds();
                            map.fitBounds(bounds);
                        }
                        layer.setStyle(style.getActive());
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                        return false;
                    } else {
                        return false;
                    }
                });
            });
        }catch(err){}
    },
    resetHightlight:function(){
        try {
            jsongroup.eachLayer(function (layer) {
                layer.eachLayer(function (layer) {
                    layer.setStyle(style.getLayerStyle(layer.feature.properties.value));
                    return false;
                });
            });
        }catch(err){}
    },
    fitBounds:function(){
        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
            map.setView(new L.LatLng(50.9307, 9.7558), 6.8);
        } else {
            try{
                map.fitBounds(jsongroup.getBounds());
            }catch(e){
                map.fitBounds(indikatorJSON.getJSONLayer().getBounds());
            }
        }
    },
    clean:function(){
        jsongroup.clearLayers();
        jsongroup_grund.clearLayers();
    },
    getLayerArray:function(exluded_areas){
        let ags_array = [];
        jsongroup.eachLayer(function (layer) {
            layer.eachLayer(function (layer) {
                //exclude by des
                let des = layer.feature.properties.spatial_class,
                    ags_feature = layer.feature.properties.ags,
                    name = layer.feature.properties.gen,
                    fc = layer.feature.properties.fc,
                    grundakt = layer.feature.properties.grundakt,
                    value = layer.feature.properties.value,
                    hc = layer.feature.properties.hc,
                    value_comma = layer.feature.properties.value_comma,
                    krs = function(){
                        if(layer.feature.properties.kreis){
                            return layer.feature.properties.kreis;
                        }
                    };
                if($.inArray(des,exluded_areas)===-1){
                    ags_array.push({
                        ags: ags_feature,
                        gen: name,
                        fc: fc,
                        grundakt: grundakt,
                        value: value,
                        hc: hc,
                        value_comma: value_comma,
                        des: des,
                        krs:krs()
                    });
                }
            });
        });
        return ags_array;
    }
};
const indikatorRasterGroup = {
  clean:function(_id){
      raster_group.eachLayer(function (layer) {
          if(_id) {
              if (layer.wmsParams.id === _id) {
                  map.removeLayer(layer);
              }
          }else{
              map.removeLayer(layer);

          }
      });
  }
};
const error_code = {
    error_code: false,
    error_color: '',
    setErrorCode:function(_error_code){this.error_code = _error_code;},
    getErrorCode:function(){return this.error_code;},
    setErrorColor:function(_error_color){this.error_color = _error_color;},
    getErrorColor:function(){return this.error_color;}
};