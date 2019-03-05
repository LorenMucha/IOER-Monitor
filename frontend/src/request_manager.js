const request_manager={
    call:false,
    url_backend:urlparamter.getURLMonitor()+"backend/query.php",
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
        return this.sendRequestPHP({"file":json,"query":"getGeoJSON","type":"POST","debug":false});
    },
    //check if a indicator is possible to view in the the given kind of visualization (gebiete/raster)
    getAvabilityIndicator:function(_ind){
        let ind = indikatorauswahl.getSelectedIndikator();
        if(_ind){ind=_ind;}
        let json = JSON.parse('{"ind":{"id":"'+ind+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getAvability"}');
        return this.sendRequestPHP({"file":json,"query":"getAvabilityIndicator","type":"POST","debug":false});
    },
    //get all avaliable indicators
    getAllAvaliableIndicators:function(){
        const manager = this;
        let json = JSON.parse('{"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getAllIndicators"}');
        return manager.sendRequestPHP({"file":json,"query":"getAllAvaliableIndicators","type":"POST","debug":false});
    },
    //get the possible time`s
    getJahre:function(ind){
        let ind_set = indikatorauswahl.getSelectedIndikator();
        if(ind){
            ind_set = ind;
        }
        let json = JSON.parse('{"ind":{"id": "'+ind_set+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getYears"}');
        return this.sendRequestPHP({"file":json,"query":"getJahre","type":"POST","debug":false});

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
        return this.sendRequestPHP({"file":json,"query":"getRaumgliederung","type":"POST","debug":false});
    },
    //get the sum of geometries to show them inside the loading bar
    getCountGeometries:function(raumgliederung){
        let json = JSON.parse('{"ind":{"klassenzahl":"'+klassenanzahl.getSelection()+'","time":"'+zeit_slider.getTimeSet()+
                                    '","ags_array":"'+gebietsauswahl.getSelection()+
                                    '","raumgliederung":"'+raumgliederung+'"},"query":"countgeometries"}');
        return this.sendRequestPHP({"file":json,"query":"getCountGeometries","type":"POST","debug":false});
    },
    //get overlays like autobahn, train, communal borders, rivers
    getZusatzlayer:function(layer){
        let json = JSON.parse('{"ind":{"zusatzlayer":"'+layer+'"},"query":"getzusatzlayer"}');
        return this.sendRequestPHP({"file":json,"query":"getZusatzlayer","type":"POST","debug":false});
    },
    //get the needed values to expand the table, has it´s own parameters, because the logic is slightly different
    getTableExpandValues:function(expand_values,ags_array){
        let ags_set = indikator_json_group.getLayerArray(table.excludedAreas);
        let raumgliederung_set = base_raumgliederung.getBaseRaumgliederungId();
        //optional ags array must include ags object {ags:01}
        if(ags_array){
            ags_set = ags_array;
        }
        let json = JSON.parse('{"ind":{"id":"'+indikatorauswahl.getSelectedIndikator()+'","time":"'+zeit_slider.getTimeSet()+
            '","raumgliederung":"'+raumgliederung_set+'"},"expand_values":'+JSON.stringify(expand_values)+',"ags_array":'+JSON.stringify(ags_set)+',"query":"getTableExpandValues"}');
        return this.sendRequestPHP({"file":json,"query":"getTableExpandValues","type":"POST","debug":false});
    },
    getTrendValues:function(indicator_id,ags,settings){
        let json = JSON.parse('{"ind":{"id":"'+indicator_id+'","ags_array":"'+ags+'"},"set":'+JSON.stringify(settings)+',"query":"getTrend"}');
        return this.sendRequestPHP({"file":json,"query":"getTrend","type":"POST","debug":false});
    },
    handleLink:function (setting){
        let json = JSON.parse(`{"query":"maplink","setting": {"id": "${setting.id}","val": "${setting.val}"}}`);
        return this.sendRequestPHP({"file":json,"query":"maplink","type":"POST","debug":false});
    },
    sendMailFeedback:function(name, sender, message){
        let json = {
            type:"GET",
            debug:false,
            endpoint:"monitor/mail",
            query:"send Mail",
            data: {
                name:name,
                sender:sender,
                message:message
            }};
        console.log(json);
        return this.sendRequestFlask(json)
    },
    sendMailError:function(name,message){
        let json = {
            type:"GET",
            debug:false,
            endpoint:"monitor/error_mail",
            query:"send Mail",
            data: {
                name:name,
                message:message
            }};
        console.error(JSON.stringify(json));
        return this.sendRequestFlask(json)
    },
    sendRequestPHP:function(json){
        const manager = this;
        this.call= $.ajax({
            async: true,
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
                    console.log(this.url,this.data,JSON.stringify(data));
                }
            }
        });
        return this.call;
    },
    sendRequestFlask:function(json){
        const manager = this;
        this.call= $.ajax({
            async: true,
            type: json.type,
            url: 'https://monitor.ioer.de/monitor_api/'+json.endpoint,
            data: json.data,
            error:function(xhr, ajaxOptions, thrownError){
                manager.onError( thrownError,json.query,this.url);
                alert_manager.alertError();
            },
            success:function(data){
                if(json.debug){
                    console.log(this.url);
                    console.log(JSON.stringify(data));
                }
            }
        });
        return this.call;
    },
    cancel:function(){
        this.call.abort();
    },
    onError:function( thrownError,function_name,url){
        if(thrownError !=="abort") {
            let message= error.getErrorMessage(`${thrownError} in function: ${function_name}`);
            progressbar.remove();
            alert_manager.alertError();
            if(!window.location.href.includes("monitor_test")) {
                this.sendMailError(message.name, message.message);
            }
            console.error(url,function_name,url);
        }
    }
};
//Todo noch umschreiben auf den neuen Mapserver
function getRasterMap(time,ind,_raumgliederung,klassifizierung,klassenanzahl,darstellung_map,_seite){
    return $.ajax({
        async:true,
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
    let raumgliederung_txt = base_raumgliederung.getBaseRaumgliederungId();
    return $.ajax({
        async:true,
        url: urlparamter.getURLMonitor()+"backend/dialog/statistik.php",
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
            map_array:indikator_json_group.getLayerArray(),
        },
        success:function(){
            console.log(this.url);
        }
    });
}
