var map,
    webatlas,
    satellite,
    layer;

$(function() {
	$("#kartenlink").click(function(){

	    if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster"){
            urlparamter.setUrlParameter('raster_save',true);
        }else{
            urlparamter.setUrlParameter('svg_save',true);
        }

	    var parameters = urlparamter.getAllUrlParameter();

		$.ajax({
			type: 'GET',
			url:  'backend/link.php',
			data: {
                param_url: parameters,
			},
			success: function(data){
				$( "#link_text").dialog({
						title: 'Kartenlink',
						hide: 'blind',
						show: 'blind',
						width: 500,
						resizable: false,
                        open: function(){
                            var link_a = urlparamter.getURL_SVG()+"?rid="+data;
                            var mail_link = 'mailto:?subject=Karte des Monitor der Siedlungs und Freiraumentwicklung (www.ioer-monitor.de)&body=Sehr geehrte Damen und Herren,%0AIhnen wird in dieser Email ein Link zu einer interaktiven Karte des Monitors der Siedlungs- und Freiraumentwicklung des Leibniz-Instituts für ökologische Raumentwicklung (http://www.ioer.de) gesendet.%0A%0ABitte nutzen Sie auf folgenden Weblink, um die Karte aufzurufen: '+urlparamter.getURL_SVG()+'?rid='+data+'%0A%0AMit freundlichen Grüßen%0A%0A';
                            $('#text_link').text(data);
                            $('#link_rid_a').attr("href",link_a);
                            $('#link_rid_a').text(link_a);
                            $('#rid_mail_to').attr("href",mail_link);
                        }
					});
			   },
			error: function(xhr, desc, err) {
				console.log(xhr);
				console.log("Details: " + desc + "\nError:" + err);
			  }
		});
        return false;
	});

    $('#rid').keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            var link = $(this).val();
            loadRID(link);
        }
    });

});
function loadRID(rid){
    var link = rid;
    $.ajax({
        type: 'GET',
        url: 'backend/link.php',
        data: {
            kartenlink: link
        },
        success: function (data) {
            var result = JSON.parse(data);
             //raster is possible
            var html = '<div><div><h3 style="color: black">Ihr Link ist für unterschiedliche räumliche Gliederungen vorhanden:</h3></div><hr style="margin-top: 10px; border-top: 1px solid black;">';

            if (result[0].raster_old !== "false") {
                html += '<button type="button" class="btn btn-secondary" id="raster" style="width:100%; margin-bottom: 10px; background-color:'+farbschema.getColorMain()+'; color:white; margin-top: 10px;">Raster laden</button></br>';
            }
            if (result[1].svg_old !== "false") {
                html += '<div style="font-size: medium;color: black">Ihr Link wurde im alten Viewer generiert und kann in der neuen Oberfläche nicht geladen werden. Es wäre möglich den Link in der alten Oberfläche zu visualisieren.</div>';
                html += '<button type="button" class="btn btn-secondary" id="svg_old" style="width:100%; margin-bottom: 10px; background-color:'+farbschema.getColorMain()+'; color:white;margin-top: 10px;">im alten Viewer laden</button>';
            }

            if(html.length <=172){
                var url = '';
                //check if raster or svg
                var array = result[2].rid.split('&');
                $.each(array,function(key,value){
                   url = urlparamter.getURL_SVG()+"?"+result[2].rid.replace('&svg_save=true','');
                });
                window.location.href = url;
            }else{
                html += "</div>";
                swal({
                    title: "",
                    text: html,
                    html:true,
                    showConfirmButton: false,
                    showCancelButton: true,
                    type: 'info',
                    confirmButtonText: "Abbrechen"
                });
                $(document).on('click','#svg_old',function() {
                    window.open('http://monitor.ioer.de/svg_viewer/svg_html.php?idk='+result[1].svg_old, '_blank');
                });
                $(document).on('click','#raster',function() {
                    window.location.href = urlparamter.getURL_SVG()+"?"+result[0].raster_old.replace('darstellung=','');
                });
            }
        }
    });
    return false;
}
$(function map_export(){
    //print
    let pdf_dialog_container = $("#print_container");
    let print_map;
        $('.print_button').click(function () {
            if(typeof indikatorauswahl.getSelectedIndikator() !=='undefined') {
                let format = $(this).data("format");

                pdf_dialog_container.dialog({
                    width: 795,
                    height: calculateHeight(),
                    title: format.toUpperCase() + " Export",
                    open: function () {
                        //scroll to top
                        $(this).get(0).scrollIntoView();
                        print_map = L.map('print_map', {zoomControl: false}).setView([51.33771846426444, 10.456320984509208], 6);
                        //scalebar
                        L.control.scale({
                            metric: true,
                            imperial: false,
                            maxWidth: 100
                        }).addTo(print_map);

                        let cloned_layer, overlay;
                        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                            cloned_layer = cloneLayer(jsongroup);

                        } else {
                            cloned_layer = cloneLayer(indikator_raster.raster_layer);
                        }
                        cloned_layer.addTo(print_map);

                        try {
                            overlay = cloneLayer(layer_control.zusatzlayer.getLayerGroup_set());
                            overlay.addTo(print_map);
                            overlay.eachLayer(function(layer){
                                console.log(style[layer.options.name]);
                               layer.setStyle(style[layer.options.name]);
                            });
                        }catch(err){}

                        $('#print_map svg path.leaflet-interactive ').css('pointer-events', 'none');
                        print_map.off('click', indikator_raster.onClick);

                        //set the legend and info content
                        $('#print_legende').empty();
                        $('#print_header_title').text($('#header').text());
                        $('#print_header_spatial_extent').text($('#header_raumgl').text());
                        $('#print_map').find('.leaflet-control-attribution').text('IÖR-Monitor © Leibniz-Institut für ökologische Raumentwicklung').css("color", "black").prop("href", "www.ioer-monitor.de");
                        $('#datengrundlage_content_print').text($('#datengrundlage_content').text());
                        $('#info_indikator_print').text($('#indikator_info_text').text());
                        //Export click
                        if (raeumliche_visualisierung.getRaeumlicheGliederung() === "raster") {
                            setRasterContent();
                        } else {
                            setSVGContent();
                        }
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
                                    .then(progressbar.setHeaderText("erstelle " + format.toUpperCase()))
                                    .then(pdf_dialog_container.dialog("option", "height", 1100))
                                    .then(function () {
                                        if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
                                            leafletImage(print_map, function (err, canvas) {
                                                //replace the map with the image
                                                $.when($('#print_map').hide())
                                                    .then(
                                                        $('.map_print_container')
                                                            .css({
                                                                "background": "url(" + canvas.toDataURL() + ")",
                                                                "background-repeat": "no-repeat",
                                                                "background-position": "center"
                                                            }))
                                                    .then(createExport());
                                            });
                                        } else {
                                            createExport();
                                        }
                                    })
                                    .then(
                                        setTimeout(function(){
                                            pdf_dialog_container.dialog('close')
                                        },500)
                                    );
                            });

                        //start the worker to export the image
                        function createExport() {
                            //source: https://github.com/eKoopmans/html2pdf
                            let element = document.getElementById('print_container');
                            let opt = {
                                margin: 5,
                                quality: 1,
                                filename: indikatorauswahl.getSelectedIndikator() + "_" + raeumliche_analyseebene.getSelectionId() + "_" + zeit_slider.getTimeSet() + '.' + format,
                                image: {type: 'png', quality: 1},
                                html2canvas: {scale: 3},
                                jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
                            };
                            if (format === "pdf") {
                                let worker = html2pdf()
                                    .from(element)
                                    .set(opt)
                                    .save()
                                    .then(function () {
                                            //the callback to remove the progressbar, if worker finished
                                            $.when(progressbar.remove())
                                                .then($('#export_btn').show())
                                                .then(function () {
                                                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === "raster") {
                                                        $('.print_map_content').css("background", "");
                                                        $('#print_map').show();
                                                    }
                                                })
                                                .then(pdf_dialog_container.dialog("option", "height", calculateHeight()));
                                        }
                                    );
                            } else {
                                let worker = html2pdf()
                                    .from(element)
                                    .set(opt)
                                    .outputImg('img')
                                    .then(function (value) {
                                            saveIMAGE(dataURLtoBlob($(value).attr("src")));
                                            //the callback to remove the progressbar, if worker finished
                                            $.when(progressbar.remove())
                                                .then($('#export_btn').show())
                                                .then(function () {
                                                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === "raster") {
                                                        $('.print_map_content').css("background", "");
                                                    }
                                                })
                                                .then(pdf_dialog_container.dialog("option", "height", calculateHeight()));
                                        }
                                    );
                            }
                        }

                        //create the svg adjustments for printing
                        function setSVGContent() {
                            let histogramm_map = $('#histogramm_pic'),
                                histogramm_print = $('#print_histogramm');
                            //resize and append DOM Data for data
                            $('.legende_map').clone().appendTo('#print_legende').find('hr').remove();
                            histogramm_print.empty();
                            histogramm_map
                                .clone()
                                .appendTo('#print_histogramm')
                                .find('svg')
                                .attr("height",histogramm_print.height()+20)
                                .attr("width", histogramm_print.width() + 50);

                            $('#print_map').find('svg')
                                .attr("height", $('#print_map').height() - 5);
                        }

                        //create the raster adjustments for printing
                        function setRasterContent() {
                            $.when($('.legende_map').clone().appendTo('#print_legende').find('hr').remove())
                                .then($('#print_histogramm').empty())
                                .then($('#histogramm_pic').clone().appendTo('#print_histogramm'))
                                .then(function () {
                                    $('#print_legende').find('img').each(function () {
                                        let image = $(this);
                                        let src = image.attr("src");
                                        $.ajax({
                                            url: urlparamter.getURL_RASTER() + "backend/export_image.php",
                                            data: {
                                                path: src
                                            },
                                            success: function (data) {
                                                image.attr("src", data);
                                            }
                                        });
                                    });
                                });


                        }
                    },
                    close: function () {
                        $('#export_btn').show();
                        print_map.remove();
                    }
                });
            }else{
                alertNoIndicatorChosen();
            }
        });
});
//export with format`s
function svgString2DataURL( width, height,element,callback) {

    var source = (new XMLSerializer()).serializeToString(d3.select(element).node());

    var doctype = '<?xml version="1.0" standalone="no"?>'
        + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    // create a file blob of our SVG.
    var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
    var url = window.URL.createObjectURL(blob);

    var image = new Image();
    image.onload = function () {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        context.fillStyle = '#ffffff';
        if (callback) callback(canvas.toDataURL("image/png"))
    };
    image.src = url;
}
function svgString2Image( width, height, element, callback ) {

    var source = (new XMLSerializer()).serializeToString(d3.select(element).node());

    var doctype = '<?xml version="1.0" standalone="no"?>'
        + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    // create a file blob of our SVG.
    var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
    var url = window.URL.createObjectURL(blob);

    var image = new Image();
    image.onload = function() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        context.clearRect ( 0, 0, width, height );
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob( function(blob) {
            var filesize = Math.round( blob.length/1024 ) + ' KB';
            if ( callback ) callback( blob, filesize );
        });


    };

    image.src = url;
}
function saveIMAGE(dataBlob, filesize) {
    saveAs(dataBlob, indikatorauswahl.getSelectedIndikator()+"_"+raeumliche_analyseebene.getSelectionId()+"_"+zeit_slider.getTimeSet() +'.png');
}
function savePDF(dataBlob, filesize) {
    //docu: https://parall.ax/products/jspdf/doc
    let doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    let dataURL = dataBlob;

    doc.setFontSize(20)
    doc.text(35, 25, $('#header').text())
    doc.setFontSize(10)
    doc.text(35, 57, $('#header_raumgl').text())
    //data.addImage(base64_source, image format, X, Y, width, height)
    doc.addImage(dataURL, 'PNG', 15, 40, 180, 160);
    doc.save(indikatorauswahl.getSelectedIndikator()+"_"+raeumliche_analyseebene.getSelectionId()+"_"+zeit_slider.getTimeSet() + ".pdf");
}
//**dataURL to blob**
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}