//This file stores all the jquery Dialogs inside the Page
//indikatorenvergleich
function openGebietsprofil(ags,name){
    let $dialogContainer = $('#gebietsprofil_content'),
        $detachedChildren = $dialogContainer.children().detach();

    $( "#gebietsprofil_content").dialog({
        title: 'Gebietscharakteristik',
        width: "80%",
        height: calculateHeight(),
        open: function(ev, ui){
            $('.ui-dialog-titlebar-close').attr('id','close_dialog');
            $detachedChildren.appendTo($dialogContainer);
            $('.ui-widget-overlay').addClass('custom-overlay');
            $.ajax({
                url: "backend/dialog/gebietsprofil.php",
                type: "GET",
                dataType: "html",
                data: {
                    'ags': ags,
                    'name': name,
                    'indikator':indikatorauswahl.getSelectedIndikator(),
                    'jahr':zeit_slider.getTimeSet()
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                },
                success: function (data) {
                    console.log();
                    $('#gebietsprofil_content').html(data);
                }
            });
        },
        close: function(){
            $('.ui-dialog-titlebar-close').removeAttr('id');
        }
    });
}
function openStatistik(ags, name, wert){
    let dialogContainer = $('#objektinformationen_content');
    dialogContainer.dialog({
        title: 'Statistik Gebietseinheit',
        width: calculateWidth(),
        height: calculateHeight(),
        open: function(ev, ui){
            $('.ui-widget-overlay').addClass('custom-overlay');
            $.when(getStatistik(ags, name, wert)).done(function(data){dialogContainer.html(data);})
        }
    });
}
//calculate Width and Height of the setted dialog's
function calculateWidth(){
    const width = mainView.getWidth();
    if($('.right_content').is(':visible') || width >=1280 && width<2000){
        return width*0.5;
    }
    else if(width>2000){
        return 1200;
    }
    else{
        return width-50;
    }
}
function calculateHeight(){
    const height = mainView.getHeight();
    if($('.right_content').is(':visible') || height >= 800){
        return height-210;
    }else{
        return height-100;
    }
}
/*
the ind trend chart--------------------------------------------------
 */
