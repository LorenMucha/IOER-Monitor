const expand_panel = {
    expandArray:[],
    class_expand : 'table_expand',
    getDOMObject:function(){
        $elem = $('#tabelle_erweitern');
        return $elem;
    },
    getOpenButtonObject:function(){
        $elem = $("#btn_table");
        return $elem;
    },
    getButtonLoadExpandObject:function(){
        $elem = $('#btn_table_load_expand');
        return $elem;
    },
    getButtonClearExpandObject:function(){
        $elem = $('#btn_table_clear_expand');
        return $elem;
    },
    getCloseIconDOMObject:function(){
        $elem = $('#panel_close');
        return $elem;
    },
    //Dropdowns
    getKenngroessenauswahlDDMObject:function(){
        $ddm = $('#kenngroessen_ddm_table');
        return $ddm;
    },
    getZeitschnittAuswahlContainer:function(){
        $elem = $('#time_expand_conatier');
        return $elem;
    },
    getZeitschnittauswahlDDMObject:function(){
        $ddm = $('#zeitschnitt_ddm_table');
        return $ddm;
    },
    getIndikatorauswahlDDMObject:function(){
        $ddm = $('#indicator_ddm_table');
        return $ddm;
    },
    getTrendfortschreibungauswahlDDMObject:function(){
        $ddm = $('#trend_ddm_table');
        return $ddm;
    },
    //return the hole container including the ddm
    getTrendAuswahlContainer:function(){return $('#lineare_trend_expand_container');},
    getAllDDMObjects:function(){
        return [this.getZeitschnittauswahlDDMObject(),
            this.getIndikatorauswahlDDMObject(),
            this.getKenngroessenauswahlDDMObject(),
            this.getTrendfortschreibungauswahlDDMObject()];
    },
    //elements
    getDiffernceCheckboxObject:function(){
        $elem = $('#differences');
        return $elem;
    },
    getABSKenngroesseObject:function(){
        $elem = $('#expand_abs');
        return $elem;
    },
    getEinwohnerObject:function(){
        $elem = $('#expand_b00ag');
        return $elem;
    },
    getUebergeordneteKenngroessenObject:function(){
        $elem = $('#expand_kenngroessen');
        return $elem;
    },
    //hinweise
    getHinweisTimeExpandNullObject:function(){
        $elem = $('#hinweis_time_expand_null');
        return $elem;
    },
    getHinweisOnlyOlderTimeShiftsObject:function(){
        $elem = $('#hinweis_time');
        return $elem;
    },
    getHinweisTrendObject:function(){
        $elem = $('#trend_hinweis_expand');
        return $elem;
    },
    //the Expand Array
    getDifferenceState:function(){
        return this.getDiffernceCheckboxObject().is(':checked');
    },
    setExpandArray:function(_epand_array){this.expandArray = _epand_array;},
    getExpandArray:function(){return this.expandArray;},
    open:function(){
        const panel = this;
        panel.getDOMObject().show("slow",function() {
            //close the panel
            panel.getCloseIconDOMObject()
                .unbind()
                .click(function () {
                    panel.close();
                });
        });
    },
    close: function(){
        this.getDOMObject().hide("slow",function() {});
    },
    fill: function(){
        const panel = this;
        let jahreArray = indikatorauswahl.getFilteredPossibleYears(),
            ind_differences_hide = ["S12RG","S11RG","S40RG"];
        panel.clear();
        //DDM Indikatoren
        indikatorauswahl.cloneMenu('kat_auswahl_table','link_kat_table','left',false,true);
        panel.getIndikatorauswahlDDMObject().addClass('indicator_ddm');
        panel.getIndikatorauswahlDDMObject().find(`#${indikatorauswahl.getSelectedIndikator()}_item`).addClass("disabled");
        //if table was expand
        //DDM Time
        if($.inArray(indikatorauswahl.getSelectedIndikator(),ind_differences_hide)!== -1){
            $('#differences_div').hide();
        }else{
            $('#differences_div').show();
        }
        //check if only one time possibility
        if(Math.min.apply(Math, jahreArray)!== zeit_slider.getTimeSet()
            &&jahreArray.length > 1) {
            helper.enableElement("#"+panel.getZeitschnittAuswahlContainer().attr("id"),"");
            panel.getHinweisTimeExpandNullObject().hide();
            panel.getHinweisOnlyOlderTimeShiftsObject().show();
            $('.time_expand_time_table').remove();
            for (let i = 0; i < jahreArray.length; i++) {
                if (zeit_slider.getTimeSet() > jahreArray[i]) {
                    let div = '<div class="item time_expand_time_table" data-value="' + jahreArray[i] + '">' + jahreArray[i] + '</div>';
                    $('#zeit_auswahl_table').append(div);
                }
            }
            //if not set the note
        }else{
            helper.disableElement("#"+panel.getZeitschnittAuswahlContainer().attr("id"),"");
        }
        //Kenngroesen
        let spatial_extend = function(){
                let selection = raumgliederung.getSelectionId();
                if(!selection){selection = raeumliche_analyseebene.getSelectionId();}
                return selection;
            },
            spatial_name=function(){
                let names ={"de":["Bundesrepublik","Bundesländer"],"en":["Federal Republic","States"]};
                return names[language_manager.getLanguage()]
            };
        div = '<div class="item" data-value="brd" value="brd">'+spatial_name()[0]+'</div>';

        if(spatial_extend() === 'ror'){
            div = spatial_name()[0];
        }
        //check if the string contains a k == something with 'kreis'
        else if(spatial_extend().indexOf("k") >= 0 ){
            div = '<div class="item" data-value="bld" value="bld">'+spatial_name()[1]+'</div>'+
                '</br>'+
                '<div class="item" data-value="brd" value="brd">'+spatial_name()[0]+'</div>';
        }

        $('#ue_raum_sum_content').empty().append(div);

        //intercept the special cases
        //AG
        if(indikatorauswahl.getSelectedIndikator().indexOf("RG") >= 0){
            if(indikatorauswahl.getSelectedIndikatorKategorie() !== 'O') {
                helper.enableElement("#"+panel.getABSKenngroesseObject().attr("id"),"");
            }
        }else{
            helper.disableElement("#"+panel.getABSKenngroesseObject().attr("id"),exclude.disable_text);
        }
        //Relief
        if(indikatorauswahl.getSelectedIndikatorKategorie() === 'X'){
            helper.disableElement("#"+panel.getUebergeordneteKenngroessenObject().attr("id"),exclude.disable_text);
        }else{
            helper.enableElement("#"+panel.getUebergeordneteKenngroessenObject().attr("id"),"");
        }
        //EW not for sst
        if(spatial_extend() === 'stt'){
            helper.disableElement("#"+panel.getEinwohnerObject().attr("id"),exclude.disable_text);
        }else{
            helper.enableElement("#"+panel.getEinwohnerObject().attr("id"),"");
        }
        //Trendfortschreibung--------------------------------------------
        if($.inArray(2025,indikatorauswahl.getAllPossibleYears())!==-1){
            helper.enableElement("#"+panel.getTrendfortschreibungauswahlDDMObject().attr("id"),exclude.disable_text);
            helper.enableElement("#"+panel.getHinweisTrendObject().attr("id"),"");
        }else{
            helper.enableElement("#"+panel.getTrendfortschreibungauswahlDDMObject().attr("id"),"");
            helper.enableElement("#"+panel.getHinweisTrendObject().attr("id"),exclude.disable_text);
        }
    },
    init:function(){
        this.create();
        this.fill();
        this.controller.set();
    },
    create:function(){
        $('#tabelle_erweitern').html(`
              <div id="panel_close" class="close_table">
                        <span title="Tabelle schließen" class="glyphicon glyphicon-remove checker float-right cursor"></span>
                    </div>
                    <div id="hinweis_time_expand_linear" class="hinweis">
                        <b style="color:red;" class="note">Hinweis:</b>
                        <span>Anzeige von zusätzlichen Zeitschnitten und weiteren Kenngrößen nur bei Deaktivierung der Trendfortschreibung.</span>
                    </div>
                    <div id="ind_expand_container" class="ddm_expand">
                        <span><b>Indikator zum Vergleich anfügen</b></span>
                        <hr class="hr"/>
                        <div id="indikator_choice_container_table" class="panel_choice_container">
                            <div id="indicator_ddm_table" class="ui floating labeled selection selection multiple dropdown ddm_table">
                                <input name="Indikatorauswahl" type="hidden"/>
                                <i class="dropdown icon"></i>
                                <div class="default text">Bitte wählen.....</div>
                                <div  id="kat_auswahl_table" class="menu"></div>
                        </div>
                        </div>
                    </div>
                    <div id="time_expand_conatier" class="ddm_expand">
                        <span><b>Zeitschnitte anfügen</b></span>
                        <hr class="hr"/>
                        <div id="zeitschnitt_choice_container_table" class="panel_choice_container">
                            <div id="zeitschnitt_ddm_table" class="ui selection multiple dropdown ddm_table">
                                <input name="Indikatorauswahl" type="hidden">
                                <i class="dropdown icon"></i>
                                <div class="default text">Bitte wählen.....</div>
                                <div  id="zeit_auswahl_table" class="menu"></div>
                            </div>
                            <div class="ui toggle checkbox">
                                <input type="checkbox" id="selectall">
                                <label>Alle Zeiten auswählen</label>
                            </div>
                            <div class="checkbox" id="differences_div">
                                <label><input id="differences" type="checkbox" value=""/><span>Differenzen anzeigen</span></label>
                            </div>
                            <div id="hinweis_time" class="hinweis"><b style="color:red;" class="note">Hinweis:</b><span>Für Vergleiche können nur frühere Zeitschnitte angezeigt werden.</span></div>
                            <div id="hinweis_time_expand_null" class="hinweis"><b style="color:red;" class="note">Hinweis:</b> Es ist nur ein Zeitschnitt verfügbar. </div>
                        </div>
                    </div>
                    <div id="kenngroessen_expand_container" class="ddm_expand">
                        <span><b>Weitere Kenngrößen zum Vergleich</b></span>
                        <hr class="hr"/>
                        <div id="kenngroessen_choice_container_table" class="panel_choice_container">
                            <div id="kenngroessen_ddm_table" class="ui selection multiple dropdown ddm_table">
                                <input name="Indikatorauswahl" type="hidden">
                                <i class="dropdown icon"></i>
                                <div id="kenngroessen_ddm_table_header" class="default text">Bitte wählen.....</div>
                                <div  id="kenngroessen_auswahl_table" class="menu">
                                    <div id="expand_abs" class="item" data-value="ABS">Absoluter Indikatorwert</div>
                                    <div id="area_size" class="item" data-value="S00AG">Gebietsfläche</div>
                                    <div id="expand_b00ag" class="item" data-value="B00AG">Einwohnerzahl</div>
                                    <div id="expand_kenngroessen" class="item" data-value="UE_RaumSum">
                                        <i class="dropdown icon left"></i>
                                        <span>Übergeordnete Raumeinheiten</span>
                                        <div id="ue_raum_sum_content" class="menu pointing left"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--Disabled: Kerngruppenbeschluss am 23.05.19
                    <div id="lineare_trend_expand_container">
                        <span><b>Lineare Trendfortschreibung</b><img id="expand_linear_tred"/> <b>für:</b></span>
                        <hr class="hr"/>
                        <div id="trend_choice_container_table" class="panel_choice_container">
                            <div id="trend_ddm_table" class="ui selection multiple dropdown ddm_table">
                                <input name="Indikatorauswahl" type="hidden">
                                <i class="dropdown icon"></i>
                                <div class="default text">Bitte wählen.....</div>
                                <div  id="trend_auswahl_table" class="menu">
                                    <div class="item" data-value="2025" value="2025">2025</div>
                                    <div class="item" data-value="2030" value="2030">2030</div>
                                </div>
                            </div>
                            <div id="trend_hinweis_expand" class="hinweis">
                                <b class="note">Hinweis:</b>
                                <span>Anzeige von Trendwerten nur für ausgewählte Indikatoren.</span>
                            </div>
                        </div>
                    </div>
                    -->
                    <button type="button" class="btn btn-primary" id="btn_table_load_expand">Tabelle aktualisieren</button>
                    <button type="button" class="btn btn-primary" id="btn_table_clear_expand">
                        <i class="glyphicon glyphicon-trash"></i>
                        <span>zurücksetzen</span>
                    </button>
      `);
    },
    clear:function(){
        this.expandArray = [];
        $.each(this.getAllDDMObjects(),function(key, value){
            value.dropdown('clear');
        });
    },
    removeExpandColumns:function(){$('.'+this.class_expand).remove();},
    controller:{
        set:function(){
            //bind the on click events
            //Button interaction for open the panel
            expand_panel
                .getOpenButtonObject()
                .unbind()
                .click(function(){
                    expand_panel.open();
            });
            //panel button to load the user choice and expand the table
            expand_panel.getButtonLoadExpandObject()
                .unbind()
                .click(function(){
                    expand_panel.removeExpandColumns();
                    expand_panel.close();
                    if(expand_panel.expandArray.length >0) {
                        try {
                            table.expand();
                        } catch (err) {
                            alert_manager.alertError();
                        }
                        setTimeout(function () {
                            progressbar.init();
                            progressbar.setHeaderText("erstelle Tabelle");
                            toolbar.close();
                        }, 100);
                    }
                });
            //reset the expand
            expand_panel.getButtonClearExpandObject()
                .unbind()
                .click(function(){
                    expand_panel.setExpandArray([]);
                    expand_panel.removeExpandColumns();
                    $('#header_ind_set').attr("colspan",6);
                    expand_panel.fill();
                    expand_panel.close();
                    table.setExpandState(false);
                    main_view.resizeSplitter(table.getWidth());
                    expand_panel
                        .getZeitschnittAuswahlContainer()
                        .find(".ui.toggle.checkbox")
                        .checkbox("set unchecked");
                });
            /*
                bind the semantic functionality
            */
            //indicator-choice
            expand_panel
                .getIndikatorauswahlDDMObject()
                .unbind()
                .dropdown({
                    maxSelections: 1,
                    onShow:function(){
                        //adjust width of the right view, if the dropdown overlay the splitter
                        if(view_state.getViewState()==="mw") {
                            main_view.resizeSplitter(right_view.getWidth() + 100);
                        }
                    },
                    onHide:function(){
                        if(view_state.getViewState()==="mw") {
                            main_view.resizeSplitter(right_view.getWidth() - 100);
                        }
                    },
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        expand_panel.expandArray.push({id:addedValue,text:addedText,time:zeit_slider.getTimeSet(),einheit:false, count: 50});
                        //sort the time array desc
                        expand_panel.expandArray = _.sortBy(expand_panel.expandArray, 'total').reverse();
                        //disable other choice possibilities
                        helper.disableElement("#"+expand_panel.getHinweisOnlyOlderTimeShiftsObject().attr("id"));
                        helper.disableElement("#"+expand_panel.getTrendAuswahlContainer().attr("id"));
                        helper.disableElement("#"+expand_panel.getUebergeordneteKenngroessenObject().attr("id"));
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(expand_panel.expandArray,value);
                        helper.enableElement("#"+expand_panel.getUebergeordneteKenngroessenObject().attr("id"));
                        helper.enableElement("#"+expand_panel.getHinweisOnlyOlderTimeShiftsObject().attr("id"));
                        helper.enableElement("#"+expand_panel.getTrendAuswahlContainer().attr("id"));
                    }
                });
            //the times to expand the table
            expand_panel
                .getZeitschnittauswahlDDMObject()
                .unbind()
                .dropdown({
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        expand_panel.expandArray.push({
                            id: indikatorauswahl.getSelectedIndikator() + '|' + addedValue,
                            text: 'Zum Vergleich (' + addedText + ')',
                            time: addedValue,
                            einheit: indikatorauswahl.getIndikatorEinheit(),
                            count: 20
                        });
                        helper.disableElement("#"+expand_panel.getTrendAuswahlContainer().attr("id"));
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(expand_panel.expandArray, indikatorauswahl.getSelectedIndikator() + '|' + value);
                        let selection = expand_panel.getZeitschnittauswahlDDMObject().dropdown('get value').split(',');
                        if (selection.length <= 1) {
                            expand_panel.getTrendAuswahlContainer().show();
                        }
                        helper.enableElement("#"+expand_panel.getTrendAuswahlContainer().attr("id"));
                    }
                });
            //select all times
            expand_panel
                .getZeitschnittAuswahlContainer()
                .find(".ui.toggle.checkbox")
                .unbind()
                .checkbox({
                    onChecked() {
                        let selections = function(){
                            let values_set = [];
                            expand_panel
                            .getZeitschnittauswahlDDMObject()
                            .find('.item')
                            .each(function(){
                                let val = $(this).data("value");
                                values_set.push(val.toString());
                            });
                            return values_set;
                        };
                        expand_panel
                            .getZeitschnittauswahlDDMObject()
                            .dropdown("set selected",selections());
                    },
                    onUnchecked() {
                        expand_panel
                            .getZeitschnittauswahlDDMObject()
                            .dropdown("clear");
                    },
                });

            //kenngrößen-------------------------------------------------------
            expand_panel.getKenngroessenauswahlDDMObject()
                .unbind()
                .dropdown("refresh")
                .dropdown({
                    onShow:function(){
                        //adjust width of the right view, if the dropdown overlayse the splitter
                        if(view_state.getViewState()==="mw") {
                            main_view.resizeSplitter(right_view.getWidth() + 100);
                        }
                    },
                    onHide:function(){
                        if(view_state.getViewState()==="mw") {
                            main_view.resizeSplitter(right_view.getWidth() - 100);
                        }
                    },
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        let time_set = parseInt(zeit_slider.getTimeSet());
                        if(addedValue === 'brd'){
                            expand_panel.expandArray.push({id:addedValue,text:'Gesamte Bundesrepublik ('+time_set+')',time:time_set,einheit:false, count: 15});
                        }
                        else if(addedValue === 'bld'){
                            expand_panel.expandArray.push({id:addedValue,text:'Bundesland ('+time_set+')',time:time_set,einheit:false,count: 15});
                        }
                        else{
                            //workaround für 2018er Werte-> nicht in der DB
                            if(addedValue==="B00AG" && time_set===2018){time_set=2017;}
                            expand_panel.expandArray.push({id:addedValue,text:addedText,time:time_set,einheit:false,count: 10});
                        }
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(expand_panel.expandArray,value);
                    }
                });
            //trendfortschreitung
            expand_panel.getTrendfortschreibungauswahlDDMObject()
                .unbind()
                .dropdown({
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        try {
                            expand_panel.expandArray.push({
                                id: indikatorauswahl.getSelectedIndikator() + '|' + addedValue,
                                text: 'Trendfortschreibung (' + addedValue + ')',
                                time: addedValue,
                                einheit: indikatorauswahl.getIndikatorEinheit(),
                                count: 30
                            });
                            helper.disableElement("#" + expand_panel.getZeitschnittAuswahlContainer().attr("id"));
                            $('#hinweis_time_expand_linear').show();
                            $(this).blur();
                        }catch(err){
                            console.error(err);
                            alert_manager.alertError();
                        }
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(expand_panel.expandArray,indikatorauswahl.getSelectedIndikator()+'|'+value);
                        let selection = expand_panel.getTrendfortschreibungauswahlDDMObject().dropdown('get value').split(',');
                        if(selection.length<= 1){
                            helper.enableElement("#"+expand_panel.getZeitschnittAuswahlContainer().attr("id"));
                            $('#hinweis_time_expand_linear').hide();
                        }
                    }
                })
        }
    }
};