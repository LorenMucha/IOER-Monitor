const toolbar = {
    getDOMObject:function(){
        $elem = $('#toolbar');
        return $elem;
    },
    state:false,
    open:function(){
        this.state=true;
        if(main_view.getMobileState()){
            this.getDOMObject().removeClass('toolbar_close');
        }else{
            this.getDOMObject().removeClass('toolbar_close',500);
            map_infos.resize();
        }
    },
    close:function(){
        this.state=false;
        if(main_view.getMobileState()){
            this.getDOMObject().addClass('toolbar_close');
        }else{
            this.getDOMObject().addClass('toolbar_close',500);
            map_infos.resize();
        }
    },
    init:function(){
        // the mapnavbar
        this.state=true;
        this.create();
        this.controller.set();
    },
    getHeight:function(){
        return this.getDOMObject().height();
    },
    isOpen:function(){
        return this.state;
    },
    create:function(){
      let html = `
            <div id="toolbar" class="toolbar">
                <div class="menu_m">
                    <span id="menu_name">Menü</span>
                </div>
                <div class="content" id="content">
                    <div id="no_overflow">
                        <!----Search------------------------->
                        <div class="ui fluid category search" id="search">
                            <div class="ui icon input">
                                <input id="search_input_field" class="prompt" type="text" placeholder="Suche nach Indikatoren, Orten...">
                                <i class="search icon"></i>
                            </div>
                            <div class="results"></div>
                        </div>
                        <!---Indicator choice--------------->
                        <div class="dropdown_choice">
                            <div class="hh_sf" id="indikator_auswahl">
                                <i class="large angle down icon" data-ddm="drop_kat"></i>
                                <span>Indikator</span>
                            </div>
                            <div class="pin">
                                <i class="glyphicon glyphicon-pushpin" title="Menü anheften" data-ddm="drop_kat"></i>
                            </div>
                        </div>
                        <div class="dropdown_menu" id="drop_kat">
                            <div id="indikator_choice_container" class="indikator_choice_container">
                                <div id="indicator_ddm" class="ui floating labeled selection dropdown indicator_ddm">
                                    <input name="Indikatorauswahl" type="hidden"/>
                                    <i class="dropdown icon"></i>
                                    <div class="default text" id="ind_choice_info">Bitte wählen Sie einen Indikator</div>
                                    <div  id="kat_auswahl" class="menu"></div>
                                </div>
                                <button class="btn btn-primary btn_dropdown kennblatt" onclick="kennblatt.open();">Kennblatt</button>
                            </div>
                        </div>
                        </div>
                    <div id="overflow_content">
                        <!--spatial choice--------------------->
                        <div class="dropdown_choice">
                            <div class="hh_sf" id="raumgl_auswahl">
                                <i class="large angle down icon" data-ddm="dropdown_raumgl"></i>
                                <span>Räumliche Gliederung</span>
                            </div>
                            <div class="pin">
                                <i class="glyphicon glyphicon-pushpin" title="Menü anheften" data-ddm="dropdown_raumgl"></i>
                            </div>
                        </div>
                        <div class="dropdown_menu" id="dropdown_raumgl">
                            <!-- Raumgliederung-->
                            <div class="spatial_choice" id="spatial_choice">
                                <label class="label_spatial_choice" id="gebiete_label">Gebiete</label>
                                <div class="ui toggle large angle checkbox" id="spatial_choice_checkbox_container">
                                    <input name="public" type="checkbox" class="massive"/>
                                </div>
                                <label class="label_spatial_choice" id="raster_label">Raster</label>
                            </div>
                            <div id="spatial_range_gebiete">
                                <span>Räumliche Analyseebene</span>
                                <hr class="hr"/>
                                <form id="menu_raumgl" name="menu_zeitschnitt">
                                    <select name="Raumgliederung" id="Raumgliederung" class="form-control" style="margin-bottom: 10px;"></select>
                                </form>
                                <!-- Selbständige Wahl durch den Nutzer-->
                                <span id="grenzen_choice"></span>
                                <hr class="hr"/>
                                <div class="dropdown_gebietsauswahl">
                                    <div id="dropdown_grenzen_container" class="ui fluid multiple search selection dropdown">
                                        <input id="tags_grenzen" name="tags" type="hidden">
                                        <i class="dropdown icon"></i>
                                        <div id="default_text_ddm_grob" class="default text">Bitte Wählen..</div>
                                        <div class="menu menu_grenzen" id="menu_grenzen_grob"></div>
                                    </div>
                                    <span class="glyphicon glyphicon-trash destroy" title="Auswahl leeren" id="clear_gebietsauswahl"></span>
                                </div>
                                <!-- Feingliederung-->
                                <div id="user_choice">
                                    <span>Raumgliederung:</span>
                                    <hr class="hr"/>
                                    <form id="menu_raumgl_fein" name="menu_zeitschnitt">
                                        <select name="Raumgliederung" id="Raumgliederung_Fein" class="form-control" style="margin-bottom: 10px;">
                                        </select>
                                    </form>
                                </div>
                            </div>
                            <!-- Range Slider Raster-->
                            <div id="spatial_range_raster">
                                <span class="span">Rasterweite in m</span>
                                <hr class="hr"/>
                                <div id="slider_raum_container">
                                    <div id="raum_slider"></div>
                               </div>
                            </div>
                        </div>
                        <!--map layout-------------------->
                        <div class="dropdown_choice">
                            <div class="hh_sf" id="kartengestaltung">
                                <i class="large angle down icon" data-ddm="dropdown_layer"></i>
                                <span>Kartengestaltung</span>
                            </div>
                            <div class="pin">
                                <i class="glyphicon glyphicon-pushpin" title="Menü anheften" data-ddm="dropdown_layer"></i>
                            </div>
                        </div>
                        <div class="dropdown_menu" id="dropdown_layer">
                            <div id="layer_conainer">
                                <span class="span">Sichtbarkeit Indikator</span>
                                <hr class="hr"/>
                                <div id="opacity_container">
                                    <div id="opacity_slider"></div>
                                    <div id="op_low">0</div>
                                    <div id="op_high">100</div>
                                </div>
                            </div>
                            <div id="farbwahl">
                                <span class="span">Farbschema</span>
                                <hr class="hr"/>
                                <div class="form-group-inline">
                                      <input type='text' name='triggerSet' id="triggerSet_min" title="Min Farbwert in Hex" placeholder="#"/>
                                      <input type="color" class="form-control" id="color_min_user"/>
                                       <span class="glyphicon glyphicon-trash fa-2x destroy float-right cursor" title="Auswahl leeren" id="clear_farbwahl"></span>
                                </div>
                                <div class="form-group">
                                      <input type='text' name='triggerSet' id="triggerSet_max" title="Max Farbwert in Hex" placeholder="#"/>
                                      <input type="color" class="form-control" id="color_max_user" placeholder="Farbname oder HEX-Wert"/>
                                      <button type="button" class="btn btn-secondary btn-sm float-right btn-outline-dark" id="create_color_schema">Erstellen</button>
                                </div>
                            </div>
                            <div class="klassenbesetzung" id="klassenbesetzung">
                                <span class="span">Klassenanzahl</span>
                                <hr class="hr"/>
                                <form id="menu_klassenbesetzung" name="menu_klassifizierung">
                                    <select class="form-control Klassifikationsmethode" name="Klassenanzahl" id="Klassenanzahl" title="Anzahl der Klassen w&auml;hlen">
                                        <option id="klassi_3" value="3">3</option>
                                        <option id="klassi_4" value="4">4</option>
                                        <option id="klassi_5" value="5">5</option>
                                        <option id="klassi_6" value="6">6</option>
                                        <option id="klassi_7" value="7" selected>7</option>
                                    </select>
                                </form>
                            </div>
                            <span id="klassifizierung" class="span">Klassifizierung</span>
                            <hr class="hr"/>
                            <div class="klassifizierung">
                                <form id="menu_klassifizierung" name="menu_klassifizierung2">
                                    <div class="radio_left">
                                        <label class="radio-inline" id="haeufigkeit_label">
                                            <input checked="checked" class="Klassifikationsmethode" name="Klassifikationsmethode" type="radio" value="haeufigkeit"/>
                                            <span>Gleiche Klassenbesetzung</span>
                                        </label>
                                    </div>
                                    <div class="radio_right">
                                        <label class="radio-inline" id="gleich_label">
                                            <input class="Klassifikationsmethode" name="Klassifikationsmethode" type="radio" value="gleich"/>
                                            <span>Gleiche Klassenbreite</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="klassifizierung" id="setting_klassifizierung">
                                <span class="span">Art der Darstellung</span>
                                <hr class="hr"/>
                                <form id="menu_darstellung" name="menu_klassifizierung2">
                                    <div class="radio_left">
                                        <label class="radio-inline" id="classify_auto">
                                            <input id="farbreihe_auto" checked="checked" class="Klassifikationsmethode" name="Klassifikationsmethode" type="radio" value="auto"/>
                                            <span>Farbreihe automatisch</span>
                                        </label>
                                    </div>
                                    <div class="radio_right">
                                        <label class="radio-inline" id="keep_settings">
                                            <input class="Klassifikationsmethode" name="Klassifikationsmethode" title="sinnvoll für Zeitschnittvergleiche & manuelle Farbreihe" type="radio" value="manuell"/>
                                            <span>Einstellungen beibehalten</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="w-100" id="map-selection">
                                <button type="button" class="btn btn-outline-dark w-100" id="map_button">Kartenergänzungen</button>
                            </div>
                        </div>
                        <!--Tools-------------------------->
                        <div class="dropdown_choice" id="tools">
                            <div class="hh_sf" id="hh_sf_dropdown_werkzeug">
                                <i class="large angle down icon" data-ddm="dropdown_werkzeug"></i>
                                <span>Werkzeuge</span>
                            </div>
                            <div class="pin">
                                <i class="glyphicon glyphicon-pushpin" title="Menü anheften" data-ddm="dropdown_werkzeug"></i>
                            </div>
                        </div>
                        <div class="dropdown_menu" id="dropdown_werkzeug">
                            <ul class="tools">
                                <li class="tool_li"><div class="btn_container">
                                    <div id="measure"></div>
                                    <div class="btn_txt" id="measure_btn">Messen</div>
                                </div>
                                </li>
                                <li class="tool_li">
                                    <div class="btn_container">
                                        <div id="lupe"></div>
                                        <div class="btn_txt" id="lupe_btn">Lupe</div>
                                    </div>
                                </li>
                                <li class="tool_li">
                                    <div class="btn_container">
                                        <div id="import"></div>
                                        <div class="btn_txt" id="import_btn">Import</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <!--export-->
                        <div class="dropdown_choice" id="export_map">
                            <div class="hh_sf" id="hh_sf_dropdown_ogc">
                                <i class="large angle down icon" data-ddm="dropdown_ogc"></i>
                                Export
                            </div>
                            <div class="pin">
                                <i class="glyphicon glyphicon-pushpin" title="Menü anheften" data-ddm="dropdown_ogc"></i>
                            </div>
                        </div>
                        <div class="dropdown_menu" id="dropdown_ogc">
                            <div class="export_div"><b>Einbinden in eigenes GIS als</b></div>
                            <hr class="hr_export"/>
                            <button id="wms" class="btn .btn-info btn_export raster_export" data-format="WMS" onclick="ogc_export.wms.open()">WMS</button>
                            <button id="wcs" class="btn .btn-info btn_export raster_export" data-format="WCS" onclick="ogc_export.wcs.open()">WCS</button>
                            <button id="wfs" class="btn .btn-info btn_export gebiete_export" data-format="WFS" onclick="ogc_export.wfs.open()">WFS</button>
                            <div class="export_div" id="export_map_display"><b>Export der Kartendarstellung als</b></div>
                            <hr class="hr_export"/>
                            <div class="btn-group">
                                <button type="button" class="btn .btn-info btn_export print_button" id="pdf_export_btn" data-format="pdf">PDF</button>
                                <button type="button" class="btn .btn-info btn_export print_button" id="png_export_btn" data-format="png">PNG</button>
                            </div>
                            <div class="export_div" id="save_map_link"><b>Dauerhaftes Speichern der Karte auf dem IÖR-Server</b></div>
                            <hr class="hr_export"/>
                            <button id="kartenlink" class="btn .btn-info">Kartenlink erzeugen</button>
                            <div class="export_div" id="load_map_link"><b>Kartenlink laden</b></div>
                            <hr class="hr_export"/>
                            <form id="KartenlinkLaden" name="KartenlinkLaden">
                                <input class="form-control" type="text"  id="rid" name="rid" placeholder="Kartenlink Nr.">
                            </form>
                        </div>
                        <!--Reset Map-->
                        <button type="button" class="btn btn-primary" id="btn_reset" onclick="map_reset.reset();">
                            <i class="glyphicon glyphicon-trash drop_arrow"></i><span>Viewer zurücksetzen</span></button>
                    </div>
                    <div id="impressum">
                        <a target="_blank" href="https://www.ioer.de/index.php?id=287" id="impressum_a">Impressum</a>
                        <a target="_blank" href="https://www.ioer.de/index.php?id=292" id="data_protection">Datenschutz</a>
                    </div>
                </div>
            </div>`;
      $('#Modal').find('.left_content').append(html);
    },
    controller:{
        set:function(){
            toolbar.getDOMObject()
                .find('.menu_m')
                .unbind()
                .click(function() {
                    if(toolbar.state){
                        toolbar.close();
                    }else{
                        toolbar.open();
                    }
                });
            setTimeout(function(){
                map_infos.resize();
            },1000);

            //open and close the dropdown's
            toolbar.getDOMObject()
                .find(".hh_sf")
                .unbind()
                .click(function(event) {
                    let ddm = $(this).find('i').data('ddm'),
                        ddm_container = $('#'+ddm);

                    if(ddm_container.hasClass('pinned')===false && !ddm_container.is(':visible')){
                        ddm_container.slideDown();
                        if($(this).attr("id")==="indikator_auswahl"){
                            indikatorauswahl.openMenu();
                        }
                    }else if(ddm_container.is(':visible')===true &&ddm_container.hasClass('pinned')===false){
                        ddm_container.slideUp();
                    }
                    $('.dropdown_menu').each(function(){
                        if($(this).is('#'+ddm)===false && $(this).hasClass('pinned')===false){
                            $(this).slideUp();
                        }
                    });
                    //set the height og the overflow content inside the menu bar
                    if(main_view.getHeight() <= 1000 && view_state.getViewState() ==='mw') {
                        let height = toolbar.getHeight() - $('#no_overflow').height() - 60;
                        $('#overflow_content').css("max-height",height+50);
                    }
                });

            //pin the element in the menu and unpin
            toolbar.getDOMObject()
                .find('.pin')
                .unbind()
                .click(function(event){
                    let drop_menu = $(this).find('i').data('ddm'),
                        icon =  $(this).find('i');
                    if(icon.hasClass('arrow_pinned')){
                        icon.removeClass('arrow_pinned');
                        $('#'+drop_menu).removeClass('pinned');
                    }else {
                        icon.addClass('arrow_pinned');
                        $('#' + drop_menu).addClass('pinned');
                    }
                });
        }
    }
};