var selection = [];
class TableSelection{
    static addAgs(_ags){
        selection.push(_ags);
    }
    static removeAgs(_ags){
        selection = $.grep(selection, function (val) {
            return val != _ags;
        });
    }
    static getSelection(){
        return selection;
    }
    static setSelection(){
        if(selection.length >0 && exclude.checkPerformanceAreas()) {
            let html_array = [];
            $.each(selection,function(key,select){
                let ags = select,
                    elem=$(`#${ags}`),
                    clone = elem.clone();
                clone
                    .addClass("selected")
                    .attr("id",ags+"check")
                    .find(".select_check")
                    .removeClass("select_check")
                    .prop("checked",true)
                    .addClass("select_uncheck");
                indikator_json_group.highlight(ags, false);
                $('#tBody_selection').append(clone);
                elem.remove();
            });
            TableHelper.updateTableSorter();
            table.getScrollableAreaDOMObject().scrollTop(0);
            TableHelper.setRang();
        }
    }
    static removeSelection(ags){
        let elem = $(`#${ags}check`),
            clone_change = elem.clone();
        this.removeAgs(ags);

        clone_change
            .removeClass("selected")
            .attr("id",ags)
            .find(".select_uncheck")
            .removeClass("select_uncheck")
            .addClass("select_check");

        indikator_json_group.resetHightlight();

        $("#tBody_value_table").append(clone_change);
        elem.remove();
        //wait until element exists in table
        TableHelper.updateTableSorter();
        $('.th_head.gebietsname').click();
        TableHelper.setRang();
    }
    static clearSelection(){
        selection=[];
        $('#tBody_selection').empty();
    }
}