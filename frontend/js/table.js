const table = {
    td_classes : 'collapsing',
    table_classes : 'tablesorter',
    excludedAreas:['Gemeindefreies Gebiet'],
    expandState:false,
    getDOMObject: function(){
        $table = $('#table_ags');
        return $table;
    },
    getContainer:function(){return $('#table_ags');},
    getScrollableAreaDOMObject:function(){
        $area =   $('#scrollable-area');
        return $area;
    },
    getTableBodyObject:function(){
        $elem = $('#tBody_value_table');
        return $elem;
    },
    getColSpanRow:function(){
        $elem = $('#header_ind_set');
        return $elem;
    },
    init:function(){
        //after sort is finish reset the rang
        $('.sorter-false').removeClass("header");
        this.controller.set();
    },
    create:function(){
        const tableObject = this.getContainer();

        //array sorted by name
        let layer_array = _.sortBy(indikatorJSONGroup.getLayerArray(),"gen");
        let html_table = '<table id="table_ags" class="'+this.table_classes+'">';
        html_table += createTableHeader()+createTableBody()+createTableFooter()+'</table><table id="header-fixed"></table>';

        this.clear();
        this.append(html_table);
        this.init();
        this.setRang();
        this.setStickTableHeader();
        this.setTableSorter();

        this.expandState=false;

        //remove progress bar if still visible
        if($('#progress_div').is(':visible') || tableObject.is(':visible')){
            progressbar.remove();
        }
        if(viewState.getViewState()==='mw'){
            mainView.resizeSplitter(table.getWidth());
        }
        //hide images on responsive devices
        if(viewState.getViewState()==='responsive'){
            $('.indsingle_entwicklungsdiagr').hide();
            $('.ind_entwicklungsdiagr').hide();
        }else{
            $('.indsingle_entwicklungsdiagr').show();
            $('.ind_entwicklungsdiagr').show();
        }
        //init the panels to filter or expand the table
        table_expand_panel.init();
        table_filter_panel.init();
        //create the main Table header
        function createTableHeader(){
            let value_text = indikatorauswahl.getSelectedIndikator().toUpperCase()+" ("+indikatorauswahl.getIndikatorEinheit()+")",
                colspan = 4;
            if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                colspan=5;
            }

            let html = '<thead id="thead" class="full-width">'+
                '<tr id="first_row_head">' +
                '<th colspan="'+colspan+'" data-sorter="false" class="sorter-false expand" id="header_ind_set">'+indikatorauswahl.getSelectedIndikatorText_Lang()+' ('+zeit_slider.getTimeSet()+')</th>'+
                '</tr>'+
                '<tr class="header" id="second_row_head">' +
                '<th class="th_head" id="tr_rang">lfd. Nr.</th>'+
                '<th class="th_head ags">AGS</th>'+
                '<th class="th_head gebietsname">Gebietsname</th>'+
                '<th id="tabel_header_raumgl" class="th_head">'+value_text+'</th>';

            if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                html += '<th class="th_head grundakt_head" id="grundakt_head">Mittlere Grund- aktualität</th>';
            }

            return html+"</tr></thead>";
        }
        function createTableBody() {
            let html = '<tbody id="tBody_value_table">',
                i=0,
                x = 0;
            $.each(layer_array,function(key,value){
                //set the counter
                if(i<(layer_array.length)-2) {i+=1;}

                //set the variables
                let ags = value.ags,
                    grundakt_value = value.grundakt,
                    wert = '<b>'+value.value_comma+'</b>',
                    value_int = value.value,
                    fc = value.fc,
                    des= value.des,
                    hc = value.hc,
                    name = value.gen,
                    raumgl = raeumliche_analyseebene.getSelectionId(),
                    ind = indikatorauswahl.getSelectedIndikator(),
                    einheit = indikatorauswahl.getIndikatorEinheit(),
                    //'icon container' for trend and indicator-comparing inside a digramm
                    img_trend = '<img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + ind + '" data-wert="' + value_int + '" data-einheit="' + einheit + '" title="Veränderung der Indikatorwerte für die Gebietseinheit" class="indsingle_entwicklungsdiagr" id="indikatoren_diagramm_ags' + ags + '" src="frontend/images/icon/indikatoren_diagr.png"/>',
                    img_trend_ind = '<img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + ind + '" data-wert="' + value_int + '" data-einheit="' + einheit + '" title="Veränderung des Indikatorwertes für die Gebietseinheit" class="ind_entwicklungsdiagr" id="indikatoren_diagramm_ags_ind' + ags + '" src="frontend/images/icon/indikatoren_verlauf.png"/>';

                //set the raumgl as id if raumgliederung is set
                if(typeof raumgliederung.getSelectedId()!=='undefined'){
                    raumgl= raumgliederung.getSelectedId();
                }

                if(name === layer_array[i].gen){
                    if(value.krs){
                        name = name+" ("+value.krs+")";
                    }else {
                        name = name + " (" + des + ")";
                    }
                }

                if(mainView.getMobileState()) {
                    img_trend = '';
                    img_trend_ind = '';
                }

                if($.inArray(des,table.excludedAreas)===-1) {
                    html += '<tr id="' + ags + '">';
                }else{
                    html += '<tr style="display:none;" id="' + ags + '">';
                }

                // handle error codes and notes
                if(hc ==='0' && fc==='0'){
                    html += '<td class="count_ags_table"></td><td class="td_ags">' + ags + '</td><td class="td_name" data-des="'+des+'"><img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + ind + '" data-wert="' + value_int + '" data-einheit="' + einheit + '" title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" class="indikatoren_gebietsprofil" id="indikatoren_gebietsprofil' + ags + '" src="frontend/images/icon/indikatoren.png"/>' + name + '</td><td class="val-ags" data-name="' + value.gen + '" data-sort-value="'+value_int+'" data-val="' + value_int + '">' + wert + '<img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + ind + '" data-wert="' + value_int + '" data-einheit="' + einheit + '" title="Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators" class="indikatoren_diagramm_ags" class="histogramm_ags" id="diagramm_ags' + ags + '" src="frontend/images/icon/histogramm.png"/>' + img_trend + img_trend_ind + '</td>';
                }
                else if (hc !== '0') {
                    //split the hc
                    let hc_arr = hc.split("||");
                    let hc_value = hc_arr[1];
                    let hc_text = hc_arr[0];
                    html += '<td class="count_ags_table"></td><td class="td_ags">'+ags + '</td><td class="td_name" data-des="'+des+'"><img data-name="'+name+'" data-ags="'+ags+'" data-ind="'+ind+'" data-wert="'+wert+'" data-einheit="'+einheit+'" title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" class="indikatoren_gebietsprofil" id="indikatoren_gebietsprofil'+ags+'" src="frontend/images/icon/indikatoren.png"/>'+name+'</td><td class="val-ags" data-name="'+name+'" data-sort-value="'+value_int+'" data-val="' +value_int+'"><img class="hc_icon" src="frontend/images/hinweis/hinweis_'+hc_value+'.png" title="' +hc_text+'"/>' +wert+'<img data-name="'+name+'" data-ags="'+ags+'" data-ind="'+ind+'" data-sort-value="'+value_int+'" data-wert="'+wert+'" data-einheit="'+einheit+'" title="Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators" class="histogramm_ags" src="frontend/images/icon/histogramm.png"/>'+img_trend+img_trend_ind+'</td>';
                }
                else if (fc !== '0') {
                    //split the fc
                    let fc_arr = fc.split("||");
                    let fc_value = fc[0];
                    let fc_name = fc_arr[2];
                    let fc_color = fc_arr[1];
                    let fc_beschreibung = fc_arr[3];
                    html += '<td class="count_ags_table"></td><td class="td_ags">' +ags+ '</td><td class="td_name" data-des="'+des+'">' +name+'</td><td  style="text-align: right;">' +fc_name+'</td>';
                }
                if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                    html +='<td class="val-grundakt">'+grundakt_value+'</td>';
                }

                html +='</tr>';
            });
            return html+"</tbody>";
        }
        function createTableFooter(){
            //germany values
            let stat_array = indikatorJSON.getStatistikArray();
            let ags_ind_array = [];
            let value_g,grundakt_val;

            //ags_values
            $.each(stat_array,function(key,value){
                $.each(stat_array[key],function(key_set,value_set)
                {
                    if (key_set === 'wert_brd') {
                        value_g = value_set;
                    }
                    else if (key_set === 'grundakt_brd') {
                        grundakt_val = value_set;
                    }else{
                        let obj = {};
                        obj[key_set] = value_set;
                        ags_ind_array.push(obj);
                    }
                });
            });
            function setAGSFooter() {
                //ags_values
                if (typeof raumgliederung.getSelectedId() !=='undefined') {
                    let tfoot_ags='';
                    $.each(ags_ind_array, function (key, value) {
                        $.each(value, function (key_found, value_found) {
                            let value_set = value_found.value_ags;
                            let grundakt_val = value_found.ags_grundakt;
                            let ags = key_found;
                            let name = value_found.gen;

                            let img_trend = '<img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" data-wert="' + value_set + '" data-einheit="' + indikatorauswahl.getIndikatorEinheit() + '" title="Veränderung der Indikatorwerte für die Gebietseinheit" class="indsingle_entwicklungsdiagr" id="indikatoren_diagramm_ags' + ags + '" src="frontend/images/icon/indikatoren_diagr.png" />';
                            let img_trend_ind = '<img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" data-wert="' + value_set + '" data-einheit="' + indikatorauswahl.getIndikatorEinheit() + '" title="Veränderung des Indikatorwertes für die Gebietseinheit" class="ind_entwicklungsdiagr" id="indikatoren_diagramm_ags_ind' + ags + '" src="frontend/images/icon/indikatoren_verlauf.png"/>';

                            tfoot_ags += '<tfoot class="tfoot full-width"><tr id="tfoot_'+ags+'">' +
                                '<th colspan="2"></th>' +
                                '<th class="td_name"><img data-name="' + value.gen + '" data-ags="' + ags + '" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" class="indikatoren_gebietsprofil" src="frontend/images/icon/indikatoren.png"/> <b>' + name + '</b></th>' +
                                '<th class="val-ags" data-name="' + value.gen + '" data-val="' + value_g + '" data-ind="' + indikatorauswahl.getSelectedIndikator() + '"><b>' + value_set + '</b><img data-name="Bundesrepublik" data-ags="' + ags + '" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" data-wert="' + value_set + '" data-einheit="' + indikatorauswahl.getIndikatorEinheit() + '" title="Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators" class="indikatoren_diagramm_ags" class="histogramm_ags" id="diagramm_ags_' + ags + '" src="frontend/images/icon/histogramm.png"/>' + img_trend + img_trend_ind + '</th>';
                            if (indikatorauswahl.getSelectedIndiktorGrundaktState()) {
                                tfoot_ags += '<th class="td_akt">' + grundakt_val + '</th>';
                            }
                        });
                    });
                    return tfoot_ags;
                }else{
                    return ' ';
                }
            }
            function setBRDFooter(value_g,grundakt_val) {
                let img_trend = '<img data-name="Bundesrepublik" data-ags="99" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" data-wert="' + value_g + '" data-einheit="' + indikatorauswahl.getIndikatorEinheit() + '" title="Veränderung der Indikatorwerte für die Gebietseinheit" class="indsingle_entwicklungsdiagr" id="indikatoren_diagramm_ags99" src="frontend/images/icon/indikatoren_diagr.png" />';
                let img_trend_ind = '<img data-name="Bundesrepublik" data-ags="99" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" data-wert="' + value_g + '" data-einheit="' + indikatorauswahl.getIndikatorEinheit() + '" title="Veränderung des Indikatorwertes für die Gebietseinheit" class="ind_entwicklungsdiagr" id="indikatoren_diagramm_ags_ind99" src="frontend/images/icon/indikatoren_verlauf.png"/>';

                let tfoot_brd = '<tfoot class="tfoot full-width"><tr id="tfoot_99">' +
                    '<th colspan="2"></th>' +
                    '<th class="td_name"><img data-name="Bundesrepublik" data-ags="99" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" title="Gebietesprofil: Charakteristik dieser Raumeinheit mit Werteübersicht aller Indikatoren" class="indikatoren_gebietsprofil" src="frontend/images/icon/indikatoren.png"/> <b>Bundesrepublik</b></th>' +
                    '<th class="val-ags" data-name="Bundesrepublik" data-val="' + value_g + '" data-ind="' + indikatorauswahl.getSelectedIndikator() + '"><b>' + value_g + '</b><img data-name="Bundesrepublik" data-ags="99" data-ind="' + indikatorauswahl.getSelectedIndikator() + '" data-wert="' + value_g + '" data-einheit="' + indikatorauswahl.getIndikatorEinheit() + '" title="Indikatorwert der Gebietseinheit in Bezug auf statistische Kenngrößen der räumlichen Auswahl und des gewählten Indikators" class="indikatoren_diagramm_ags" class="histogramm_ags" id="diagramm_ags_99" src="frontend/images/icon/histogramm.png"/>' + img_trend + img_trend_ind + '</th>';

                if (indikatorauswahl.getSelectedIndiktorGrundaktState()) {
                    tfoot_brd += '<th class="td_akt">' + grundakt_val + '</th>';
                }
                return tfoot_brd;
            }
            return setBRDFooter(value_g,grundakt_val)+setAGSFooter()+"</tr></tfoot>";
        }
    },
    clear:function(){
        this.expandState=false;
        this.getScrollableAreaDOMObject().empty();
    },
    append:function(html_string){
        this.getScrollableAreaDOMObject().append(html_string);
    },
    expand:function(){
        const table = this;
        let grey_border = 'grey_border',
            class_expand = table_expand_panel.class_expand,
            expand_array = table_expand_panel.getExpandArray(),
            colspan_th = $('#header_ind_set'),
            first_header_row = $('#first_row_head'),
            second_header_row = $('#second_row_head'),
            table_body = this.getTableBodyObject(),
            footer_brd = $('#tfoot_99'),
            def = $.Deferred();

        //reset the colspa
        if(!indikatorauswahl.getSelectedIndiktorGrundaktState()){table.setColspanHeader(4);}

        function defCalls(){
            let requests = [];
            $.each(expand_array,function(key,value){
                requests.push(request_manager.getTableExpandValues(value));
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
                let id = values_expand.id,
                    count =values_expand.count,
                    name = getExpandValue(id,'text'),
                    einheit = values_expand.einheit,
                    time_set = getExpandValue(id,'time'),
                    //the html elements
                    rowspan_head = parseFloat(colspan_th.attr("colspan"));

                //expand elements inside the map indicator table (S00AG, B00AG, ABS)
                if(count==10){
                    //expand the header of the table
                    colspan_th.attr("colspan",(rowspan_head+1));
                    let einheit_txt = '('+einheit+')';
                    if(id==="B00AG"){
                        einheit_txt = einheit;
                    }
                    second_header_row.append('<th class="th_head '+class_expand+' header">'+name+' '+einheit_txt+'</th>');
                    //expand the body
                    $.each(values_expand.values,function(key,value){
                        table_body.find('tr').each(function(){
                            //the ags is automatically the key
                            if($(this).attr("id")===key){
                                $(this).append('<td class="val-ags '+class_expand+'">'+value.value_round+'</td>');
                            }
                        })
                    });
                    //expand the footer
                    let obj_brd = getExpandValue(id);
                    let obj_ags = [{ags:"99"}];
                    footer_brd.append('<td id="99_expand_'+id+'" class="val-ags '+class_expand+'"></td>');
                    $.when(request_manager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let data_array = data;
                        let value_brd = data_array['values']['99']['value_round'];
                        $('#99_expand_'+id).text(value_brd);
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectedId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let obj_ags_bld = [{ags:value}];
                            $('#tfoot_'+value).append('<td id="'+value+'_expand_'+id+'" class="val-ags '+class_expand+'"></td>');
                            $.when(request_manager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let data_array_bld = data;
                                let value_bld = data_array_bld['values'][value]['value_round'];
                                $('#'+value+'_expand_'+id).text(value_bld);
                            });
                        });
                    }
                }
                //expand with BRD ord BLD as new columns outside the table
                else if(count ==15){
                    //epand the header
                    let header_text_first_row = "Differenz zum Bundesland",
                        header_text_second_row = "Bundeslandwert (Name)("+indikatorauswahl.getIndikatorEinheit()+")";
                    if(id==='brd'){
                        header_text_first_row = 'Differenz zur Bundesrepublik';
                        header_text_second_row = 'Wert für Bundesrepublik';
                    }
                    first_header_row.append('<th colspan="2" class="'+grey_border+' '+class_expand+' sorter-false expand">'+name+'</th>');
                    second_header_row.append('<th id="expand_values" class="'+grey_border+' '+class_expand+'">'+header_text_first_row+'</th><th class="'+class_expand+'">'+header_text_second_row+'</th>');

                    //expand the table body
                    $.each(values_expand.values,function(key,value_json){
                        table_body.find('tr').each(function(){
                            let ags_subst = $(this).attr("id").substr(0,2),
                                bld_text = ' ('+value_json.bld+')';
                            if (key === ags_subst || id ==='brd') {
                                if(id==='brd'){bld_text='';}
                                let value_bld = parseFloat(value_json.value_round);
                                let value_ags = parseFloat($(this).find('.val-ags').find('b').text());
                                $(this).append('<td class="'+grey_border+' '+class_expand+'" data-sort-value="'+getDifferenceValue(value_bld,value_ags)+'">'+getDifferenceDiv(value_bld,value_ags)+'</td><td class="val-ags '+class_expand+'">'+value_json.value_round+bld_text+'</td>');
                            }
                        });
                    });
                    //expand the table footer
                    $('#table_ags').find('.tfoot').find('tr').each(function(){$(this).append('<th class="'+grey_border+' '+class_expand+'" colspan="2"></th>')})
                }
                //time shift expand
                else if(count==20){
                    let colspan = 1,
                        //calculate the cospan
                        td_grund = '',
                        td_diff = '',
                        x = 0;

                    if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                        x = x+2;
                        td_grund = '<th class="'+class_expand+' header">'+$('#grundakt_head').text()+'</th><th class="'+class_expand+' header">Aktualitäts- Differenz (Jahre,dezimal)</th>';
                    }
                    if(table_expand_panel.getDifferenceState()){
                        x=x+1;
                        td_diff ='<th class="'+class_expand+' header">Differenz ('+time_set+' bis '+zeit_slider.getTimeSet()+')</th>';
                    }
                    //append the header
                    first_header_row.append('<th colspan="'+(colspan+x)+'" class="'+grey_border+' '+class_expand+' sorter-false expand">'+name+'</th>');
                    second_header_row.append('<th class="'+grey_border+' '+class_expand+' header">'+$('#tabel_header_raumgl').text()+'</th>'+td_grund+td_diff);

                    //append the body
                    $.each(values_expand.values,function(key,value_json) {
                        table_body.find('tr').each(function () {
                            let grundakt_val = '';
                            if($(this).attr("id")===key){
                                $(this).append('<td class="val-ags '+grey_border+' '+class_expand+'">'+value_json.value_round+'</td>');
                                //if possible append the grundakt
                                if(indikatorauswahl.getSelectedIndiktorGrundaktState()) {
                                    grundakt_val = value_json.grundakt;
                                    let values_set = grundakt_val.split("/");
                                    let values_ind = $(this).find('.val-grundakt').text().split("/");
                                    $(this).append('<td class="val-grundakt '+class_expand+'">'+grundakt_val+'</td><td class="val-grundakt '+class_expand+'">'+getDiff_Grundakt(values_ind,values_set)+'</td>');
                                }
                                //apend the differences if set
                                if(table_expand_panel.getDifferenceState()){
                                    //create the difference view
                                    let value_ind = parseFloat((value_json.value_round).replace(',', '.'));
                                    let value_ags = parseFloat($(this).find('.val-ags').find('b').text().replace(',', '.'));
                                    $(this).append('<td class="'+class_expand+'" data-sort-value="'+getDifferenceValue(value_ind,value_ags)+'">'+getDifferenceDiv(value_ind,value_ags)+'</td>');
                                }
                            }
                        });
                    });
                    //expand the footer
                    let obj_brd = getExpandValue(id),
                        obj_ags = [{ags:"99"}],
                        key_time_shift = id.replace("|","_");
                    footer_brd.append('<th id="99_expand_'+key_time_shift+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                    if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                        footer_brd.append('<th id="expand_grundakt_footer_99" class="val-grundakt '+class_expand+'"></th><th id="expand_grundakt_footer_diff_99" class="val-grundakt '+class_expand+'"></th>');
                    }
                    if(table_expand_panel.getDifferenceState()){
                        footer_brd.append('<th id="expand_diff_footer_99" class="'+class_expand+'"></th>');
                    }
                    $.when(request_manager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let data_array = data;
                        let value_brd = data_array['values']['99']['value_round'];
                        $('#99_expand_'+key_time_shift).text(value_brd);
                        if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                            let value_ind_brd = $('#tfoot_99 .td_akt').text().split("/");
                            let grundakt = data_array['values']['99']['grundakt'];
                            let value_brd_set = grundakt.split("/");
                            $('#expand_grundakt_footer_99').text(grundakt);
                            $('#expand_grundakt_footer_diff_99').text(getDiff_Grundakt(value_ind_brd,value_brd_set));
                        }
                        if(table_expand_panel.getDifferenceState()){
                            //create the difference view
                            let value_ind = parseFloat((value_brd).replace(',', '.'));
                            let value_ags = parseFloat(footer_brd.find('.val-ags').find('b').text().replace(',', '.'));
                            $('#expand_diff_footer_99').html(getDifferenceDiv(value_ind,value_ags));
                        }
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectedId()!=='undefined'){
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
                            if(table_expand_panel.getDifferenceState()){
                                tFoot_append_bld.append('<th id="expand_diff_footer_'+value+'" class="'+class_expand+'"></th>');
                            }
                            $.when(request_manager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let data_array_bld = data;
                                let value_bld = data_array_bld['values'][value]['value_round'];
                                $('#'+value+'_expand_'+key_time_shift).text(value_bld);
                                if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
                                    let value_ind_bld = $('#tfoot_'+value+' .td_akt').text().split("/");
                                    let grundakt = data_array_bld['values'][value]['grundakt'];
                                    let value_brd_set = grundakt.split("/");
                                    //add the data to the appended value
                                    $('#expand_grundakt_footer'+value).text(grundakt);
                                    $('#expand_grundakt_footer_diff'+value).text(getDiff_Grundakt(value_ind_bld,value_brd_set));
                                }
                                if(table_expand_panel.getDifferenceState()){
                                    //create the difference view
                                    let value_ind = parseFloat((value_bld).replace(',', '.'));
                                    let value_ags = parseFloat($('#tfoot_'+value).find('.val-ags').find('b').text().replace(',', '.'));
                                    //$('#tfoot_'+value).append('<td class="'+class_expand+'">'+getDifferenceDiv(value_ind,value_ags)+'</td>');
                                    $('#expand_diff_footer_'+value).html(getDifferenceDiv(value_ind,value_ags));
                                }
                            });
                        });
                    }
                }
                //trend values
                else if(count==30){
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
                    let obj_brd = getExpandValue(id);
                    let obj_ags = [{ags:"99"}];
                    footer_brd.append('<th id="99_expand_'+time_set+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                    $.when(request_manager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let data_array = data;
                        let value_brd = data_array['values']['99']['value_round'];
                        $('#99_expand_'+time_set).text(value_brd);
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectedId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let obj_ags_bld = [{ags:value}];
                            $('#tfoot_'+value).append('<th id="'+value+'_expand_'+time_set+'" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                            $.when(request_manager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let data_array_bld = data;
                                let value_bld = data_array_bld['values'][value]['value_round'];
                                $('#'+value+'_expand_'+time_set).text(value_bld);
                            });
                        });
                    }
                }
                //indicator expand
                else if(count==50){
                    //epand the table header
                    first_header_row.append('<th rowspan="2" class="'+grey_border+' '+class_expand+' header">'+name+' ('+einheit+')</th>');

                    //expand the table body
                    $.each(values_expand.values,function(key,value_json) {
                        table_body.find('tr').each(function () {
                            if($(this).attr("id")===key){
                                $(this).append('<td class="val-ags '+grey_border+' '+class_expand+'">'+value_json.value_round+'</td>');
                            }
                        });
                    });
                    //expand the footer
                    let obj_brd = getExpandValue(id);
                    let obj_ags = [{ags:"99"}];
                    footer_brd.append('<th id="99_expand_ind" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                    $.when(request_manager.getTableExpandValues(obj_brd,obj_ags)).done(function(data){
                        let data_array =data;
                        let value_brd = data_array['values']['99']['value_round'];
                        $('#99_expand_ind').text(value_brd);
                    });
                    //if finer spatial choice -> expand the table footer above the brd part
                    if(typeof raumgliederung.getSelectedId()!=='undefined'){
                        //get the selection from the dropdown as string
                        let selection = $('#dropdown_grenzen_container').dropdown('get value').split(',');
                        //append the footer
                        $.each(selection,function(key,value){
                            let obj_ags_bld = [{ags:value}];
                            $('#tfoot_'+value).append('<th id="'+value+'_expand_ind" class="val-ags '+grey_border+' '+class_expand+'"></th>');
                            $.when(request_manager.getTableExpandValues(obj_brd,obj_ags_bld)).done(function(data){
                                let data_array_bld = data;
                                let value_bld = data_array_bld['values'][value]['value_round'];
                                $('#'+value+'_expand_ind').text(value_bld);
                            });
                        });
                    }
                }
            });
            progressbar.remove();
            table.setTableSorter();
            table.expandState= true;
            mainView.resizeSplitter(table.getWidth()+80);
        });
        //function to get the order state inside the table, based on the given number
        function getExpandValue(id,key_set){
            let return_val;
            $.each(expand_array,function(key,value){
                if(value.id===id){
                    if(key_set) {
                        return_val = value[key_set];
                    }else{
                        return_val=value;
                    }
                }
            });
            return return_val;
        }
        //get only the difference Value for data sorting
        function getDifferenceValue(value_ind,value_ags){
            return (value_ags-value_ind).toFixed(2);
        }
        //function to create the difference div, value ind = expand value
        function getDifferenceDiv(value_ind,value_ags){
            //create the difference view
            let dif_val = (value_ags-value_ind).toFixed(2),
                class_glyphicon = 'negativ';
            if (value_ind<value_ags){
                class_glyphicon='positiv';
            }else if(value_ags==value_ind){
                class_glyphicon='';
            }
            return '<div class="dif_val_div"><span class="glyphicon glyphicon-circle-arrow-right '+class_glyphicon+'"></span><b>'+dif_val.replace('.',',')+'</b></div>';
        }
        //get the dufference between the year's
        function getDiff_Grundakt(values_ind,values_set){
            let date_set = new Date(parseFloat(values_set[1]),parseFloat(values_set[0])),
                date_ind = new Date(parseFloat(values_ind[1]),parseFloat(values_ind[0])),
                //solution to calc the difference from http://www.splessons.com/how-do-i-find-the-difference-between-two-dates-using-jquery/
                diff_date = date_ind - date_set,
                years = Math.floor(diff_date/31536000000),
                months = Math.floor((diff_date % 31536000000)/2628000000);
            return (years-(months/12)).toFixed(1).toString().replace('.',',');
        }
    },
    setExpandState:function(_state){
        this.expandState = _state;
    },
    setRang:function(){
        let i=0;
        this.getContainer().find('.count_ags_table').each(function(){
            if($(this).closest('tr').css("display")!=='none') {
                i +=1;
                $(this).text(i);
            }
        });
    },
    setColspanHeader:function(val){
        this.getColSpanRow().attr("colspan",val);
    },
    setTableSorter:function(){
        // these default equivalents were obtained from a table of equivalents
        $.tablesorter.characterEquivalents = {
            'a' : '\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5', // áàâãäąå
            'A' : '\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5', // ÁÀÂÃÄĄÅ
            'c' : '\u00e7\u0107\u010d', // çćč
            'C' : '\u00c7\u0106\u010c', // ÇĆČ
            'e' : '\u00e9\u00e8\u00ea\u00eb\u011b\u0119', // éèêëěę
            'E' : '\u00c9\u00c8\u00ca\u00cb\u011a\u0118', // ÉÈÊËĚĘ
            'i' : '\u00ed\u00ec\u0130\u00ee\u00ef\u0131', // íìİîïı
            'I' : '\u00cd\u00cc\u0130\u00ce\u00cf', // ÍÌİÎÏ
            'o' : '\u00f3\u00f2\u00f4\u00f5\u00f6\u014d', // óòôõöō
            'O' : '\u00d3\u00d2\u00d4\u00d5\u00d6\u014c', // ÓÒÔÕÖŌ
            'ss': '\u00df', // ß (s sharp)
            'SS': '\u1e9e', // ẞ (Capital sharp s)
            'u' : '\u00fa\u00f9\u00fb\u00fc\u016f', // úùûüů
            'U' : '\u00da\u00d9\u00db\u00dc\u016e' // ÚÙÛÜŮ
        };
        // modify the above defaults as follows
        $.extend( $.tablesorter.characterEquivalents, {
            "ae" : "\u00e6", // expanding characters æ Æ
            "AE" : "\u00c6",
            "oe" : "\u00f6\u0153", // œ Œ
            "OE" : "\u00d6\u0152",
            "d"  : "\u00f0",  // Eth (ð Ð)
            "D"  : "\u00d0",
            "o"  : "\u00f3\u00f2\u00f4\u00f5", // remove ö because it's in the oe now
            "O"  : "\u00d3\u00d2\u00d4\u00d5"  // remove Ö because it's in the OE now
        });

        this.getDOMObject()
            .tablesorter()
            .trigger("update")
            .bind("sortEnd",function () {
                table.setRang();
            });
    },
    destroyTableSorter:function(){
        this.getDOMObject().trigger("destroy");
    },
    setStickTableHeader:function(){
        const table = this.getDOMObject();
        table.stickyTableHeaders({
            fixedOffset: $('#thead'),
            scrollableArea: $('.scrollable-area')
        });
    },
    destroyStickyTableHeader:function(){
        this.getDOMObject().stickyTableHeaders('destroy');
    },
    reinitializeStickyTableHeader:function(){
        this.destroyStickyTableHeader();
        if(this.getWidth()<rightView.getWidth()){
            this.setStickTableHeader();
        }
    },
    isOpen:function(){
        let state = true;
        if ($('.right_content').is(':hidden')) {
            state = false;
        }
        return state;
    },
    isExpand:function(){
        return this.expandState;
    },
    onScroll:function(){
        if(viewState.getViewState()==='responsive') {
            let scrollTimeout = null;
            let scrollendDelay = 500; // ms
            if (scrollTimeout === null) {
                scrollbeginHandler();
            } else {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(scrollendHandler, scrollendDelay);

            function scrollbeginHandler() {
                // this code executes on "scrollbegin"
                panner.hide();
            }

            function scrollendHandler() {
                // this code executes on "scrollend"
                panner.show();
                scrollTimeout = null;
            }
        }
    },
    getWidth:function(){
        return this.getContainer().width();
    },
    controller:{
        set:function(){
            const tableObject = table.getTableBodyObject();

            //on click table head
            tableObject
                .find("thead")
                .unbind()
                .click(function(){
                    setTimeout(function () {
                        table.setRang();
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

            csv_table_export.init();

            //indikatorenvergleich button
            $('.indikatoren_gebietsprofil')
                .unbind()
                .click(function(){
                    let ags = $(this).data('ags'),
                        name = $(this).data('name');
                    openGebietsprofil(ags,name);
                });
            //development chart button
            $('.indikatoren_diagramm_ags')
                .unbind()
                .click(function() {
                    let ags = $(this).data('ags'),
                        name = $(this).data('name'),
                        wert = $(this).data('wert');
                    openStatistik(ags,name,wert);
                });
            //development chart single ind
            $('.ind_entwicklungsdiagr')
                .unbind()
                .click(function () {
                    let ags = $(this).data('ags');
                    let name = $(this).data('name');
                    let ind = indikatorauswahl.getSelectedIndikator();
                    openEntwicklungsdiagramm(ags,name,ind,false);
                });

            //development chart single indicator
            $('.indsingle_entwicklungsdiagr')
                .unbind()
                .click(function () {
                    let ags = $(this).data('ags');
                    let name = $(this).data('name');
                    let ind = indikatorauswahl.getSelectedIndikator();
                    openEntwicklungsdiagramm(ags,name,ind,true);
                });

            //Live Search in Table
            $('#search_input_table')
                .unbind()
                .on('keyup', function() {
                    let value = $(this).val().toLowerCase(),
                        selector = tableObject.find('tr');
                    if(value.length >2) {
                        selector.each(function () {
                            if ($(this).find('.td_name').text().toLocaleLowerCase().includes(value)) {
                                console.log($(this));
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
            $("#tBody_value_table")
                .unbind()
                .mouseenter(function() {
                    $(this).delegate('tr', 'mouseover mouseleave', function (e) {
                        if (e.type === 'mouseover') {
                            $(this).addClass("hover");
                            let ags = $(this).find('.td_ags').text();
                            ags.trim();
                            indikatorJSONGroup.highlight(ags,false);
                        }
                        else {
                            $(this).removeClass("hover");
                            indikatorJSONGroup.resetHightlight();
                        }
                    });
                    $(this).delegate('tr', 'click', function (e) {
                        if (e.type === 'click') {
                            $(this).addClass("hover");
                            let ags = $(this).find('.td_ags').text();
                            ags.trim();
                            indikatorJSONGroup.highlight(ags,true);
                        }
                        else {
                            $(this).removeClass("hover");
                            indikatorJSONGroup.resetHightlight();
                        }
                    });
                });
            table.getScrollableAreaDOMObject()
                .unbind()
                .on("scroll",function(){
                    table.onScroll();
                });
        }
    }
};
const table_expand_panel = {
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
        if(mainView.getMobileState()){
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
            table_expand_panel.getOpenButtonObject().unbind().click(function(){
                table_expand_panel.open();
            });
            //panel button to load the user choice and expand the table
            table_expand_panel.getButtonLoadExpandObject()
                .unbind()
                .click(function(){
                    table_expand_panel.removeExpandColumns();
                    table_expand_panel.close();
                    if(table_expand_panel.expandArray.length >0) {
                        try {
                            table.expand();
                        } catch (err) {
                            alertError();
                        }
                        setTimeout(function () {
                            progressbar.init();
                            progressbar.setHeaderText("erstelle Tabelle");
                            toolbar.close();
                        }, 100);
                    }
                });
            //reset the expand
            table_expand_panel.getButtonClearExpandObject()
                .unbind()
                .click(function(){
                    table_expand_panel.setExpandArray([]);
                    table_expand_panel.removeExpandColumns();
                    $('#header_ind_set').attr("colspan",5);
                    table_expand_panel.fill();
                    table_expand_panel.close();
                    table.setExpandState(false);
                    mainView.resizeSplitter(table.getWidth());
                });
            /*
                bind the semantic functionality
            */
            //indicator-choice
            table_expand_panel
                .getIndikatorauswahlDDMObject()
                .unbind()
                .dropdown({
                    maxSelections: 1,
                    onShow:function(){
                        //adjust width of the right view, if the dropdown overlay the splitter
                        if(viewState.getViewState()==="mw") {
                            mainView.resizeSplitter(rightView.getWidth() + 100);
                        }
                    },
                    onHide:function(){
                        if(viewState.getViewState()==="mw") {
                            mainView.resizeSplitter(rightView.getWidth() - 100);
                        }
                    },
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        table_expand_panel.expandArray.push({id:addedValue,text:addedText,time:zeit_slider.getTimeSet(),einheit:false, count: 50});
                        //sort the time array desc
                        table_expand_panel.expandArray = _.sortBy(table_expand_panel.expandArray, 'total').reverse();
                        //disable other choice possibilities
                        table_expand_panel.getHinweisOnlyOlderTimeShiftsObject().hide();
                        table_expand_panel.getTrendAuswahlContainer().hide();
                        table_expand_panel.getUebergeordneteKenngroessenObject().hide();
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        table_expand_panel.expandArray = removefromarray(table_expand_panel.expandArray,value);
                    }
                });
            //the times to expand the table
            table_expand_panel
                .getZeitschnittauswahlDDMObject()
                .unbind()
                .dropdown({
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        table_expand_panel.expandArray.push({
                            id: indikatorauswahl.getSelectedIndikator() + '|' + addedValue,
                            text: 'Zum Vergleich (' + addedText + ')',
                            time: addedValue,
                            einheit: indikatorauswahl.getIndikatorEinheit(),
                            count: 20
                        });
                        table_expand_panel.getTrendAuswahlContainer().hide();
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        table_expand_panel.expandArray = removefromarray(table_expand_panel.expandArray, indikatorauswahl.getSelectedIndikator() + '|' + value);
                        let selection = table_expand_panel.getZeitschnittauswahlDDMObject().dropdown('get value').split(',');
                        if (selection.length <= 1) {
                            table_expand_panel.getTrendAuswahlContainer().show();
                        }
                    }
                });
            //kenngrößen-------------------------------------------------------
            table_expand_panel.getKenngroessenauswahlDDMObject()
                .unbind()
                .dropdown("refresh")
                .dropdown({
                    onShow:function(){
                        //adjust width of the right view, if the dropdown overlayse the splitter
                        if(viewState.getViewState()==="mw") {
                            mainView.resizeSplitter(rightView.getWidth() + 100);
                        }
                    },
                    onHide:function(){
                        if(viewState.getViewState()==="mw") {
                            mainView.resizeSplitter(rightView.getWidth() - 100);
                        }
                    },
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        if(addedValue === 'brd'){
                            table_expand_panel.expandArray.push({id:addedValue,text:'Gesamte Bundesrepublik ('+zeit_slider.getTimeSet()+')',time:zeit_slider.getTimeSet(),einheit:false, count: 15});
                        }
                        else if(addedValue === 'bld'){
                            table_expand_panel.expandArray.push({id:addedValue,text:'Übergeordnetes Bundesland ('+zeit_slider.getTimeSet()+')',time:zeit_slider.getTimeSet(),einheit:false,count: 15});
                        }
                        else{
                            table_expand_panel.expandArray.push({id:addedValue,text:addedText,time:zeit_slider.getTimeSet(),einheit:false,count: 10});
                        }
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        table_expand_panel.expandArray = removefromarray(table_expand_panel.expandArray,value);
                    }
                });
            //trendfortschreitung
            table_expand_panel.getTrendfortschreibungauswahlDDMObject()
                .unbind()
                .dropdown({
                    onAdd: function (addedValue, addedText, $addedChoice) {
                        table_expand_panel.clear();
                        table_expand_panel.expandArray.push({id:indikatorauswahl.getSelectedIndikator()+'|'+addedValue,text:'Trendfortschreibung ('+addedValue+')',time:addedValue,einheit:indikatorauswahl.getIndikatorEinheit(),count:30});
                        table_expand_panel.getZeitschnittAuswahlContainer().hide();
                        $('#hinweis_time_expand_linear').show();
                        $(this).blur();
                    },
                    onLabelRemove: function (value) {
                        table_expand_panel.expandArray = removefromarray(panel.expandArray,indikatorauswahl.getSelectedIndikator()+'|'+value);
                        let selection = table_expand_panel.getTrendfortschreibungauswahlDDMObject().dropdown('get value').split(',');
                        if(selection.length<= 1){
                            table_expand_panel.getZeitschnittAuswahlContainer().show();
                            $('#hinweis_time_expand_linear').hide();
                        }
                    }
                })
        }
    }
};
const table_filter_panel = {
    getContainer:function(){
        $elem = $('#filter_div');
        return $elem;
    },
    getFilterCheckBoxObject:function(){
        $elem = $('.filter_checkbox');
        return $elem;
    },
    getOpenButtonObject:function(){
        $elem = $('#filter_table');
        return $elem;
    },
    getCloseIconObject:function(){
        $elem = $('#panel_close_filter');
        return $elem;
    },
    init:function(){
        this.fill();
        this.controller.set();

    },
    fill:function(){
        let not_showing=["ror","lks","kfs","g50","stt"],
            raumgl = gebietsauswahl.getSelectionAsString();

        if(raumgliederung.getSelectedId()){
            raumgl = raumgliederung.getSelectedId();
        }
        if($.inArray(raumgl,not_showing)!==-1){
            disableElement('#filter_table',"Keine möglichen Filteroptionen");
        }else{
            enableElement('#filter_table',"Tabelle filtern");
        }
        //fill the filter div
        let form = $('#filter_form');
        let options = [];
        table.getTableBodyObject().find('.td_name').each(function(){
            let des = $(this).data('des');
            if($.inArray(des,options)===-1 && des !==''){
                options.push(des);
            }
        });
        form.empty();
        $.each(options,function(key,value){
            $('#filter_form').append('<div class="field">' +
                '                            <div class="ui checkbox checkbox filter_checkbox">' +
                '                                <input type="checkbox" data-value="' + value + '">' +
                '                                <label>' + value + '</label>' +
                '                            </div>' +
                '                        </div>');
            if($.inArray(value,table.excludedAreas)===-1) {
                $('#filter_form').find('input').prop("checked",true);
            }
        });

    },
    removeDes:function(_des){
        table.getTableBodyObject().find('.td_name').each(function() {
            let des = $(this).data('des');
            if(_des===des){
                $(this).closest('tr').css("display","none");
            }
        });
    },
    showDes:function(_des){
        table.getTableBodyObject().find('.td_name').each(function() {
            let des = $(this).data('des');
            if(_des===des){
                $(this).closest('tr').css("display","");
            }
        });
    },
    show:function(){
        this.getContainer().show("slow",function() {});
    },
    close:function(){
        this.getContainer().hide("slow",function() {});
    },
    controller:{
        set:function(){
            table_filter_panel.getFilterCheckBoxObject().checkbox({
                onChecked:function(){
                    table_filter_panel.showDes($(this).data('value'));
                    setTimeout(function(){table.setRang();},500);
                    table_filter_panel.close();
                },
                onUnchecked: function() {
                    table_filter_panel.removeDes($(this).data('value'));
                    setTimeout(function(){table.setRang();},500);
                    table_filter_panel.close();
                }
            });
            //bin the on click events
            table_filter_panel.getOpenButtonObject().unbind().click(function(){
                table_filter_panel.show();
            });
            table_filter_panel.getCloseIconObject().unbind().click(function(){
                table_filter_panel.close();
            });
        }
    }
};
const csv_table_export = {
    getButtonDomObject:function(){
        $elem = $('#csv_export');
        return $elem;
    },
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            csv_table_export.getButtonDomObject()
                .unbind()
                .click(function(e){
                    e.preventDefault();
                    table.destroyStickyTableHeader();
                    let table_header = [];
                    //push all table header in array
                    table.getDOMObject().find('.th_head').each(function () {
                        table_header.push($(this).text());
                    });
                    // Quelle:https://github.com/zachwick/TableCSVExport
                    table.getDOMObject().TableCSVExport({
                        header: table_header,
                        delivery: 'download',
                        separator: ';',
                        filename:indikatorauswahl.getSelectedIndikator()+"_"+gebietsauswahl.getSelectionAsString()+"_"+zeit_slider.getTimeSet()+".csv"
                    });
                    table.setStickTableHeader();
                });
        }
    }
};