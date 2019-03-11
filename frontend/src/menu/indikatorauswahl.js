//Indikatorauswahl
const indikatorauswahl ={
    possebilities:false,
    all_possible_years:'',
    filtered_years:'',
    paramter:'ind',
    previous_indikator:'',
    responsive:false,
    schema:{
        //collection of icons which stands for each category https://semantic-ui.com/elements/icon.html
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
        "E":{"name":"Energie","icon":"<i class='adjust icon'></i>","color":false},
        "M":{"name":"Materiallager","icon":"<i class='cubes icon'></i>","color":false},
        "X":{"name":"Relief","icon":"<i class='align right icon'></i>","color":false}
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
                //create the cat choices
                if(main_view.getHeight()>=700) {
                    menu.responsive=false;
                    html += `<div id="kat_item_${cat_id}"
                                  title="${main_view.getHeight() >= 800 ? '':'durch erneutes anklicken ändern sie die horizontale Positionierung des Sub-Menü'}"
                                  class="ui left pointing dropdown link item link_kat" 
                                  data-value="${cat_id}"
                                  style="${background_color}">
                                ${icon_set}
                                <i class="dropdown icon"></i>
                                ${cat_name()}
                                <div id="submenu${cat_id}" class="menu submenu upward">`;
                }else{
                    menu.responsive=true;
                    html += `<div class="header">
                                <i class="tags icon"></i>${cat_name()}</div>
                            <div class="divider"></div>`
                }
                //create the subselection
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
                        times = value.times,
                        markierung_class=function(){
                            let set="";
                            if(markierung==="true"){
                                set= "indicator_ddm_item_bold";
                            }
                            return set;
                        };

                    html += `<div class="${markierung_class()} item link_sub" 
                                    id="${ind_id}_item" 
                                    data-times="${times}" 
                                    data-einheit="${einheit}" 
                                    data-value="${ind_id}" 
                                    data-kat="${cat_id}" 
                                    data-name="${ind_name()}" 
                                    data-sort="1" 
                                    data-actuality="${grundakt_state}">`;
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
                        alert_manager.alertNotAsRaster();
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
        if(start_map.getState()){
            start_map.remove();
        }
        farbschema.reset();
        //reset error code
        error.setErrorCode(false);
        legende.init(true);
        $.when(request_manager.getJahre(indicator_id)).done(function(data_time){
            menu.all_possible_years = data_time;
            let years_selected = [];
            $.each(data_time,function(key,value){
                if(value<helper.getCurrentYear()){
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
        $('#kat_item_'+menu.getIndikatorKategorie(indicator_id)).css({"color": farbschema.getColorHexMain(), "font-weight": "bold"});
        $('#'+indicator_id+"_item").css({"color": farbschema.getColorHexMain(), "font-weight": "bold"});
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
    //function to clone the indicator dropdown menu to reuse it for example inside table expand or chart
    cloneMenu:function(appendToId,newClassId,orientation,exclude_kat,possible_indicators){
        let elem_id = $(`#${appendToId}`);
        let menu_clone = $('.toolbar #kat_auswahl > div').clone();

        //get the responsive menu

        menu_clone
            .removeClass('link_kat')
            .addClass(newClassId)
            .each(function() {
                let element = $(this);
                //add  the needed classes and change the id
                element
                    .find('i')
                    .addClass(orientation);
                element
                    .find('.submenu')
                    .addClass(orientation)
                    .addClass('transition')
                    .removeAttr("id")
                    .find('.item')
                    .each(function(){
                        //if true clone only indicators which times are possible with the indicator set times
                        if(possible_indicators){
                            let times_values = $(this).data("times").toString().split(',');
                            let time = zeit_slider.getTimeSet().toString();
                            if($.inArray(time,times_values)===-1){
                                $(this).remove();
                            }
                        }
                    });
        });

        //set the align css for the menu
        let text_align = 'left';
        if(orientation==='left'){
            text_align = 'right';
        }
        menu_clone.find('.item').children().css('text-align',text_align);
        //add the element to the given id
        elem_id
            .html(menu_clone);

        //exlude categories for cloning
        if(exclude_kat){
            if(exclude_kat instanceof Array){
                $.each(exclude_kat,function(key,value){
                    elem_id.find(`#kat_item_${value}`).remove();
                });
            }else {
                elem_id.find(`#kat_item_${exclude_kat}`).remove();
            }
        }
        //if menu is fully added -> remove empty categories, no need for responisve menu without categories view
        if(!this.responsive) {
            var interval = setInterval(function () {
                //if all indictaor values are ready
                if (elem_id.find('.submenu').length >= 2) {
                    clearInterval(interval);
                    elem_id
                        .find('.submenu')
                        .each(function () {
                            let length = $(this).find(".item").length;
                            if (length === 0) {
                                let set = $(this).parent();
                                set.remove();
                            }
                        });
                }
            }, 50);
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
                    onShow:function(){
                        $('.link_kat')
                            .unbind()
                            .click(function(){
                                MenuHelper.setUpward($(this).find('.submenu'));
                            });
                    },
                    onChange: function (value, text, $choice) {
                        //enable or disbale OGC Services 
                        let state_ogc = indikatorauswahl.getIndikatorInfo(value,"ogc");
                        var interval = setInterval(function () {
                            //if all indictaor values are ready
                            if (state_ogc) {
                                clearInterval(interval);
                                if (state_ogc.wfs !=="1"){
                                    helper.disableElement("#wfs","");
                                }else{
                                    helper.enableElement("#wfs","");
                                }
                                if (state_ogc.wcs !=="1"){
                                    helper.disableElement(".raster_export","");
                                }else{
                                    helper.enableElement(".raster_export","");
                                }
                            }
                        }, 100);
                        //clean the search field
                        $('#search_input_indikatoren').val('');
                        //save the prev selected indicator as paramter
                        indikatorauswahl.previous_indikator=value;
                        indikatorauswahl.setIndicator(value);
                        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                            farbliche_darstellungsart.resetSelection();
                            dev_chart.chart.controller.clearChartArray();
                            expand_panel.close();
                        }
                        if(view_state.getViewState()==="responsive"){
                            toolbar.close();
                        }
                    },
                    onHide: function () {
                        helper.resetHighlightElementByID('indicator_ddm');
                    }
                });
        }
    }
};