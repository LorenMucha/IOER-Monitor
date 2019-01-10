var raster_group = new L.layerGroup();
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
                    indikator_raster_group.clean(_seite);
                    object.raster_layer.setParams({id: _seite}, false);
                    raster_split.getController().setRightLayers(object.raster_layer.addTo(map));
                } else {
                    object.raster_layer.setParams({id: 'links'}, false);
                    if (raster_split.getState()) {
                        indikator_raster_group.clean('links');
                        raster_split.getController().setLeftLayers(object.raster_layer.addTo(map));
                    } else {
                        indikator_raster_group.clean();
                        indikator_json_group.clean();
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
                map_header.set();
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