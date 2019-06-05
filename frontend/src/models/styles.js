const style = {
    startMap:{
        color: "grey",
        weight: 2
    },
    autobahn:{
        weight: 3,
        opacity: 1,
        color: 'yellow'
    },
    fernbahnnetz:{
        weight: 3,
        opacity: 1,
        color: 'grey'
    },
    gewaesser:{
        weight: 1,
        opacity: 1,
        color: 'blue'
    },
    laendergrenzen:{
        weight: 2,
        opacity: 1,
        color: 'black',
        fillOpacity: 0,
        dashArray: '3'
    },
    kreisgrenzen:{
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0
    },
    gemeindegrenzen:{
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0
    },
    disable:{
        weight:0,
        opacity: 0,
        fillOpacity:0
    },
    getStandard:function(){
        return {
            weight: 0.25,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: opacity_slider.getOpacity()
        }
    },
    getHover:function(){
        return {
            weight: 5,
            color: farbschema.getColorHexMain(),
            dashArray: ''
        }
    },
    getLayerStyle:function(layer_value){
        let fillcolor = {fillColor: klassengrenzen.getColor(layer_value)};
        return $.extend({},fillcolor,this.getStandard());
    },
    getErrorStyle: function(){
        let bigStripes = new L.StripePattern({
            patternContentUnits: 'userSpaceOnUse',
            patternUnits: 'userSpaceOnUse',
            angle: 45,
            color: 'red'
        });
        bigStripes.addTo(map);
        return {
            fillPattern: bigStripes,
            weight: 0.25,
            opacity: 1,
            color: 'black',
            fillOpacity: 0.5
        };
    }
};