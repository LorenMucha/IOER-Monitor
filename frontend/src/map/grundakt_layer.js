const grundakt_layer = {
    klassen:{},
    json_file:false,
    json_layer:false,
    raster_layer:false,
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
    remove:function(){
      try{
         map.removeLayer(this.json_layer);
      }catch(err){throw err}
      try{
          map.removeLayer(this.raster_layer);
      }catch(err){throw err}
    },
    addToLegende:function(settings) {
        //-----------------------------------------------------------
        const object = this;
        let grundaktmap = $("#grundaktmap"),
            grundakt_title= $('#grundakt_titel'),
            raumgliederung_set = raeumliche_analyseebene.getSelectionId();

        //diabled for gem and vwg to save performance
        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete'
            && zeit_slider.getTimeSet() > 2000
            && exclude.checkPerformanceAreas()) {

            if (settings.raumgl) {
                raumgliederung_set = settings.raumgl;
            }

            $.when(RequestManager.getGeoJSON('Z00AG', zeit_slider.getTimeSet(), raumgliederung_set, gebietsauswahl.getSelection(),5,"gleich")).done(function(arr){
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
                    object.controller.addGeoJSONLayer();

                }//else
            });//ajax
        }
        else if(raeumliche_visualisierung.getRaeumlicheGliederung()==='raster'){
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
                    let x_datenakt = data.split('##');
                    let datenalter_mapfile = x_datenakt[0].replace(/^( +)/g, '');
                    let datenalter_legende = x_datenakt[1];
                    let datenalter_layer = x_datenakt[2];

                    $('#datenalter_container').show();
                    grundaktmap.empty();

                    grundakt_layer.raster_layer = new L.tileLayer.wms('https://maps.ioer.de/cgi-bin/mapserv_dv?Map=' + datenalter_mapfile,
                        {
                            layers: datenalter_layer,
                            cache: Math.random(),
                            version: '1.3.0',
                            format: 'image/png',
                            transparent: true,
                            id: "ioer"
                        });
                    let rect1 = {color: "#8CB91B", weight: 3, fillOpacity: 0};
                    let miniMapDiv = new L.Control.MiniMap(grundakt_layer.raster_layer, {
                        toggleDisplay: true,
                        zoomLevelOffset: -3,
                        aimingRectOptions: rect1
                    }).addTo(map);

                    grundakt_title.text('Datenalter gegenüber ' + zeit_slider.getTimeSet() + ' (Jahren)');

                    grundaktmap.append(miniMapDiv.getContainer());
                    grundaktmap.find('.leaflet-control-minimap-toggle-display').remove();
                    $('#grundakt_legende')
                        .empty()
                        .load(datenalter_legende, function () {
                            let elements = $(this).find('img');
                            elements.each(function (key, value) {
                                let src = $(this).attr('src');
                                $(this).attr('src', "https://maps.ioer.de" + src);
                            });
                        });
                    grundakt_layer.controller.set();
                }
            });
        }else{
            $('#datenalter_container').hide();
        }
    },
    controller:{
        set:function(){
            let click = 0,
                get_grund_layer =function(){
                    if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster") {
                        return cloneLayer(grundakt_layer.raster_layer);
                    }else{
                        return grundakt_layer.json_layer;
                    }
                },
                grund_layer = get_grund_layer(),
                setRaster=function(){
                    indikator_raster_group.clean();
                    grund_layer.addTo(map);
                    grund_layer.bringToFront();
                    opacity_slider.setOpacity();
                },
                removeRaster=function(){
                    map.removeLayer(grund_layer);
                    map.addLayer(indikator_raster.getRasterLayer());
                    click = 0;
                },
                setSVG=function(){
                    indikator_json_group.clean();
                    console.log(grund_layer);
                    grund_layer.addTo(map);
                    grund_layer.bringToFront();
                    opacity_slider.setOpacity();
                },
                removeSVG=function(){
                    map.removeLayer(grund_layer);
                    indikator_json_group.add(indikator_json.getJSONLayer());
                    indikator_json_group.addToMap();
                    click = 0;
                },
                setLayer=function(){
                    let gliederung = raeumliche_visualisierung.getRaeumlicheGliederung();
                    if(click==0){
                        if(gliederung==="raster"){
                            setRaster();
                        }else{
                            setSVG();
                        }
                        click++;
                    }else{
                        if(gliederung==="raster"){
                            removeRaster();
                        }else{
                            removeSVG();
                        }
                        click=0;
                    }
                };
            $('.grundaktmap_click')
                .unbind()
                .click(function () {
                    setLayer();
            });
        },
        //method to add a single JSON to the mini-map, by set {settings.jsonFile and settings.klassen}
        addGeoJSONLayer:function(settings){
            //try{
                const object = grundakt_layer;
                let grades = [],
                    einheit,
                    grundakt_map = object.getMapContainerObject(),
                    grundakt_title= $('#grundakt_titel');

                if(settings && settings.jsonFile && settings.klassen){
                    object.json_file = settings.jsonFile;
                    object.klassen = settings.klassen;
                }

                //let einheit = geoJson.feature[0].properties.einheit;
                $.each(object.json_file.features, function (key, value) {
                    if (key == 0) {
                        einheit = String(value.properties.einheit);
                    }
                });

                function getColor(d) {
                    for (let i = 0; i < object.klassen.length; i++) {
                        let obj = object.klassen[i],
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

                grundakt_layer.json_layer = new L.GeoJSON(object.json_file, {
                    style: style
                });

                $.each(object.klassen, function (key, value) {
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

                grundakt_title.text('Datenalter gegenüber ' + zeit_slider.getTimeSet() + ' (Jahren)');

                grades.reverse();
                let last = grades[grades.length - 1];

                $('#grundakt_legende').empty();

                //create the grundakt Legende
                $.each(grades, function (key, value) {
                    $('#grundakt_legende').append(`<div id="legende_grund_line">
                                                                <i style="background:${value.farbe}"></i>
                                                                (${key}) ${parseInt(value.max, 10)}
                                                            </div>`);
                });

                //Quelle: https://github.com/Norkart/Leaflet-MiniMap
                //create the Minimap with the grundakt map inside
                let rect1 = {color: "#8CB91B", weight: 3, fillOpacity: 0};
                let miniMapDiv = new L.Control.MiniMap(grundakt_layer.json_layer, {
                    toggleDisplay: true,
                    aimingRectOptions: rect1,
                    zoomLevelOffset: -3
                }).addTo(map);

                grundakt_map
                    .empty()
                    .append(miniMapDiv.getContainer())
                    .find('.leaflet-control-minimap-toggle-display')
                    .remove();

                grundakt_layer.controller.set();

        /*}catch(err){
            legende.datenalter.hide();
        }*/
    }
    }
};
