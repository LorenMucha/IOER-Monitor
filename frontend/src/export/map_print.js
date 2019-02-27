const map_print={
    endpoint_id:"print_container",
    map:null,
    format:null,
    open:function(_format){
        map_print.format=_format.toLowerCase();
        //create the dialog html
            let setRasterContent=function(){
                $.when($('.legende_map').clone().appendTo('#print_legende').find('hr').remove())
                    .then($('#print_histogramm').empty())
                    .then($('#histogramm_pic').clone().appendTo('#print_histogramm'))
                    .then(function () {
                        $('#print_legende').find('img').each(function () {
                            let image = $(this);
                            let src = image.attr("src");
                            //ToDo rewrite on monitor.ioer
                            $.ajax({
                                async:true,
                                url: urlparamter.getURL_RASTER() + "php/export_image.php",
                                data: {
                                    path: src
                                },
                                success: function (data) {
                                    image.attr("src", data);
                                }
                            });
                        });
                    });
                },
                setSVGContent=function(){
                    let histogramm_map = $('#histogramm_pic'),
                        histogramm_print = $('#print_histogramm');

                    //resize and append DOM Data for data
                    $('.legende_map').clone().appendTo('#print_legende').find('hr').remove();
                    histogramm_print.empty();
                    histogramm_map
                        .clone()
                        .appendTo('#print_histogramm')
                        .find('svg')
                        .attr("height",50)
                        .attr("width", histogramm_print.width()+10);
                },
                open=function(){
                    //create the print map
                    let cloned_layer, overlay;

                    let map = L.map('print_map', {zoomControl: false}).setView([urlparamter.getUrlParameter('lat'),urlparamter.getUrlParameter('lng')],urlparamter.getUrlParameter('zoom'));
                    //scalebar
                    L.control.scale({
                        metric: true,
                        imperial: false,
                        maxWidth: 100
                    }).addTo(map);

                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                        cloned_layer = cloneLayer(jsongroup);

                    } else {
                        cloned_layer = cloneLayer(indikator_raster.raster_layer);
                    }
                    cloned_layer.addTo(map);
                    map.invalidateSize();

                    try {
                        overlay = cloneLayer(layer_control.zusatzlayer.getLayerGroup_set());
                        overlay.addTo(map);
                        overlay.eachLayer(function(layer){
                            console.log(style[layer.options.name]);
                            layer.setStyle(style[layer.options.name]);
                        });
                    }catch(err){}

                    $('#print_map svg path.leaflet-interactive ').css('pointer-events', 'none');
                    map.off('click', indikator_raster.onClick);

                    //set the legend and info content
                    $('#print_legende').empty();
                    $('#print_map').find('.leaflet-control-attribution').text('IÖR-Monitor © Leibniz-Institut für ökologische Raumentwicklung').css("color", "black").prop("href", "www.ioer-monitor.de");
                    //Export click
                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === "raster") {
                        setRasterContent();
                    } else {
                        setSVGContent();
                    }
                    map_print.map = map;
                },
                html = `
                <div id="${this.endpoint_id}" class="jq_dialog">
                    <div class="print_map_content" id="print_map_content">
                         <button class="btn btn-primary btn_dropdown" id="export_btn">
                            <i class="glyphicon glyphicon-export"></i>
                            Exportieren
                        </button>
                        <div class="print_header">
                        <div class=float-left">
                            <h3 id="print_header_title">${$('#header').text()}</h3>
                            <span id="print_header_spatial_extent">${$('#header_raumgl').text()}</span>
                        </div>
                    </div>
                    <div class="print_container">
                        <div class="map_print_container">
                                <div title="passen Sie die Karte per Drag and Drop an" id="print_map" class="move"></div>
                        </div>
                        <div class="print_info_content">
                                <div id="legende_container" class="hover_close">
                                    <div id="print_legende"></div>
                                </div>
                                <div class="map_projection_print_container hover_close" id="print_projection">
                                    <div class="print_projection"><b>Kartenprojektion</b></div>
                                    <div class="print_projection">ETRS89 / UTM Zone 32N</div>
                                </div>
                                <div class="histostogramm_print_container hover_close" id="print_histogramm_container">
                                        <div><b>Histogramm</b></div>
                                        <div id="print_histogramm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="print_bottom">
                        <div id="info_ind_print">
                            <div><b>Information zum Indikator</b></div>
                            <div id="info_indikator_print">${$('#indikator_info_text').text()}</div>
                        </div>
                        <div class="datengrundlage_print_container">
                            <div><b>Datengrundlage</b></div>
                            <div id="datengrundlage_content_print">${$('#datengrundlage_content').text()}</div>
                        </div>
                    </div>
                </div>
            `;

        //settings for the manager
        let instructions = {
          endpoint:`${this.endpoint_id}`,
            html:html,
            title:map_print.format.toUpperCase()+" Export",
            modal:true,
            width:795,
            open:open
        };
        dialog_manager.setInstruction(instructions);
        dialog_manager.create();
        this.controller.set();
    },
    init:function(){

    },
    controller:{
        set:function(){
            $('.hover_close')
                .hover(function(){
                    let id = $(this).attr("id");
                    helper.disableElement(`#${id}`,"Entfernen Sie das Element durch Klick");
                })
                .mouseleave(function(){
                    let id = $(this).attr("id");
                    helper.enableElement(`#${id}`,"Entfernen Sie das Element durch Klick");
                })
                .click(function() {
                    $(this).remove();
                    if($('.hover_close').length==0){
                        $('.map_print_container').css("width","100%");
                        map_print.map.invalidateSize();
                    }
                });

            $('#export_btn')
                .click(function () {
                    $.when($(this).hide())
                        .then(function(){
                            //reset the error pattern to grey, bcause error pattern export did not work
                            $('.map_print_container .leaflet-map-pane .leaflet-overlay-pane').find('svg').find('g').find('path').each(function(){
                                let fill_param = $(this).attr("fill");
                                if(fill_param.indexOf('url(')!==-1){
                                    $(this).attr('fill','grey');
                                    $(this).data('fill_reset',fill_param);
                                }
                            });
                            $('#print_legende').find('.legende_i').find('.error').find('i').css("background","grey");
                        })
                        .then(progressbar.init())
                        .then(progressbar.setHeaderText("erstelle " + map_print.format.toUpperCase()))
                        .then(dialog_manager.changeHeight( 1100))
                        .then(function () {
                            if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
                                leafletImage(map_print.map, function (err, canvas) {
                                    //replace the map with the image
                                   $('#print_map')
                                       .empty()
                                        .css({
                                            "background": "url(" + canvas.toDataURL() + ")",
                                            "background-repeat": "no-repeat",
                                            "background-position": "center"
                                        });
                                    //wait until background is rendered
                                    map_print.controller.createExport();
                                });
                            } else {
                                map_print.controller.createExport();
                            }
                        });
                });
        },
        createExport:function(){
            //source: https://github.com/eKoopmans/html2pdf
            let element = document.getElementById('print_container'),
                map = $('#print_map');
            let opt = {
                margin: 5,
                quality: 0.98,
                filename: indikatorauswahl.getSelectedIndikator() + "_" + raeumliche_analyseebene.getSelectionId() + "_" + zeit_slider.getTimeSet() + '.' + map_print.format,
                image: {type: 'png', quality: 1},
                html2canvas: {scale: 2},
                jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
            };
            //remove unnecessary css styles
            $('#print_map .leaflet-pane.leaflet-map-pane')
                .css("transform","")
                .find("svg")
                .css("transform","")
                .attr("height",map.height())
                .attr("width",map.width());
            if (map_print.format === "pdf") {
                let worker = html2pdf()
                    .from(element)
                    .set(opt)
                    .save()
                    .then(function () {
                            //the callback to remove the progressbar, if worker finished
                            $.when(progressbar.remove())
                                .then($('#export_btn').show())
                                .then(dialog_manager.changeHeight(dialog_manager.calculateHeight()));
                        }
                    );
            } else {
                let worker = html2pdf()
                    .from(element)
                    .set(opt)
                    .outputImg('img')
                    .then(function (value) {
                            Export_Helper.saveIMAGE(Export_Helper.dataURLtoBlob($(value).attr("src")));
                            //the callback to remove the progressbar, if worker finished
                            $.when(progressbar.remove())
                                .then($('#export_btn').show())
                                .then(function () {
                                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === "raster") {
                                        $('.print_map_content').css("background", "");
                                    }
                                })
                                .then(dialog_manager.changeHeight(dialog_manager.calculateHeight()));
                        }
                    );
            }
        }
    }
};