const dev_chart={
    endpoint_id:"entwicklungsdiagramm_content",
    text:{
        de:{
            title:"Entwicklungsvergleich",
            info:"Dieses Diagramm stellt die Entwicklung der Indikatoren dar.",
            indicator:"verfügbare Indikatoren",
            choice:"Bitte wählen.....",
            no_choice:"Kein Indikator gewählt",
            load:"Lädt Diagramm......",
            pnt:"alle Stützpunkte",
            trend:"Prognosewerte",
            unit:"Einheit",
            chart:"Entwicklungsdiagramm für Gebietseinheit"
        },
        en:{
            title:"Trend chart",
            info:"This diagram represents the trend of the indicators.",
            indicator:"available indicators",
            choice:"Please choose.....",
            no_choice:"No indicator selected",
            load:"Loading diagram ......",
            pnt: "all base points",
            trend:"Forecast values",
            unit:"Unit",
            chart:"Development diagram for territorial unit"
        }
    },
    open:function(){
        let lan = language_manager.getLanguage(),
            html = he.encode(`
            <div class="jq_dialog" id="${this.endpoint_id}">
                <div class="container">
                    <h4>${this.text[lan].info}</h4>
                    <div id="diagramm_options">
                        <div id="indikator_choice_container_diagramm">
                            <div>${this.text[lan].indicator}</div>
                            <div id="indicator_ddm_diagramm" class="ui selection multiple dropdown">
                                <i class="dropdown icon"></i>
                                <a id="default_diagramm_choice" class="ui label transition visible" style="display: inline-block !important;"></i></a>
                                <div class="default text">${this.text[lan].choice}</div>
                                <div  id="kat_auswahl_diagramm" class="menu"></div>
                            </div>
                        </div>
                        <div id="diagramm_export">
                            <div title="Diagramm herunterladen">Download:</div>
                            <div id="digramm_export_container">
                                <div id="diagramm_download_format_choice" class="ui compact selection dropdown">
                                    <i class="dropdown icon"></i>
                                    <div class="default text">${this.text[lan].choice}</div>
                                    <div class="menu">
                                        <div class="item" data-format="png">PNG</div>
                                        <div class="item" data-format="pdf">PDF</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="diagramm_choices">
                            <div id="digramm_choices_container">
                                <div class="checkboxes">
                                    <label>
                                        <input type="checkbox" value="" id="alle_stpkt">${this.text[lan].pnt}
                                    </label>
                                    <label id="prognose_container">
                                        <input type="checkbox" value="" id="prognose">${this.text[lan].trend}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="diagramm_info_text">
                        <div>${this.text[lan].chart}: <b id="diagramm_gebietsname"></b><span id="diagramm_ags"></span> in <b id="diagrmm_gebiets_typ"></b>.</div>
                    </div>
                    <div id="container_diagramm" class="container_diagramm">
                        <div id="diagramm">
                            <h3 class="Hinweis_diagramm" id="Hinweis_diagramm_empty">${this.text[lan].no_choice}</h3>
                            <h3 class="Hinweis_diagramm" id="diagramm_loading_info">Lädt Diagramm......</h3>
                            <svg id="visualisation" height="100"></svg>
                        </div>
                        <div id="tooltip"></div>
                    </div>
                </div>
                </div>
            </div>
        `);
        //settings for the manager
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html= html;
        dialog_manager.instructions.title=dev_chart.text[lan].title;
        dialog_manager.instructions.modal=false;
        dialog_manager.create();
        this.chart.create();

    },
    chart:{
        settings:{
            ags:"",
            ind:"",
            name:"",
            ind_vergleich:false,
            state_stueztpnt : true,
            state_prognose :false
        },
        ind_array_chart:[],
        merge_data:[],
        init:function(){
            const chart = this;
            let svg = d3.select("#visualisation"),
                array = chart.ind_array_chart,
                diagram = $('#diagramm'),
                margin = {top: 20, right: 60, bottom: 30, left: 60},
                chart_width = diagram.width() - margin.left - margin.right,
                chart_height = 400 - (array.length * 30);

                //let chart_height = $('.ui-dialog').height()*(1.5/3);
            let x = d3.scaleTime().range([0, chart_width]),
                y = d3.scaleLinear().range([chart_height, 0]);

                //show loading info
                $('#diagramm_loading_info').show();

                if (array.length == 0) {
                    $('#visualisation').hide();
                    $('#Hinweis_diagramm_empty').show();
                } else {
                    //clean the chart
                    $('#visualisation').show().empty();
                    //remove the tip if shown
                    $('#Hinweis_diagramm_empty').hide();
                }

                //set dynamic the chart dimensions
               diagram.css("height", $('#entwicklungsdiagramm_content').height() - $('#diagramm_options').height() - 70 + (array.length * 30));
                //clean the legend
                $('.legende_single_part_container').remove();

                let g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                let line = d3.line()
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(d.value);
                    });

                let legend = svg.append("g")
                    .attr("class", "legend");

                let def = $.Deferred();

                //create the call
                function defCalls() {
                    let requests = [],
                        settings = {
                            "forecast":chart.settings.state_prognose.toString(),
                            "all_points":chart.settings.state_stueztpnt.toString(),
                            "compare":chart.settings.ind_vergleich.toString()
                    };
                    $.each(array, function (key, value) {
                        requests.push(request_manager.getTrendValues(value.id,chart.settings.ags.toString(),settings));
                    });
                    $.when.apply($, requests).done(function () {
                        def.resolve(arguments);
                    });
                    return def.promise();
                }

                defCalls().done(function (arr) {
                    chart.merge_data = [];
                    let i = 0;
                    $.each(array, function (key, val) {
                        let obj = {"id": val.id, "values": arr[i][0]};
                        if (array.length == 1) {
                            obj = {"id": val.id, "values": arr[0]};
                        }
                        chart.merge_data.push(obj);
                        i++;
                    });
                    $('#diagramm_loading_info').hide();
                    scaleChart();
                    createPath();
                });

                function scaleChart() {
                    let data = [];
                    $.each(chart.merge_data, function (key, value) {
                        $.each(value.values, function (x, y) {
                            data.push({"year": y.year, "value": y.value, "real_value": y.real_value});
                        })
                    });
                    let minYear = getMinArray(data, "year"),
                        maxYear = getMaxArray(data, "year"),
                        maxValue = parseInt(Math.round(getMaxArray(data, "value")) + 1),
                        minValue = parseInt(Math.round(getMinArray(data, "value")) - 1),
                        min_date = new Date(minYear - 1, 0, 1),
                        max_date = new Date(maxYear + 1, 0, 1),
                        current_year = getCurrentYear();
                    //reset max year if prognose is unset
                    if (!chart.settings.state_prognose) {
                        max_date = new Date(current_year + 2, 0, 1);
                    }
                    if (minYear== maxYear) {
                        x.domain(d3.extent([new Date(maxYear - 5, 0, 1), max_date]));
                    } else {
                        x.domain(d3.extent([min_date, max_date]));
                    }

                    y.domain(d3.extent([minValue, maxValue]));


                    g.append("g")
                        .attr("class", "axis axis--x")
                        .attr("transform", "translate(0," + chart_height + ")")
                        .call(d3.axisBottom(x).scale(x).ticks(10).tickFormat(function(d){
                            if(chart.settings.state_prognose){
                                if(d.getFullYear() <= getCurrentYear()){
                                    return d.getFullYear();
                                }
                            }else{
                                return d.getFullYear();
                            }
                        }));

                    g.append("g")
                        .attr("class", "axis axis--y")
                        .call(d3.axisLeft(y).ticks(6).tickFormat(function (d) {
                            if (chart.settings.ind_vergleich) {
                                if (d == 0) {
                                    if (array.length== 1) {
                                        return data[0].real_value;
                                    } else {
                                        return 'x';
                                    }
                                }
                                else if (d != minValue || d != maxValue) {
                                    return d;
                                }
                            } else {
                                return d;
                            }
                        }))
                        .append("text")
                        .attr("class", "axis-title")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .attr("fill", "#4E60AA");
                }

                //fill the path values
                function createPath() {
                    $.each(chart.merge_data, function (key, value) {
                        let data = value.values;
                        parseTime(data);
                        appendData(data, data[0].color.toString());
                        createCircle(data, data[0].color.toString());
                        setLegende(data, data[0].color.toString());
                    });
                }

                //add the data
                function appendData(data, color) {
                    let color_set = color;
                    g.append("path")
                        .data(data)
                        .attr("class", "path_line")
                        .attr("id", data[0].id + "_path")
                        .attr('stroke', color_set)
                        .attr("stroke-dasharray", ("7, 3"))
                        .attr("fill", "none")
                        .attr("d", line(data));
                }

                let margin_top = 0;

                function setLegende(data, color) {
                    legend.append('g')
                        .append("rect")
                        .attr("x", margin.left)
                        .attr("y", chart_height + 50 + margin_top)
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", color);

                    legend.append("text")
                        .attr("x", margin.left + 30)
                        .attr("y", chart_height + 60 + margin_top)
                        .attr("height", 30)
                        .attr("width", chart_width)
                        .style("fill", color)
                        .text(data[0].name + ' in ' + data[0].einheit);

                    margin_top += 20;
                }

                function createCircle(data, color) {
                    let color_set = color;
                    let format_month = d3.timeFormat("%m");
                    let format_year = d3.timeFormat("%Y");
                    for (let i = 0; i < data.length; i++) {
                        let circle = g.append("g");
                        circle.append("circle")
                            .attr("class", data[0].id + "_circle circle")
                            .attr("r", 5.5)
                            .attr("data-value", data[i].value)
                            .attr('fill', function () {
                                if (data[i].year > (new Date).getFullYear()) {
                                    return 'white';
                                } else {
                                    return color_set;
                                }
                            })
                            .attr('stroke', color_set)
                            .attr("data-realvalue", data[i].real_value)
                            .attr("data-date", format_month(data[i].date) + "_" + format_year(data[i].date))
                            .attr("data-date_d3", data[i].date)
                            .attr("data-name", data[i].name)
                            .attr("data-ind", data[i].id)
                            .attr("data-year", data[i].year)
                            .attr("data-month", data[i].month)
                            .attr("data-einheit", data[i].einheit)
                            .attr("data-color", color_set)
                            .attr("transform", "translate(" + x(data[i].date) + "," + y(data[i].value) + ")");
                    }
                    //bind the mouseover events
                    $('.circle').on("mouseover",function(){
                            chart.controller.handleMouseOver($(this));
                        })
                        .on("mouseout",function(){
                            chart.controller.handleMouseOut($(this));
                        });
                }

                function parseTime(data) {
                    let parseTime = d3.timeParse("%m/%Y");
                    // format the data
                    data.forEach(function (d) {
                        d.date = parseTime(d.date);
                        d.value = +d.value;
                    });
                    return data;
                }
       },
        create:function(){
            const chart = dev_chart.chart;
            let selector = $(`#${dev_chart.endpoint_id}`);
            chart.controller.clearChartArray();
            $('#default_diagramm_choice').text(indikatorauswahl.getSelectedIndikatorText());
            if(chart.settings.ind_vergleich) {
                $('#indikator_choice_container_diagramm').show();
                if (chart.ind_array_chart.length==0) {
                    let kat_auswahl_diagramm =$('#kat_auswahl_diagramm');
                    indikatorauswahl.cloneMenu('kat_auswahl_diagramm', 'link_kat_diagramm', 'right',['X'],false);
                    //remove items which have not the simular unit
                    $('#indicator_ddm_diagramm .submenu .item').each(function(){
                        if(indikatorauswahl.getIndikatorEinheit() !== $(this).data('einheit')){
                            $(this).remove();
                        }
                    });
                    //clear empty categories
                    $('.link_kat_diagramm').each(function(){
                        let test = ($(this).find('.item').text()).replace(/\s+/g, '');
                        if(parseInt(test.length)<=2 && $.isNumeric(test.length)){
                            $(this).remove();
                        }
                    });
                    kat_auswahl_diagramm.find('.item').each(function(){$(this).css("color","rgba(0,0,0,.87)")});
                    //remove selected Indicatopr from the list
                    kat_auswahl_diagramm.find("#"+indikatorauswahl.getSelectedIndikator()+"_item").remove();
                    chart.ind_array_chart.push({"id": chart.settings.ind});
                }
            }else{
                selector.find('#indikator_choice_container_diagramm').remove();
                chart.ind_array_chart.push({"id": chart.settings.ind});
            }
            chart.controller.set();
            chart.init();
        },
        controller:{
            set:function(){
                const chart = dev_chart.chart;
                let ind_auswahl = $('#indicator_ddm_diagramm'),
                    download = $('#diagramm_download_format_choice');
                //set the info text
                $("#diagramm_gebietsname").text(chart.settings.name);
                $('#diagramm_ags').text(" (" + chart.settings.ags + ")");
                $('#diagrmm_gebiets_typ').text(" "+indikatorauswahl.getIndikatorEinheit());
                //set the selcted value
                ind_auswahl
                    .dropdown({
                        'maxSelections': 2,
                        onAdd: function (addedValue, addedText, $addedChoice) {
                            chart.ind_array_chart.push({"id": addedValue});
                            chart.init();
                            $(this).blur();
                        },
                        onLabelRemove: function (value) {
                            chart.ind_array_chart = removefromarray(chart.ind_array_chart, value);
                            chart.init();
                        }
                        });

                setTimeout(function(){
                    ind_auswahl.dropdown("hide");
                },500);

                //options-------------------------
                //1. alle Stützpkt
                $('#alle_stpkt')
                    .prop('checked', false)
                    .change(function(){
                        if (this.checked) {
                            chart.settings.state_stueztpnt = false;
                            chart.init();
                        }else{
                            chart.settings.state_stueztpnt = true;
                            chart.init();
                        }
                    });
                if($.inArray(2025,indikatorauswahl.getAllPossibleYears())!==-1){
                    $('#prognose_container').show();
                }else{
                    $('#prognose_container').hide();
                }
                //2. Prognose
                $('#prognose')
                    .prop('checked', false)
                    .change(function(){
                        if (this.checked) {
                            chart.settings.state_prognose = true;
                            chart.init();
                        }else{
                            chart.settings.state_prognose = false;
                            chart.init();
                        }
                    });
                download
                    .dropdown({
                        onChange: function (value, text, $choice) {
                            let container = $('#visualisation'),
                                width = container.width(),
                                height = container.height();
                            //workaround for firefox Bug
                            container.attr("height",height).attr("width",width);
                            $(this).blur();
                            if (value === 'png') {
                                svgString2Image(width, height, '.container_diagramm #diagramm svg', saveIMAGE);
                            } else if (value === 'pdf') {
                                svgString2DataURL(width, height, '.container_diagramm #diagramm svg',savePDF);
                            }
                        }
                    });
                setTimeout(function(){
                    download.dropdown("hide");
                },500);
            },
            // Create Event Handlers for mouse
            handleMouseOver:function(elem) {
                const chart = dev_chart.chart;
                elem.attr("r",7.5);
                console.log(elem.data("ind"));
                let ind = elem.data('ind'),
                    year = elem.data('year'),
                    month = elem.data('month'),
                    value = elem.data('value'),
                    real_value = elem.data('realvalue'),
                    color = elem.data('color'),
                    einheit = elem.data('einheit'),
                    x = elem.position().left-document.getElementById('visualisation').getBoundingClientRect().x +10,
                    y = elem.position().top-document.getElementById('visualisation').getBoundingClientRect().y + 80,
                    html = '',
                    text_value = "Wert: " + real_value + " "+einheit;
                //the tooltip for ind vergleich
                if (dev_chart.chart.settings.ind_vergleich) {
                    let data = [],
                        ind_before = function(merge_data,ind,year){
                            let array = [];
                            for (let i = 0; i <merge_data.length; i++) {
                                if (merge_data[i].id === ind) {
                                    array.push(merge_data[i])
                                }
                            }
                            for (let i = 0; i < array.length; i++) {
                                if (array[i].id === ind) {
                                    if (array[i].year == year) {
                                        return i - 1;
                                    }
                                }
                            }
                        };
                    $.each(chart.merge_data,function(x,y){
                        if (y.id === ind) {
                            data.push(y.values);
                        }
                    });
                    //check if the oldest year is hover
                    let index = ind_before(data[0],ind, year);
                    if (index == -1) {
                        html = text_value + "<br/>" + "Stand: " + month + "/" + year;
                    } else {
                        //the text part
                        let date_before = "von " + data[0][index].month + "/" +data[0][index].year + " bis " + month + "/" + year;
                        let text_value_dev = "Entwicklung: " + (value - data[0][index].value).toFixed(2) + " "+einheit;
                        html = text_value + "<br/>" + text_value_dev + "<br/>" + date_before;
                    }
                } else {
                    html = text_value + "<br/> Stand: " + month + "/" + year;
                }

                $('#tooltip')
                    .html(html)
                    .css({"left": x, "top": y, "color": color, "border": "1px solid" + color})
                    .show();
            },
            handleMouseOut:function(elem) {
                elem.attr("r", 5.5);
                $('#tooltip').hide();
            },
            clear:function(){
                $('#visualisation').empty();
                $("#diagramm_gebietsname").empty();
                $('#diagramm_ags').empty();
                $('#diagrmm_gebiets_typ').empty();
            },
            clearChartArray:function(){
                dev_chart.chart.ind_array_chart = [];
                dev_chart.chart.merge_data = [];
            }
        }
    }
};
/*
User Feedback---------------------------------------------
 */
