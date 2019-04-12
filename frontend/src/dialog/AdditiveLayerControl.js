const endpoint_id="layer_control";
class AdditiveLayerControl{
    constructor(){
        this.text = {
            de:{
                title:"Karten",
                grund:"Grundkarten",
                extra:"Zusatzkarten",
                empty:"kein Hintergrund",
                laendergrenzen:"Ländergrenzen",
                kreisgrenzen:"Kreisgrenzen",
                gemeindegrenzen:"Gemeindegrenzen",
                mdmap:"OSM Buildings 2.5D",
                autobahn:"Autobahnnetz (Stand 2015)",
                fernbahnnetz:"Fernbahnnetz (Stand 2016)",
                gewaesser:"Gewässer"
            },
            en:{
                title:"Maps",
                grund:"Base Maps",
                extra:"Extra Maps",
                empty:"no Background",
                laendergrenzen:"National borders",
                kreisgrenzen:"District boundaries",
                gemeindegrenzen:"Municipal boundaries",
                mdmap:"OSM Buildings 2.5D",
                autobahn:"Autobahn network (as of 2015)",
                fernbahnnetz:"Long-distance railway network (as of 2016)",
                gewaesser:"Waters"
            }
        };
    }
    open(){
        let lan = language_manager.getLanguage(),
            html=`
             <div class="jq_dialog" id="${endpoint_id}">
                <div class="container">
                    <h3 class="well">${this.text[lan].grund}</h3>
                    <div class="maps row">
                        <div class="col-sm-6 left">
                            <ul class="list-group">
                                  <li class="list-group-item">
                                        <div id="topplus" class="image-content cursor base_layers" data-id="topplus">
                                            <div class="pic image"></div>
                                            <div class="name">Topplus</div>
                                        </div>
                                   </li>
                                  <li class="list-group-item">
                                        <div id="satellite" class="image-content cursor base_layers" data-id="satellite">
                                            <div class="pic image"></div>
                                            <div class="name">Satellite</div>
                                        </div>
                                  </li>
                                  <li class="list-group-item">
                                        <div id="osm" class="image-content cursor base_layers" data-id="osm">
                                            <div class="pic image"></div>
                                            <div class="name">OSM</div>
                                        </div>
                                  </li>
                            </ul>
                        </div>
                        <div class="col-sm-6 right">
                            <ul class="list-group">
                                  <li class="list-group-item">
                                         <div id="webatlas" class="image-content cursor base_layers" data-id="webatlas" data-name="${this.text[lan].empty}">
                                            <div class="pic image"></div>
                                            <div class="name">WebatlasDE</div>
                                        </div>
                                   </li>
                                  <li class="list-group-item">
                                        <div id="leer" class="image-content cursor base_layers" data-id="noBackground"  data-name="${this.text[lan].empty}">
                                            <div class="pic image"></div>
                                            <div class="name">${this.text[lan].empty}</div>
                                        </div>
                                  </li>
                            </ul>
                         </div>
                    </div>
                    <h3 class="well">${this.text[lan].extra}</h3>
                    <div class="maps extra-maps row">
                    <div class="col-sm-6 left">
                            <ul class="list-group">
                                  <li class="list-group-item">
                                       <div id="laendergrenzen" class="image-content cursor overlay" data-id="laendergrenzen" data-name="${this.text[lan].laendergrenzen}">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].laendergrenzen}</div>
                                        </div>
                                   </li>
                                  <li class="list-group-item">
                                        <div id="kreisgrenzen" class="image-content cursor overlay" data-id="kreisgrenzen" data-name="${this.text[lan].kreisgrenzen}">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].kreisgrenzen}</div>
                                        </div>
                                  </li>
                                  <li class="list-group-item">
                                        <div id="gemeindegrenzen" class="image-content cursor overlay" data-id="gemeindegrenzen" data-name="${this.text[lan].gemeindegrenzen}">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].gemeindegrenzen}</div>
                                        </div>
                                  </li>
                                  <!-- OSM 3D Buildings
                                  <li class="list-group-item">
                                        <div id="${OsmBuildings.getButtonId().replace("#","")}" class="image-content cursor overlay" data-id="mdmap" data-name="${this.text[lan].mdmap}" title="3D Gebäude, welche erst ab hoher Zoomstufe sichtbar sind">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].mdmap}</div>
                                        </div>
                                  </li>-->
                            </ul>
                        </div>
                        <div class="col-sm-6 right">
                            <ul class="list-group">
                                  <li class="list-group-item">
                                         <div id="autobahn" class="image-content overlay cursor" data-id="autobahn" data-name="${this.text[lan].autobahn}">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].autobahn}</div>
                                        </div>
                                   </li>
                                  <li class="list-group-item">
                                       <div id="fernbahnnetz" class="image-content overlay cursor" data-id="fernbahnnetz" data-name="${this.text[lan].fernbahnnetz}">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].fernbahnnetz}</div>
                                        </div>
                                  </li>
                                  <li class="list-group-item">
                                        <div id="gewaesser" class="image-content overlay cursor" data-id="gewaesser" data-name="${this.text[lan].gewaesser}">
                                            <div class="pic extra-image"></div>
                                            <div class="name">${this.text[lan].gewaesser}</div>
                                        </div>
                                  </li>
                            </ul>
                         </div>
                    </div>
                </div>
             </div>
        `;
        console.log("open");
        //settings for the manager
        dialog_manager.instructions.endpoint = `${endpoint_id}`;
        dialog_manager.instructions.html= html;
        dialog_manager.instructions.title=this.text[lan].title;
        dialog_manager.instructions.modal=false;
        dialog_manager.create();
        try {
            //set 3d maps selected
            if(OsmBuildings.getState()){
                $(OsmBuildings.getButtonId()).addClass('active');
            }
            $('.base_layers').each(function(){
                if($(this).data("id")===additiveLayer.baselayer.getParameter()){
                    $(this).addClass("active");
                }
            });
            $.each(additiveLayer.zusatzlayer.overlays_set.eachLayer(function (layer) {
                $(`#${layer.options.name}`).addClass('active');
            }));
        }catch(err){}
    }
}