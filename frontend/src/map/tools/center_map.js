const center_map={
    selector:"#center_map",
    getDOMContainer:function(){
        $elem = $(`${this.selector}`);
        return $elem;
    },
    centerElement:L.control({position: 'topright'}),
    init:function(){
        center_map.centerElement.onAdd = function (map) {
            var div = L.DomUtil.create('div');
            div.title = "Zoom auf die gesamte Ausdehnung anpassen";
            div.innerHTML = `<div id="${center_map.selector}" class="germany btn_map cursor"></div>`;

            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function () {
                    center_map.center();
                });

            return div;
        };
        center_map.centerElement.addTo(map);

    },
    center:function(){
        if(raeumliche_visualisierung.getParameter()==="raster"){
            map.setView([51.33,10.4589],6);
        }else{
            indikator_json_group.fitBounds();
        }
    }
};