const helper={
    dotTocomma:function(int) {
        return int
            .toString()
            .replace(/\./g, ',');
    },
    parseFloatCommaToPoint: function (string) {
        return parseFloat(string.replace(',', '.'));
    },
    removefromarray:function(array,value_remove){
        var array_cleaned = [];
        $.each(array,function(key,value){
            if(value.id != value_remove){
                //must seperate time values
                if(value.id === indikatorauswahl.getSelectedIndikator()){
                    if(value.time != value_remove){
                        array_cleaned.push(value);
                    }
                }else{
                    array_cleaned.push(value);
                }
            }
        });

        return array_cleaned;
    },
    uniqueArray:function(list) {
        var result = [];
        $.each(list, function(i, e) {
            if ($.inArray(e, result) === -1) result.push(e);
        });
        return result;
    },
    getMaxArray:function(array, propName){
        return Math.max.apply(Math, array.map(function(i) {
            return i[propName];
        }));
    },
    getMinArray:function(array, propName){
        return Math.min.apply(Math, array.map(function(i) {
            return i[propName];
        }));
    },
    getCurrentYear:function(){
        return (new Date).getFullYear();
    },
    enableElement:function(_elem,title){
        let elem = $(_elem);
        elem
            .removeClass('disabled')
            .prop('disabled',false)
            .css('cursor','pointer');

        if(title){
            elem.prop('title',title);
        }
    },
    disableElement:function(_elem,title) {
        let elem = $(_elem);
        elem
            .addClass('disabled')
            .prop('disabled', true)
            .css('cursor', 'not-allowed')
            .unbind();

        if(title){
            elem.prop('title',title);
        }
    },
    highlightElementByID:function(id,color){
        let color_set = farbschema.getColorHexActive();
        if(color){
            color_set = color;
        }
        $('#'+id).css("border","2px solid "+color_set);
    },
    resetHighlightElementByID:function(id){
        $('#'+id).css("border","");
    },
    slideDownElementByID:function(id){
        $('#'+id).slideDown("slow", function () {});
        return true;
    },
    slideUpElementByID:function(id){
        $('#'+id).slideUp("slow", function () {});
        return true;
    },
    checkIE:function(){
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        return msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
    }
};