const feedback={
    endpoint_id:"feedback_div",
    text:{
        de:{
            like:'Wie gefällt Ihnen unser neuer IÖR-Monitor ?</b><br/>Lassen Sie es uns wissen',
            message:"Nachricht",
            send:"Senden",
            cancel:"Abbrechen"
        },
        en:{
            like:'How do you like our new IÖR monitor? </b><br/> Let us know',
            message:"Message",
            send:"Send",
            cancel:"Cancel"
        }
    },
    open:function(){
        let lan = language_manager.getLanguage(),
            html = he.encode(`
                            <div class ="jq_dialog" id="${this.endpoint_id}">
                                <span><b>${this.text[lan].like}</span>
                                <form class="form" id="reg_form">
                                    <fieldset>
                                        <div class="form-group feedback_form">
                                            <label class="col-md-4 control-label feeback_label first" >Name</label>
                                            <div class="col-md-6  inputGroupContainer">
                                                <div class="input-group"> <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                                                    <input id="name" name="name" placeholder="Name" class="form-control input_feedback"  type="text"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group feedback_form">
                                            <label class="col-md-4 control-label feeback_label">E-Mail</label>
                                            <div class="col-md-6  inputGroupContainer">
                                                <div class="input-group"> <span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>
                                                    <input id="email" name="email" placeholder="E-Mail Addresse" class="form-control input_feedback"  type="text"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group feedback_form">
                                            <label class="col-md-4 control-label feeback_label">${this.text[lan].message}</label>
                                            <div class="col-md-6  inputGroupContainer">
                                                <div class="input-group"> <span class="input-group-addon"><i class="glyphicon glyphicon-pencil"></i></span>
                                                    <textarea class="form-control input_feedback" rows="10" id="message" name="message" placeholder="${this.text[lan].message}.. "></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </form>
                                 <div class="form-group btn-group-feedback">
                                        <div class="btn-group">
                                            <button class="btn btn-primary send" style="margin-right: 30px;" onclick="feedback.controller.send();">${this.text[lan].send} 
                                                <span class="glyphicon glyphicon-send"></span>
                                            </button>
                                            <button class="btn btn-primary cancel" onclick="dialog_manager.content.remove()">${this.text[lan].cancel} 
                                                <span class="glyphicon glyphicon-remove"></span>
                                            </button>
                                        </div>
                                </div>
                            </div>
            `);
        //settings for the manager
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html= html;
        dialog_manager.instructions.title="Feedback";
        dialog_manager.instructions.modal=true;
        dialog_manager.create();
       this.controller.validate();
    },
    controller:{
        /*validator*/
        validate:function() {

            let lan = language_manager.getLanguage(),
                messages = {
                    de: {
                        name: "Bitte nennen Sie uns ihren Namen",
                        name_notEmpty: "Dies ist kein gültiger Name",
                        message: "Bitte hinterlassen Sie uns eine Nachricht, mit mindestens 10 und maximal 1000 Zeichen",
                        message_notEmpty: "Bitte hinterlassen Sie uns eine Nachricht, mit mindestens 10 Zeichen",
                        email: "Bitten nennen Sie uns ihre Email Adresse",
                        email_notEmpty: "Dies ist keine gültige Email Adresse"
                    },
                    en: {
                        name: "Please tell us your name",
                        name_notEmpty: "This is not a valid name",
                        message: "Please leave us a message with at least 10 characters",
                        message_notEmpty: "Please leave us a message with at least 10 and a maximum of 1000 characters",
                        email: "Please give us your email address",
                        email_notEmpty: "This is not a valid email address"
                    }
                };

            //Quelle: http://bootstrapvalidator.votintsev.ru/getting-started/
            $('#reg_form').bootstrapValidator({
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    name: {
                        validators: {
                            stringLength: {
                                min: 2,
                                message: messages[lan].name

                            },
                            notEmpty: {
                                message: messages[lan].name_notEmpty
                            }
                        }
                    },
                    message: {
                        validators: {
                            stringLength: {
                                min: 10,
                                max:1000,
                                message: messages[lan].message
                            },
                            notEmpty: {
                                message: messages[lan].message_notEmpty
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: messages[lan].email
                            },
                            emailAddress: {
                                message: messages[lan].email_notEmpty
                            }
                        }
                    }
                }
            });
        },
        send:function(){
            let send = 'true',
                selector = $("#reg_form"),
                // Use Ajax to submit form data
                name = selector.find("#name").val(),
                email = selector.find("#email").val(),
                message = selector.find("#message").val(),
                url = 'https://monitor.ioer.de/monitor_api/email/';

            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    name:name,
                    sender:email,
                    message:message
                },
                error:function(xhr, ajaxOptions, thrownError){
                   console.log(thrownError);
                   console.log(this.data);
                    swal({
                        title: 'Fehler!',
                        text: 'Ihre Nachricht konnte nicht zugestellt werden. Bitte kontaktieren Sie uns unter: <a id="mail_to" href="mailto:l.mucha@ioer.de" target="_blank">Email</a>',
                        type: 'error',
                        html: true
                    });
                },
                success:function(data){
                    dialog_manager.content.remove();
                    swal(
                        'Vielen Dank!',
                        'Ihre Nachricht wurde zugestellt.',
                        'success'
                    );
                }
            });
        }
    }
};
/*
Show the dialog for the OGC Export services---------------
 */
