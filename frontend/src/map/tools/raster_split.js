const raster_split={
    control:'',
    button:'',
    selector_toolbar:"#ind_compare",
    dialog:
        {
            jahre:'',
            raumgliederung:'',
            jahre_set:'',
            raumgliederung_set:'',
            info_leave:0,
            getButtonDomObject:function(){
              $elem=$("#map_compare");
              return $elem;
            },
            getContainerObject:function(){
                $elem=  $('#vergleich_dialog');
                return $elem;
            },
            getDropdownDOMObject:function(){
                $elem=$('#indicator_ddm_vergleich');
                return $elem;
            },
            getTimeSliderDOMObject:function(){
                $elem = $("#zeit_slider_vergleich");
                return $elem;
            },
            getSpatialSliderDOMObject:function(){
                $elem = $("#raum_slider_vergleich");
                return $elem;
            },
            create:function(){
                $('#Modal').append(`
                     <div id="vergleich_dialog">
                            <div id="close_vergleich" class="close_vergleich">
                                <span class="close" title="Dialog schließen">X</span>
                            </div>
                            <div class="auswahlcontainer">
                                <span class="span">Indikator für den Vergleich</span>
                                <hr class="hr"/>
                                <div id="indicator_ddm_vergleich" class="ui selection dropdown indicator_ddm">
                                    <input name="Indikatorauswahl" type="hidden"/>
                                    <i class="dropdown icon"></i>
                                    <div class="default text">Bitte wählen.....</div>
                                    <div  id="kat_auswahl_vergleich" class="menu kat_auswahl_vergleich"></div>
                                </div>
                                <div class="ind_content">
                                    <div id="time_range_raster_vergleich" class="vergleich_container">
                                        <span class="span">Zeitschnitt</span>
                                        <hr class="hr"/>
                                        <div class="zeit_slider" id="zeit_slider_vergleich"></div>
                                    </div>
                                    <div id="spatial_range_raster_vergleich" class="vergleich_container">
                                        <span class="span">Rasterweite in m</span>
                                        <hr class="hr"/>
                                        <div id="slider_raum_container_vergleich">
                                            <div id="raum_slider_vergleich"></div>
                                        </div>
                                    </div>
                                    <div id="klassifizierung_vergleich">
                                        <span class="span">Klassenanzahl</span>
                                        <hr class="hr"/>
                                        <form id="menu_klassenanzahl_vergleich" name="menu_klassifizierung">
                                            <select class="form-control Klassifikationsmethode" name="Klassenanzahl" id="Klassenanzahl_vergleich" title="Anzahl der Klassen wählen">
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                                <option value="6">6</option>
                                                <option value="7" selected>7</option>
                                            </select>
                                        </form>
                                    </div>
                                    <div id="klassenbestzung_vergleich">
                                        <span class="span">Klassifizierung</span>
                                        <hr class="hr"/>
                                        <div class="klassifizierung">
                                            <form id="menu_klassifizierung_vergleich" name="menu_klassifizierung2">
                                                <div class="radio_left">
                                                    <label class="radio-inline" id="haeufigkeit_label_vergleich">
                                                        <input checked="checked" class="Klassifikationsmethode" name="Klassifikationsmethode" type="radio" value="gleicheAnzahl"/>
                                                        Gleiche <br>Klassenbesetzung
                                                    </label>
                                                </div>
                                                <div class="radio_right">
                                                    <label class="radio-inline" id="gleich_label_vergleich">
                                                        <input class="Klassifikationsmethode" name="Klassifikationsmethode" type="radio" value="gleicheBreite"/>
                                                        Gleiche <br>Klassenbreite
                                                    </label>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-primary btn_dropdown" id="create_vergleichskarte_button">Karte hinzufügen</button>
                            </div>
                            <div class="legende_vergleich">
                                <div id="legende_vergleich">
                                    <div class="legende_content ind_content">
                                        <span class="span">Legende</span>
                                        <hr class="hr"/>
                                        <div class="">Einheit:<b id="legende_vergleich_einheit"></b></div>
                                        <div id="legende_vergleich_i" class="legende_vergleich_generated"></div>
                                        <div class="iconlegende_schraffur"></div>
                                        <hr class="hr"/>
                                        <div><b>Datengrundlage</b></div>
                                        <div id="datengrundlage_content_vergleich" class="legende_vergleich_generated"></div>
                                        <div><b>Kartenprojektion</b></div>
                                        <div>ETRS89 / UTM Zone 32N</div>
                                        <hr class="hr"/>
                                        <div><b>Histogramm</b></div>
                                        <div id="histogramm_pic_vergleich" class="legende_vergleich_generated"></div>
                                    </div>
                                </div>
                            </div>
                    </div>
                `);
            },
            openDialog:function(){
                const dialog = raster_split.dialog;
                let button_map = raster_split.getButtonObject();

                //open the dialog
                dialog.show();
                button_map.css("background-color",farbschema.getColorHexActive());
                //clone the menu
                if ($('#kat_auswahl_vergleich').length === 1) {
                    indikatorauswahl.cloneMenu('kat_auswahl_vergleich', 'ink_kat_vergleich', 'right',["X","G"],false);
                }

                dialog.controller.set();
                map_header.moveVertical("left","100px");
            },
            controller:{
                set:function(){
                    const dialog = raster_split.dialog;
                    let button_map = raster_split.getButtonObject(),
                        dropdown_ind =  dialog.getDropdownDOMObject(),
                        close_container = $('.close_vergleich');

                    dropdown_ind
                        .dropdown({
                            onChange: function (value, text, $choice) {
                                dialog.controller.createGUIElements(value);
                                $('.ind_content').slideDown();
                            }
                    });

                    //pre select the set indicator
                    if(!dropdown_ind.dropdown('get value')||typeof dropdown_ind.dropdown('get value') ==='undefined') {
                        dropdown_ind.dropdown('set selected',indikatorauswahl.getSelectedIndikator());
                    }

                    //klassifizierungsmenu
                    $('#menu_klassifizierung_vergleich').find('input').change(function () {
                        dialog.setLegende();
                    });

                    //change the number of classes
                    $('#Klassenanzahl_vergleich').change(function(){
                        dialog.setLegende();
                    });

                    //destroy the function
                    close_container
                        .find('.destroy')
                        .unbind()
                        .click(function(){
                            raster_split.remove();
                            dialog.hide();
                            button_map.css("background-color",farbschema.getColorHexMain());
                        });

                    //close the dialog
                    close_container
                        .find('.close')
                        .unbind()
                        .click(function () {
                            dialog.hide();
                        });

                    $('#create_vergleichskarte_button').click(function(){
                        const settings = dialog.getSettings();
                        indikator_raster.init(null,null,"rechts",settings);
                        dialog.hide();
                        if(main_view.getWidth()>=950) {
                            $('#indikator_header_rechts')
                                .show();
                            $('#header_rechts').text(settings[0].ind_text + " (" + settings[0].time + ")");
                            $('#header_raumgl_rechts').text(settings[0].raumgl);
                        }else{
                            $('#indikator_header_rechts').hide();
                        }
                    });

                    $("#kennblatt_vergleich").click(function(){
                        kennblatt.open();
                    });
                },
                //Adds the essential Elements
                createGUIElements:function(indikator_id) {
                    const dialog = raster_split.dialog;
                    let def = $.Deferred();

                    function defCalls() {
                        let requests = [
                            RequestManager.getJahre(indikator_id),
                            RequestManager.getRaumgliederung(indikator_id)
                        ];
                        $.when.apply($, requests).done(function () {
                            def.resolve(arguments);
                        });
                        return def.promise();
                    }

                    defCalls().done(function (arr) {
                        //now we have access to array of data
                        dialog.jahre = arr[0][0];
                        dialog.raumgliederung = arr[1][0];
                        dialog.getTimeSliderDOMObject()
                            .unbind()
                            .slider({
                                orientation: "horizontal",
                                min: 0,
                                max: (dialog.jahre).length - 1,
                                step: 1,
                                value: 0,
                                stop: function (event, ui) {
                                    dialog.setLegende();
                                    dialog.jahre_set = dialog.jahre[(ui.value)];
                                }
                            });
                        dialog.jahre_set = dialog.jahre[0];
                        pips.set(dialog.getTimeSliderDOMObject(), dialog.jahre);

                        let labels = [];
                        dialog.getSpatialSliderDOMObject()
                            .unbind()
                            .slider({
                                orientation: "horizontal",
                                min: 0,
                                max: (dialog.raumgliederung).length - 1,
                                value: 0,
                                step: 1,
                                stop: function (event, ui) {
                                    dialog.setLegende();
                                    dialog.raumgliederung_set = dialog.raumgliederung[(ui.value)];
                                }
                            });
                        dialog.raumgliederung_set = dialog.raumgliederung[0];
                        try {
                            $.each(dialog.raumgliederung, function (key, value) {
                                labels.push(value.replace('Raster', '').replace('m', ''));
                            });
                        } catch (err) {
                        }
                        pips.set(dialog.getSpatialSliderDOMObject(), labels);
                        dialog.setLegende();
                    });
                }
            },
            setLegende:function(){
                const dialog = this;
                let settings = dialog.getSettings(),
                    ind = settings[0].ind,
                    time = settings[0].time,
                    kat = settings[0].kat,
                    raumgl_set = settings[0].raumgl,
                    klassifizierung = settings[0].klassifizierung,
                    klassenanzahl = settings[0].klassenanzahl,
                    indicator_id = indikatorauswahl.getSelectedIndikator();

                $.when(RequestManager.getRasterMap(time, ind, raumgl_set, klassifizierung, klassenanzahl, farbliche_darstellungsart.getSelectionId()))
                    .done(function (data) {
                        //TODO umschreiben auf den neuen Mapserver
                        let txt = data,
                            x = txt.split('##'),
                            info_json = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()],
                            legende = x[1],
                            legende_schraffur ="https://maps.ioer.de/cgi-bin/mapserv_dv?map=/mapsrv_daten/detailviewer/mapfiles/mapserv_raster.map&MODE=legend&layer=schraffur&IMGSIZE=150+30",
                            einheit = x[10];

                        if(einheit==='proz'){einheit='%'}

                        $('#legende_vergleich_i').empty().load(legende, function () {
                            let elements = $(this).find('img');
                            elements.each(function (key, value) {
                                let src = $(this).attr('src');
                                $(this).attr('src', "https://maps.ioer.de" + src);
                            });
                        });

                        $('.iconlegende_schraffur').load(legende_schraffur, function () {
                            let elements = $(this).find('img');
                            elements.each(function (key, value) {
                                let src = $(this).attr('src');
                                $(this).attr('src', "https://maps.ioer.de" + src);
                            });
                        });

                        if (einheit.length >= 1) {
                            $('#legende_vergleich_einheit').show().text(' ' + einheit);
                        } else {
                            $('#legende_vergleich_einheit').hide();
                        }

                        $.ajax({
                            async:true,
                            type:"GET",
                            url :urlparamter.getURL_RASTER() + "php/histogramm.php?Jahr=" + time + "&Kategorie=" + kat + "&Indikator=" + ind + "&Raumgliederung=" + raumgl_set + "&Klassifizierung=" + klassifizierung + "&AnzKlassen=" + klassenanzahl,
                            success:function(data){
                                $('#histogramm_pic_vergleich').empty().append('<img style="width:100%;" src="'+data+'"/>');
                            }
                        });

                        let language_tag = function(){
                            let tag = '';
                            if(language_manager.getLanguage()==="en"){
                                tag = '_en';
                            }
                            return tag;
                            },
                        datengrundlage = info_json['indicators'][indicator_id][("datengrundlage"+language_tag())],
                        atkis =  function(){
                                let val = parseInt(info_json['indicators'][indicator_id]["atkis"]);
                                if(val==1){
                                    return " © GeoBasis-DE / BKG ("+helper.getCurrentYear()+")";
                                }
                            };
                        $('#indikator_info_text_vergleich').text(info_json['indicators'][indicator_id][("info"+language_tag())]);
                        $('#datengrundlage_content_vergleich').html(datengrundlage + atkis());
                    });
            },
            getSettings:function(){
                let ind = this.getDropdownDOMObject().dropdown('get value'),
                    ind_text = this.getDropdownDOMObject().dropdown('get text'),
                    time = this.jahre_set,
                    raumgl_set = this.raumgliederung_set,
                    kat = $('#kat_auswahl_vergleich #'+indikatorauswahl.getSelectedIndikator()+"_item").attr("data-kat"),
                    klassifizierung = $('#menu_klassifizierung_vergleich').find('input:checked').val(),
                    klassenanzahl = $('#menu_klassenanzahl_vergleich').find('select').val(),
                    settings = [];
                settings.push({"kat":kat,"ind":ind,"ind_text":ind_text,"time":time,"raumgl":raumgl_set,"klassifizierung":klassifizierung,"klassenanzahl":klassenanzahl});
                return settings;
            },
            show:function(){
                this.getContainerObject().slideDown();
            },
            hide:function(){
                this.getContainerObject().slideUp();
            }
        },
    getButtonObject:function(){
        $elem = $('#ind_compare');
        return $elem;
    },
    getSplitterContainer:function(){
        $elem = $('.leaflet-sbs');
        return $elem;
    },
    init:function(){
        raster_split.constroller.set();
        raster_split.dialog.create();
    },
    setController:function(_controller){
        this.control = _controller;
    },
    getController:function(){
        return this.control;
    },
    getButton:function(){
        return this.button;
    },
    remove:function(){
        const object = this;
        object.getSplitterContainer().remove();
        $('#indicator_ddm_vergleich').dropdown('clear');
        $('.ind_content').hide();
        $('#indikator_header_rechts')
            .hide();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster"){
            indikator_raster.init();
        }else{
            map.removeControl(object.getButton());
        }
        this.getButtonObject().css("background-color",farbschema.getColorHexMain());
        this.dialog.getButtonDomObject().hide();
        this.dialog.hide();
        map_header.resetCSS();
    },
    getState:function(){
        return this.getSplitterContainer().length >= 1;
    },
    constroller:{
        set:function(){
            const object = raster_split;
            let btn_show_info = object.dialog.getButtonDomObject(),
                click=0;

            object.button = new L.control({position:'topright'});
            //extend map with the function
            $(document)
                .on("click",raster_split.selector_toolbar,function(){
                    if(click==0) {
                        object.dialog.info_leave = 1;
                        if(object.dialog.info_leave==0){
                            alert_manager.leaveESCInfo();
                        }
                        if (raeumliche_visualisierung.getRaeumlicheGliederung() === "gebiete") {
                            raeumliche_visualisierung.setChecked();
                        }
                        var interval = setInterval(function () {
                            if (indikator_raster.getRasterLayer()) {
                                try {
                                    clearInterval(interval);
                                    btn_show_info.show();
                                    let sideByside = L.control.sideBySide(indikator_raster.raster_layer.addTo(map), null);
                                    object.setController(sideByside);
                                    if (!object.getState()) {
                                        sideByside.addTo(map);
                                        object.dialog.openDialog();
                                        object.getButtonObject().css('background-color', farbschema.getColorHexActive());
                                    }
                                } catch (err) {
                                    console.error(err);
                                    if (!window.location.href.includes("monitor_test")) {
                                        let message = error.getErrorMessage(`function:raster_split\n Error: ${err}`);
                                        alert_manager.alertError();
                                        RequestManager.sendMailError(message.name, message.message);
                                    }
                                }
                            }
                        }, 100);
                        click +=1;
                    }else{
                        object.remove();
                        click=0;
                    }
            });

            //leave on ESC

            $(document)
                .keyup(function(e) {
                    if (e.keyCode === 27) {
                        raster_split.remove();
                    }
                });

            //show the info dialog
            btn_show_info
                .unbind()
                .click(function(){
                   object.dialog.show();
                });
        }
    }
};