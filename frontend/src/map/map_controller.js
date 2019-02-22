var map= L.map('map',{
    zoomControl:false,
    twoFingerZoom:true
});

const map_controller={
    //scripts to activate all the scripts
    tools:['lupe.init()',
        'measurement.init()',
        'file_loader.init()',
        'center_map.init()',
        'zoom_out.init()',
        'zoom_in.init()',
        'raster_split.init()',
        'glaetten.init()',
        'dev_chart.init()',
        'map_link.init()',
        'geolocate.init()'
    ],
  set:function(){
      map.on('moveend',         function () {

          let centerPoint = map.getSize().divideBy(2),
              targetLatLng = map.containerPointToLatLng(centerPoint);
          urlparamter.updateURLParameter('lat',targetLatLng.lat);
          urlparamter.updateURLParameter('lng',targetLatLng.lng);

      });
      map.on('zoomend',function () {
          let zoom = map.getZoom();
          urlparamter.updateURLParameter('zoom',zoom);
      });

      if(!main_view.getMobileState()) {
          $('.leaflet-bottom').show();
          map.attributionControl.addAttribution('<a href="http://www.ioer-monitor.de" target="_blank">IÖR-Monitor@Leibniz-Institut für ökologische Raumentwicklung</a>');
      }else{
          $('.leaflet-bottom').hide();
      }
      //init the tools
      this.setTools();
  },
    setTools:function(){
        //scalebar
        L.control.scale({
            metric:true,
            imperial: false,
            maxWidth: 200
        }).addTo(map);

        //style
        $('.leaflet-control-scale-line').css({"border-bottom-color":"black","border-right-color": "black","border-left-color":"black"});

        $.each(this.tools,function(key,value){
            try {
                var tmpFunc = new Function(value);
                tmpFunc();
            }catch(err){
                console.error(err);
            }
        });
    }
};