const file_loader={
  fileElement:L.Control.fileLayerLoad({
      layer: L.geoJson,
      // See http://leafletjs.com/reference.html#geojson-options
      layerOptions: {style: {color:'red'}},
      // Add to map after loading (default: true) ?
      addToMap: true,
      // File size limit in kb (default: 1024) ?
      fileSizeLimit: 1024,
      // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
      formats: [
          '.geojson',
          '.kml',
          '.gpx'
      ]
  }),
  init:function(){
      file_loader.fileElement.addTo(map);
      document.getElementById("import").appendChild(file_loader.fileElement.getContainer());
  }
};