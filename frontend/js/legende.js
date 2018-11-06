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
            histogramm_container = this.getHistogrammObject(),
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
                    let minus_max = value.Wert_Obergrenze,
                        minus_min = value.Wert_Untergrenze,
                        round_max = (Math.round(minus_max * 100) / 100).toFixed(2),
                        round_min = (Math.round(minus_min * 100) / 100).toFixed(2);

                    grades.push({
                        "max": round_max,
                        "min": round_min,
                        "farbe": value.Farbwert
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
            /*------Histogramm------------------------------------------------------------------------*/
            /*$.when(getHistogramm()).done(function (data) {
                $('#iconhistogramm').attr("src", "");
                histogramm_container.empty().append(data);
            });*/
        }
        else {
            $.ajax({
                type:"GET",
                url :urlparamter.getURL_RASTER() + "php/histogramm.php?Jahr=" + zeit_slider.getTimeSet() + "&Kategorie=" + indikatorauswahl.getSelectedIndikatorKategorie() + "&Indikator=" + indikatorauswahl.getSelectedIndikator() + "&Raumgliederung=" + raeumliche_analyseebene.getSelectionId() + "&Klassifizierung=" + klassifzierung.getSelectionId() + "&AnzKlassen=" + klassenanzahl.getSelection(),
                success:function(data){
                    histogramm_container.empty().append('<img style="width:100%;" src="'+data+'"/>');
                }
            });
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
    }
};