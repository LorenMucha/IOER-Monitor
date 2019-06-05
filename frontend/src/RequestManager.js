var call = false,
    url_backend=urlparamter.getURLMonitor()+"backend/query.php";
class RequestManager{
    //get the indicator-JSON
    static getGeoJSON(ind,time,_raumgliederung,ags_array,_klassenanzahl,_klassifizierung){
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
    }
    //check if a indicator is possible to view in the the given kind of visualization (gebiete/raster)
    static getAvabilityIndicator(_ind){
        let ind = indikatorauswahl.getSelectedIndikator();
        if(_ind){ind=_ind;}
        let json = JSON.parse('{"ind":{"id":"'+ind+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getAvability"}');
        return this.sendRequestPHP({"file":json,"query":"getAvabilityIndicator","type":"POST","debug":false});
    }
    //get all avaliable indicators
    static getAllAvaliableIndicators(){
        let json = JSON.parse('{"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getAllIndicators"}');
        return this.sendRequestPHP({"file":json,"query":"getAllAvaliableIndicators","type":"POST","debug":false});
    }
    //get the possible time`s
    static getJahre(ind){
        let ind_set = indikatorauswahl.getSelectedIndikator();
        if(ind){
            ind_set = ind;
        }
        let json = JSON.parse('{"ind":{"id": "'+ind_set+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+'"},"query":"getYears"}');
        return this.sendRequestPHP({"file":json,"query":"getJahre","type":"POST","debug":false});

    }
    //get the possible spatial extends for a indicator
    static getRaumgliederung(ind){
        let ind_set = indikatorauswahl.getSelectedIndikator();
        if(ind){
            ind_set = ind;
        }
        let json = JSON.parse('{"ind":{"id":"'+ind_set+
            '","time":"'+zeit_slider.getTimeSet()+'"},"format":{"id":"'+raeumliche_visualisierung.getRaeumlicheGliederung()+
            '"},"query":"getSpatialExtend"}');
        return this.sendRequestPHP({"file":json,"query":"getRaumgliederung","type":"POST","debug":false});
    }
    //get the sum of geometries to show them inside the loading bar
    static getCountGeometries(raumgliederung){
        let json = JSON.parse('{"ind":{"klassenzahl":"'+klassenanzahl.getSelection()+'","time":"'+zeit_slider.getTimeSet()+
            '","ags_array":"'+gebietsauswahl.getSelection()+
            '","raumgliederung":"'+raumgliederung+'"},"query":"countgeometries"}');
        return this.sendRequestPHP({"file":json,"query":"getCountGeometries","type":"POST","debug":false});
    }
    //get overlays like autobahn, train, communal borders, rivers
    static getZusatzlayer(layer){
        let json = JSON.parse('{"ind":{"zusatzlayer":"'+layer+'"},"query":"getzusatzlayer"}');
        return this.sendRequestPHP({"file":json,"query":"getZusatzlayer","type":"POST","debug":false});
    }
    //get the needed values to expand the table, has it´s own parameters, because the logic is slightly different
    static getTableExpandValues(expand_values,ags_array){
        let ags_set = indikator_json_group.getLayerArray(table.excludedAreas);
        let raumgliederung_set = base_raumgliederung.getBaseRaumgliederungId();
        //optional ags array must include ags object {ags:01}
        if(ags_array){
            ags_set = ags_array;
        }
        let json = JSON.parse('{"ind":{"id":"'+indikatorauswahl.getSelectedIndikator()+'","time":"'+zeit_slider.getTimeSet()+
            '","raumgliederung":"'+raumgliederung_set+'"},"expand_values":'+JSON.stringify(expand_values)+',"ags_array":'+JSON.stringify(ags_set)+',"query":"getTableExpandValues"}');
        return this.sendRequestPHP({"file":json,"query":"getTableExpandValues","type":"POST","debug":false});
    }
    //get the chart values to set up the line chart
    static getTrendValues(indicator_id,ags,settings){
        let json = JSON.parse('{"ind":{"id":"'+indicator_id+'","ags_array":"'+ags+'"},"set":'+JSON.stringify(settings)+',"query":"getTrend"}');
        console.log(JSON.stringify(json));
        return this.sendRequestPHP({"file":json,"query":"getTrend","type":"POST","debug":false});
    }
    //get the stored map-Link parameters to create the map
    static handleLink(setting){
        let json = JSON.parse(`{"query":"maplink","setting": {"id": "${setting.id}","val": "${setting.val}"}}`);
        return this.sendRequestPHP({"file":json,"query":"maplink","type":"POST","debug":false});
    }
    //get all indicator values for a given indicator and AGS
    static getSpatialOverview(indicator_id,ags){
        let json = JSON.parse(`{"ind":{"id":"${indicator_id}","ags":"${ags}","time":"${zeit_slider.getTimeSet()}"},"query":"getvaluesags"}`);
        return this.sendRequestPHP({"file":json,"query":"getvaluesags","type":"POST","debug":false});
    }
    static sendMailFeedback(name, sender, message){
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
        return this.sendRequestFlask(json)
    }
    static sendMailError(name,message){
        let json = {
            type:"GET",
            debug:false,
            endpoint:"monitor/error_mail",
            query:"send Mail",
            data: {
                name:name,
                message:message
            }};
        return this.sendRequestFlask(json)
    }
    static sendRequestPHP(json){
        const manager = this;
        call= $.ajax({
            async: true,
            type: json.type,
            url: url_backend,
            cache: true,
            data: {
                values: JSON.stringify(json.file)
            },
            success:function(data){
                if(json.debug){
                    console.log(this.url,this.data,JSON.stringify(data));
                }
            }
        });
        return call;
    }
    static sendRequestFlask(json){
        const manager = this;
        call= $.ajax({
            async: true,
            type: json.type,
            url: 'https://monitor.ioer.de/monitor_api/'+json.endpoint,
            data: json.data,
            error:function(xhr, ajaxOptions, thrownError){
                alert_manager.alertError();
            },
            success:function(data){
                if(json.debug){
                    console.log(this.url);
                    console.log(JSON.stringify(data));
                }
            }
        });
        return call;
    }
    static cancel(){
        call.abort();
    }
    static getRasterMap(time,ind,_raumgliederung,klassifizierung,klassenanzahl,darstellung_map,_seite) {
        return $.ajax({
            async: true,
            type: "GET",
            url: urlparamter.getURL_RASTER() + "php/map/create_raster.php",
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
}