const ogc_export={
  wms:{
      endpoint_id:"wms_text",
      text:{
          de:{
              title:"WMS Dienst",
              use:"Dieser WMS-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.",
              terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
              url:"Die zu verwendende URL für den WMS-Dienst lautet:"

          },
          en:{
              title:"WMS Service",
              use:"This WMS service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.",
              terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
              url:"The URL for the WMS service to use is:"
          }
      },
      open:function(){
          if(typeof indikatorauswahl.getSelectedIndikator() !=='undefined') {
              let lan = language_manager.getLanguage(),
                  html = he.encode(`
                                     <div class="jq_dialog ogc_dialog" id="${this.endpoint_id}">
                                        <img src="frontend/images/icon/worldwide.png"/>
                                        <h4>${this.text[lan].use}</h4>
                                        <div class="ogc_accecpt_container">
                                            <input title="Aktzeptieren" type="checkbox" name="allow" id="checkbox_wms" />
                                            <span>${this.text[lan].terms}</span>
                                        </div>
                                        <div class="ogc_allow" id="wms_allow">
                                            <h4>${this.text[lan].url}</h4>
                                            <div class="link_container">
                                                <h3 id="wms_link"></h3>
                                                <a target="_blank">
                                                    <div class="btn btn-primary ogc_info"></div>
                                                </a>
                                            </div>
                                        </div>
                                    </div> 
                                  `);
              //settings for the manager
              dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
              dialog_manager.instructions.html= html;
              dialog_manager.instructions.title=this.text[lan].title;
              dialog_manager.instructions.width=500;
              dialog_manager.instructions.height=300;
              dialog_manager.create();
              this.controller.set();
          }else{
              alertNoIndicatorChosen();
          }
      },
      controller:{
          set:function(){
              const object = ogc_export.wms;
              let indikator = indikatorauswahl.getSelectedIndikator(),
                  endpoint = $(`#${object.endpoint_id}`),
                  wms_link = 'http://maps.ioer.de/cgi-bin/wms?MAP=' + indikator + '_100',
                  checkbox = endpoint.find("#checkbox_wms"),
                  allow =endpoint.find('#wms_allow');

              allow.hide();

              checkbox.change(function () {
                  if ($(this).is(":checked")) {
                      allow.show();
                      endpoint
                          .find('#wms_link')
                          .text(wms_link);
                      endpoint
                          .find('.link_container')
                          .find('a')
                          .attr("href",wms_link+"&SERVICE=WMS&VERSION=1.0.0&REQUEST=GetCapabilities");
                  } else {
                      allow.hide();
                  }
              });
          }
      }
  },
  wcs:{
        endpoint_id:"wcs_text",
        text:{
            de:{
                title:"WCS Dienst",
                use:"Dieser WCS-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.",
                terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
                url:"Die zu verwendende URL für den WMS-Dienst lautet:",
                instruction:"Kurzanleitung für die Einbindung von WCS Diensten:"

            },
            en:{
                title:"WCS Service",
                use:"This WCS service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.",
                terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
                url:"The URL for the WMS service to use is:",
                instruction:"Brief instructions for the integration of WCS services:"
            }
        },
        open:function() {
            if (typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
                let lan = language_manager.getLanguage(),
                    html = he.encode(`
                         <div class="jq_dialog ogc_dialog" id="${this.endpoint_id}">
                            <img src="frontend/images/icon/worldwide.png"/>
                            <h4 >${this.text[lan].use}</h4>
                            <div class="ogc_accecpt_container">
                                <input title="Aktzeptieren" type="checkbox" name="allow" id="checkbox_wcs" />
                                <span>${this.text[lan].terms}</span>
                            </div>
                            <div class="ogc_allow" id="wcs_allow">
                                <h4>${this.text[lan].url}</h4>
                                <div class="link_container">
                                    <h3 id="wcs_link"></h3>
                                    <a target="_blank">
                                        <div class="btn btn-primary ogc_info"></div>
                                    </a>
                                </div>
                                <!--
                                Todo
                                <hr class="hr">
                                <div class="ogc_anleitung">${this.text[lan].instruction}</div>
                                <a target="_blank" href="data/anleitung_import_arcgis_wcs.pdf">
                                    <button>ArcGIS</button>
                                </a>
                                <a target="_blank" href="data/anleitung_import_qgis_wcs.pdf">
                                    <button>QGIS</button>
                                </a>
                                -->
                            </div>
                        </div>
                    `);
                //settings for the manager
                dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
                dialog_manager.instructions.html= html;
                dialog_manager.instructions.title=this.text[lan].title;
                dialog_manager.instructions.width=500;
                dialog_manager.instructions.height=300;
                dialog_manager.create();
                this.controller.set();
            }else{
                alertNoIndicatorChosen();
            }
        },
        controller:{
            set:function(){
                const object = ogc_export.wcs;
                let indikator = indikatorauswahl.getSelectedIndikator(),
                    endpoint = $(`#${object.endpoint_id}`),
                    wcs_link = 'http://maps.ioer.de/cgi-bin/wcs?MAP=' + indikator + '_wcs',
                    checkbox = endpoint.find("#checkbox_wcs"),
                    allow=endpoint.find('#wcs_allow');

                allow.hide();

                checkbox.change(function () {
                    if ($(this).is(":checked")) {
                        allow.show();
                        endpoint
                            .find('#wcs_link')
                            .text(wcs_link);
                        endpoint
                            .find('.link_container')
                            .find('a')
                            .attr("href",wcs_link+"&SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCapabilities");
                    } else {
                        allow.hide();
                    }
                });
            }
        }
    },
    wfs:{
        endpoint_id:"wfs_text",
        text:{
            de:{
                title:"WFS Dienst",
                use:"Dieser WFS-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.",
                terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
                url:"Die zu verwendende URL für den WFS-Dienst lautet:",
                instruction:"Kurzanleitung für die Einbindung von WCS Diensten:"

            },
            en:{
                title:"WFS Service",
                use:"This WFS service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.",
                terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
                url:"The URL for the WMS service to use is:",
                instruction:"Brief instructions for the integration of WFS services:"
            }
        },
        open:function() {
            if (typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
                let lan = language_manager.getLanguage(),
                    html = he.encode(`
                          <div class ="jq_dialog ogc_dialog" id="${this.endpoint_id}">
                                <img src="frontend/images/icon/worldwide.png"/>
                                <h4>${this.text[lan].use}</h4>
                                <div class="ogc_accecpt_container">
                                    <input title="Aktzeptieren" type="checkbox" name="allow" id="checkbox_wfs" />
                                    <span>${this.text[lan].terms}</span>
                                </div>
                                <div class="ogc_allow" id="wfs_allow">
                                    <h4>${this.text[lan].url}</h4>
                                    <div class="link_container">
                                        <h3 id="wfs_link"></h3>
                                        <a target="_blank">
                                            <div class="btn btn-primary ogc_info"></div>
                                        </a>
                                    </div>
                                    <!--
                                    Todo
                                    <hr class="hr">
                                    <div class="ogc_anleitung">Kurzanleitung für die Einbindung von WFS Diensten:</div>
                                    <a target="_blank" href="frontend/data/anleitung_import_arcgis.pdf">
                                        <button>ArcGIS</button>
                                    </a>
                                    <a target="_blank" href="frontend/data/anleitung_import_qgis.pdf">
                                        <button>QGIS</button>
                                    </a>
                                    -->
                                </div>
                            </div>
                    `);
                //settings for the manager
                dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
                dialog_manager.instructions.html= html;
                dialog_manager.instructions.title=this.text[lan].title;
                dialog_manager.instructions.width=500;
                dialog_manager.instructions.height=300;
                dialog_manager.create();
                this.controller.set();
            }else{
                alertNoIndicatorChosen();
            }
        },
        controller:{
            set:function(){
                const object = ogc_export.wfs;
                let indikator = indikatorauswahl.getSelectedIndikator(),
                    endpoint = $(`#${object.endpoint_id}`),
                    wfs_link = 'http://maps.ioer.de/cgi-bin/wfs?MAP=' + indikator,
                    checkbox = endpoint.find("#checkbox_wfs"),
                    allow=endpoint.find('#wfs_allow');

                allow.hide();

                checkbox.change(function () {
                    if ($(this).is(":checked")) {
                        allow.show();
                        endpoint
                            .find('#wfs_link')
                            .text(wfs_link);
                        endpoint
                            .find('.link_container')
                            .find('a')
                            .attr("href",wfs_link+"&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities");
                    } else {
                        allow.hide();
                    }
                });
            }
        }
    }
};
/*
the indicator data sheet ----------------------------------
 */
