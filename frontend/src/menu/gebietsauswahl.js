//Multi Choice Gebietsauswahl
var changed = false;
const gebietsauswahl = {
    mapLayer:[],
    mapLayerGrund:[],
    addedAGS:[],
    paramter:'ags_array',
    getParamter:function(){
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
    getMapLayer:function(){return this.mapLayer;},
    setMapLayer:function(array){this.mapLayer=array;},
    getMapLayerGrund:function(){return this.mapLayerGrund;},
    setMapLayerGrund:function(array){this.mapLayerGrund=array;},
    getSelection:function(){return this.addedAGS;},
    setSelection:function(array){this.addedAGS=array;},
    clearAddedAGS:function(){
        this.addedAGS = [];
        urlparamter.removeUrlParameter(this.paramter);
    },
    getDOMObject:function(){
        $menu = $('#dropdown_grenzen_container');
        return $menu;
    },
    getClearIconObject:function(){
        $elem = $("#clear_gebietsauswahl");
        return $elem;
    },
    init:function(){
        /*
        Extend the existing semntic ui Object with the needed callbacks
         */
        const object = this;
        let parameter_ags_set = this.getParamter();

        if (this.countTags()=== 0) {
            this.fill();
            if(typeof parameter_ags_set ==='undefined'){
                object.setParamter('');
            }
            //create parameter AGS_ARRAY if not set
            $('#grenzen_choice').text('Gebietsauswahl: ' + raeumliche_analyseebene.getSelectionText().replace("- nur", ""));
            this.controller.set();
        }else{
            raumgliederung.init();
        }
    },
    addSelectedLayersToMap:function(){
        $.each(this.getMapLayer(), function (key, value) {
            indikator_json.addToMap(value, klassengrenzen.getKlassen());
        });
        $.each(this.getMapLayerGrund(), function (key, value) {
            grundakt_layer.controller.addGeoJSONLayer({jsonFile:value, klassen:grundakt_layer.getKlassen()});
        });
        indikator_json_group.fitBounds();
    },
    removeSelectedLayersFromMap:function(value){
        indikator_json_group.clean();
        let mapLayer = this.getMapLayer(),
            mapLayer_grund = this.getMapLayerGrund(),
            ags_array= this.getSelection();
        for (let i = 0; i < mapLayer.length; i++) {
            if (mapLayer[i].properties.ags == value) {
                mapLayer.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < mapLayer_grund.length; i++) {
            if (mapLayer_grund[i].properties.ags == value) {
                mapLayer_grund.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < ags_array.length; i++) {
            if (ags_array[i] == value) {
                ags_array.splice(i, 1);
                break;
            }
        }
        this.updateParamter(ags_array.toString());
        this.setMapLayer(mapLayer);
        this.setMapLayerGrund(mapLayer_grund);
        this.setSelection(ags_array);
        if(raumgliederung.getSelectionId()) {
            indikator_json.init(raumgliederung.getSelectionId());

        }else{
            this.addSelectedLayersToMap();
        }
        indikator_json_group.fitBounds();
    },
    fill:function(){
        let items = {values:[]},
            selection = this.getDOMObject().dropdown('get value').split(','),
            json_set = indikator_json.getJSONFile();
        for (let i = 0; i < json_set.features.length; i++) {
            let gen = json_set.features[i].properties.gen,
                ags = json_set.features[i].properties.ags,
                fc = json_set.features[i].properties.fc;
            //items.push('<div class="item item_ddm_grob" data-value="'+ags+'" data-sort="'+gen+'">'+gen+'</div>');
            if(fc===0 || typeof fc !=='undefined' && $.inArray(ags,selection)===-1) {
                items['values'].push({
                    text: gen,
                    value: ags,
                    name: gen
                });
            }
        }
        items['values'].sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        this.getDOMObject().dropdown('setup menu',items);
    },
    clear:function(){this.getDOMObject().dropdown('clear')},
    countTags:function(){
        let tags =  this.getDOMObject().find('a');
        return tags.length;
    },
    getSelectionAsString:function(){
        let string ='';
        this.getDOMObject().find('a').each(function(){
            string +=$(this).text()+",";
        });
        return string.slice(0, -1);
    },
    controller:{
        set:function(){
            let mapLayer = [],
                mapLayer_grund = [],
                ags_array = [],
                menu =  gebietsauswahl.getDOMObject(),
                geoJson = indikator_json.getJSONFile();

            menu
                .unbind()
                .dropdown({
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        //close after each choice
                        menu.dropdown('hide');
                        indikator_json_group.clean();
                        //update the paramter
                        ags_array.push(addedValue);
                        if(indikator_json_group.getLayerArray().length!==ags_array.length) {
                            gebietsauswahl.updateParamter(ags_array.toString());
                        }
                        $.each(geoJson.features, function (key, value) {
                            $.each(value, function (_key, _value) {
                                if (_value.ags === addedValue) {
                                    mapLayer.push(value);
                                }
                            });
                        });
                        //only if possible
                        try {
                            $.each(grundakt_layer.getJSONFile().features, function (key, value) {
                                $.each(value, function (_key, _value) {
                                    if (_value.ags === addedValue) {
                                        mapLayer_grund.push(value);
                                    }
                                });
                            });
                        } catch (err) {}
                        gebietsauswahl.setMapLayer(mapLayer);
                        gebietsauswahl.setMapLayerGrund(mapLayer_grund);
                        gebietsauswahl.setSelection(ags_array);
                        if(raumgliederung.getSelectionId() && !page_init){
                            indikator_json.init(raumgliederung.getSelectionId());
                        }else {
                            //add the selected spatial areas to the map
                            gebietsauswahl.addSelectedLayersToMap();
                            table.fill();
                            raumgliederung.init();
                        }
                    },
                    onRemove: function (removedValue, removedText, $removedChoice) {
                        //changed: prevend Trigger
                        let value = removedValue;
                        if (gebietsauswahl.countTags() > 1 && changed == false) {
                            gebietsauswahl.removeSelectedLayersFromMap(value);
                        }else{
                            if(changed === false) {
                                $.when(raumgliederung.removeParameter())
                                    .then(gebietsauswahl.removeParamter())
                                    .then(gebietsauswahl.clearAddedAGS())
                                    .then(indikator_json.init())
                                    .then(raumgliederung.init());
                            }
                        }
                        $("tr[id^='"+value+"']").remove();
                    }
                });

            gebietsauswahl.getClearIconObject()
                .unbind()
                .click(function(){
                    raumgliederung.removeParameter();
                    gebietsauswahl.clear();
                    indikator_json_group.fitBounds();
                    raumgliederung.hide();
                    TableSelection.clearSelection();
                });
        }
    }
};