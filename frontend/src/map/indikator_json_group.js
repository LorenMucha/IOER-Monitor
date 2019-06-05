var jsongroup = new L.FeatureGroup();
const indikator_json_group = {
    //for highlighting layer on table mouseover
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
                        layer.setStyle(style.getHover());
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                        let fillcolor = layer.options.fillColor.replace('#', '');
                        $('#legende_' + fillcolor + " i").css({
                            "width": "20px",
                            "height": "15px",
                            "border": "2px solid " + farbschema.getColorHexActive()
                        });
                    }
                });
            });
        }catch(err){
            console.error(err);
        }
    },
    resetHightlight:function(){
        try {
            let ags_selection = TableSelection.getSelection();
            jsongroup.eachLayer(function (layer) {
                layer.eachLayer(function (layer) {
                    let ags = layer.feature.properties.ags,
                        test_select = function(){
                            return $.inArray(ags.toString(), ags_selection) >= 0;
                        };
                    if(!test_select()) {
                        layer.setStyle(style.getLayerStyle(layer.feature.properties.value));
                    }
                    let fillcolor = layer.options.fillColor.replace('#', '');
                    $('#legende_' + fillcolor + " i").css({"width": "15px", "height": "10px", "border": ""});
                });
            });
        }catch(err){
            console.error(err);
        }finally {
            additiveLayer.zusatzlayer.setForward();
        }
    },
    fitBounds:function(){
        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
            map.setView(new L.LatLng(50.9307, 9.7558), 6.8);
        } else {
            try{
                map.fitBounds(jsongroup.getBounds());
            }catch(e){
                map.fitBounds(indikator_json.getJSONLayer().getBounds());
            }
        }
    },
    clean:function(){
        jsongroup.clearLayers();
    },
    add:function(layer){
        jsongroup.addLayer(layer);
    },
    addToMap(){
      jsongroup.addTo(map);
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
    },
    getAGSArray:function(){
        let values = [];
        jsongroup.eachLayer(function (layer) {
            layer.eachLayer(function (layer) {
                let ags_feature = layer.feature.properties.ags,
                    name = layer.feature.properties.gen;
                values.push({id:ags_feature,name:name});
            });
        });
        return values;
    }
};