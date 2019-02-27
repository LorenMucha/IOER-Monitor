const csv_export = {
    ignoreClass:"tableexport-ignore",
    state:false,
    getButtonDomObject:function(){
        $elem = $('#csv_export');
        return $elem;
    },
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            $.fn.tableExport.formatConfig = {
                csv:{
                    fileExtension:".csv",
                    separator:";",
                    mimeType: "application/csv"
                }
            };
            csv_export.getButtonDomObject()
                .unbind()
                .click(function(){
                    console.log("export");
                    csv_export.state=true;
                    //push all table header in array
                    // Quelle:https://tableexport.v5.travismclarke.com
                    table.controller.destroyStickyTableHeader();
                    let exportTable = table.getDOMObject()
                        .tableExport({
                            formats: ['csv'],
                            headers:true,
                            footers:false,
                            filename:indikatorauswahl.getSelectedIndikator()+"_"+gebietsauswahl.getSelectionAsString()+"_"+zeit_slider.getTimeSet(),
                            trimWhitespace: true,
                            ignoreCols:[0,1],
                            exportButtons: false,
                            ignoreCSS:"."+csv_export.ignoreClass
                        });
                    let exportData = exportTable.getExportData()['table_ags']['csv'],
                        link = window.document.createElement("a");
                    link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(exportData.data));
                    link.setAttribute("download", exportData.filename+exportData.fileExtension);
                    link.click();
                    setTimeout(function(){
                        csv_export.state=false;
                    },500);
                });
        }
    }
};