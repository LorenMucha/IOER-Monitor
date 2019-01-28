const indikator_json = {
    json_layer : '',
    json_file:'',
    hover:true,
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

        progressbar.init();
        indikator_raster_group.clean();
        indikator_json_group.clean();

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
                table.create();
                gebietsauswahl.init();
                //add the farbschema
                var interval = setInterval(function () {
                    if (indikatorauswahl.getPossebilities()) {
                        clearInterval(interval);
                        //add the farbschema
                        farbschema.init();
                        grundakt_layer.init(raumgliederung_set);
                        legende.fillContent();
                    }
                }, 100)
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
        map_header.set();
        if($('.right_content').is(":hidden")){
            progressbar.remove();
        }
        if(layer_control.zusatzlayer.getState()){layer_control.zusatzlayer.setForward()}
    },
    setPopUp:function(e){
        let text={
                de:{
                    profil:"Indikatorwertübersicht",
                    profil_title:"Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren",
                    stat:"Statistik",
                    stat_title:"Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators",
                    trend:dev_chart.text[language_manager.getLanguage()].title[false],
                    trend_title:"Veränderung der Indikatorwerte für die Gebietseinheit",
                    compare:dev_chart.text[language_manager.getLanguage()].title[true],
                    compare_title:"Veränderung der Indikatorwerte für die Gebietseinheit"
                },
                en:{
                    profil:"Indicator value overview",
                    profil_title:"Area profile: Characteristic of this room unit with value overview of all indicators",
                    stat:"Statistics",
                    stat_title:"Indicator value of the territorial unit in relation to statistical characteristics of the spatial selection and the selected indicator",
                    trend:"Trend Indicator",
                    trend_title:"Change in indicator values for the area unit",
                    compare:"Trend comparison",
                    compare_title:"Change in indicator values for the area unit"
                }
            },
            lan = language_manager.getLanguage(),
            layer = e.target,
            gen = layer.feature.properties.gen.toString(),
            value_ags = layer.feature.properties.value_comma,
            einheit = layer.feature.properties.einheit,
            ags = layer.feature.properties.ags,
            grundakt = $('#'+ags).find('.td_akt').text(),
            val_d = helper.dotTocomma(value_ags),
            //fc = Fehlercode
            fc = layer.feature.properties.fc.toString(),
            div,
            id_popup = ags.toString().replace(".",""),
            gebietsprofil = `<div><img id="pop_up_gebietsprofil_${id_popup}" title="${text[lan].profil_title}" src="frontend/assets/icon/indikatoren.png"/><b> ${text[lan].profil}</b></div>`,
            statistik = `<div><img title="${text[lan].stat_title}" id="pop_up_diagramm_ags_${id_popup}" src="frontend/assets/icon/histogramm.png"/><b>  ${text[lan].stat}</b></div>`,
            indikatorwertentwicklung = `<div><img class="dev_chart_trend" id="pop_up_diagramm_ind_ags_${id_popup}" title="${text[lan].trend_title}" src="frontend/assets/icon/indikatoren_verlauf.png"/><b class="dev_chart_trend">  ${text[lan].trend}</b></div>`,
            entwicklungsdiagramm = `<div><img class="dev_chart_compare" id="pop_up_diagramm_entwicklung_ags_${id_popup}" title="${text[lan].compare}" src="frontend/assets/icon/indikatoren_diagr.png"/><b class="dev_chart_compare">  ${text[lan].compare}</b></div>`;

        //remove chart on mobile phones to save space
        if(main_view.getMobileState()) {
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

        //disable charts for community level
        if(raumgliederung.getSelectedId()==='gem' || raeumliche_analyseebene.getSelectionId()==='gem'){
            helper.disableElement(".dev_chart_compare","Steht für die Gemeindeebene nicht zur Verfügung");
            helper.disableElement(".dev_chart_trend","Steht für die Gemeindeebene nicht zur Verfügung");
        }

    },
    /*/
    Set a Marker on the map with Lat Lon and Title f.eg. used inside the geographic search to tick the result inside the map
     */
    setMarker:function(lat,lng,title){
        if(!title){
            title = "<b>"+lat+" "+lon+"</b>"
        }
        let icon = L.icon({iconUrl:"frontend/assets/icon/marker-icon.png",shadowUrl:"frontend/assets/icon/marker-shadow.png"});
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
            error.setErrorCode(text);
            return style.getErrorStyle();
        }
    },
    highlightFeatureOnmouseover:function(e) {
            let layer = e.target;
            if(indikator_json.hover) {
                layer.setStyle(style.getActive());
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
            }
            //highlight element in legend
            try {
                let fillcolor = layer.options.fillColor.replace('#', '');
                $('#legende_' + fillcolor + " i").css({
                    "width": "20px",
                    "height": "15px",
                    "border": "2px solid " + farbschema.getColorActive()
                });
            } catch (err) {
            }
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