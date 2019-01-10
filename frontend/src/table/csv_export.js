const csv_export = {
    getButtonDomObject:function(){
        $elem = $('#csv_export');
        return $elem;
    },
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            csv_export.getButtonDomObject()
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