var raster_group = new L.layerGroup();
const indikator_raster_group = {
    clean:function(_seite){
        map.eachLayer(function(layer){
           try{
               let id = layer.options.id;
               if(id==="indicator_raster"){
                   if(_seite) {
                       if (layer.wmsParams.seite === _seite) {
                           map.removeLayer(layer);
                       }
                   }else{
                       map.removeLayer(layer);

                   }
               }
           } catch(err){}
        });
    },
    add:function(layer){
        raster_group.addLayer(layer);
    }
};