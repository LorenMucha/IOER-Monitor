var raster_group = new L.layerGroup();
const indikator_raster_group = {
    clean:function(_id){
        raster_group.eachLayer(function (layer) {
            if(_id) {
                if (layer.wmsParams.id === _id) {
                    map.removeLayer(layer);
                }
            }else{
                map.removeLayer(layer);

            }
        });
    }
};