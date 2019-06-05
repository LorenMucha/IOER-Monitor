const additiveLayer={
    control:'',
    state:'sw',
    toolbar_button:'#map_button',
    baselayer:{
        paramter:'baselayer',
        layer_set: "topplus",
        baselayer_sw:{
            topplus:L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_topplus_web_open', {
                layers: 'web_grau',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "topplus",
                attribution: '<a href="https://www.bkg.bund.de">TopPlus © GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            webatlas:L.tileLayer.wms('https://sg.geodatenzentrum.de/wms_webatlasde.light_grau?', {
                layers: 'webatlasde.light_grau',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "webatlas",
                attribution: '<a href="https://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            noBackground: L.tileLayer('',{name:"noBackground",id: 'baselayer'}),
            satellite: L.tileLayer.grayscale('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri',name: "satellite",id: 'baselayer'}),
            osm : L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',name: "osm",id: 'baselayer'})
        },
        baselayer_rgb:{
            flaechenschema:new L.tileLayer.wms("https://maps.ioer.de/cgi-bin/mapserv_dv?map=/mapsrv_daten/detailviewer/wms_mapfiles/flaechenschema.map", {
                layers: "Flaechenschema",
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "flaechenschema",
                id: 'baselayer'
            }),
            webatlas:L.tileLayer.wms('https://sg.geodatenzentrum.de/wms_webatlasde.light?', {
                layers:'webatlasde.light',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "webatlas",
                attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            topplus:L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_topplus_web_open', {
                layers: 'web',
                version: '1.3.0',
                format: 'image/png',
                srs:"EPSG:3035",
                transparent: true,
                name: "topplus",
                attribution: '<a href="https://www.bkg.bund.de">TopPlus © GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
                id: 'baselayer'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri',name: "satellite",id: 'baselayer'}),
            osm : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',name: "osm",id: 'baselayer'})
        },
        getParameter:function(){
            if(!urlparamter.getUrlParameter(this.paramter)){
                //if not set replace it with the standard base layer
                this.setParamter(additiveLayer.baselayer.layer_set);
            }
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
        getBaseLayers_sw:function(){
            return {
                "WebAtlas_DE": this.baselayer_sw.webatlas,
                "TopPlus-Web-Open": this.baselayer_sw.topplus,
                "Satellit": this.baselayer_sw.satellite,
                "OSM": this.baselayer_sw.osm,
                "kein Hintergrund": this.baselayer_sw.noBackground
            }
        },
        getBaseLayers_rgb:function(){
            return {
                "WebAtlas_DE": this.baselayer_rgb.webatlas,
                "kein Hintergrund": this.baselayer_sw.noBackground,
                "TopPlus-Web-Open": this.baselayer_rgb.topplus,
                "Satellit":this.baselayer_rgb.satellite,
                "OSM": this.baselayer_rgb.osm
            }
        },
        getAllBaseLayers:function(){
            return $.extend({},this.baselayer_sw,this.baselayer_rgb);
        },
        getBaseLayer:function(){
            return this.layer_set;
        },
        getBaseLayerGroup_set:function(){
            if(opacity_slider.getOpacity()==0){
                additiveLayer.state='rgb';
                return this.getBaseLayers_rgb();
            }else{
                additiveLayer.state='sw';
                return this.getBaseLayers_sw();
            }
        },
        clear:function() {
            map.eachLayer(function (layer) {
                let id = layer.options.id;
                if (id) {
                    if (id === 'baselayer') {
                        layer.removeFrom(map);
                    }
                }
            });
        }
    },
    zusatzlayer:{
        style:'',
        layer:'',
        parameter:'overlays',
        state:false,
        overlays_set : new L.FeatureGroup().on("mouseover",function(){
            this.eachLayer(function(layer){
                layer.bringToBack();
            })}),
        laendergrenzen:new L.GeoJSON('',{
            name: 'laendergrenzen'
        }),
        kreisgrenzen:new L.GeoJSON('',{
            name: 'kreisgrenzen'
        }),
        gemeindegrenzen:new L.GeoJSON('',{
            name: 'gemeindegrenzen'
        }),
        autobahn:new L.GeoJSON('',{
            name: 'autobahn'
        }),
        fernbahnnetz:new L.GeoJSON('',{
            name: 'fernbahnnetz'
        }),
        gewaesser:new L.GeoJSON('',{
            name: 'gewaesser'
        }),
        getState:function(){
            return this.getLayerGroup_set().length !== 0;
        },
        getParameter:function(){
            return urlparamter.getUrlParameter(this.parameter);
        },
        setParameter:function(){
            let array = [],
                object = this;
            this.overlays_set.eachLayer(function (layer) {
                array.push(layer.options.name);
            });

            if(array.length===0){
                object.removeParamter();
            }
            else if (!this.getParameter()) {
                urlparamter.setUrlParameter(this.parameter, array.toString());
            } else {
                urlparamter.updateURLParameter(this.parameter, array.toString());
            }
        },
        removeParamter:function(){
            urlparamter.removeUrlParameter(this.parameter);
        },
        updateParamter:function(){
            this.removeParamter();
            this.setParameter();
        },
        setStyleSet:function(_style){
            this.style = _style;
        },
        getStyleSet:function(){
            return this.style;
        },
        setForward:function(){
            this.overlays_set.eachLayer(function(layer){
                layer.bringToFront();
            });
        },
        getLayerGroup_set:function(){
            return this.overlays_set;
        }
    },
    getState:function(){
        return this.state;
    },
    init:function(){
        const controller = this;
        this.controller.set();
        //set the baselayer
        if (controller.baselayer.getParameter()) {
            $.each(controller.baselayer.getBaseLayerGroup_set(), function (key, value) {
                if (controller.baselayer.getParameter().indexOf(value.options.name) >= 0) {
                    controller.baselayer.layer_set = value;
                    value.addTo(map);
                }
            });
        }
        //set the zusatzlayer if set
        if(controller.zusatzlayer.getParameter()){
            let array = controller.zusatzlayer.getParameter().split(',');
            $.each(array,function(key_a,value_a){
                controller.controller.setOverlay(value_a);
            });
        }
    },
    remove:function(){
        this.baselayer.clear();
        try {map.removeControl(this.control);} catch (err) {}
    },
    controller:{
        set:function(){
            const control = additiveLayer;
            $(control.toolbar_button)
                .unbind()
                .click(function(){
                    const addControl = new AdditiveLayerControl();
                    addControl.open();
            });
            //on click baselayer
            $(document).on("click",".base_layers",function () {
               let id =  $(this).data("id");
               control.controller.setBaselayer(id);
            });
            //on click overlay
            $(document).on("click",".overlay",function(){
                    let id = $(this).data("id");
                    if($(this).hasClass('active')){
                        control.controller.removeOverlay(id);
                    }else{
                        control.controller.setOverlay(id);
                    }
                });
        },
        setBaselayer:function(_id){
            map.eachLayer(function(layer){
                //not working for all layer so try
                try{
                    if(layer.options.id==="baselayer"){
                        map.removeLayer(layer);
                    }
                }catch(err){}
            });
            $.each(additiveLayer.baselayer.getBaseLayerGroup_set(), function (key, value) {
                if (_id.indexOf(value.options.name) >= 0) {
                    additiveLayer.baselayer.layer_set = value;
                    value.addTo(map);
                    value.bringToBack();
                    additiveLayer.baselayer.updateParamter(_id);
                    dialog_manager.close();
                }
            });
        },
        setOverlay:function(_id){
            const control = additiveLayer;
            let layer = control.zusatzlayer[_id],
                name = $(`#zusatz_${_id}`).data("name");

            dialog_manager.close();
            progressbar.init();
            progressbar.setHeaderText("Lade Layer");

            $.when(RequestManager.getZusatzlayer(_id)).done(function(json){
                layer.addData(json);
                layer.setStyle(style[_id]);
                //add a legend entry
                control.zusatzlayer.getLayerGroup_set().addLayer(layer);
                control.zusatzlayer.setParameter();
                layer.addTo(map);
                layer.bringToFront();
                control.zusatzlayer.setForward();
                progressbar.remove();
                legende.getLegendeColorsObject().append(`<div class="zusatzlayer" id="zusatz_${_id}"><div style="border-bottom: 3px solid ${style[_id].color};"></div>${name}</div>`);
            });
        },
        removeOverlay:function(_id){
            dialog_manager.close();
            if(_id==="mdmap"){
                OsmBuildings.removeEngine();
                return false;
            }
            additiveLayer.zusatzlayer.overlays_set.eachLayer(function(layer){
               let name = layer.options.name;
               if(name === _id){
                   map.removeLayer(layer);
                   additiveLayer.zusatzlayer.overlays_set.removeLayer(layer);
                   additiveLayer.zusatzlayer.updateParamter();
                   //remove from elend
                   $(`#zusatz_${_id}`).remove();
               }
            });
        }

    }
};