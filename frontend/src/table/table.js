const table = {
    td_classes : 'collapsing',
    table_classes : 'tablesorter',
    excludedAreas:['Gemeindefreies Gebiet'],
    expandState:false,
    selection:[],
    getDOMObject: function(){
        $table = $('#table_ags');
        return $table;
    },
    init:function(){
      this.createInteract();
    },
    getContainer:function(){return $('#table_ags');},
    getScrollableAreaDOMObject:function(){
        $area =   $('#scrollable-area');
        return $area;
    },
    getTableBodyObject:function(){
        $elem = $('.tBody_value_table');
        return $elem;
    },
    getColSpanRow:function(){
        $elem = $('#header_ind_set');
        return $elem;
    },
    createInteract:function(){
      $('.table_page_header').html(`
                <div id="table_close" class="close_table">
                    <span title="Tabelle schließen" class="glyphicon glyphicon-remove checker" id="close_checker"></span>
                </div>
                <div id="interact_div">
                    <button type="button" class="btn btn-primary mobile_hidden" id="btn_table">
                        <i class="glyphicon glyphicon-chevron-right mobile_hidden" title="Tabelle mit Indikatorwerten oder Zeitschnitten erweitern"></i><span>erweitern</span></button>
                    <div title="Tabelle filtern" id="filter_table" class="filter"></div>
                    <div title="Tabelle als CSV exportieren" id="csv_export" data-id="csv_export" data-title="Tabelle als CSV exportieren"></div>
                     <input id="search_input_table" placeholder="Suche nach Orten.." type="text" class="form-control search_input prompt" />
                </div>
                <hr class="hr"/>
      `);
    },
    fill:function(){
        //array sorted by name
        let layer_array = _.sortBy(indikator_json_group.getLayerArray(),"gen"),
            html_table = `<table id="table_ags" class="${this.table_classes}">`,
            //create the main Table header --private functions
            createTableHeader=function(){
                let value_text = `Wert (${indikatorauswahl.getIndikatorEinheit()})`,
                    colspan = 5;
                if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                    colspan=6;
                }
                //the html for the header
                let html = `<thead id="thead" class="full-width">
                    <tr id="first_row_head">
                    <th colspan="${colspan}" data-sorter="false" class="sorter-false" id="header_ind_set">${indikatorauswahl.getSelectedIndikatorText_Lang()} (${zeit_slider.getTimeSet()})</th>
                    </tr>
                    <tr class="header" id="second_row_head">
                        <th class="th_head ${csv_export.ignoreClass}" data-export="false"></th>
                        <th class="th_head ${csv_export.ignoreClass}" id="tr_rang" data-export="false">lfd. Nr.</th>
                        <th class="th_head ags sort-arrow" data-export="true">AGS</th>
                        <th class="th_head gebietsname sort-arrow" data-export="true">Gebietsname</th>
                        <th id="tabel_header_raumgl" class="th_head sort-arrow" data-export="true">${value_text}</th>`;

                if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                    html += '<th class="th_head grundakt_head" id="grundakt_head">Mittlere Grund- aktualität</th>';
                }

                return (html+"</tr></thead>").trim();
            },
            createTableBody=function() {
                let html = `
                    <tbody id="tBody_selection" class="tBody_value_table"></tbody>
                    <tbody id="tBody_value_table" class="tBody_value_table">
                `,
                i=0;
                $.each(layer_array,function(key,value){
                    //set the counter
                    i+=1;

                    //set the variables
                    let ags = value.ags,
                        grundakt_value = value.grundakt,
                        value_int = value.value,
                        fc = value.fc,
                        des= value.des,
                        hc = value.hc,
                        name = value.gen,
                        ind = indikatorauswahl.getSelectedIndikator(),
                        einheit = indikatorauswahl.getIndikatorEinheit(),
                        exclude_area=function(){
                            if($.inArray(des,table.excludedAreas)!==-1){
                                return 'style="display:none"';
                            }
                            else{
                                return "";
                            }
                        },
                        //'icon container' for trend and indicator-comparing inside a digramm
                        img_trend = `<img class="dev_table indsingle_entwicklungsdiagr dev_chart_compare ${exclude.class_performance} mobile_hidden chart oneTime disbale_performance" 
                                                    data-name="${value.gen}" 
                                                    data-ags="${ags}" 
                                                    data-ind="${ind}" 
                                                    data-wert="${value_int}" 
                                                    data-einheit="${einheit}" 
                                                    data-title="Veränderung der Indikatorwerte für die Gebietseinheit" 
                                                    title="Veränderung der Indikatorwerte für die Gebietseinheit" 
                                                    id="indikatoren_diagramm_ags${ags}" 
                                                    style="margin-left: .5vh;"
                                                    src="${dev_chart.icon.single.path}"/>`,
                        img_trend_ind = `<img class="dev_table ind_entwicklungsdiagr dev_chart_trend ${exclude.class_performance} mobile_hidden chart oneTime disbale_performance" 
                                                    data-name="${value.gen}" 
                                                    data-ags="${ags}" 
                                                    data-ind="${ind}" 
                                                    data-wert="${value_int}" 
                                                    data-einheit="${einheit}" 
                                                    style="margin-left: .5vh;"
                                                    data-title="Veränderung des Indikatorwertes für die Gebietseinheit" 
                                                    title="Veränderung des Indikatorwertes für die Gebietseinheit"
                                                    id="indikatoren_diagramm_ags_ind${ags}" 
                                                    src="${dev_chart.icon.multiple.path}"/>`,
                        img_gebiets_profil = ` <img data-name="${value.gen}" 
                                                        data-ags="${ags}" 
                                                        data-ind="${ind}" 
                                                        data-wert="${value_int}" 
                                                        data-einheit="${einheit}" 
                                                        title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" 
                                                        class="indikatoren_gebietsprofil chart"  
                                                        id="indikatoren_gebietsprofil${ags}" 
                                                        style="margin-left: .2vh;"
                                                        src="frontend/assets/icon/indikatoren.png"/>`,
                        img_stat = ` <img data-name="${value.gen}" 
                                                 data-ags="${ags}" 
                                                 data-ind="${ind}" 
                                                 data-wert="${value_int}" 
                                                 data-einheit="${einheit}" 
                                                 title="Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators" 
                                                 class="indikatoren_diagramm_ags histogramm_ags" 
                                                 id="diagramm_ags${ags}" 
                                                 src="frontend/assets/icon/histogramm.png"/>`,
                        value_td = function(){
                        //Todo HC werden vom Backend nicht weitergegeben
                            if(hc !== '0'){
                                //split the hc
                                let hc_arr = hc.split("||"),
                                    hc_text = hc_arr[0],
                                    hc_value = hc_arr[1];
                                return `<img className="hc_icon" src="frontend/assets/hinweis/hinweis_${hc_value}.png" title="${hc_text}"/><b class=""> ${value.value_comma}</b>`;
                            }
                            else if(fc !== '0'){
                                //split the fc
                                let fc_arr = fc.split("||"),
                                    fc_name = fc_arr[2],
                                    fc_beschreibung = fc_arr[3];
                                return `<b title="${fc_beschreibung}" class="">${fc_name}</b>`;
                            }else{
                                return `<b class="">${value.value_comma}</b>${img_stat+img_trend + img_trend_ind}`;
                            }
                        },
                        grundaktualitaet_td=function(){
                            if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                                return `<td class="val-grundakt indicator_main">${grundakt_value}</td>`;
                            }
                            else{
                                return '';
                            }
                        };

                    try {
                        if (name === layer_array[i].gen && base_raumgliederung.getBaseRaumgliederungId() !== "bld") {
                            if (value.krs) {
                                name = name + " (" + value.krs + ")";
                            } else {
                                name = name + " (" + des + ")";
                            }
                        }
                    }catch(err){}

                    html += `<tr ${exclude_area()} id="${ags}" class="tr">
                                        <td class="${csv_export.ignoreClass}">
                                            <input id="checkbox_${ags}" type="checkbox" class="select_check disbale_performance mobile_hidden" data-ags="${ags}">
                                        </td>
                                        <td class="count_ags_table selectable ${csv_export.ignoreClass}"></td>
                                        <td class="td_ags">${ags}</td>
                                        <td class="td_name" data-des="${des}">
                                            ${img_gebiets_profil}
                                            ${ name}
                                        </td>
                                        <td class="val-ags" 
                                            data-name="${value.gen}" 
                                            data-text="${value_int}" 
                                            data-val="${value_int}">
                                            ${value_td()}
                                        </td>
                                        ${grundaktualitaet_td()}
                                    </tr>`;
                });
                return (html+"</tbody>").trim();
            },
            createTableFooter=function(){
                //germany values
                let stat_array = indikator_json.getStatistikArray(),
                    ags_ind_array = [],
                    value_g = false,
                    grundakt_val = false;

                //the footer part for the corresponding bld
                let ags_footer = function(){
                        //ags_values
                        if (typeof raumgliederung.getSelectionId() !=='undefined') {
                            let tfoot_ags='';
                            $.each(ags_ind_array, function (key, value) {
                                $.each(value, function (key_found, value_found) {
                                    let value_set = value_found.value_ags,
                                        grundakt_val = value_found.ags_grundakt,
                                        ags = key_found,
                                        name = value_found.gen,
                                        img_trend = `<img data-name="${value.gen}" 
                                                      data-ags="${ags}" 
                                                      data-ind="${indikatorauswahl.getSelectedIndikator()}" 
                                                      data-wert="${value_set}" 
                                                      data-einheit="${indikatorauswahl.getIndikatorEinheit()}" 
                                                      title="Veränderung der Indikatorwerte für die Gebietseinheit" 
                                                      style="margin-left: .5vh;"
                                                      class="dev_table indsingle_entwicklungsdiagr mobile_hidden" 
                                                      id="indikatoren_diagramm_ags${ags}" 
                                                      src="${dev_chart.icon.multiple.path}" />`,
                                        img_trend_ind = `<img data-name="${value.gen}" 
                                                          data-ags="${ags}" 
                                                          data-ind="${indikatorauswahl.getSelectedIndikator()}" 
                                                          data-wert="${value_set}" 
                                                          data-einheit="${indikatorauswahl.getIndikatorEinheit()}" 
                                                          title="Veränderung des Indikatorwertes für die Gebietseinheit" 
                                                          class="dev_table ind_entwicklungsdiagr mobile_hidden" 
                                                          id="indikatoren_diagramm_ags_ind${ags}"
                                                          style="margin-left: .5vh;" 
                                                          src="${dev_chart.icon.single.path}"/>`;

                                    tfoot_ags += `<tfoot class="tfoot full-width">
                                                <tr id="tfoot_${ags}">
                                                    <th colspan="4" class="td_name">
                                                        <img style="margin-left: 10px; margin-right: 10px;"
                                                             data-name="${value.gen}" 
                                                             data-ags="${ags}" 
                                                             data-ind="${indikatorauswahl.getSelectedIndikator()}" 
                                                             title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" 
                                                             class="indikatoren_gebietsprofil" 
                                                             src="frontend/assets/icon/indikatoren.png"/>
                                                             ${name}
                                                    </th>
                                                    <th class="val-ags" 
                                                        data-name="${value.gen}" 
                                                        data-val="${value_g}" 
                                                        data-ind="${indikatorauswahl.getSelectedIndikator()}">
                                                        ${value_set}
                                                        ${img_trend_ind+img_trend}
                                                     </th>`;
                                    if (indikatorauswahl.getSelectedIndiktorGrundaktState()) {
                                        tfoot_ags += `<th class="td_akt indicator_main">${grundakt_val}</th>`;
                                    }
                                });
                            });
                            return tfoot_ags.trim();
                        }else{
                            return ' ';
                        }
                    },
                    brd_footer=function(){
                        //get the stat values
                        $.each(stat_array, function (key) {
                            $.each(stat_array[key], function (key_set, value_set) {
                                if (key_set === 'wert_brd') {
                                    value_g = value_set;
                                } else if (key_set === 'grundakt_brd') {
                                    grundakt_val = value_set;
                                } else {
                                    let obj = {};
                                    obj[key_set] = value_set;
                                    ags_ind_array.push(obj);
                                }
                            });
                        });
                        let img_trend = `<img data-name="Bundesrepublik" 
                                      data-ags="99" 
                                      data-ind="${indikatorauswahl.getSelectedIndikator()}" 
                                      data-wert="${value_g}" 
                                      data-einheit="${indikatorauswahl.getIndikatorEinheit()}" 
                                      title="Veränderung der Indikatorwerte für die Gebietseinheit" 
                                      class="dev_table indsingle_entwicklungsdiagr mobile_hidden" 
                                      id="indikatoren_diagramm_ags99" 
                                      style="margin-left: .5vh;" 
                                      src="${dev_chart.icon.multiple.path}" />`,
                            img_trend_ind = `<img data-name="Bundesrepublik" 
                                          data-ags="99" 
                                          data-ind="${indikatorauswahl.getSelectedIndikator()}" 
                                          data-wert="${value_g}" 
                                          data-einheit="${indikatorauswahl.getIndikatorEinheit()}" 
                                          title="Veränderung des Indikatorwertes für die Gebietseinheit" 
                                          class="dev_table ind_entwicklungsdiagr mobile_hidden" 
                                          id="indikatoren_diagramm_ags_ind99" 
                                          style="margin-left: .5vh;" 
                                          src="${dev_chart.icon.single.path}"/>`,
                            tfoot_brd = `<tfoot class="tfoot full-width">
                                    <tr id="tfoot_99">
                                        <th colspan="4" class="td_name">
                                            <img style="margin-left: 10px; margin-right: 10px;"
                                                 data-name="Bundesrepublik" 
                                                 data-ags="99" 
                                                 data-ind="${indikatorauswahl.getSelectedIndikator()}" 
                                                 title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" 
                                                 class="indikatoren_gebietsprofil" src="frontend/assets/icon/indikatoren.png"/>
                                                 Bundesrepublik
                                        </th>
                                        <th class="val-ags" 
                                            data-name="Bundesrepublik" 
                                            data-val="${value_g}" 
                                            data-ind="${indikatorauswahl.getSelectedIndikator()}">
                                            ${value_g}
                                            ${img_trend_ind+img_trend}
                                        </th>`;

                        if (indikatorauswahl.getSelectedIndiktorGrundaktState()) {
                            tfoot_brd += `<th class="td_akt indicator_main">${grundakt_val}</th>`;
                        }
                        return tfoot_brd.trim();
                    };
                return `${brd_footer()+ags_footer()}</tr></tfoot>`;
            };

        html_table += createTableHeader()+createTableBody()+createTableFooter()+'</table><table id="header-fixed"></table>';

        $.when(this.clear())
            .then(this.append(html_table))
            .then(this.controller.set())
            .then(TableHelper.setRang())
            .then(TableSelection.setSelection())
            .then(TableHelper.setTableSorter())
            .then(this.expandState=false)
            .then(exclude.setPerformanceElements())
            .then(progressbar.remove());

        if(view_state.getViewState()==='mw'){
            main_view.resizeSplitter(table.getWidth());
        }
        //init the panels to filter or expand the table
        expand_panel.init();
        filter_panel.init();

        //disable charts for community level
        if(raumgliederung.getSelectionId()==='gem' || raeumliche_analyseebene.getSelectionId()==="gem"){
            helper.disableElement(".dev_chart_compare","Steht für die Gemeindeebene nicht zur Verfügung");
            helper.disableElement(".dev_chart_trend","Steht für die Gemeindeebene nicht zur Verfügung");
        }
        //disable chart for single time shift
        if(zeit_slider.getTimes().length===1){
            helper.disableElement(".dev_table",exclude.disable_text);
        }
    },
    clear:function(){
        this.expandState=false;
        this.getScrollableAreaDOMObject().empty();
    },
    append:function(html_string){
      TableHelper.destroyStickyTableHeader();
      this.getScrollableAreaDOMObject().append(html_string);
      TableHelper.setStickTableHeader();
    },
    expand:function(){
        const table = this;
        let grey_border = 'grey_border',
            class_expand = expand_panel.class_expand,
            expand_array = expand_panel.getExpandArray(),
            first_header_row = $('#first_row_head'),
            second_header_row = $('#second_row_head'),
            table_body = this.getTableBodyObject(),
            footer_brd = $('#tfoot_99'),
            def = $.Deferred();

        TableHelper.resetColspan();

        //function
        let getDifferenceValue=function(value_ind,value_ags){
                return (value_ags-value_ind).toFixed(2);
            },
            getDifferenceDiv=function(value_ind,value_ags){
                //create the difference view
                let dif_val = (value_ags-value_ind).toFixed(2),
                    class_glyphicon = 'negativ';
                if (value_ind<value_ags){
                    class_glyphicon='positiv';
                }else if(value_ags==value_ind){
                    class_glyphicon='';
                }
                return `<div class="dif_val_div">
                            <b>${dif_val.replace('.',',')}</b>
                            <span class="glyphicon glyphicon-circle-arrow-right ${class_glyphicon}"></span>
                        </div>`;
            },
            //function to get the order state inside the table, based on the given number
            getExpandValue=function(id,key_set){
                console.log("call expand value",id,key_set);
                let result = "";
                $.each(expand_array,function(key,value){
                    if(value.id===id){
                        if(key_set && typeof key_set !=="undefined") {
                            result =  value[key_set];
                        }else{
                            result = value;
                        }
                    }
                });
                return result;
            },
            //function to create the difference div, value ind = expand value
            //get the dufference between the year's
            getDiff_Grundakt=function(values_ind,values_set){
                //create the Date object Date(year,months)
                let date_set = new Date(parseFloat(values_set[0]),parseFloat(values_set[1])),
                    date_ind = new Date(parseFloat(values_ind[0]),parseFloat(values_ind[1])),
                    //solution to calc the difference from http://www.splessons.com/how-do-i-find-the-difference-between-two-dates-using-jquery/
                    diff_date = date_ind - date_set,
                    years = Math.floor(diff_date/31536000000),
                    months = Math.floor((diff_date % 31536000000)/2628000000);
                return `${years} <b>Jahr(e)</b><br/>${months} <b>Monat(e)</b>`;
                //return (years-(months/12)).toFixed(1).toString().replace('.',',');
            };

        //reset the colspan to originial
        if(!indikatorauswahl.getSelectedIndiktorGrundaktState()){TableHelper.setColspanHeader(5);}

        function defCalls(){
            let requests = [];
            $.each(expand_array,function(key,value){
                requests.push(RequestManager.getTableExpandValues(value));
            });
            $.when.apply($,requests).done(function(){
                def.resolve(arguments);
            });
            return def.promise();
        }
        defCalls().done(function(arr) {
            let results = [];
            if(expand_array.length===1){
                results.push(arr[0]);
            }else{
                for(let i=0;i<=expand_array.length-1;i++){
                    results.push(arr[i][0]);
                }
            }
            //sort by count
            results =  results.sort(function(obj1, obj2) {return obj1.count - obj2.count;});

            //expand the table---------------------------------------------------------------
            $.each(results,function(key,values_expand){
                console.log("results",results);
                let id = values_expand.id,
                    count =parseInt(values_expand.count),
                    name = getExpandValue(id,'text'),
                    einheit = values_expand.einheit,
                    time_set = getExpandValue(id,'time'),
                    //the html elements
                    obj_brd = getExpandValue(id),
                    obj_ags = [{ags:"99"}];

                console.log(id,count,name,einheit,time_set);

                //expand elements inside the map indicator table (S00AG, B00AG, ABS)
                if(count===10){
                    let colspan_th = $('#header_ind_set'),
                        rowspan_head = parseFloat(colspan_th.attr("colspan")),
                        einheit_txt = '('+einheit+')';
                    //expand the header of the table
                    colspan_th.attr("colspan",(rowspan_head+1));
                    if(id==="B00AG"){
                        einheit_txt = einheit;
                    }
                    second_header_row.append(`<th class="th_head ${class_expand} header">${name} ${einheit_txt}</th>`);
                    //expand the body
                    $.each(values_expand.values,function(key,value){
                        table_body.find('tr').each(function(){
                            //the ags is automatically the key
                            if($(this).attr("id")===key){
                                $(this).append(`<td class="val-ags ${class_expand}">${value.value_round}</td>`);
                            }
                        })
                    });
                    //expand the footer
                    footer_brd.append(`<th id="99_expand_${id}" class="val-ags ${class_expand}"></th>`);
                    //grab the data for brd and bld
                    $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let value_brd = data['values']['99']['value_round'];
                        $('#99_expand_'+id).text(value_brd);
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectionId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let obj_ags_bld = [{ags:value}];
                            $('#tfoot_'+value).append(`<th id="${value}_expand_${id}" class="val-ags ${class_expand}"></th>`);
                            $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let value_bld = data['values'][value]['value_round'];
                                $(`#${value}_expand_${id}`).text(value_bld);
                            });
                        });
                    }
                }
                //expand with BRD ord BLD as new columns outside the table
                else if(count===15){
                    //epand the header
                    let header_text_first_row = "Differenz",
                        header_text_second_row = "Bld-Wert ("+indikatorauswahl.getIndikatorEinheit()+")",
                        //get only the difference Value for data sorting
                        getDifferenceValue=function(value_ind,value_ags){
                            return (value_ags-value_ind);
                        };
                    if(id==='brd'){
                        header_text_second_row = 'Wert für BRD';
                    }
                    first_header_row.append(`<th colspan="2" class="${grey_border} ${class_expand} sorter-false expand">${name}</th>`);
                    second_header_row.append(`<th class="${grey_border} ${class_expand}">${header_text_first_row}</th>
                                              <th class="${class_expand}">${header_text_second_row}</th>`);

                    //expand the table body
                    $.each(values_expand.values,function(key,value_json){
                        table_body.find('tr').each(function(){
                            let ags_subst = $(this).attr("id").substr(0,2),
                                bld_text = ' ('+value_json.bld+')';
                            if (key === ags_subst || id ==='brd') {
                                if(id==='brd'){bld_text='';}
                                let value_bld = parseFloat(value_json.value_round.replace(",",".")),
                                    value_ags = parseFloat($(this).find('.val-ags').find('b').text().replace(",","."));

                                $(this).append(`<td class="${grey_border} ${class_expand} expand_brd_bld" 
                                                    data-sort-value="${getDifferenceValue(value_bld,value_ags)}">
                                                    ${getDifferenceDiv(value_bld,value_ags)}</td>
                                                <td class="val-ags ${class_expand}">${value_json.value_round+bld_text}</td>`);
                            }
                        });
                    });
                    //expand the table footer
                    $('#table_ags').find('.tfoot').find('tr').each(function(){$(this).append(`<th class="${grey_border} ${class_expand}" colspan="2"></th>`)})
                }
                //time shift expand
                else if(count===20){
                    let colspan = 1,
                        //calculate the cospan
                        td_grund = '',
                        td_diff = '',
                        x = 0;

                    if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                        x = x+2;
                        td_grund = '<th class="'+class_expand+' header">'+$('#grundakt_head').text()+'</th><th class="'+class_expand+' header">Aktualitäts- Differenz</th>';
                    }
                    if(expand_panel.getDifferenceState()){
                        x=x+1;
                        td_diff ='<th class="'+class_expand+' header">Differenz ('+time_set+' bis '+zeit_slider.getTimeSet()+')</th>';
                    }
                    //append the header
                    first_header_row.append(`<th colspan="${(colspan+x)}" class="${grey_border} ${class_expand} sorter-false expand">${name}</th>`);
                    second_header_row.append(`<th class="${grey_border} ${class_expand} header">${$('#tabel_header_raumgl').text()}</th>${td_grund+td_diff}`);

                    //append the body
                    $.each(values_expand.values,function(key,value_json) {
                        table_body.find('tr').each(function () {
                            let grundakt_val = '';
                            if($(this).attr("id")===key){
                                $(this).append(`<td class="val-ags ${grey_border} ${class_expand}">${value_json.value_round}</td>`);
                                //if possible append the grundakt
                                if(indikatorauswahl.getSelectedIndiktorGrundaktState()) {
                                    grundakt_val = value_json.grundakt;
                                    let values_set = grundakt_val.split("/");
                                    let values_ind = $(this).find('.val-grundakt.indicator_main').text().split("/");
                                    $(this).append(`<td class="val-grundakt ${class_expand}">${grundakt_val}</td><td class="val-grundakt ${class_expand}">${getDiff_Grundakt(values_ind,values_set)}</td>`);
                                }
                                //apend the differences if set
                                if(expand_panel.getDifferenceState()){
                                    //create the difference view
                                    let value_ind = parseFloat((value_json.value_round).replace(',', '.'));
                                    let value_ags = parseFloat($(this).find('.val-ags').find('b').text().replace(',', '.'));
                                    $(this).append(`<td class="${class_expand}" data-sort-value="${getDifferenceValue(value_ind,value_ags)}">${getDifferenceDiv(value_ind,value_ags)}</td>`);
                                }
                            }
                        });
                    });
                    //expand the footer
                    let key_time_shift = id.replace("|","_");
                    footer_brd.append('<th id="99_expand_'+key_time_shift+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                    if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                        footer_brd.append('<th id="expand_grundakt_footer_99'+key_time_shift+'" class="val-grundakt '+class_expand+'"></th><th id="expand_grundakt_footer_diff_99'+key_time_shift+'" class="val-grundakt '+class_expand+'"></th>');
                    }
                    if(expand_panel.getDifferenceState()){
                        footer_brd.append('<th id="expand_diff_footer_99'+key_time_shift+'" class="'+class_expand+'"></th>');
                    }
                    $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let data_array = data;
                        let value_brd = data_array['values']['99']['value_round'];
                        $('#99_expand_'+key_time_shift).text(value_brd);
                        if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                            let value_ind_brd = $('#tfoot_99 .td_akt.indicator_main').text().split("/");
                            let grundakt = data_array['values']['99']['grundakt'];
                            let value_brd_set = grundakt.split("/");
                            $('#expand_grundakt_footer_99'+key_time_shift).text(grundakt);
                            $('#expand_grundakt_footer_diff_99'+key_time_shift).html(getDiff_Grundakt(value_ind_brd,value_brd_set));
                        }
                        if(expand_panel.getDifferenceState()){
                            //create the difference view
                            let value_ind = parseFloat((value_brd).replace(',', '.'));
                            let value_ags = parseFloat(footer_brd.find('.val-ags').text().replace(',', '.'));
                            console.warn(value_ind,value_ags);
                            $('#expand_diff_footer_99'+key_time_shift).html(getDifferenceDiv(value_ind,value_ags));
                        }
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectionId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let tFoot_append_bld = $('#tfoot_'+value);
                            let obj_ags_bld = [{ags:value}];
                            tFoot_append_bld.append('<th id="'+value+'_expand_'+key_time_shift+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                            //first append, because if append inside ajax causes some trouble with the table order
                            if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                                tFoot_append_bld.append('<th id="expand_grundakt_footer'+value+'" class="val-grundakt '+class_expand+'"></th><th id="expand_grundakt_footer_diff'+value+'" class="val-grundakt '+class_expand+'"></th>');
                            }
                            if(expand_panel.getDifferenceState()){
                                tFoot_append_bld.append('<th id="expand_diff_footer_'+value+'" class="'+class_expand+'"></th>');
                            }
                            $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let data_array_bld = data;
                                let value_bld = data_array_bld['values'][value]['value_round'];
                                $('#'+value+'_expand_'+key_time_shift).text(value_bld);
                                if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                                    let value_ind_bld = $('#tfoot_'+value+' .td_akt').text().split("/");
                                    let grundakt = data_array_bld['values'][value]['grundakt'];
                                    let value_brd_set = grundakt.split("/");
                                    //add the data to the appended value
                                    $('#expand_grundakt_footer'+value).text(grundakt);
                                    $('#expand_grundakt_footer_diff'+value).html(getDiff_Grundakt(value_ind_bld,value_brd_set));
                                }
                                if(expand_panel.getDifferenceState()){
                                    //create the difference view
                                    let value_ind = parseFloat((value_bld).replace(',', '.'));
                                    let value_ags = parseFloat($('#tfoot_'+value).find('.val-ags').text().replace(',', '.'));
                                    //$('#tfoot_'+value).append('<td class="'+class_expand+'">'+getDifferenceDiv(value_ind,value_ags)+'</td>');
                                    $('#expand_diff_footer_'+value).html(getDifferenceDiv(value_ind,value_ags));
                                }
                            });
                        });
                    }
                }
                //trend values
                else if(count===30){
                    //the head
                    first_header_row.append('<th class="'+grey_border+' '+class_expand+' sorter-false expand">'+name+'</th>');
                    second_header_row.append('<th class="'+grey_border+' '+class_expand+' header">'+$('#tabel_header_raumgl').text()+'</th>');
                    //expand the table body
                    $.each(values_expand.values,function(key,value_json) {
                        table_body.find('tr').each(function () {
                            if($(this).attr("id")===key){
                                $(this).append('<td class="val-ags '+grey_border+' '+class_expand+'">'+value_json.value_round+'</td>');
                            }
                        });
                    });
                    //expand the footer
                    footer_brd.append('<th id="99_expand_'+time_set+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                    $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let value_brd = data['values']['99']['value_round'];
                        $('#99_expand_'+time_set).text(value_brd);
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectionId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let obj_ags_bld = [{ags:value}];
                            $('#tfoot_'+value).append('<th id="'+value+'_expand_'+time_set+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                            $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let value_bld = data['values'][value]['value_round'];
                                $('#'+value+'_expand_'+time_set).text(value_bld);
                            });
                        });
                    }
                }
                //indicator expand
                else if(count===50){
                    //epand the table header
                    first_header_row.append(`<th rowspan="2" class="${grey_border+" "+class_expand+" header"}">${name+" ("+einheit+")"}</th>`);

                    //expand the table body
                    $.each(values_expand.values,function(key,value_json) {
                        table_body.find('tr').each(function () {
                            if($(this).attr("id")===key){
                                $(this).append('<td class="val-ags '+grey_border+' '+class_expand+'">'+value_json.value_round+'</td>');
                            }
                        });
                    });
                    //expand the footer
                    footer_brd.append('<th id="99_expand_ind" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                    $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        console.log(data);
                        let value_brd = data['values']['99']['value_round'];
                        $('#99_expand_ind').text(value_brd);
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectionId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let obj_ags_bld = [{ags:value}];
                            $('#tfoot_'+value).append('<th id="'+value+'_expand_ind" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                            $.when(RequestManager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                console.log(data);
                                let value_bld = data['values'][value]['value_round'];
                                $('#'+value+'_expand_ind').text(value_bld);
                            });
                        });
                    }
                }
            });
            progressbar.remove();
            TableHelper.setTableSorter();
            table.expandState= true;
            main_view.resizeSplitter(table.getWidth()+80);
        });
    },
    setExpandState:function(_state){
        this.expandState = _state;
    },
    onScroll:function(){
        if(view_state.getViewState()==='responsive') {
            let scrollTimeout = null,
                scrollendDelay = 500, // ms
                scrollbeginHandler=function(){
                    panner.hide();
                },
                scrollendHandler=function(){
                    panner.show();
                    scrollTimeout = null;
                };
            if (scrollTimeout === null) {
                scrollbeginHandler();
            } else {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(scrollendHandler, scrollendDelay);
        }
    },
    getWidth:function(){
        return this.getContainer().width();
    },
    controller:{
        set:function(){
            const tableObject = table.getTableBodyObject();
            let table_body = $('#tBody_value_table'),
                TableSelectionion = $('#tBody_selection');

            //on click table head
            tableObject
                .find("thead")
                .unbind()
                .click(function(){
                    setTimeout(function () {
                        TableHelper.setRang();
                    }, 1000);
                });
            //trigger Update tablesorter and set the 'rang text'
            tableObject
                .find(".th_head")
                .unbind()
                .click(function () {
                    const header_rang = $('#tr_rang');
                    if($(this).hasClass('gebietsname')|| $(this).hasClass('ags')){
                        header_rang.text('lfd. Nr.');
                    }else {
                        header_rang.text('Rang');
                    }
                    tableObject.trigger('sortReset');
                });

            csv_export.init();

            //indikatorenvergleich button
            $('.indikatoren_gebietsprofil')
                .unbind()
                .click(function(){
                    let ags = $(this).data('ags'),
                        name = $(this).data('name');
                    area_info.open(ags,name);
                });
            //development chart button
            $('.indikatoren_diagramm_ags')
                .unbind()
                .click(function() {
                    statistics.chart.settings = {
                        ags: $(this).data('ags').toString(),
                        name: $(this).data('name'),
                        ind: indikatorauswahl.getSelectedIndikator(),
                        allValuesJSON: indikator_json.getJSONFile(),
                        indText: indikatorauswahl.getSelectedIndikatorText(),
                        indUnit: indikatorauswahl.getIndikatorEinheit()
                    };
                    statistics.open();
                });
            //development chart single ind

            $('.ind_entwicklungsdiagr')
                .unbind()
                .click(function () {
                    let ags = $(this).data('ags');
                    let name = $(this).data('name');
                    let ind = indikatorauswahl.getSelectedIndikator();
                    console.log("click");
                    dev_chart.chart.settings.ags = ags;
                    dev_chart.chart.settings.name = name;
                    dev_chart.chart.settings.ind = indikatorauswahl.getSelectedIndikator();
                    dev_chart.chart.settings.ind_vergleich = true;
                    dev_chart.open();
                });

            //development chart single indicator
            $('.indsingle_entwicklungsdiagr')
                .unbind()
                .click(function () {
                    let ags = $(this).data('ags');
                    let name = $(this).data('name');
                    let ind = indikatorauswahl.getSelectedIndikator();
                    dev_chart.chart.settings.ags = ags;
                    dev_chart.chart.settings.name = name;
                    dev_chart.chart.settings.ind = indikatorauswahl.getSelectedIndikator();
                    dev_chart.chart.settings.ind_vergleich = false;
                    dev_chart.open();
                });

            //Live Search in Table
            $('#search_input_table')
                .unbind()
                .on('keyup', function() {
                    let value = $(this).val().toLowerCase(),
                        selector = table_body.find('tr');
                    if(value.length >2) {
                        selector.each(function () {
                            if ($(this).find('.td_name').text().toLocaleLowerCase().includes(value)) {
                                $(this).show();
                            }else{
                                $(this).hide();
                            }
                        });
                    }else{
                        selector.show();
                    }
                });

            //Hover
            table_body
                .unbind()
                .mouseenter(function() {
                    $(this).delegate('tr', 'mouseover mouseleave', function (e) {
                        if (e.type === 'mouseover') {
                            let ags = $(this).find('.td_ags').text();
                            ags.trim();
                            indikator_json_group.highlight(ags,false);
                        }
                        else {
                            indikator_json_group.resetHightlight();
                        }
                    });
                });
            //add the scroll funcionality
            table.getScrollableAreaDOMObject()
                .unbind()
                .on("scroll",function(){
                    table.onScroll();
                });

            // selection for allowed spatial extends
            if(exclude.checkPerformanceAreas()) {
                //set selection by check
                $(document).on("change",".select_check",function(){
                       let ags = $(this).data("ags").toString();
                       //table.selection.push(ags);
                    TableSelection.addAgs(ags);
                    TableSelection.setSelection();
                       //table.setSelection();
                });
                //remove selection by uncheck
                $(document).on("change",".select_uncheck",function(){
                        let ags = $(this).data("ags").toString();
                        TableSelection.removeSelection(ags);
                    });
            }
        },
    }
};