const expand_panel = {
    expandArray:[],
    class_expand : 'table_expand',
    getDOMObject:function(){
        $elem = $('#tabelle_erweitern');
        return $elem;
    },
    getContaner:function(){return $('#tabelle_erweitern');},
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
        $elem = $('#expand_kenngroessen').hide();
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
        if(jahreArray.length > 1 || indikatorauswahl.getFilteredPossibleYears()[0] > parseInt(zeit_slider.getTimeSet())) {
            panel.getZeitschnittAuswahlContainer().show();
            panel.getHinweisTimeExpandNullObject().hide();
            panel.getHinweisOnlyOlderTimeShiftsObject().show();
            $('.time_expand_time_table').remove();
            let min_time = Math.min.apply(Math, jahreArray);
            if (min_time== zeit_slider.getTimeSet()) {
                panel.getZeitschnittauswahlDDMObject().hide();
            } else {
                panel.getZeitschnittauswahlDDMObject().show();
                for (let i = 0; i < jahreArray.length; i++) {
                    if (zeit_slider.getTimeSet() > jahreArray[i]) {
                        let div = '<div class="item time_expand_time_table" data-value="' + jahreArray[i] + '">' + jahreArray[i] + '</div>';
                        $('#zeit_auswahl_table').append(div);
                    }
                }
            }
            //if not set the note
        }else{
            panel.getZeitschnittAuswahlContainer().hide();
        }
        //Kenngroesen
        let spatial_extend = function(){
                let selection = raumgliederung.getSelectedId();
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
                panel.getABSKenngroesseObject().show()
            }
        }else{
            panel.getABSKenngroesseObject().hide();
        }
        //Relief
        if(indikatorauswahl.getSelectedIndikatorKategorie() === 'X'){
            panel.getUebergeordneteKenngroessenObject().hide();
        }else{
            panel.getUebergeordneteKenngroessenObject().show();
        }
        //EW not for sst
        if(spatial_extend() === 'stt'){
            panel.getEinwohnerObject().hide();
        }else{
            panel.getEinwohnerObject().show();
        }
        //Trendfortschreibung--------------------------------------------
        if($.inArray(2025,indikatorauswahl.getAllPossibleYears())!==-1){
            panel.getTrendfortschreibungauswahlDDMObject().show();
            panel.getHinweisTrendObject().hide()
        }else{
            panel.getTrendfortschreibungauswahlDDMObject().hide();
            panel.getHinweisTrendObject().show();
        }
    },
    init:function(){
        this.fill();
        this.controller.set();
        //don`t enable function on mobile devices
        if(main_view.getMobileState()){
            this.disable();
        }else{
            this.enable();
        }

    },
    disable:function(){
        this.getOpenButtonObject().hide();
    },
    enable:function(){
        this.getOpenButtonObject().show();
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
            expand_panel.getOpenButtonObject().unbind().click(function(){
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
                    $('#header_ind_set').attr("colspan",5);
                    expand_panel.fill();
                    expand_panel.close();
                    table.setExpandState(false);
                    main_view.resizeSplitter(table.getWidth());
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
                        expand_panel.getHinweisOnlyOlderTimeShiftsObject().hide();
                        expand_panel.getTrendAuswahlContainer().hide();
                        expand_panel.getUebergeordneteKenngroessenObject().hide();
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(expand_panel.expandArray,value);
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
                        expand_panel.getTrendAuswahlContainer().hide();
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(expand_panel.expandArray, indikatorauswahl.getSelectedIndikator() + '|' + value);
                        let selection = expand_panel.getZeitschnittauswahlDDMObject().dropdown('get value').split(',');
                        if (selection.length <= 1) {
                            expand_panel.getTrendAuswahlContainer().show();
                        }
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
                        if(addedValue === 'brd'){
                            expand_panel.expandArray.push({id:addedValue,text:'Gesamte Bundesrepublik ('+zeit_slider.getTimeSet()+')',time:zeit_slider.getTimeSet(),einheit:false, count: 15});
                        }
                        else if(addedValue === 'bld'){
                            expand_panel.expandArray.push({id:addedValue,text:'Übergeordnetes Bundesland ('+zeit_slider.getTimeSet()+')',time:zeit_slider.getTimeSet(),einheit:false,count: 15});
                        }
                        else{
                            expand_panel.expandArray.push({id:addedValue,text:addedText,time:zeit_slider.getTimeSet(),einheit:false,count: 10});
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
                        expand_panel.clear();
                        expand_panel.expandArray.push({id:indikatorauswahl.getSelectedIndikator()+'|'+addedValue,text:'Trendfortschreibung ('+addedValue+')',time:addedValue,einheit:indikatorauswahl.getIndikatorEinheit(),count:30});
                        expand_panel.getZeitschnittAuswahlContainer().hide();
                        $('#hinweis_time_expand_linear').show();
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        expand_panel.expandArray = helper.removefromarray(panel.expandArray,indikatorauswahl.getSelectedIndikator()+'|'+value);
                        let selection = expand_panel.getTrendfortschreibungauswahlDDMObject().dropdown('get value').split(',');
                        if(selection.length<= 1){
                            expand_panel.getZeitschnittAuswahlContainer().show();
                            $('#hinweis_time_expand_linear').hide();
                        }
                    }
                })
        }
    }
};