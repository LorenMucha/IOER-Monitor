const raster_split={
    control:'',
    button:'',
    dialogObject:
        {
            jahre:'',
            raumgliederung:'',
            jahre_set:'',
            raumgliederung_set:'',
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
            openDialog:function(){
                const dialog = this;
                let dialog_container = dialog.getContainerObject(),
                    button_map = raster_split.getButtonObject(),
                    dropdown_ind =  dialog.getDropdownDOMObject(),
                    close_container = $('.close_vergleich');

                //open the dialog
                dialog.show();
                button_map.css("background-color",farbschema.getColorActive());

                if ($('#kat_auswahl_vergleich').length === 1) {
                    indikatorauswahl.cloneMenu('kat_auswahl_vergleich', 'ink_kat_vergleich', 'right',["X","G"],false);
                }

                dropdown_ind.dropdown({
                    onChange: function (value, text, $choice) {
                        dialog.createGUIElements(value);
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
                        button_map.css("background-color",farbschema.getColorMain());
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
                    $('#indikator_header_rechts')
                        .show();
                    $('#header_rechts').text(settings[0].ind_text+" ("+settings[0].time+")");
                    $('#header_raumgl_rechts').text(settings[0].raumgl);
                });

                $("#kennblatt_vergleich").click(function(){
                    kennblatt.open();
                });
            },
            //Adds the essential Elements
            createGUIElements:function(indikator_id){
                const dialog = this;
                let def = $.Deferred();
                function defCalls(){
                    let requests = [
                        request_manager.getJahre(indikator_id),
                        request_manager.getRaumgliederung(indikator_id)
                    ];
                    $.when.apply($,requests).done(function(){
                        def.resolve(arguments);
                    });
                    return def.promise();
                }
                defCalls().done(function(arr) {
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

                $.when(getRasterMap(time, ind, raumgl_set, klassifizierung, klassenanzahl, farbliche_darstellungsart.getSelectionId()))
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
        $elem = $('#vergleich_btn');
        return $elem;
    },
    getSplitterContainer:function(){
        $elem = $('.leaflet-sbs');
        return $elem;
    },
    init:function(){
        const controller = this;
        //the comperative Map
        let vergleichcontrol = new L.control({position:'topright'});
        controller.button = vergleichcontrol;
        vergleichcontrol.onAdd = function(map){
            var div = L.DomUtil.create('div');
            div.title="Zwei Indikatorkarten miteinander Vergleichen";
            div.innerHTML = '<div class="vergleich btn_map" id="vergleich_btn"></div>';
            let timer;
            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function(){
                    controller.dialogObject.openDialog();
                    sideByside = L.control.sideBySide(indikator_raster.raster_layer.addTo(map), null);
                    raster_split.setController(sideByside);
                    if(!raster_split.getState()){
                        sideByside.addTo(map);
                    }
                })
                .on(div,'mouseover',function () {
                    if(raster_split.getState()){
                        timer = setTimeout(function(){
                            controller.dialogObject.openDialog();
                        },100);
                    }
                })
                .on(div,'mouseleave',function() {
                    clearTimeout(timer);
                });

            return div;
        };
        try{
            setTimeout(function(){
                if(!main_view.getMobileState()) {
                    vergleichcontrol.addTo(map);
                }
            },1000);
        }catch(err){}
    },
    getController:function(){
        return this.control;
    },
    setController:function(_controller){
        this.control = _controller;
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
    },
    getState:function(){
        return this.getSplitterContainer().length >= 1;
    }
};