const kennblatt={
    endpoint_id:"kennblatt_text",
    open:function(){
        let lang_tag = function(){
            let tag = '';
            if(language_manager.getLanguage()==="en"){tag="_en"}
            return tag;
        },
        ind_name = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("ind_name"+lang_tag())],
        category = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()][('cat_name'+lang_tag())],
        unit = indikatorauswahl.getIndikatorEinheit(),
        info = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("info"+lang_tag())],
        methodik = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("methodik"+lang_tag())],
        verweise = function(){
            try {
                let cont = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("verweise" + lang_tag())],
                    encode = he.decode(cont),
                    split = encode.split("</a>"),
                    html = function () {
                        let ul = "<ul>",
                            i = 0;
                        $.each(split, function (x, y) {
                            i += 1;
                            let res = y
                                    .replace("target", " target")
                                    .replace("href", " href")
                                    .replace(">- ", ">")
                                    .replace("http://www.ioer -monitor.de/methodik/glossar/b/", "https://www.ioer-monitor.de/methodik/glossar/b/")
                                + "</a>";
                            if (i < split.length) {
                                ul += `<li>${res}</li>`;
                            }
                        });
                        return `${ul}</ul>`;
                    };
                return html();
            }catch(err){
                console.log(err);
                return "";
            }
        },
        interpretation = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("interpretation"+lang_tag())],
        bemerkungen = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("bemerkungen"+lang_tag())],
        ebenen = raeumliche_analyseebene.getRange(),
        ogc = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()]["ogc"],
        spatial_extends = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()]["spatial_extends"],
        language = language_manager.getLanguage(),
        datengrundlage=legende.getDatengrundlageObject().text(),
        bezugsebenen=function(){
            try {
                let form = '';
                $.each(spatial_extends, function (key, value) {
                    let state = function () {
                            let state = 'checked="checked"';
                            if (parseInt(value) != 1) {
                                state = "";
                            }
                            return state;
                        },
                        checkbox = `<div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" ${state()} disabled>
                                <label class="form-check-label">${raeumliche_analyseebene.getSpatialExtentNameById(key)}</label>
                             </div>`;
                    form += checkbox;
                });
                return `${form}`;
            }catch(err){
                console.log(err);
                return "";
            }
        },
        ogc_links=function(){
            try {
                let form = '';
                $.each(ogc, function (key, value) {
                    let state = function () {
                            let state = 'checked="checked"';
                            if (parseInt(value) != 1) {
                                state = "";
                            }
                            return state;
                        },
                        link = function () {
                            let ind_id = indikatorauswahl.getSelectedIndikator();
                            if (key === "wms") {
                                return "http://maps.ioer.de/cgi-bin/wms?map=" + ind_id + "_100&";
                            } else if (key === "wcs") {
                                return "http://maps.ioer.de/cgi-bin/wcs?map=" + ind_id + "_wcs";
                            } else {
                                return "http://maps.ioer.de/cgi-bin/wfs?map=" + ind_id;
                            }
                        },
                        checkbox = `<div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" ${state()} disabled>
                                <label class="form-check-label">${key.toUpperCase()}: ${link()}</label>
                             </div>`;
                    form += checkbox;
                });
                return `${form}`;
            }catch(err){
                console.log(err);
                return "";
            }
        },
        literatur=function(){
            try {
                let litereatur = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("literatur" + lang_tag())];
                return he.decode(litereatur);
            }catch(err){
                console.log(err);
                return "";
            }
        },
        header_text={"de":{
                        "header":"Indikatorkennblatt",
                        "export":"Exportieren",
                        "cat":"Kategorie",
                        "einheit":"Maßeinheit",
                        "beschreibung":"Kurzbeschreibung",
                        "bedeutung":"Bedeutung und Interpretation",
                        "daten":"Datengrundlagen",
                        "methodik":"Methodik",
                        "verweise":"Verweise",
                        "bemerkung":"Bemerkungen",
                        "bezugsebenen":"Bezugsebenen",
                        "ogc":"Verfügbare Geodienste mit Links",
                        "literatur":"Quellen/Literatur"
                    },
                "en":{
                        "header":"Indicator data sheet",
                        "export":"Export",
                        "cat":"Category:",
                        "einheit":"Unit",
                        "beschreibung":"Short description",
                        "bedeutung":"Importance and interpretation",
                        "daten":"Data basis",
                        "methodik":"Methodology",
                        "verweise":"Eprimands",
                        "bemerkung":"Remarks",
                        "bezugsebenen":"Available levels",
                        "ogc":"Links to available geoservices",
                        "literatur":"Sources/References"
                        }
                };
        //create the html
        let html = he.encode(`
            <div id="${this.endpoint_id}" class="dialog jq_dialog">
                <div class="export">
                    <button class="btn btn-primary" id="print_btn_kennblatt">
                        <i class="glyphicon glyphicon-print"></i>
                        <span>${header_text[language]["export"]}</span>
                    </button>            
                </div>
                <div id="kennblatt_form">
                    <h3>${ind_name}</h3>
                    <hr/>
                    <div class="header" >${header_text[language]["cat"]}</div>
                    <div class="text">${category}</div>
                    <div class="header" >${header_text[language]["einheit"]}</div>
                    <div class="text">${unit}</div>
                    <div class="header" >${header_text[language]["beschreibung"]}</div>
                    <div class="text">${info}</div>
                    <div class="header" >${header_text[language]["bedeutung"]}</div>
                    <div class="text">${interpretation}</div>
                    <div class="header" >${header_text[language]["daten"]}</div>
                    <div class="text">${datengrundlage}</div>
                    <div class="header" >${header_text[language]["methodik"]}</div>
                    <div class="text">${methodik}</div>
                    <div class="header" >${header_text[language]["verweise"]}</div>
                    <div class="text">${verweise()}</div>
                    <div class="header" >${header_text[language]["bemerkung"]}</div>
                    <div class="text">${bemerkungen}</div>
                    <div class="header" >${header_text[language]["bezugsebenen"]}</div>
                    <div class="text">${bezugsebenen()}</div>
                    <div class="html2pdf__page-break"></div>
                    <div class="header">${header_text[language]["ogc"]}</div>
                    <div class="text">${ogc_links()}</div>
                     <div class="header">${header_text[language]["literatur"]}</div>
                    <div class="text">${literatur()}</div>
                </div>
            </div>`);
        //settings for the manager
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html= html;
        dialog_manager.instructions.title=header_text[language]["header"];
        dialog_manager.create();
        this.controller.set();
    },
    controller:{
        set:function(){
            let print_button = $('#print_btn_kennblatt');
                print_button
                    .unbind()
                    .click(function(){
                        print_button.hide();
                        let element = document.getElementById('kennblatt_form'),
                            opt = {
                                margin: 5,
                                quality: 0.98,
                                enableLinks: true,
                                filename: indikatorauswahl.getSelectedIndikator() + "_" + raeumliche_analyseebene.getSelectionId() + "_" + zeit_slider.getTimeSet() + '.' + ".pdf",
                                image: {type: 'pdf', quality: 1},
                                html2canvas:  { scale: 2,letterRendering: true},
                                jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
                            };
                        progressbar.init();
                        progressbar.setHeaderText("erstelle PDF");
                        let worker = html2pdf()
                            .from(element)
                            .set(opt)
                            .save()
                            .then(function(){
                                progressbar.remove();
                                print_button.show();
                                dialog_manager.restoreDimension();
                            });
                    });
            }
    }
};
/*
Manager which coordinates the dialogs
 */
