var jsongroup_grund = new L.FeatureGroup();
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
        helper.disableElement('#datenalter','Nicht verfügbar');
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
                helper.enableElement('#datenalter', 'Zeige die Karte des Datenalters an.');
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
                helper.enableElement('#datenalter', 'Zeige die Karte des Datenalters an.');
                $.ajax({
                    async:true,
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
                                    indikator_raster_group.clean();
                                    grundaktlayer_set.addTo(map);
                                    grundaktlayer_set.bringToFront();
                                    grundaktlayer_set.setOpacity(opacity_slider.getOpacity());
                                    click++;
                                } else {
                                    indikator_raster_group.clean();
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
                let last_clicked_layer = indikator_json.getJSONLayer();
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