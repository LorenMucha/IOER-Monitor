var page_init = true,
    splitter_width = null,
    changed = false,
    step;

//Models--------------------------------------------------------------------
//Toolbar
const toolbar = {
    getDOMObject:function(){
        $elem = $('#toolbar');
        return $elem;
    },
    state:false,
    open:function(){
        this.state=true;
        if(mainView.getMobileState()){
            this.getDOMObject().removeClass('toolbar_close');
        }else{
            this.getDOMObject().removeClass('toolbar_close',500);
            map_indikator_infos.resize();
        }
    },
    close:function(){
        this.state=false;
        if(mainView.getMobileState()){
            this.getDOMObject().addClass('toolbar_close');
        }else{
            this.getDOMObject().addClass('toolbar_close',500);
            map_indikator_infos.resize();
        }
    },
    init:function(){
        // the mapnavbar
        this.state=true;
        this.controller.set();
    },
    getHeight:function(){
        return this.getDOMObject().height();
    },
    isOpen:function(){
        return this.state;
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
                map_indikator_infos.resize();
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
                    if(mainView.getHeight() <= 1000 && viewState.getViewState() ==='mw') {
                        let height = toolbar.getHeight() - $('#no_overflow').height() - 60;
                        $('#overflow_content').css("height",height+50);
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
//Indikatorauswahl
const indikatorauswahl ={
    possebilities:'',
    all_possible_years:'',
    filtered_years:'',
    paramter:'ind',
    previous_indikator:'',
    schema:{
        "N":{"name":"Nachhaltigkeit","icon":"<i class='leaf icon'></i>","color":false},
        "S":{"name":"Siedlung","icon":false,"color":"#fceded"},
        "V":{"name":"Verkehr","icon":false,"color":"#ededfd"},
        "F":{"name":"Freiraum","icon":false,"color":"#ecf3db"},
        "B":{"name":"Bevölkerung","icon":"<i class='male icon'></i>","color":false},
        "D":{"name":"Zersiedelung","icon":"<i class='spinner icon'></i>","color":false},
        "G":{"name":"Gebäude","icon":"<i class='home icon'></i>","color":false},
        "L":{"name":"Landschafts- und Naturschutz","icon":"<i class='bug icon'></i>","color":false},
        "U":{"name":"Landschaftsqualität","icon":"<i class='heart icon'></i>","color":false},
        "O":{"name":"Ökosystemleistungen","icon":"<i class='umbrella icon'></i>","color":false},
        "R":{"name":"Risiko","icon":"<i class='exclamation icon'></i>","color":false},
        "E":{"name":"Energie","icon":"<i class='bolt icon'></i>","color":false},
        "M":{"name":"Materiallager","icon":"<i class='cubes icon'></i>","color":false},
        "X":{"name":"Relief","icon":"<i class='align right icon'></i>","color":false}
    },
    getPreviousIndikator:function(){
        return this.previous_indikator;
    },
    getSelectedIndikator:function(){
        return urlparamter.getUrlParameter(this.paramter);
    },
    getIndikatorKategorie:function(_ind){
        return $('#'+_ind+"_item").attr("data-kat");
    },
    getSelectedIndikatorKategorie:function(){
        return $('#'+this.getSelectedIndikator()+"_item").attr("data-kat");
    },
    setIndikatorParameter:function(_value){
        urlparamter.setUrlParameter(this.paramter, _value);
    },
    getIndikatorEinheit:function(){
        let value =this.getIndikatorInfo(this.getSelectedIndikator(),"unit");
        if(typeof value ==='undefined' || value===''){
            value = '';
        }
        return value;
    },
    getSelectedIndiktorGrundaktState:function(){
        let value = $('#'+this.getSelectedIndikator()+'_item').data('actuality');
        return value === 'verfügbar';
    },
    updateIndikatorParamter:function(_value){
        urlparamter.updateURLParameter(this.paramter, _value);
    },
    getAllPossibleYears:function(){
        return this.all_possible_years;
    },
    getFilteredPossibleYears:function(){
        return this.filtered_years;
    },
    getPossebilities:function(){
        return this.possebilities;
    },
    getDOMObject:function(){
        $elem = $('#indicator_ddm');
        return $elem;
    },
    init:function(){
        this.fill();
        this.controller.set();
    },
    isVisible:function(){
        return this.getDOMObject().is(':visible');
    },
    fill:function(){
        const menu = this;
        //get all possebilities via ajax
        $.when(request_manager.getAllAvaliableIndicators()).done(function(data){
            menu.possebilities = data;
            let container = $('#kat_auswahl');
            let html = "";
            //fill the Options
            $.each(data,function(cat_key,cat_value){
                let cat_id = cat_key,
                    cat_name=function(){
                        let cat_name = cat_value.cat_name;
                        if(language_manager.language==="en"){
                            cat_name = cat_value.cat_name_en
                        }
                        return  cat_name;
                    },
                    color = menu.schema[cat_id]["color"],
                    icon= menu.schema[cat_id]["icon"],
                    background_color = '',
                    icon_set = '';

                if(color){
                    background_color="background-color:"+color+";";
                }else{
                    icon_set=icon;
                }

                if(mainView.getWidth()>=500) {
                    html += '<div id="kat_item_'+cat_id+'" class="ui left pointing dropdown link item link_kat" value="' + cat_id + '" style="'+background_color+'">'+icon_set+'<i class="dropdown icon"></i>' + cat_name() + '<div id="submenu' + cat_id + '" class="menu submenu upward">';
                }else{
                    html += '<div class="header">' +
                        '      <i class="tags icon"></i>'+cat_name()+'</div>' +
                        '    <div class="divider"></div>'
                }
                $.each(cat_value.indicators, function (key, value) {
                    let ind_id = key,
                        ind_name=function(){
                            let ind_name = value.ind_name;
                            if(language_manager.language==="en"){
                                ind_name = value.ind_name_en
                            }
                            return  ind_name;
                        },
                        markierung = value.significant,
                        grundakt_state = value.basic_actuality_state,
                        einheit = value.unit,
                        times = value.times;
                    if (markierung === 'true') {
                        html += '<div class="indicator_ddm_item_bold item link_sub" id="' + ind_id + '_item' + '" data-times="'+times+'" data-einheit="'+einheit+'" data-value="' + ind_id + '" value="' + ind_id + '" data-kat="' + cat_id + '" data-name="' + ind_name() + '" data-sort="1" data-actuality="'+grundakt_state+'">';
                    } else {
                        html += '<div class="item link_sub" id="' + ind_id + '_item' + '" data-times="'+times+'" data-einheit="'+einheit+'" data-value="' + ind_id + '" value="' + ind_id + '" data-kat="' + cat_id + '" data-name="' + ind_name() + '" data-sort="0" data-actuality="'+grundakt_state+'">';
                    }
                    html += ind_name() + "</div>";
                });
                html +='</div></div>';
            });
            container.empty().append(html);
            //sort by attribute 'markierung'
            $(container).find('div').sort(function(a,b){
                let contentA =parseInt( $(a).attr('data-sort'));
                let contentB =parseInt( $(b).attr('data-sort'));
                return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
            });
        })
        //append 'Siedlungsdicht for Herr Dr. Meinel'
            .then(function() {
                    $('#B02DT_item').clone().appendTo('#submenuN');
                }
            );
    },
    checkAvability:function(_ind,draw){
        let ind = this.getSelectedIndikator();
        const menu = this;
        if(_ind){ind = _ind;}
        $.when(request_manager.getAvabilityIndicator(ind)).done(function(data){
            $.each(data,function(key,value) {
                if(value.ind === ind) {
                    if(value.avability==false){
                        alertNotAsRaster();
                        $('.raster_export').hide();
                        return false;
                    }else{
                        if(!ind){
                            menu.setIndikatorParameter(ind);
                        }else{
                            menu.updateIndikatorParamter(ind);
                        }
                        if(draw){
                            menu.setIndicator(ind);
                        }
                        $('.raster_export').show();
                        return true;
                    }
                }
            });
        });
    },
    setIndicator:function(indicator_id){
        const menu = this;

        let ind_param = menu.getSelectedIndikator();
        if (!ind_param) {
            menu.setIndikatorParameter(indicator_id);
        } else {
            menu.updateIndikatorParamter(indicator_id);
        }
        $('#ind_choice_info').css({"color": "black", "font-weight": "bold"});
        $('.kennblatt').show();
        //reset the first init layer
        if(startMap.getState()){
            startMap.remove();
        }
        farbschema.reset();
        //reset error code
        error_code.setErrorCode(false);
        legende.init(true);
        $.when(request_manager.getJahre(indicator_id)).done(function(data_time){
            menu.all_possible_years = data_time;
            let years_selected = [];
            $.each(data_time,function(key,value){
                if(value<getCurrentYear()){
                    years_selected.push(value);
                }
            });
            menu.filtered_years = years_selected;
            zeit_slider.init(years_selected);
            $.when(request_manager.getRaumgliederung(indicator_id)).done(function(data_raum){
                raeumliche_analyseebene.init(data_raum);
            });
        });
        //reset highlight
        $('.item').each(function () {
            $(this).css({"color": "rgba(0,0,0,.87)", "font-weight": ""})
        });
        //highlight the elements inside the menu
        $('#kat_item_'+menu.getIndikatorKategorie(indicator_id)).css({"color": farbschema.getColorMain(), "font-weight": "bold"});
        $('#'+indicator_id+"_item").css({"color": farbschema.getColorMain(), "font-weight": "bold"});
    },
    getIndikatorInfo:function(indicator_id,key_name){
        let val_found = null;
        $.each(this.getPossebilities(),function(cat_key,cat_value){
            $.each(cat_value.indicators, function (key, value) {
                if(key===indicator_id){
                    val_found = value[key_name];
                }
            });
        });
        return val_found;
    },
    getSelectedIndikatorText:function(){
        const menu = this;
        let name = this.getDOMObject().dropdown('get text');
        if(name.toLowerCase().indexOf("bitte")===0 || menu.getSelectedIndikator() !== menu.previous_indikator){
            setTimeout(function(){
                name = $('#'+menu.getSelectedIndikator()+"_item").text();
                menu.setSelectedIndikatorText(name);
            },1000);
        }
        return name;
    },
    setSelectedIndikatorText:function(value){
        this.getDOMObject().dropdown('set text',value);
    },
    getSelectedIndikatorText_Lang:function(){
        //just as control mechanism
        this.getSelectedIndikatorText();
        return $('#'+this.getSelectedIndikator()+"_item").attr("data-name");
    },
    cloneMenu:function(appendToId,newClassId,orientation,exclude_kat,possible_indicators){

        $('.'+newClassId).remove();

        let target_ddm = $('.link_kat');
        if(target_ddm.length===0){
            target_ddm = $('.link_sub');
        }

        target_ddm.each(function(){
            $(this)
                .clone()
                .appendTo('#'+appendToId)
                .removeClass('link_kat')
                .addClass(newClassId);
        });

        $('.'+newClassId).
        each(function() {
            let element = $(this);
            let kat = $(this).attr("value");
            let time = zeit_slider.getTimeSet();
            //add  the needed classes and change the id
            element
                .find('i')
                .addClass(orientation);
            element
                .find('.submenu')
                .addClass(orientation)
                .addClass('transition')
                .removeAttr("id")
                .attr('id', 'submenu'+kat+newClassId)
                .find('.item').each(function(){
                //if true clone only indicators which times are possible with the indicator set times
                if(possible_indicators){
                    let times_values = $(this).data("times").toString().split(',');
                    let kat_name = $(this).data("kat");
                    let time = zeit_slider.getTimeSet().toString();
                    if($.inArray(time,times_values)===-1){
                        $(this).remove();
                    }
                }
            })
        });

        //remove empty kats
        $(' .'+newClassId).each(function(){
            if($(this).find('.item').length ==0){
                $(this).remove();
            }
        });

        //set the align css for the menu
        let text_align = 'left';
        if(orientation==='left'){
            text_align = 'right';
        }
        $('#'+appendToId+' >.item').css('text-align',text_align);

        //remove a excluded Kat
        if(exclude_kat){
            if(exclude_kat instanceof Array){
                $.each(exclude_kat,function(key,value){
                    $('.' + newClassId + "[value=" + value + "]").remove();
                });
            }else {
                $('.' + newClassId + "[value=" + exclude_kat + "]").remove();
            }
        }
    },
    openMenu:function(){
        this.getDOMObject().dropdown('show');
    },
    controller:{
        set:function(){
            indikatorauswahl.getDOMObject()
                .dropdown('refresh')
                .dropdown({
                    onChange: function (value, text, $choice) {
                        //clean the search field
                        $('#search_input_indikatoren').val('');
                        //save the prev selected indicator as paramter
                        indikatorauswahl.previous_indikator=value;
                        indikatorauswahl.setIndicator(value);
                        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                            farbliche_darstellungsart.resetSelection();
                            dev_chart.chart.controller.clearChartArray();
                            table_expand_panel.close();
                        }
                    },
                    onHide: function () {
                        resetHighlightElementByID('indicator_ddm');
                    }
                });
        }
    }
};
//checkbox Gebiete <-> Raster
const raeumliche_visualisierung = {
    param:'raeumliche_gliederung',
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.param,_value);
    },
    getParameter:function(){
        return urlparamter.getUrlParameter(this.param);
    },
    upateParameter:function(_value){
        urlparamter.updateURLParameter(this.param,_value);
    },
    getDOMObject:function(){
        $elem = $('#spatial_choice_checkbox_container');
        return $elem;
    },
    init:function(){
        indikatorauswahl.init();
        this.controller.set();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='raster'){
            this.setChecked();
        }
    },
    setRaster:function(){
        this.upateParameter('raster');
        mainView.restoreView();
        rightView.close();
        indikatorJSONGroup.clean();
        indikatorauswahl.fill();
        indikatorauswahl.checkAvability(false,true);
        legende.init(true);
        $('#spatial_range_raster').show();
        $('#spatial_range_gebiete').hide();
        $('#gebiete_label').css("color","black");
        $('#raster_label').css("color",farbschema.getColorMain());
        panner.hide();
        glaetten.init();
        raster_split.init();
    },
    setGebiete:function(){
        this.upateParameter('gebiete');
        mainView.restoreView();
        indikatorRasterGroup.clean();
        indikatorauswahl.fill();
        indikatorauswahl.checkAvability(false,true);
        $('#panRight').show();
        $('#spatial_range_raster').hide();
        $('#spatial_range_gebiete').show();
        $('#gebiete_label').css("color",farbschema.getColorMain());
        $('#raster_label').css("color","black");
        glaetten.remove();
        raster_split.remove();
        panner.init();
    },
    setChecked:function(){
        this.getDOMObject()
            .checkbox('check');
    },
    setUnchecked:function(){
        this.getDOMObject()
            .checkbox('set unchecked');
    },
    getRaeumlicheGliederung:function(){
        let parameter =  this.getParameter();
        if(!parameter){
            this.setParameter('gebiete');
        }
        return this.getParameter();
    },
    controller:{
        set:function(){
            raeumliche_visualisierung.getDOMObject()
                .checkbox('enable')
                .checkbox({
                    onChecked: function () {
                        raeumliche_visualisierung.setRaster();
                    },
                    onUnchecked: function() {
                        raeumliche_visualisierung.setGebiete();
                    }
                });
        }
    }
};
//Räumliche Analyseebene
const raeumliche_analyseebene = {
    values:'',
    param:'raumgl',
    range:[],
    getRange:function(){
      return this.range;
    },
    setParam:function(_value){
        urlparamter.setUrlParameter(this.param,_value);
    },
    updateParamter:function(_value){
        if(!this.getParamter()){
            this.setParam(_value);
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
            return this.getDOMObject().find('#Raumgliederung').find("option:selected").text().replace("- nur", "").replace("-", "");
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
                indikatorJSONGroup.clean();
                alertNotinSpatialRange($('#Raumgliederung option:selected').text(), selected);
                return false;
            }

            urlparamter.updateURLParameter('raumgl', selected);
            $('#' + selected + "_raumgl").prop("selected", true);

            //check if raumgl fein is set or not -> standrad map create
            let parameter_ags = urlparamter.getUrlParameter('ags_array');
            let selection_fein = raumgliederung.getSelectedId();
            if (!raumgliederung.getSelectedId() && !parameter_ags) {
                indikatorJSON.init();
            } else {
                //check if parameter are set
                if (parameter_ags) {
                    //set the ddm grob map
                    indikatorJSON.init(menu.getSelectionId(),
                        function () {
                            //reacreate the ddm grob
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
                                    indikatorJSON.init(selection_fein);
                                } else {
                                    indikatorJSONGroup.clean();
                                    alertNotinSpatialRange($('#Raumgliederung option:selected').text(), $('#Raumgliederung option:selected').val());
                                    if (menu.range.length < 1) {
                                        raumgliederung.hide();
                                    }
                                }
                            }
                        }
                    );
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
                    changed = true;
                    let choice = $(this).val();
                    //start the pipeline
                    gebietsauswahl.clear();
                    raumgliederung.removeParameter();
                    gebietsauswahl.removeParamter();
                    //save the user setted spatial extent
                    if (choice === "gem") {
                        alertServerlast(choice);
                    } else {
                        raeumliche_analyseebene.updateParamter(choice);
                        indikatorJSON.init();
                    }
                    table_expand_panel.close();
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
//Multi Choice Gebietsauswahl
const gebietsauswahl = {
    mapLayer:[],
    mapLayerGrund:[],
    addedAGS:[],
    paramter:'ags_array',
    getParamter:function(){
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
    getMapLayer:function(){return this.mapLayer;},
    setMapLayer:function(array){this.mapLayer=array;},
    getMapLayerGrund:function(){return this.mapLayerGrund;},
    setMapLayerGrund:function(array){this.mapLayerGrund=array;},
    getSelection:function(){return this.addedAGS;},
    setSelection:function(array){this.addedAGS=array;},
    clearAddedAGS:function(){
        this.addedAGS = [];
        urlparamter.removeUrlParameter(this.paramter);
    },
    getDOMObject:function(){
        $menu = $('#dropdown_grenzen_container');
        return $menu;
    },
    getClearIconObject:function(){
        $elem = $("#clear_gebietsauswahl");
        return $elem;
    },
    init:function(){
        /*
        Extend the existing semntic ui Object with the needed callbacks
         */
        const object = this;
        let parameter_ags_set = this.getParamter();

        if (this.countTags()=== 0) {
            this.fill();
            if(typeof parameter_ags_set ==='undefined'){
                object.setParamter('');
            }
            //create parameter AGS_ARRAY if not set
            $('#grenzen_choice').text('Gebietsauswahl: ' + raeumliche_analyseebene.getSelectionText().replace("- nur", ""));
            this.controller.set();
        }else{
            raumgliederung.init();
        }
    },
    addSelectedLayersToMap:function(){
        $.each(this.getMapLayer(), function (key, value) {
            indikatorJSON.addToMap(value, klassengrenzen.getKlassen());
        });
        $.each(this.getMapLayerGrund(), function (key, value) {
            grundakt_layer.addToMap(value, grundakt_layer.getKlassen());
        });
        indikatorJSONGroup.fitBounds();
    },
    removeSelectedLayersFromMap:function(value){
        indikatorJSONGroup.clean();
        let mapLayer = this.getMapLayer(),
            mapLayer_grund = this.getMapLayerGrund(),
            ags_array= this.getSelection();
        for (let i = 0; i < mapLayer.length; i++) {
            if (mapLayer[i].properties.ags == value) {
                mapLayer.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < mapLayer_grund.length; i++) {
            if (mapLayer_grund[i].properties.ags == value) {
                mapLayer_grund.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < ags_array.length; i++) {
            if (ags_array[i] == value) {
                ags_array.splice(i, 1);
                break;
            }
        }
        this.updateParamter(ags_array.toString());
        this.setMapLayer(mapLayer);
        this.setMapLayerGrund(mapLayer_grund);
        this.setSelection(ags_array);
        if(raumgliederung.getSelectedId()) {
            indikatorJSON.init(raumgliederung.getSelectedId());

        }else{
            this.addSelectedLayersToMap();
        }
        indikatorJSONGroup.fitBounds();
    },
    fill:function(){
        let items = {values:[]},
            selection = this.getDOMObject().dropdown('get value').split(','),
            json_set = indikatorJSON.getJSONFile();
        for (let i = 0; i < json_set.features.length; i++) {
            let gen = json_set.features[i].properties.gen,
                ags = json_set.features[i].properties.ags,
                fc = json_set.features[i].properties.fc;
            //items.push('<div class="item item_ddm_grob" data-value="'+ags+'" data-sort="'+gen+'">'+gen+'</div>');
            if(fc===0 || typeof fc !=='undefined' && $.inArray(ags,selection)===-1) {
                items['values'].push({
                    text: gen,
                    value: ags,
                    name: gen
                });
            }
        }
        items['values'].sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        this.getDOMObject().dropdown('setup menu',items);
    },
    clear:function(){this.getDOMObject().dropdown('clear')},
    countTags:function(){
        let tags =  this.getDOMObject().find('a');
        return tags.length;
    },
    getSelectionAsString:function(){
        let string ='';
        this.getDOMObject().find('a').each(function(){
            string +=$(this).text()+",";
        });
        return string.slice(0, -1);
    },
    controller:{
        set:function(){
            let mapLayer = [],
                mapLayer_grund = [],
                ags_array = [],
                menu =  gebietsauswahl.getDOMObject(),
                geoJson = indikatorJSON.getJSONFile();

            menu
                .unbind()
                .dropdown({
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        //close after each choice
                        menu.dropdown('hide');
                        indikatorJSONGroup.clean();
                        //update the paramter
                        ags_array.push(addedValue);
                        if(indikatorJSONGroup.getLayerArray().length!==ags_array.length) {
                            gebietsauswahl.updateParamter(ags_array.toString());
                        }
                        $.each(geoJson.features, function (key, value) {
                            $.each(value, function (_key, _value) {
                                if (_value.ags === addedValue) {
                                    mapLayer.push(value);
                                }
                            });
                        });
                        //only if possible
                        try {
                            $.each(grundakt_layer.getJSONFile().features, function (key, value) {
                                $.each(value, function (_key, _value) {
                                    if (_value.ags === addedValue) {
                                        mapLayer_grund.push(value);
                                    }
                                });
                            });
                        } catch (err) {

                        }
                        gebietsauswahl.setMapLayer(mapLayer);
                        gebietsauswahl.setMapLayerGrund(mapLayer_grund);
                        gebietsauswahl.setSelection(ags_array);
                        if(raumgliederung.getSelectedId() && !page_init){
                            indikatorJSON.init(raumgliederung.getSelectedId());
                        }else {
                            gebietsauswahl.addSelectedLayersToMap();
                            table.create();
                            raumgliederung.init();
                        }
                    },
                    onRemove: function (removedValue, removedText, $removedChoice) {
                        //changed: prevend Trigger
                        let value = removedValue;
                        if (gebietsauswahl.countTags() > 1 && changed == false) {
                            gebietsauswahl.removeSelectedLayersFromMap(value);
                        }else{
                            if(changed === false) {
                                $.when(raumgliederung.removeParameter())
                                    .then(gebietsauswahl.removeParamter())
                                    .then(gebietsauswahl.clearAddedAGS())
                                    .then(indikatorJSON.init())
                                    .then(raumgliederung.init());
                            }
                        }
                        $("tr[id^='"+value+"']").remove();
                    }
                });

            gebietsauswahl.getClearIconObject()
                .unbind()
                .click(function(){
                    raumgliederung.removeParameter();
                    gebietsauswahl.clear();
                    indikatorJSONGroup.fitBounds();
                    raumgliederung.hide();
                });
        }
    }
};
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
    getSelectedId:function(){
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
            .replace("-","");
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
                    if(typeof raumgliederung.getSelectedId() !=='undefined'){
                        $('#raumgl_fein'+raumgliederung.getSelectedId()).prop("selected",true);
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
                            indikatorJSON.init();
                        } else {
                            if (!url_parameter) {
                                raumgliederung.setParameter(valueSelected);
                            } else {
                                raumgliederung.updateParamter(valueSelected);
                            }
                            indikatorJSON.init(valueSelected);
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
const farbschema = {
    farben: {
        grey: ['f0f0f0', '636363'],
        YlOrRd: ['ffeda0', 'f03b20'],
        YlGnBu: ['edf8b1', '2c7fb8'],
        PuRd: ['e7e1ef', 'dd1c77']
    },
    paramter: 'farbschema',
    getDOMObject: function () {
        $elem = $('#farbwahl');
        return $elem;
    },
    getFarbwahlButtonDomObject: function () {
        $elem = $("#farbwahl_btn");
        return $elem;
    },
    getParamter: function () {
        return urlparamter.getUrlParameter(this.paramter);
    },
    setParamter: function (_value) {
        urlparamter.setUrlParameter(this.paramter, _value)
    },
    updateParamter: function (_value) {
        urlparamter.updateURLParameter(this.paramter, _value);
    },
    removeParamter: function () {
        urlparamter.removeUrlParameter(this.paramter);
    },
    fill: function () {
        const object = this;
        let color_container =  object.getDOMObject().find('#color_schema'),
            keys_array = [],
            def = $.Deferred();
        function defCalls() {
            let requests = [];
            $.each(object.farben, function (key, value) {
                keys_array.push(key);
                requests.push(request_manager.getColorSchema(value));
            });
            $.when.apply($, requests).done(function () {
                def.resolve(arguments);
            });
            return def.promise();
        }

        defCalls().done(function (arr) {
            color_container.empty();
            let html = "";
            $.each(arr,function(key,value){
                let key_color = keys_array[key];
                let li = '';
                let width = 100/klassenanzahl.getSelection();
                $.each(value[0],function(k,v){
                    li +='<i class="color_i" style="background:'+v+';width:'+width+'%;"></i>'
                });
                html +='<div id="'+key_color+'" class="color-line">'+li+"</div>";
            });
            color_container.append(html);
        });
    },
    init: function () {
        const object = this;
        this.fill();
        this.controller.set();
    },
    reset:function(){
        this.removeParamter();
        this.getFarbwahlButtonDomObject()
            .empty()
            .append('Bitte Wählen..<span class="caret"></span>');
    },
    setColorChoice: function () {
        if (raeumliche_visualisierung.getRaeumlicheGliederung()==="gebiete") {
            if (typeof raumgliederung.getSelectedId() === 'undefined') {
                indikatorJSON.init();
            } else {
                indikatorJSON.init(raumgliederung.getSelectedId());
            }
        }
        else {
            indikator_raster.init();
        }
    },
    getColorActive: function () {
        return "#8CB91B";
    },
    getColorMain: function () {
        return '#4E60AA';
    },
    getHexMin: function () {
        let paramter = this.getParamter(),
            return_value = '';
        if (typeof paramter !== 'undefined') {
            let value = paramter.split(',');
            return_value = value[0];
        }
        return return_value;
    },
    getHexMax: function () {
        let paramter = this.getParamter(),
            return_value = '';
        if (typeof paramter !== 'undefined') {
            let value = paramter.split(',');
            return_value = value[1];
        }
        return return_value;
    },
    controller: {
        set:function(){
            let click_farb = 0;
            $(document).on('click','.color-line',function(){
                let content = $(this).html(),
                    id = $(this).attr("id"),
                    paramter = farbschema.getParamter();
                farbschema.getFarbwahlButtonDomObject()
                    .empty()
                    .append('<span id="color_remove" class="glyphicon glyphicon-remove"></span><div class="color-line">' + content + '</div>');
                //craete the new colored map
                if (typeof paramter !== 'undefined') {
                    farbschema.updateParamter(farbschema.farben[id].toString());
                } else {
                    farbschema.setParamter(farbschema.farben[id].toString());
                }
                farbschema.setColorChoice();
            });
            $(document).on('click','#color_remove',function(){
                farbschema.removeParamter();
                farbschema.getFarbwahlButtonDomObject()
                    .empty()
                    .append('Bitte Wählen..<span class="caret"></span>');
                farbschema.getDOMObject().find('#color_schema').show();
                if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
                    indikator_raster.init();
                }
                else {
                    if (typeof raumgliederung.getSelectedId() === 'undefined') {
                        indikatorJSON.init();
                    } else {
                        indikatorJSON.init(raumgliederung.getSelectedId());
                    }
                }
            });
            //the color schema
            farbschema.getFarbwahlButtonDomObject()
                .unbind()
                .click(function () {
                    if(click_farb==0) {
                        farbschema.getDOMObject().find('#color_schema').show();
                        click_farb++;
                    }else{
                        farbschema.getDOMObject().find('#color_schema').hide();
                        click_farb = 0;
                    }

                });
        }
    }
};
const klassifzierung = {
    paramter:"klassifizierung",
    getDOMObject:function(){
        $elem = $('#menu_klassifizierung');
        return $elem;
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.paramter);
    },
    setParamter:function(_value){
        urlparamter.setUrlParameter(this.paramter,_value);
    },
    updateParamter:function(_value){
        urlparamter.updateURLParameter(this.paramter,_value);
    },
    removeParameter:function(){
        urlparamter.removeUrlParameter(this.paramter);
    },
    getSelectionId:function(_modus){
        const object = this;
        let parameter = this.getParamter();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete'|| _modus==="gebiete") {
            if (!parameter) {
                object.setParamter('haeufigkeit');
            }
            return object.getParamter();
        }else{
            //raster
            let values = ['gleicheAnzahl','gleicheBreite'];
            if(parameter === 'haeufigkeit'){
                return values[0];
            }else{
                return values[1];
            }
        }
    },
    init:function() {
        this.constroller.set();
    },
    constroller:{
        set:function() {
            klassifzierung.getDOMObject()
                .find('input')
                .unbind()
                .change(function () {
                    let value = $(this).val();
                    farbliche_darstellungsart.resetSelection();
                    klassifzierung.updateParamter(value);
                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                        if (typeof raumgliederung.getSelectedId() !== 'undefined') {
                            indikatorJSON.init(raumgliederung.getSelectedId());
                        } else {
                            indikatorJSON.init();
                        }
                    } else {
                        indikator_raster.init();
                    }
                });
        }
    }
};
const klassenanzahl = {
    paramter:'klassenanzahl',
    getDOMObject:function(){
        $elem = $('#Klassenanzahl');
        return $elem;
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.paramter);
    },
    setParamter:function(_value){
        urlparamter.setUrlParameter(this.paramter,_value);
    },
    updateParamter:function(_value){
        urlparamter.updateURLParameter(this.paramter,_value);
    },
    removeParameter:function(){
        urlparamter.removeUrlParameter(this.paramter);
    },
    getSelection:function(){
        const object = this;
        let parameter = object.getParamter();
        if(!parameter){
            object.setParamter(7);
        }else{
            $('#klassi_'+parameter).prop("selected",true);
        }
        return parseInt(object.getParamter());

    },
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            klassenanzahl .getDOMObject()
                .unbind()
                .change(function(){
                    farbliche_darstellungsart.resetSelection();
                    let value =$(this).val(),
                        param = klassenanzahl.getParamter();
                    if(!param){
                        klassenanzahl .setParamter(value);
                    }else{
                        klassenanzahl .updateParamter(value);
                    }
                    if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete'){
                        if(typeof raumgliederung.getSelectedId() !=='undefined'){
                            indikatorJSON.init(raumgliederung.getSelectedId());
                        }else{
                            indikatorJSON.init();
                        }
                    }else{
                        indikator_raster.init();
                    }
                });
        }
    }
};
const farbliche_darstellungsart = {
    paramter:'darstellung',
    getDOMObject:function(){
        $elem = $('#menu_darstellung');
        return $elem;
    },
    getParamter:function(){
        return urlparamter.getUrlParameter(this.paramter);
    },
    setParamter:function(_value){
        urlparamter.setUrlParameter(this.paramter,_value);
    },
    updateParamter:function(_value){
        urlparamter.updateURLParameter(this.paramter,_value);
    },
    removeParameter:function(){
        urlparamter.removeUrlParameter(this.paramter);
    },
    getSelectionId:function(){
        const object = this;
        let parameter = object.getParamter();
        if(!parameter){
            object.setParamter('auto');
        }
        return object.getParamter();

    },
    resetSelection:function(){
        this.updateParamter('auto');
        $('#farbreihe_auto').prop('checked', true);
    },
    init:function(){
        this.constroller.set();
    },
    constroller:{
        set:function(){
            //art of the vizualization
            farbliche_darstellungsart.getDOMObject()
                .find('input')
                .unbind()
                .change(function () {
                    let value = $(this).val();
                    farbliche_darstellungsart.updateParamter(value);
                    if(value==="auto"){
                        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='gebiete'){
                            indikatorJSON.init()
                        }else{
                            indikator_raster.init();
                        }
                    }
                });
        }
    }
};