dialog_manager={
    content:null,
    instructions:{
        endpoint: "",
        html:"",
        title:"",
        open:false,
        close:false,
        height:this.calculateHeight(),
        width:this.calculateWidth(),
        modal:false
    },
    calculateWidth:function(){
        const manager = this;
        let width = mainView.getWidth();
        if($('.right_content').is(':visible') || width >=1280 && width<2000){
            return (width*0.5);
        }
        else if(width>2000){
            return 1200;
        }
        else{
            return (width-50);
        }
    },
    calculateHeight:function(){
        const manager = this;
        let height = mainView.getHeight();
        if($('.right_content').is(':visible') || height >= 800){
            return (height-210);
        }else{
            return (height-100);
        }
    },
    changeHeight:function(_height){
        this.content.dialog("option", "height", _height);
    },
    changeWidth:function(_width){
        this.content.dialog("option", "width", _width);
    },
    restoreDimension(){
        this.changeWidth(this.calculateWidth());
        this.changeHeight(this.calculateHeight());
    },
    create:function(instructions) {
        const manager = this;
        let body = $('body'),
            /*
           html needs to encodes or decoded for storing inside the instroduction object,
           use he from lib: https://github.com/mathiasbynens/he
            */
            html = he.decode(manager.instructions.html);
        body.append(html);
        manager.content=body.find(`#${manager.instructions.endpoint}`);
        manager.content.dialog({
            title: manager.instructions.title,
            hide: 'blind',
            show: 'blind',
            width: manager.instructions.width,
            height: manager.instructions.height,
            modal: manager.instructions.modal,
            open: function (ev, ui) {
                $(this)
                    .empty()
                    .append(html);
                //run the open callback if set
                if(manager.instructions.open)manager.instructions.open();
            },
            close:function(){
                $('.jq_dialog').remove();
            }
        });
    }
};