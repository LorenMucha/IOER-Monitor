//the model
const legende = {
    getDOMObject : function(){
        $elem= $('#legende');
        return $elem;
    },
    getCloseIconObject : function(){return $('#legende_close');},
    getShowButtonObject: function(){return $('#legende_button');},
    getDatenalterContainerObject:function(){
        $elem = $('#datenalter_container');
        return $elem;
    },
    getLegendeColorsObject : function(){
        $elem = $('#legende_i');
        return $elem;},
    getIndikatorInfoObject : function(){
        $elem =$('#indikator_info_text');
        return $elem;
    },
    getDatengrundlageObject: function(){
        $elem = $('#datengrundlage_content');
        return $elem;
    },
    getEinheitObject:  function(){
        $elem =$('#einheit_container');
        return $elem;
    },
    getKlasseneinteilungObject: function(){
        $elem = $('#histogramm_klasseneinteilung');
        return $elem;
    },
    getHistogrammObject: function(){
        $elem = $('#histogramm_pic');
        return $elem;
    },
    open: function(){
        this.getShowButtonObject().hide();
        this.getDOMObject().show("slow",function(){});
    },
    resize: function(){
        let map_content = $('#mapwrap'),
            table_container = rightView.getDOMObject(),
            right_content = $('#rightPane'),
            leaflet_right_controls = $('.leaflet-right'),
            width = 250,
            height = map_content.height()- leaflet_right_controls.height()-100,
            close_icon = this.getCloseIconObject(),
            show_button = this.getShowButtonObject(),
            legende_container = this.getDOMObject();
        //only for Multiview
        if(viewState.getViewState()==="mw"){
            if(table.isOpen()){
                show_button.css("right", rightView.getWidth()+50);
                legende_container.css("right",rightView.getWidth()+50);
                close_icon.css("right",rightView.getWidth()+70);
            }else{
                show_button.css("right", "0px");
                legende_container.css("right","0px");
                close_icon.css("right","30px");
                close_icon.css("right","30px");
            }
            height = map_content.height()- leaflet_right_controls.height()-180;
        }else{
            if(mainView.getWidth()<=1024){
                width=200;
            }
            show_button.css("right", "0px");
            legende_container.css("right","0px");
            close_icon.css("right","30px");
            close_icon.css("right","30px");
        }
        legende_container.css({"max-height":height,"width":width});
    },
    init:function(open){
        const legende = this;
        this.resize();
        legende.getShowButtonObject().show();
        if(legende.getDOMObject().is(':visible')){
            legende.getShowButtonObject().hide();
        }
        if(viewState.getViewState()==="responsive"){
            legende.getShowButtonObject().css("right","0px").show();
        }else{
            if(open) {
                legende.open();
            }
        }
        //the onClick funcionality
        //open Button
        legende.getCloseIconObject()
                .unbind()
                .click(function(){
                        legende.close();
                    });
        //close Icon
        legende.getShowButtonObject()
            .unbind()
            .click(function(){
                    legende.open();
                });
        //Datenalter
        legende.getDatenalterContainerObject().find('#datenalter')
            .unbind()
            .click(function () {
                let datenalter_dd = legende.getDatenalterContainerObject().find('#dropdown_datenalter'),
                    legende_width = legende.getDOMObject().width(),
                    width_dd_datenalter = 50;
                    if(mainView.getWidth()<=1024){
                        width_dd_datenalter = 100;
                    }
                    if (rightView.isVisible()) {
                        if (datenalter_dd.is(':hidden')) {
                            legende.getDOMObject().css("width", legende_width+width_dd_datenalter);
                            legende.getShowButtonObject().css("right", legende_width+width_dd_datenalter);
                            datenalter_dd.show();
                            legende.getHistogrammObject().css("margin-left", "10px");
                        }
                        else {
                            legende.getDOMObject().css("width", legende_width-width_dd_datenalter);
                            legende.getShowButtonObject().css("right", legende_width-width_dd_datenalter);
                            datenalter_dd.hide();
                            legende.getHistogrammObject().css("margin-left", "0px");
                        }
                    } else {
                        if (datenalter_dd.is(':hidden')) {
                            legende.getDOMObject().css("width", legende_width+width_dd_datenalter);
                            legende.getShowButtonObject().css("right", (rightView.getWidth()) + (legende_width+width_dd_datenalter));
                            datenalter_dd.show();
                            legende.getDOMObject().css("margin-left", "10px");
                        } else {
                            legende.getDOMObject().css("width", legende_width-width_dd_datenalter);
                            legende.getShowButtonObject().css("right", $('#rightPane').width() + legende_width-width_dd_datenalter);
                            datenalter_dd.hide();
                            legende.getDOMObject().css("margin-left", "0px");
                        }
                    }
                //scroll down to view full viewport
                setTimeout(function() {
                    legende.getDOMObject().scrollTop(legende.getDOMObject()[0].scrollHeight);
                },100);
            });
    },
    fillContent:function() {
        const object = this;
        let einheit = indikatorauswahl.getIndikatorEinheit(),
            errorcode = error_code.getErrorCode(),
            legende_colors = this.getLegendeColorsObject(),
            datengrundlage_container = this.getDatengrundlageObject(),
            indikator_info_container = this.getIndikatorInfoObject(),
            einheit_container = this.getEinheitObject(),
            klasseneinteilung_contaiener = this.getKlasseneinteilungObject();

        //close datenalter
        object.getDatenalterContainerObject().find('#dropdown_datenalter').hide();

        /*------hole Zusatzinfos------------------------------------------------------------------------*/
        $.when(getIndZusatzinformationen()).done(function(data){
            let datengrundlage = data[0]["datengrundlage"];
            if (datengrundlage.length >= 3) {
                datengrundlage = datengrundlage + "</br>";
            }
            let atkis = data[0]["atkis"];
            indikator_info_container.text(data[0]["info"]);
            datengrundlage_container.html(datengrundlage + atkis);
            if (einheit.length<=0) {
                einheit_container.hide();
            } else {
                einheit_container.show();
                einheit_container.find('#legende_einheit').text(einheit);
            }
        });
        /*-------------------------KLasseneinteilung---------------------------------------------*/
        klasseneinteilung_contaiener.text($('#' + klassifzierung.getSelectionId("gebiete") + '_label').text());

        /*create the histogramm and Legende------------------------------*/
        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
            if (farbliche_darstellungsart.getSelectionId()=== "auto") {
                let grades = [];

                $.each(klassengrenzen.getKlassen(), function (key, value) {
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

                grades.reverse();
                //clone zusatzlayer
                let zusatzlayer = legende_colors.find('.zusatzlayer').clone();
                $('.legende_i').empty();
                let i = 1;
                $.each(grades, function (key, value) {
                    let farbe = value.farbe,
                        value_id = farbe.replace('#', ''),
                        sign = '>';

                    if(i===grades.length){sign='';}
                    legende_colors.append('<div id="legende_' + value_id + '" class="legende_line"><i style="background:' + farbe + '"></i> '+sign+ DotToComma(value.min) + ' - ' + DotToComma(value.max) + '</div>');
                    i +=1;
                });

                if (errorcode != false) {
                    legende_colors.append('<div class="legende_line error"><i style="background: repeating-linear-gradient(45deg,rgb(255, 0, 0),rgb(255,255,255) 5px, rgb(255,255,255) 1px, rgb(255,255,255) 1px);"></i>' + errorcode + '</div>');
                }
                legende_colors.append(zusatzlayer);
            }
            object.histogramm.setHistogrammGebiete();
        }
        else {
            let options = indikator_raster.getInfos(),
                pfad_mapfile = options[0]["pfadmapfile"],
                layername = options[0]["layername"],
                legende = "https://maps.ioer.de/cgi-bin/mapserv_dv?map="+pfad_mapfile+"&MODE=legend&layer="+layername+"&IMGSIZE=150+300",
                legende_schraffur ="https://maps.ioer.de/cgi-bin/mapserv_dv?map=/mapsrv_daten/detailviewer/mapfiles/mapserv_raster.map&MODE=legend&layer=schraffur&IMGSIZE=150+30";
            //workaround for CORS
            //set the other params like legendenpic and staff
            if (einheit === "proz") {
                einheit = '%';
            }
            legende_colors.empty().load(legende, function () {
                let elements = $(this).find('img');
                elements.each(function (key, value) {
                    let src = $(this).attr('src'),
                        url = "https://maps.ioer.de" + src;
                    $(this).attr('src', url);
                });
            });
            //set the histogramm
            object.histogramm.setHistogrammRaster();
        }
        this.resize();
    },
    remove:function(){
        let show_button = this.getShowButtonObject(),
            legende_container = this.getDOMObject();

        show_button.hide();
        legende_container.hide();
    },
    isOpen:function(){
      return this.getDOMObject().is(":visible");
    },
    close: function(){
        let show_button = this.getShowButtonObject(),
            legende_container = this.getDOMObject();
        legende_container.hide('slow',function(){});
        if(viewState.getViewState()==='responsive'){
            show_button.css("right","0px").show();
        }else{
            if($('.right_content').is(':visible')) {
                show_button.css("right", $('#rightPane').width()).show();
            }else{
                show_button.css("right","0px").show();
            }
        }
    },
    histogramm:{
        setHistogrammGebiete:function(){
            //get the classes and color
            let grenzen = klassengrenzen.getKlassen(),
                ioer_json = indikatorJSON.getJSONFile(),
                obergrenze_max = klassengrenzen.getMax(),
                untergrenze_min = klassengrenzen.getMin();
                value_array = [];
            //extract the values out of the JSON
            $.each(ioer_json.features,function(key,value){value_array.push(value.properties.value)});
            //append histogramm with the gradient object
            let gradient =  '<defs>' +
                                '<linearGradient x1="100%" x2="0%" y1="0" y2="0">' +
                                    '<stop offset="0%" stop-color="'+grenzen[(Object.keys(grenzen).length-1)]['color']+'"></stop>'+
                                    '<stop offset="100%" stop-color="'+grenzen[0]['color']+'"></stop>'+
                                '</linearGradient>'+
                            '</defs>',
                //the colored classes isnide the diagramm
                classes = function(){
                                let html = '<text x="" style="font-size:9px;"></text>',
                                    width = 4,
                                    height = 62,
                                    counter = 0;

                                //TODO-> klassengenerierung

                            },
                diagramm = '<svg id="svgId">' +
                                '<g>' +
                                    gradient+
                                    classes()+
                /*
                '<rect x="0" width="4px" height="62" style="fill:#ffff99" stroke="none"></rect>'+
                '<rect x="2.5" width="4px" height="62" style="fill:#ffff99" stroke="none"></rect>'+
                '<rect x="5" width="4px" height="62" style="fill:#ffff99" stroke="none"></rect>'+
                '<rect x="7.5" width="4px" height="62" style="fill:#ffff99" stroke="none"></rect>'+
                '<rect x="10" width="4px" height="62" style="fill:#f8db83" stroke="none"></rect>'+
                '<rect x="12.5" width="4px" height="62" style="fill:#f8db83" stroke="none"></rect>'+
                '<rect x="15" width="4px" height="62" style="fill:#f8db83" stroke="none"></rect>'+
                '<rect x="17.5" width="4px" height="62" style="fill:#f0b66d" stroke="none"></rect>'+
                '<rect x="20" width="4px" height="62" style="fill:#f0b66d" stroke="none"></rect>'+
                '<rect x="22.5" width="4px" height="62" style="fill:#e99257" stroke="none"></rect>'+
                '<rect x="25" width="4px" height="62" style="fill:#e99257" stroke="none"></rect>'+
                '<rect x="27.5" width="4px" height="62" style="fill:#e26d42" stroke="none"></rect>'+
                '<rect x="30" width="4px" height="62" style="fill:#e26d42" stroke="none"></rect>'+
                '<rect x="32.5" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="35" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="37.5" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="40" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="42.5" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="45" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="47.5" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="50" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="52.5" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="55" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="57.5" width="4px" height="62" style="fill:#db492c" stroke="none"></rect>'+
                '<rect x="60" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="62.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="65" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="67.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="70" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="72.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="75" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="77.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="80" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="82.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="85" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="87.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="90" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="92.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="95" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="97.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="100" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="102.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="105" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="107.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="110" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="112.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="115" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="117.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="120" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="122.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="125" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="127.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="130" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="132.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="135" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="137.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="140" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="142.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="145" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="147.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="150" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="152.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="155" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="157.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="160" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="162.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="165" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="167.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="170" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="172.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="175" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="177.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="180" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="182.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="185" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="187.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="190" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="192.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="195" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="197.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="200" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="202.5" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="205" width="4px" height="62" style="fill:#d32416" stroke="none"></rect>'+
                '<rect x="207.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="210" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="212.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="215" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="217.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="220" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="222.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="225" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="227.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="230" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="232.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="235" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="237.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="240" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="242.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="245" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="247.5" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+
                '<rect x="250" width="4px" height="62" style="fill:#cc0000" stroke="none"></rect>'+*/
                    //generate the lines
                /*'<rect x="0" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="2.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="7.5" y="0" width="1px" height="60" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="10" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="12.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="15" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="17.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="20" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="22.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="25" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="27.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="30" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="32.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="35" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="37.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="40" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="42.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="45" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="47.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="50" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="52.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="55" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="57.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="60" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="62.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="65" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="67.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="70" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="72.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="75" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="77.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="80" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="82.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="85" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="87.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="90" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="92.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="95" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="97.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="100" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="102.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="105" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="107.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="110" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="112.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="115" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="117.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="120" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="122.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="125" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="127.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="130" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="132.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="135" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="137.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="140" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="142.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="145" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="147.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="150" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="152.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="155" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="157.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="160" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="162.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="165" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="167.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="170" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="172.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="175" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="177.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="180" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="182.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="185" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="187.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="190" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="192.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="195" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="197.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="200" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="202.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="205" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="207.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="210" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="212.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="215" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="217.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="220" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="222.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="225" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="227.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="230" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="232.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="235" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="237.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="240" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="242.5" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="245" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="247.5" y="30" width="1px" height="30" style="fill:#000000" stroke="none"></rect>'+
                '<rect x="250" y="60" width="1px" height="0" style="fill:#000000" stroke="none"></rect>'+*/
                                '</g>' +
                            '</svg>';


            legende.getHistogrammObject().empty().append(diagramm);
            //console.log(classes());
        },
        setHistogrammRaster:function(){
            $.ajax({
                type:"GET",
                url :urlparamter.getURL_RASTER() + "php/histogramm.php?Jahr=" + zeit_slider.getTimeSet() + "&Kategorie=" + indikatorauswahl.getSelectedIndikatorKategorie() + "&Indikator=" + indikatorauswahl.getSelectedIndikator() + "&Raumgliederung=" + raeumliche_analyseebene.getSelectionId() + "&Klassifizierung=" + klassifzierung.getSelectionId() + "&AnzKlassen=" + klassenanzahl.getSelection(),
                success:function(data){
                    legende.getHistogrammObject().empty().append('<img style="width:100%;" src="'+data+'"/>');
                }
            });
        }
    }
};