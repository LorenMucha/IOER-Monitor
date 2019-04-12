class TableHelper{
    //count rows
    static countTableRows(){
        return table.getDOMObject().find("tr").length;
    }
    //check if table is visible
    static isTableOpen(){
        let state = true,
            elem = document.getElementById('right_content');
        if (window.getComputedStyle(elem).display==="none" || window.getComputedStyle(elem).visibility==="hidden") {
            state = false;
        }
        return state;
    }
    //check if table is expanded
    static isTableExpand(){
        return table.expandState;
    }
    //new numerate the table
    static setRang(){
        let i=0;
        table.getContainer().find('.count_ags_table').each(function(){
            if($(this).closest('tr').css("display")!=='none') {
                i +=1;
                $(this).text(i);
            }
        });
    }
    static setColspanHeader(val){
        table.getColSpanRow().attr("colspan",val);
    }
    //creates the table sorter
    static setTableSorter(){
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

        table.getDOMObject()
            .tablesorter()
            .bind("sortEnd",function () {
                TableHelper.setRang();
            });
    }
    //refresh the sorter cache
    static updateTableSorter(){
        table.getDOMObject().trigger("update");
    }
    static destroyTableSorter(){
        table.getDOMObject().trigger("destroy");
    }
    //create the fixed table header on scroll
    static setStickTableHeader(){
        table.getDOMObject().stickyTableHeaders({
            fixedOffset: $('#thead'),
            scrollableArea: $('.scrollable-area')
        });
    }
    static destroyStickyTableHeader(){
        table.getDOMObject().stickyTableHeaders('destroy');
    }
    static reinitializeStickyTableHeader(){
        this.destroyStickyTableHeader();
        if(table.getWidth()<right_view.getWidth()){
            this.setStickTableHeader();
        }
    }
    static resetColspan(){
        let header = document.getElementById("header_ind_set");
        let colspan = 5;
        if(indikatorauswahl.getSelectedIndiktorGrundaktState()){
            colspan=6;
        }
        header.colSpan=colspan;
    }
}