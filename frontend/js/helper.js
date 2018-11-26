function DotToComma(int){
    return int
            .toString()
            .replace(/\./g, ',');
}
function removefromarray(array,value_remove){
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
}
function uniqueArray(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}
function getMaxArray(array, propName){
    return Math.max.apply(Math, array.map(function(i) {
        return i[propName];
    }));
}
function getMinArray(array, propName){
    return Math.min.apply(Math, array.map(function(i) {
        return i[propName];
    }));
}
function getCurrentYear(){
    return (new Date).getFullYear();
}
function enableElement(elem,title){
    $(elem)
        .prop('title',title)
        .prop('disabled',false)
        .css('cursor','pointer');
}
function disableElement(elem,text) {
    $(elem)
        .prop('title', text)
        .prop('disabled', true)
        .css('cursor', 'not-allowed');
}
function highlightElementByID(id,color){
    let color_set = farbschema.getColorActive();
    if(color){
        color_set = color;
    }
    $('#'+id).css("border","2px solid "+color_set);
}
function resetHighlightElementByID(id){
    $('#'+id).css("border","");
}
function slideDownElementByID(id){
    $('#'+id).slideDown("slow", function () {});
    return true;
}
function slideUpElementByID(id){
    $('#'+id).slideUp("slow", function () {});
    return true;
}
