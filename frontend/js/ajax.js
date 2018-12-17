let url_backend = urlparamter.getURL_SVG()+"backend";
const request_manager={
    call:false,
    url_backend:urlparamter.getURL_SVG()+"backend/query.php",
    //get the indicator-JSON
    getGeoJSON:function(ind,time,_raumgliederung,ags_array,_klassenanzahl,_klassifizierung){
        let colors = function(){
                let max = farbschema.getHexMax(),
                    min = farbschema.getHexMin(),
                    string = '';
                if(max.length >0){
                    string = ',"colors":{"max":"'+max+'","min":"'+min+'"}';
                }
                return string;
            },
            json = JSON.parse('{"ind":{"id":"'+ind+
                '","time":"'+time+
                '","raumgliederung":"'+_raumgliederung+
                '","ags_array":"'+ags_array.toString()+
                '","klassifizierung":"'+_klassifizierung+
                '","klassenzahl":"'+_klassenanzahl+'"'+
                colors()+
                '},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+
                '"},"query":"getJSON"}');
        return this.makeRequest({"file":json,"query":"getGeoJSON","type":"POST","debug":false});
    },
    //check if a indicator is possible to view in the the given kind of visualization (gebiete/raster)
    getAvabilityIndicator:function(_ind){
        let ind = indikatorauswahl.getSelectedIndikator();
        if(_ind){ind=_ind;}
        let json = JSON.parse('{"ind":{"id":"'+ind+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getAvability"}');
        return this.makeRequest({"file":json,"query":"getAvabilityIndicator","type":"POST","debug":false});
    },
    //get all avaliable indicators
    getAllAvaliableIndicators:function(){
        const manager = this;
        let json = JSON.parse('{"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getAllIndicators"}');
        console.log(JSON.stringify(json));
        return manager.makeRequest({"file":json,"query":"getAllAvaliableIndicators","type":"POST","debug":false});
    },
    //get the possible time`s
    getJahre:function(ind){
        let ind_set = indikatorauswahl.getSelectedIndikator();
        if(ind){
            ind_set = ind;
        }
        let json = JSON.parse('{"ind":{"id": "'+ind_set+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getYears"}');
        return this.makeRequest({"file":json,"query":"getJahre","type":"POST","debug":false});

    },
    //get the possible spatial extends for a indicator
    getRaumgliederung:function(ind){
        let ind_set = indikatorauswahl.getSelectedIndikator();
        if(ind){
            ind_set = ind;
        }
        let json = JSON.parse('{"ind":{"id":"'+ind_set+
            '","time":"'+zeit_slider.getTimeSet()+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+
            '"},"query":"getSpatialExtend"}');
        return this.makeRequest({"file":json,"query":"getRaumgliederung","type":"POST","debug":false});
    },
    //get colors to give the user the possibility to manipulate the color of the indicator map
     getColorSchema:function(color_array){
        const manager = this;
        let json = JSON.parse('{"ind":{"klassenzahl":"'+klassenanzahl.getSelection()+
                                    '","colors":{"max":"'+color_array[0]+
                                        '","min":"'+color_array[1]+
                                        '"}},"query":"getColorSchema"}');
         return manager.makeRequest({"file":json,"query":"getColorSchema","type":"POST","debug":false});
    },
    //get the sum of geometries to show them inside the loading bar
    getCountGeometries:function(raumgliederung){
        let json = JSON.parse('{"ind":{"klassenzahl":"'+klassenanzahl.getSelection()+'","time":"'+zeit_slider.getTimeSet()+
                                    '","ags_array":"'+gebietsauswahl.getSelection()+
                                    '","raumgliederung":"'+raumgliederung+'"},"query":"countgeometries"}');
        return this.makeRequest({"file":json,"query":"getCountGeometries","type":"POST","debug":false});
    },
    //get overlays like autobahn, train, communal borders, rivers
    getZusatzlayer:function(layer){
        let json = JSON.parse('{"ind":{"zusatzlayer":"'+layer+'"},"query":"getzusatzlayer"}');
        return this.makeRequest({"file":json,"query":"getZusatzlayer","type":"POST","debug":false});
    },
    //get the needed values to expand the table, has it´s own parameters, because the logic is slightly different
    getTableExpandValues:function(expand_values,ags_array){
        let ags_set = indikatorJSONGroup.getLayerArray(table.excludedAreas);
        let raumgliederung_set = raeumliche_analyseebene.getSelectionId();
        if(raumgliederung.getSelectedId()){raumgliederung_set=raumgliederung.getSelectedId();}
        //optional ags array must include ags object {ags:01}
        if(ags_array){
            ags_set = ags_array;
        }
        let json = JSON.parse('{"ind":{"id":"'+indikatorauswahl.getSelectedIndikator()+'","time":"'+zeit_slider.getTimeSet()+
            '","raumgliederung":"'+raumgliederung_set+'"},"expand_values":'+JSON.stringify(expand_values)+',"ags_array":'+JSON.stringify(ags_set)+',"query":"getTableExpandValues"}');
        console.log('{"ind":{"id":"'+indikatorauswahl.getSelectedIndikator()+'","time":"'+zeit_slider.getTimeSet()+
            '","raumgliederung":"'+raumgliederung_set+'"},"expand_values":'+JSON.stringify(expand_values)+',"ags_array":'+JSON.stringify(ags_set)+',"query":"getTableExpandValues"}');
        return this.makeRequest({"file":json,"query":"getTableExpandValues","type":"POST","debug":false});
    },
    makeRequest:function(json){
        const manager = this;
        this.call= $.ajax({
            type: json.type,
            url: manager.url_backend,
            data: {
                values: JSON.stringify(json.file)
            },
            error:function(xhr, ajaxOptions, thrownError){
                manager.onError( thrownError,json.query,this.url);
            },
            success:function(data){
                if(json.debug){
                    console.log(this.url);
                    console.log(data);
                }
            }
        });
        return this.call;
    },
    cancel:function(){
        this.call.abort();
    },
    onError:function( thrownError,function_name,url){
        console.log("Error in: "+function_name);
        progressbar.remove();
        console.log(url);
        console.log(thrownError);
        alertError();
    }
};
function getRasterMap(time,ind,_raumgliederung,klassifizierung,klassenanzahl,darstellung_map,_seite){
    return $.ajax({
        type: "GET",
        url: urlparamter.getURL_RASTER()+"php/map/create_raster.php",
        cache: false,
        data: {
            Jahr: time,
            Indikator: ind,
            Raumgliederung: _raumgliederung,
            Klassifizierung: klassifizierung,
            AnzKlassen: klassenanzahl,
            Darstellung: darstellung_map,
            hex_min: farbschema.getHexMin(),
            hex_max: farbschema.getHexMax(),
            seite: _seite
        }
    });
}
//dialog
function getStatistik(ags, name, wert){
    let raumgliederung_txt = raeumliche_analyseebene.getSelectionText();
    //set the value if Raumgl fein was set
    if(raumgliederung.getSelectedId() != null){
        raumgliederung_txt = raumgliederung.getSelectionText();
    }
    return $.ajax({
        url: url_backend+"/dialog/statistik.php",
        type: "POST",
        data: {
            ags: ags,
            name: name,
            wert: wert,
            einheit:indikatorauswahl.getIndikatorEinheit(),
            raumgliederung_name: raumgliederung_txt,
            raeumliche_ausdehnung:gebietsauswahl.getSelectionAsString(),
            indikator:indikatorauswahl.getSelectedIndikator(),
             jahr:zeit_slider.getTimeSet(),
            map_array:indikatorJSONGroup.getLayerArray(),
        },
        success:function(){
            console.log(this.url);
        }
    });
}
