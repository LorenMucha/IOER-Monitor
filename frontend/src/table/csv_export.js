const csv_export = {
    ignoreClass: "tableexport-ignore",
    state: false,
    getButtonDomObject: function () {
        $elem = $('#csv_export');
        return $elem;
    },
    init: function () {
        this.controller.set();
    },
    controller:{
        set:function(){
            const csv_button = csv_export.getButtonDomObject();
            $.fn.tableExport.formatConfig = {
                csv:{
                    fileExtension:".csv",
                    separator:";",
                    mimeType: "data:application/csv;charset=UTF-8"
                }
            };

            if(TableHelper.countTableRows()<=1000) {
                helper.enableElement("#"+csv_button.attr("id"),csv_button.data("title"));
                csv_button
                    .unbind()
                    .click(function () {
                        let background_default = csv_button.css("background"),
                            setLoadIcon = function () {
                                csv_button.css("background", "white");
                                csv_button.append('<i class="spinner loading icon"></i>');
                            },
                            resetLoadIcon = function () {
                                csv_button.css("background", background_default);
                                csv_button.empty();

                            };
                        $.when(setLoadIcon())
                            .then(csv_export.state = true)
                            .then(function(){
                                TableHelper.destroyStickyTableHeader();
                                let exportTable = table.getDOMObject()
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
                                                    let exportData = exportTable.getExportData()['table_ags']['csv'];
                                                    var interval = setInterval(function () {
                                                        //if table date csv is created
                                                        if (exportData.data) {
                                                            clearInterval(interval);
                                                            Export_Helper.downloadFile(exportData.data, exportData.filename, exportData.fileExtension);
                                                            resetLoadIcon();
                                                            TableHelper.setStickTableHeader();
                                                            setTimeout(function () {
                                                                csv_export.state = false;
                                                            }, 1000);
                                                        }
                                                    }, 500);}
                            );
                    });
            }else{
                helper.disableElement("#"+csv_button.attr("id"),"Anzahl der Tabellenzeilen zu hoch");
            }
        }
    }
};