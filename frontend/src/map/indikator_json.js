const indikator_json = {
    json_layer : false,
    json_file:false,
    ags_count:false,
    getJSONLayer:function(){
        return this.json_layer;
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
        grundakt_layer.remove();

        if (raumgl) {
            raumgliederung_set = raumgl;
        }
        if (gebietsauswahl.countTags() === 0) {
            ags_set = [];
        }

        //info how much geomtries will be created and afterwards stat the creation
        $.when(RequestManager.getCountGeometries(raumgliederung_set)).done(function (x) {
                var interval = setInterval(function () {
                    if (progressbar.getContainer().is(":visible")) {
                        clearInterval(interval);
                        indikator_json.ags_count = x[0].count;
                        progressbar.setHeaderText("Lade " + x[0].count + " Gebiete");
                    }
                },10);
        });

        $.when(RequestManager.getGeoJSON(ind, time, raumgliederung_set, ags_set,klassenanzahl.getSelection(),klassifzierung.getSelectionId()))
            .done(function(arr){
                //now we have access to array of data
                try{
                    object.json_file = JSON.parse(arr);
                }catch(err){
                    object.json_file = arr
                }

                if (farbliche_darstellungsart.getSelectionId() === "auto"
                    //error handling, if first view and no classes are set
                    || typeof klassengrenzen.getKlassen().length==="undefined") {
                    klassengrenzen.setKlassen(object.json_file.classes);
                }

                object.addToMap();
                //add the farbschema if indicator ddm is loaded
                var interval = setInterval(function () {
                    //if all indictaor values are ready
                    if (indikatorauswahl.getPossebilities()) {
                        clearInterval(interval);
                        //add the farbschema
                        farbschema.init();
                        table.fill();
                        gebietsauswahl.init();
                        if(exclude.checkPerformanceAreas()) {
                            grundakt_layer.addToLegende({raumgl:raumgliederung_set});
                        }
                        legende.fillContent();
                        page_init = false;
                        //set the callback
                        if (callback) callback();
                    }
                    //if table is ready
                }, 100);
            });
    },
    addToMap:function(geoJson_set, klassenJson_set){
        const object = this;
        let geoJson = this.json_file;
        //close all existing popus
        this.closePopUp();
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
        //add the layer to map
        indikator_json_group.add(object.json_layer);
        indikator_json_group.addToMap();
        //create the banner
        map_header.set();
        if(additiveLayer.zusatzlayer.getState()){additiveLayer.zusatzlayer.setForward()}
    },
    setPopUp:function(e){
        let text={
                de:{
                    profil:"Wertübersicht",
                    profil_title:"Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren",
                    stat:"Statistik",
                    stat_title:"Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators",
                    trend:dev_chart.text[language_manager.getLanguage()].title[false],
                    trend_title:"Veränderung der Indikatorwerte für die Gebietseinheit",
                    compare:dev_chart.text[language_manager.getLanguage()].title[true],
                    compare_title:"Veränderung der Indikatorwerte für die Gebietseinheit"
                },
                en:{
                    profil:"Indicator value overview",
                    profil_title:"Characteristic of this room unit with value overview of all indicators",
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
            val_d = helper.dotTocomma(value_ags),
            //fc = Fehlercode
            fc = layer.feature.properties.fc.toString(),
            div,
            id_popup = ags.toString().replace(".",""),
            gebietsprofil = `<div class="cursor w-100" id="pop_up_gebietsprofil_${id_popup}">
                                <b class="float-right w-75 wordbreak">${text[lan].profil}</b>
                                <img title="${text[lan].profil_title}" 
                                     style="margin-right: .5vh;" 
                                     src="frontend/assets/icon/indikatoren.png"/>
                             </div>`,
            statistik = `<div class="cursor w-100" id="pop_up_diagramm_ags_${id_popup}">
                              <b class="float-right w-75">${text[lan].stat}</b>
                              <img title="${text[lan].stat_title}" 
                                src="frontend/assets/icon/histogramm.png"/>
                         </div>`,
            indikatorwertentwicklung = `<div class="dev_popup mobile_hidden dev_chart_trend oneTime ${exclude.class_performance} cursor w-100" 
                                             id="pop_up_diagramm_ind_ags_${id_popup}">
                                            <b class="float-right w-75">${text[lan].trend}</b>
                                            <img data-title="${text[lan].trend_title}" 
                                                title="${text[lan].trend_title}"
                                                style="margin-right: 1.3vh;" 
                                                src="${dev_chart.icon.single.path}"/>
                                        </div>`,
            entwicklungsdiagramm = `<div class="dev_popup mobile_hidden dev_chart_compare ${exclude.class_performance} oneTime cursor w-100" 
                                            id="pop_up_diagramm_entwicklung_ags_${id_popup}" >
                                            <b class="wordbreak float-right w-75">${text[lan].compare}</b>
                                            <img data-title="${text[lan].compare}" 
                                                title="${text[lan].compare}"
                                                style="margin-right: 1.3vh;"  
                                                src="${dev_chart.icon.multiple.path}"/>
                                    </div>`;


        if(fc !== '0') {
            //get the single values of each fc
            let arr = fc.split("||");
            let text = arr[2];
            let color = arr[1];
            div = $(`<div class="PopUp">
                        <div><b style="color:red">${text}</b></div>
                    </div>`)[0];
        }else{
            div =  $(`<div class="PopUp inline-block w-100">
                        <div class="w-100">
                            <div><b>${gen}</b></div>
                             <hr class="hr"/> 
                            <div><b>Indikatorwert:</b> ${val_d} ${einheit}</div>
                        </div> 
                        <div style="margin-top: 1vh;">
                            ${gebietsprofil}
                            ${statistik}
                            ${indikatorwertentwicklung}
                            ${entwicklungsdiagramm}
                        </div>
                        </div>`)[0];
        }

        let bounds = layer.getBounds();
        let popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(div)
            .openOn(map);

        $(document).on('click','#pop_up_gebietsprofil_'+id_popup,function(){
            area_info.open(ags,gen);
        });

        $(document).on('click','#pop_up_diagramm_ags_'+id_popup,function(){
            statistics.chart.settings.ags=ags;
            statistics.chart.settings.name=gen;
            statistics.chart.settings.ind=indikatorauswahl.getSelectedIndikator();
            statistics.chart.settings.allValuesJSON  = indikator_json.getJSONFile();
            statistics.chart.settings.indText=indikatorauswahl.getSelectedIndikatorText();
            statistics.chart.settings.indUnit=indikatorauswahl.getIndikatorEinheit();
            statistics.open();
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
        //disbale chart fdor excluded areas, needs to place here and not in exclude because of it´s dynamic content
        if(!exclude.checkPerformanceAreas()){
            helper.disableElement(`#pop_up_diagramm_entwicklung_ags_${id_popup}`,exclude.disable_text);
            helper.disableElement(`#pop_up_diagramm_ind_ags_${id_popup}`,exclude.disable_text);
        }else{
            helper.enableElement(`#pop_up_diagramm_entwicklung_ags_${id_popup}`,$(`#pop_up_diagramm_entwicklung_ags_${id_popup}`).data("title"));
            helper.enableElement(`#pop_up_diagramm_ind_ags_${id_popup}`,$(`#pop_up_diagramm_ind_ags_${id_popup}`).data("title"));
        }
        //disable chart for single time shift
        if(zeit_slider.getTimes().length===1){
            helper.disableElement(".dev_popup",exclude.disable_text);
        }
    },
    closePopUp:function(){
        try {
            map.closePopup();
        }catch(err){}
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
        let fc = feature.properties.fc;
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
            indikator_json_group.highlight(e.target.feature.properties.ags);
    },
    resetHighlight: function(e) {
        indikator_json_group.resetHightlight(e.target.feature.properties.ags);
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