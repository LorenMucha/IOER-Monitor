const raumgliederung = {
    param:'raumgl_fein',
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.param,_value);
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.param);
    },
    updateParamter:function(_value){
        urlparamter.updateURLParameter(this.param,_value);
    },
    removeParameter:function(){
        urlparamter.removeUrlParameter(this.param);
    },
    getSelectionId:function(){
        return this.getParamter();
    },
    setSelectionId:function(_val){
        $('#raumgl_fein'+_val).attr("selected",true);
    },
    getSelectionText:function(){
        return this.getDOMObject()
            .find('#Raumgliederung_Fein')
            .find("option:selected").text()
            .replace("- nur","")
            .replace("-","")
            .replace("ab 50 000 Ew.","");
    },
    getDOMObject:function(){
        $elem =  $('#menu_raumgl_fein');
        return $elem;
    },
    getContainerObject:function(){
        $elem = $('#user_choice');
        return $elem;
    },
    init:function(){
        this.constroller.set();
    },
    fill:function(){
        const object = this,
            menu = this.getDOMObject().find('#Raumgliederung_Fein');
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="gebiete") {
            object.clear();

            let length_raumgl = $('#Raumgliederung option:not(:disabled)').length;
            if (raeumliche_analyseebene.getSelectionId() !== 'ror' && raeumliche_analyseebene.getSelectionId() !=='gem' && length_raumgl > 1) {
                let values_menu = [],
                    values = [];

                raeumliche_analyseebene.getDOMObject().find('option').each(function () {
                    values_menu.push({id: $(this).val(), name: $(this).text(),state:$(this).data('state')});
                    values.push($(this).val());
                });

                let value_set = raeumliche_analyseebene.getSelectionId();
                let position = $.inArray(value_set, values);
                //show the menu only if the user has mor than 2 possebilities
                if (position != (values.length - 1) || values.length > 1) {
                    menu.append('<option data-val="preset" style="color: lightgrey;" selected="true" value="empty" disabled="disabled">Bitte wählen!</option><option data-val="preset" value="null">Auswahl zurücksetzen</option>');
                    $.each(values_menu, function (key, value) {
                        if (key > position) {
                            menu.append('<option data-val="preset" id="raumgl_fein' + value.id + '" name="' + value.name + '" value="' + value.id + '" '+value.state+'>' + value.name + '</option>');
                        }
                    });
                    //set the disable title
                    menu.find('option').each(function(){if($(this).is(':disabled')){$(this).attr("title","Für den Indikator nicht verfügbar")}});
                    if(typeof raumgliederung.getSelectionId() !=='undefined'){
                        $('#raumgl_fein'+raumgliederung.getSelectionId()).prop("selected",true);
                    }
                } else {
                    menu.append('<option data-val="preset" style="color: lightgrey;" selected="true" value="empty" disabled="disabled">keine Feingliederung verfügbar</option>');
                }
            } else {
                menu.append('<option data-val="preset" style="color: lightgrey;" selected="true" value="empty" disabled="disabled">keine Feingliederung verfügbar</option>');
            }
        }
    },
    clear:function(){
        this.getDOMObject().find('#Raumgliederung_Fein').empty();
    },
    hide:function(){
        this.getContainerObject().hide();
    },
    constroller:{
        set:function(){
            if(raeumliche_analyseebene.getSelectionId()!=='ror' && raeumliche_analyseebene.getSelectionId() !=='gem') {
                raumgliederung.getDOMObject()
                    .find('#Raumgliederung_Fein')
                    .unbind()
                    .change(function () {
                        let valueSelected = this.value,
                            url_parameter = raumgliederung.getParamter();

                        if (valueSelected === 'null') {
                            raumgliederung.removeParameter();
                            indikator_json.init();
                        } else {
                            if (!url_parameter) {
                                raumgliederung.setParameter(valueSelected);
                            } else {
                                raumgliederung.updateParamter(valueSelected);
                            }
                            indikator_json.init(valueSelected);
                        }
                    });
                raumgliederung.fill();
                raumgliederung.getContainerObject().show();
            }else{
                raumgliederung.hide();
            }
        }
    }
};