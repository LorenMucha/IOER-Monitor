class Export_Helper{
    static svgString2DataURL( width, height,element,text,callback) {

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
            if (callback) callback(canvas.toDataURL("image/png"),text)
        };
        image.src = url;
    }
    static svgString2Image( width, height, element, callback ) {

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
    static saveIMAGE(dataBlob, filesize) {
        saveAs(dataBlob, indikatorauswahl.getSelectedIndikator()+"_"+raeumliche_analyseebene.getSelectionId()+"_"+zeit_slider.getTimeSet() +'.png');
    }
    static savePDF(dataBlob, text) {
        //docu: https://parall.ax/products/jspdf/doc
        let doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        let dataURL = dataBlob;

        doc.setFontSize(20);
        doc.text(35, 25, text.header);
        doc.setFontSize(10);
        doc.text(35, 57,text.sub_header);
        //data.addImage(base64_source, image format, X, Y, width, height)
        doc.addImage(dataURL, 'PNG', 15, 40, 180, 160);
        doc.save(indikatorauswahl.getSelectedIndikator()+"_"+raeumliche_analyseebene.getSelectionId()+"_"+zeit_slider.getTimeSet() + ".pdf");
    }
//**dataURL to blob**
    static dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
    static downloadFile(data,filename,extension){
        let a = document.createElement("a"),
            url="data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(data);
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = filename+extension;
        a.click();
        window.URL.revokeObjectURL(url);
        setTimeout(function(){
            csv_export.state=false;
            a.remove();
        },500);
    }
    static exportTable(_tableId){
        let exportTable = $(`#${_tableId}`)
            .tableExport({
                formats: ['csv'],
                headers: true,
                footers: false,
                filename: indikatorauswahl.getSelectedIndikator() + "_" + gebietsauswahl.getSelectionAsString() + "_" + zeit_slider.getTimeSet(),
                trimWhitespace: true,
                bootstrap: false,
                //ignoreCols: [0, 1],
                exportButtons: false,
                ignoreCSS: "." + csv_export.ignoreClass
            });
        let exportData = exportTable.getExportData()[_tableId]['csv'];
        var interval = setInterval(function () {
            //if table date csv is created
            if (exportData.data) {
                clearInterval(interval);
                Export_Helper.downloadFile(exportData.data, exportData.filename, exportData.fileExtension);
            }
        }, 500);
    }
}