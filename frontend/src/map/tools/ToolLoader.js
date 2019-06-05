let tools=['lupe.init()',
    'measurement.init()',
    'center_map.init()',
    'zoom_out.init()',
    'zoom_in.init()',
    'raster_split.init()',
    'glaetten.init()',
    'dev_chart.init()',
    'map_link.init()',
    'geolocate.init()',
    'statistics.init()'
];
class ToolLoader {
    static setTools(_tools){
        tools=_tools;
    }
    static initTools(){
        //wait until the map is ready
        $.each(tools,function(key,value){
            try {
                var tmpFunc = new Function(value);
                tmpFunc();
            }catch(err){
                console.error(err);
            }
        });
    }
}