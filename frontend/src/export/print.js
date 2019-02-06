const print={
    create:function(){
        let html = `
            <div id="print_container" class="jq_dialog">
                <button class="btn btn-primary btn_dropdown" id="export_btn"><i class="glyphicon glyphicon-export"></i>Exportieren</button>
                <div class="print_map_content" id="print_map_content">
                    <div class="print_header">
                        <h3 id="print_header_title"></h3>
                        <span id="print_header_spatial_extent"></span>
                        <hr class="hr">
                    </div>
                    <div class="map_print_container">
                        <div title="passen Sie die Karte per Drag and Drop an" id="print_map"></div>
                    </div>
                    <div class="ioer_logo"></div>
                    <div class="print_info_content">
                        <div id="print_legende"></div>
                        <div class="map_projection_print_container">
                            <div><b>Kartenprojektion</b></div>
                            <div>ETRS89 / UTM Zone 32N</div>
                        </div>
                        <div class="histostogramm_print_container">
                            <div><b>Histogramm</b></div>
                            <div id="print_histogramm"></div>
                        </div>
                    </div>
                </div>
                <div class="print_bottom">
                    <div id="info_ind_print">
                        <div><b>Information zum Indikator</b></div>
                        <div id="info_indikator_print"></div>
                    </div>
                    <div class="datengrundlage_print_container">
                        <div><b>Datengrundlage</b></div>
                        <div id="datengrundlage_content_print"></div>
                    </div>
                </div>
            </div>
        `;
        $('#Modal').append(html);
    },
    init:function(){

    },
    controller:{
        set:function(){

        }
    }
};