const zoom_in={
    selector:"#zoom_in",
    getDOMContainer:function(){
        $elem = $(`${this.selector}`);
        return $elem;
    },
    zoomElement:L.control({position: 'topright'}),
    init:function(){
        zoom_in.zoomElement.onAdd = function (map) {
            var div = L.DomUtil.create('div');
            div.title = "In die Karte hineinzoomen";
            div.innerHTML = `<div id="${zoom_in.selector}" class="zoomIn btn_map cursor"></div>`;

            L.DomEvent
                .on(div, 'dblclick', L.DomEvent.stop)
                .on(div, 'click', L.DomEvent.stop)
                .on(div, 'mousedown', L.DomEvent.stopPropagation)
                .on(div, 'click', function () {
                    zoom_in.zoomIn();
                });

            return div;
        };
        zoom_in.zoomElement.addTo(map);

    },
    zoomIn:function(){
        map.setZoom(map.getZoom()+1);
    }
};
