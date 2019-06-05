const raeumliche_analyseebene = {
    values:'',
    param:'raumgl',
    range:[],
    getRange:function(){
        return this.range;
    },
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.param,_value);
    },
    updateParamter:function(_value){
        if(!this.getParamter()){
            this.setParameter(_value);
        }else{
            urlparamter.updateURLParameter(this.param,_value);
        }
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.param);
    },
    getSelectionId:function(){
        const menu = this;
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete') {
            return menu.getParamter();
        }else{
            return rasterweite_slider.getSelectText();
        }
    },
    setSectionId:function(_val){
        this.getDOMObject().find('#Raumgliederung').val(_val);
    },
    getSelectionText:function(){
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete') {
            return this
                .getDOMObject()
                .find('#Raumgliederung')
                .find("option:selected")
                .text()
                .replace("* nur", "")
                .replace("-", "")
                .replace("ab 50 000 Ew.","");
        }else {
            return rasterweite_slider.steps[(rasterweite_slider.getParameter())];
        }
    },
    getDOMObject:function(){
        $elem = $('#menu_raumgl');
        return $elem;
    },
    fill(){
        const menu = this;
        //clear array
        menu.range = [];
        let raumgl_selection = $('#Raumgliederung');
        raumgl_selection.empty();
        $.each(menu.values,function(key,value){
            if(menu.values[key].state==="enabled"){
                menu.range.push(value.id);
            }
            let spatial_name = value.name;
            if(language_manager.getLanguage()==="en"){spatial_name=value.name_en;}
            let html = '<option data-state="'+value.state+'" id="'+value.id+'_raumgl" name="'+spatial_name+'" value="'+value.id+'" '+value.state+'>'+spatial_name+'</option>';
            raumgl_selection.append(html);
        });
        //set the disable title
        raumgl_selection.find('option').each(function(){if($(this).is(':disabled')){$(this).attr("title","Für den Indikator nicht verfügbar")}});
    },
    init:function(json_raumgl) {
        const menu = this;
        menu.values = json_raumgl;
        //create the spatial choice menu
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete') {
            let raumgl_parameter = menu.getParamter();

            if (!raumgl_parameter) {
                menu.updateParamter('bld');
            }
            //set the options
            menu.fill();
            //set the selected Option
            let inArray = $.inArray(menu.getSelectionId(), menu.range);
            let selected = menu.getSelectionId();
            //check if it's possible to set the stored parameter
            if (inArray != -1) {
                selected = menu.getSelectionId();
            }
            //if not check if krs is possible as the main option
            else {
                selected = menu.range[0];
                indikator_json_group.clean();
                alert_manager.alertNotinSpatialRange($('#Raumgliederung option:selected').text(), selected);
                return false;
            }

            urlparamter.updateURLParameter('raumgl', selected);
            $('#' + selected + "_raumgl").prop("selected", true);

            //check if raumgl fein is set or not -> standrad map create
            let parameter_ags = urlparamter.getUrlParameter('ags_array');
            let selection_fein = raumgliederung.getSelectionId();
            if (!raumgliederung.getSelectionId() && !parameter_ags) {
                indikator_json.init();
            } else {
                //check if parameter are set
                if (parameter_ags) {
                    //set the ddm grob map
                    let callback=function(){
                        let ags_set = parameter_ags.split(',');
                        page_init = true;
                        gebietsauswahl.getDOMObject()
                            .dropdown('refresh')
                            .dropdown('set selected', ags_set);

                        if (selection_fein) {
                            //check if the parameter is possible for the given indicator
                            raumgliederung.init();
                            if ($.inArray(selection_fein, menu.range) !== -1) {
                                $('#raumgl_fein' + selection_fein).prop("selected", true);
                                indikator_json.init(selection_fein);
                            } else {
                                indikator_json_group.clean();
                                alert_manager.alertNotinSpatialRange($('#Raumgliederung option:selected').text(), $('#Raumgliederung option:selected').val());
                                if (menu.range.length < 1) {
                                    raumgliederung.hide();
                                }
                            }
                        }
                    };
                    indikator_json.init(menu.getSelectionId(),callback);
                }
            }
        }
        else{
            let steps_set = [];
            let slider = $("#raum_slider");
            $.each(json_raumgl, function (i,val) {
                steps_set.push(val);
            });
            //initializeFirstView the spatial extend slider
            rasterweite_slider.init(steps_set);
            indikator_raster.init();
        }
        menu.constroller.set();

    },
    getSpatialExtentNameById(id){
        return $(`#${id}_raumgl`).text();
    },
    constroller:{
        set:function() {
            //bind the on click events
            raeumliche_analyseebene.getDOMObject()
                .find('#Raumgliederung')
                .unbind()
                .change(function () {
                    if(!raumgliederung.getSelectionId()) {
                        TableSelection.clearSelection();
                    }
                    changed = true;
                    let choice = $(this).val();
                    //start the pipeline
                    gebietsauswahl.clear();
                    raumgliederung.removeParameter();
                    gebietsauswahl.removeParamter();
                    //save the user setted spatial extent
                    if (choice === "gem") {
                        alert_manager.alertServerlast(choice);
                    } else {
                        raeumliche_analyseebene.updateParamter(choice);
                        indikator_json.init();
                    }
                    expand_panel.close();
                    gebietsauswahl.clearAddedAGS();
                    raumgliederung.init();
                    gebietsauswahl.clear();
                    //remove the fine choice for spatial extent
                    raumgliederung.hide();
                    changed = false;
                });
        }
    }
};