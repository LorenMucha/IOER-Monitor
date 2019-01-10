//the model
const legende = {
    getDOMObject : function(){
        $elem= $('#legende');
        return $elem;
    },
    getCloseIconObject : function(){return $('#legende_close');},
    getShowButtonObject: function(){return $('#legende_button');},
    getDatenalterContainerObject:function(){
        $elem = $('#datenalter_container');
        return $elem;
    },
    getLegendeColorsObject : function(){
        $elem = $('#legende_i');
        return $elem;},
    getIndikatorInfoObject : function(){
        $elem =$('#indikator_info_text');
        return $elem;
    },
    getDatengrundlageObject: function(){
        $elem = $('#datengrundlage_content');
        return $elem;
    },
    getEinheitObject:  function(){
        $elem =$('#einheit_container');
        return $elem;
    },
    getKlasseneinteilungObject: function(){
        $elem = $('#histogramm_klasseneinteilung');
        return $elem;
    },
    getHistogrammObject: function(){
        $elem = $('#histogramm_pic');
        return $elem;
    },
    open: function(){
        this.getDOMObject().show("slow",function(){});
    },
    getWidth:function(){
        let width = 270;
        if(main_view.getWidth()<=1024){
            width=200;
        }
        return width;
    },
    resize: function(){
        let map_content = $('#mapwrap'),
            width = this.getWidth(),
            height = function(){
                return map_content.height()*(1/2)
            },
            close_icon = this.getCloseIconObject(),
            show_button_grp = $(".btn-group-map"),
            legende_container = this.getDOMObject();
        //only for Multiview
        if(view_state.getViewState()==="mw"){
            if(table.isOpen()){
                show_button_grp.css("right", right_view.getWidth()+56);
                legende_container.css("right",right_view.getWidth()+50);
                close_icon.css("right",right_view.getWidth()+73);
            }else{
                show_button_grp.css("right", "0px");
                legende_container.css("right","0px");
                close_icon.css("right","30px");
                close_icon.css("right","30px");
            }
        }else{
            show_button_grp.css("right", "0px");
            legende_container.css("right","0px");
            close_icon.css("right","30px");
            close_icon.css("right","30px");
        }
        legende_container.css({"max-height":height(),"width":width});
    },
    init:function(){
        const legende = this;
        this.resize();
        legende.getShowButtonObject().show();
        //set the controller
        legende.controller.set();
    },
    fillContent:function() {
        const object = this;
        let einheit = indikatorauswahl.getIndikatorEinheit(),
            errorcode = error_code.getErrorCode(),
            legende_colors = this.getLegendeColorsObject(),
            datengrundlage_container = this.getDatengrundlageObject(),
            indikator_info_container = this.getIndikatorInfoObject(),
            einheit_container = this.getEinheitObject(),
            klasseneinteilung_contaiener = this.getKlasseneinteilungObject(),
            info_json = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()];

        //close datenalter
        if(indikatorauswahl.getSelectedIndiktorGrundaktState() && object.getDatenalterContainerObject().find('#dropdown_datenalter').is(":visible")){
            object.getDatenalterContainerObject().find('#dropdown_datenalter').show();
        }else{
            object.getDatenalterContainerObject().find('#dropdown_datenalter').hide();
        }

        /*------hole Zusatzinfos------------------------------------------------------------------------*/
        let indicator_id = indikatorauswahl.getSelectedIndikator(),
            language_tag = function(){
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

        indikator_info_container.text( info_json['indicators'][indicator_id][("info"+language_tag())]);
        datengrundlage_container.html(datengrundlage + atkis());
        if (einheit.length<=0) {
            einheit_container.hide();
        } else {
            einheit_container.show();
            einheit_container.find('#legende_einheit').text(einheit);
        }
        /*-------------------------KLasseneinteilung---------------------------------------------*/
        klasseneinteilung_contaiener.text($('#' + klassifzierung.getSelectionId("gebiete") + '_label').text());

        /*create the histogramm and Legende------------------------------*/
        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
            if (farbliche_darstellungsart.getSelectionId()=== "auto") {
                let grades = [];

                $.each(klassengrenzen.getKlassen(), function (key, value) {
                    let minus_max = value.max,
                        minus_min = value.min,
                        round_max = (Math.round(minus_max * 100) / 100).toFixed(2),
                        round_min = (Math.round(minus_min * 100) / 100).toFixed(2);

                    grades.push({
                        "max": round_max,
                        "min": round_min,
                        "farbe": value.color
                    });
                });

                grades.reverse();
                //clone zusatzlayer
                let zusatzlayer = legende_colors.find('.zusatzlayer').clone();
                $('.legende_i').empty();
                let i = 1;
                $.each(grades, function (key, value) {
                    let farbe = value.farbe,
                        value_id = farbe.replace('#', ''),
                        sign = '>';

                    if(i===grades.length){sign='';}
                    legende_colors.append(`<div id="legende_${value_id}" class="legende_line"><i style="background:${farbe}"></i>${sign+ helper.dotTocomma(value.min)} - ${helper.dotTocomma(value.max)}</div>`);
                    i +=1;
                });

                if (errorcode != false) {
                    legende_colors.append(`<div class="legende_line error"><i style="background: repeating-linear-gradient(45deg,rgb(255, 0, 0),rgb(255,255,255) 5px, rgb(255,255,255) 1px, rgb(255,255,255) 1px);"></i>${errorcode}</div>`);
                }
                legende_colors.append(zusatzlayer);
            }
            object.histogramm.setHistogrammGebiete();
        }
        else {
            let options = indikator_raster.getInfos(),
                pfad_mapfile = options[0]["pfadmapfile"],
                layername = options[0]["layername"],
                legende = "https://maps.ioer.de/cgi-bin/mapserv_dv?map="+pfad_mapfile+"&MODE=legend&layer="+layername+"&IMGSIZE=150+300",
                legende_schraffur ="https://maps.ioer.de/cgi-bin/mapserv_dv?map=/mapsrv_daten/detailviewer/mapfiles/mapserv_raster.map&MODE=legend&layer=schraffur&IMGSIZE=150+30";
            //workaround for CORS
            //set the other params like legendenpic and staff
            if (einheit === "proz") {
                einheit = '%';
            }
            legende_colors.empty().load(legende, function () {
                let elements = $(this).find('img');
                elements.each(function (key, value) {
                    let src = $(this).attr('src'),
                        url = "https://maps.ioer.de" + src;
                    $(this).attr('src', url);
                });
            });
            //set the histogramm
            object.histogramm.setHistogrammRaster();
        }
        this.resize();
    },
    remove:function(){
        let show_button = this.getShowButtonObject(),
            legende_container = this.getDOMObject();

        show_button.hide();
        legende_container.hide();
    },
    isOpen:function(){
      return this.getDOMObject().is(":visible");
    },
    close: function(){
        let show_button = $(".btn-group-map"),
            legende_container = this.getDOMObject();
        legende_container.hide('slow',function(){});
        if(view_state.getViewState()!=='responsive'){
            if($('.right_content').is(':visible')) {
                show_button.css("right", $('#rightPane').width()+6);
            }else{
                show_button.css("right","0px");
            }
        }else{
            show_button.css("right","0px");
        }
    },
    controller:{
      set:function(){
          let click_dd = 0,
              legende_width = legende.getWidth();
          //the onClick funcionality
          //open Button
          legende.getCloseIconObject()
              .unbind()
              .click(function(){
                  legende.close();
              });
          //close Icon
          legende.getShowButtonObject()
              .unbind()
              .click(function(){
                  legende.open();
              });
          //Datenalter
          legende.getDatenalterContainerObject().find('#datenalter')
              .unbind()
              .click(function () {
                  let datenalter_dd = legende.getDatenalterContainerObject().find('#dropdown_datenalter'),
                      margin = function(){
                          let x = 50,
                              margin;
                          if(click_dd===0){
                              margin = (legende_width+x);
                          }else{
                              margin = legende_width;
                          }
                          return margin;
                      };
                  console.log(legende_width);
                  legende.getDOMObject().css("width", margin());
                  if(click_dd===0){
                      datenalter_dd.show();
                      ++click_dd;
                  }else{
                      datenalter_dd.hide();
                      click_dd=0;
                  }
                  //scroll down to view full viewport
                  setTimeout(function() {
                      legende.getDOMObject().scrollTop(legende.getDOMObject()[0].scrollHeight);
                  },100);
              });
      }
    },
    histogramm:{
        value_array:[],
        x_set:[],
        setHistogrammGebiete:function(){
            //get the classes and color
            let grenzen = klassengrenzen.getKlassen(),
                info_div = $('.hist_info'),
                ioer_json = indikator_json.getJSONFile(),
                max_value = grenzen[(grenzen.length-1)]['max'],
                min_value = grenzen[0]['min'],
                diagramm_width = legende.getWidth(),
                //norm max to zero
                max_neu = max_value-min_value,
                //extract the values out of the JSON
                //append histogramm with the gradient object
                gradient =  '<defs>' +
                                '<linearGradient x1="100%" x2="0%" y1="0" y2="0">' +
                                    '<stop offset="0%" stop-color="'+grenzen[(Object.keys(grenzen).length-1)]['color']+'"></stop>'+
                                    '<stop offset="100%" stop-color="'+grenzen[0]['color']+'"></stop>'+
                                '</linearGradient>'+
                            '</defs>',
                //count the classes
                extract_values = function(){
                                const object = legende.histogramm;
                                let value_array = [];
                                $.each(ioer_json.features,
                                    function(key,value){
                                        value_array.push(parseFloat((value.properties.value_comma).replace(",",".")));
                                });
                                object.value_array= value_array.sort();
                                return object.value_array;
                            },
                //the colored classes inside the diagramm
                classes_svg = function(){
                                let html = '',
                                    element_height = 62,
                                    _x_set = [],
                                    i = 0,
                                    klassifizierung = klassifzierung.getSelectionId();
                                //create the svg classes
                                $.each(grenzen,function(key,value){
                                    if(klassifizierung==="gleich"){
                                        let width = diagramm_width*((1/klassenanzahl.getSelection()));
                                        html +='<rect x="'+i+'" width="'+width+'" height="'+element_height+'" style="fill:'+value.color+'" stroke="none"></rect>';
                                        _x_set.push(width);
                                        i +=width;
                                    }else {
                                        let percent = ((value.max-min_value) * 100) / max_neu,
                                            pixel_width = (diagramm_width / 100) * percent,
                                            x=function(){
                                                try {
                                                    return _x_set[(i - 1)]['width'];
                                                }catch(err){
                                                    return 0;
                                                }
                                            },
                                            width = function(){
                                                let width = pixel_width-x();
                                                if(!width){
                                                    width=pixel_width;
                                                }
                                                return width;
                                            };
                                        _x_set.push({'width':pixel_width,'min':value.min-min_value,'max':value.max-min_value});
                                        html += '<rect x="' + x()  + '" width="' +width() + '" height="' + element_height + '" style="fill:' + value.color + '" stroke="none"></rect>';
                                        i += 1;
                                    }
                                });
                                this.x_set = _x_set;
                                return html;
                            },
                values_svg = function(){
                    let html = '',
                        diagramm_hoehe = 60,
                        diagramm_width = legende.getWidth(),
                        color = '#000000',
                        verteilung = function(){
                            let a = [],
                                b = [],
                                prev,
                                arr = extract_values();

                            for ( let i = 0; i < arr.length; i++ ) {
                                if ( arr[i] !== prev ) {
                                    a.push(arr[i]);
                                    b.push(1);
                                } else {
                                    b[b.length-1]++;
                                }
                                prev = arr[i];
                            }
                            return [a, b];
                        },
                        percent = function(_value){
                            let value = (_value*100)/max_neu;
                            return (diagramm_width / 100) * value;
                        },
                        verteilung_arr = verteilung(),
                        height=function(_value){
                            let max = function(){
                                    let max =Math.max.apply(Math,verteilung_arr[1]);
                                    if(max===1){max=2;}
                                    return max;
                                },
                                percent = _value/max();
                            return diagramm_hoehe*percent;

                        };
                    //set the value pillars`s
                    for(let g=0;g<=this.x_set.length-1;g++) {
                        for (let x = 0; x <=verteilung_arr[0].length-1; x++) {
                            let value = verteilung_arr[0][x]-min_value,
                                min = this.x_set[g]['min'],
                                max = this.x_set[g]['max'],
                                verteilung = verteilung_arr[1][x];
                            if(value>=min&&value<=max){
                                html +=' <rect class="value-rect" data-value="'+(value+min_value)+'" data-verteilung="'+verteilung+'" x="'+percent(value)+'" y="'+(diagramm_hoehe-height(verteilung))+'" width="1px" height="'+height(verteilung)+'" stroke="none"></rect>';
                            }
                        }
                    }
                    return html;
                },
                diagramm = '<svg id="svgId">' +
                                '<g>' +
                                    gradient+
                                    classes_svg()+
                                    values_svg()+
                                '</g>' +
                            '</svg>';

            legende.getHistogrammObject().empty().append(diagramm);
        },
        setHistogrammRaster:function(){
            $.ajax({
                type:"GET",
                url :urlparamter.getURL_RASTER() + "php/histogramm.php?Jahr=" + zeit_slider.getTimeSet() + "&Kategorie=" + indikatorauswahl.getSelectedIndikatorKategorie() + "&Indikator=" + indikatorauswahl.getSelectedIndikator() + "&Raumgliederung=" + raeumliche_analyseebene.getSelectionId() + "&Klassifizierung=" + klassifzierung.getSelectionId() + "&AnzKlassen=" + klassenanzahl.getSelection(),
                success:function(data){
                    legende.getHistogrammObject().empty().append('<img style="width:100%;" src="'+data+'"/>');
                }
            });
        }
    },
    datenalter:{
        getDOMObject:function(){
            $elem = legende.getDatenalterContainerObject().find('#dropdown_datenalter') ;
            return $elem;
        },
        show:function(){

        },
        hide:function(){

        }
    }
};