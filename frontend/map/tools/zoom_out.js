const zoom_out={
    selector:"#zoom_out",
    getDOMContainer:function(){
        $elem = $(`${this.selector}`);
        return $elem;
    },
    zoomElement:L.control({position: 'topright'}),
    init:function(){
        zoom_out.zoomElement.onAdd = function (map) {
            var div = L.DomUtil.create('div');
            div.title = "Aus der Karte herauszoomen";
            div.innerHTML = `<div id="${zoom_out.selector}" class="zoomOut btn_map cursor"></div>`;

            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function () {
                    zoom_out.zoomOut();
                });

            return div;
        };
        zoom_out.zoomElement.addTo(map);

    },
    zoomOut:function(){
        map.setZoom(map.getZoom()-1);
    }
};
