const helper={
    dotTocomma:function(int) {
        return int
            .toString()
            .replace(/\./g, ',');
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
            if ($.inArray(e, result) == -1) result.push(e);
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
    enableElement:function(elem,title){
        $(elem)
            .prop('title',title)
            .prop('disabled',false)
            .css('cursor','pointer');
    },
    disableElement:function(elem,text) {
        $(elem)
            .prop('title', text)
            .prop('disabled', true)
            .css('cursor', 'not-allowed');
    },
    highlightElementByID:function(id,color){
        let color_set = farbschema.getColorActive();
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
    }
};
