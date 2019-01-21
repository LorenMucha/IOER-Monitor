const ogc_export={
    wms:{
        endpoint_id:"wms_text",
        text:{
            de:{
                title:"WMS Dienst",
                use:"Dieser WMS-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.",
                terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
                url:"Die zu verwendende URL für den WMS-Dienst lautet:"

            },
            en:{
                title:"WMS Service",
                use:"This WMS service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.",
                terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
                url:"The URL for the WMS service to use is:"
            }
        },
        open:function(){
            if(typeof indikatorauswahl.getSelectedIndikator() !=='undefined') {
                let lan = language_manager.getLanguage(),
                    html = he.encode(`
                                     <div class="jq_dialog ogc_dialog" id="${this.endpoint_id}">
                                        <img src="frontend/assets/icon/worldwide.png"/>
                                        <h4>${this.text[lan].use}</h4>
                                        <div class="ogc_accecpt_container">
                                            <input title="Aktzeptieren" type="checkbox" name="allow" id="checkbox_wms" />
                                            <span>${this.text[lan].terms}</span>
                                        </div>
                                        <div class="ogc_allow" id="wms_allow">
                                            <h4>${this.text[lan].url}</h4>
                                            <div class="link_container">
                                                <h3 id="wms_link"></h3>
                                                <a target="_blank">
                                                    <div class="btn btn-primary ogc_info"></div>
                                                </a>
                                            </div>
                                        </div>
                                    </div> 
                                  `);
                //settings for the manager
                dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
                dialog_manager.instructions.html= html;
                dialog_manager.instructions.title=this.text[lan].title;
                dialog_manager.instructions.width=500;
                dialog_manager.instructions.height=300;
                dialog_manager.create();
                this.controller.set();
            }else{
                alert_manager.alertNoIndicatorChosen();
            }
        },
        controller:{
            set:function(){
                const object = ogc_export.wms;
                let indikator = indikatorauswahl.getSelectedIndikator(),
                    endpoint = $(`#${object.endpoint_id}`),
                    wms_link = 'http://maps.ioer.de/cgi-bin/wms?MAP=' + indikator + '_100',
                    checkbox = endpoint.find("#checkbox_wms"),
                    allow =endpoint.find('#wms_allow');

                allow.hide();

                checkbox.change(function () {
                    if ($(this).is(":checked")) {
                        allow.show();
                        endpoint
                            .find('#wms_link')
                            .text(wms_link);
                        endpoint
                            .find('.link_container')
                            .find('a')
                            .attr("href",wms_link+"&SERVICE=WMS&VERSION=1.0.0&REQUEST=GetCapabilities");
                    } else {
                        allow.hide();
                    }
                });
            }
        }
    },
    wcs:{
        endpoint_id:"wcs_text",
        text:{
            de:{
                title:"WCS Dienst",
                use:"Dieser WCS-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.",
                terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
                url:"Die zu verwendende URL für den WMS-Dienst lautet:",
                instruction:"Kurzanleitung für die Einbindung von WCS Diensten:"

            },
            en:{
                title:"WCS Service",
                use:"This WCS service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.",
                terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
                url:"The URL for the WMS service to use is:",
                instruction:"Brief instructions for the integration of WCS services:"
            }
        },
        open:function() {
            if (typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
                let lan = language_manager.getLanguage(),
                    html = he.encode(`
                         <div class="jq_dialog ogc_dialog" id="${this.endpoint_id}">
                            <img src="frontend/assets/icon/worldwide.png"/>
                            <h4 >${this.text[lan].use}</h4>
                            <div class="ogc_accecpt_container">
                                <input title="Aktzeptieren" type="checkbox" name="allow" id="checkbox_wcs" />
                                <span>${this.text[lan].terms}</span>
                            </div>
                            <div class="ogc_allow" id="wcs_allow">
                                <h4>${this.text[lan].url}</h4>
                                <div class="link_container">
                                    <h3 id="wcs_link"></h3>
                                    <a target="_blank">
                                        <div class="btn btn-primary ogc_info"></div>
                                    </a>
                                </div>
                                <!--
                                Todo
                                <hr class="hr">
                                <div class="ogc_anleitung">${this.text[lan].instruction}</div>
                                <a target="_blank" href="data/anleitung_import_arcgis_wcs.pdf">
                                    <button>ArcGIS</button>
                                </a>
                                <a target="_blank" href="data/anleitung_import_qgis_wcs.pdf">
                                    <button>QGIS</button>
                                </a>
                                -->
                            </div>
                        </div>
                    `);
                //settings for the manager
                dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
                dialog_manager.instructions.html= html;
                dialog_manager.instructions.title=this.text[lan].title;
                dialog_manager.instructions.width=500;
                dialog_manager.instructions.height=300;
                dialog_manager.create();
                this.controller.set();
            }else{
                alert_manager.alertNoIndicatorChosen();
            }
        },
        controller:{
            set:function(){
                const object = ogc_export.wcs;
                let indikator = indikatorauswahl.getSelectedIndikator(),
                    endpoint = $(`#${object.endpoint_id}`),
                    wcs_link = 'http://maps.ioer.de/cgi-bin/wcs?MAP=' + indikator + '_wcs',
                    checkbox = endpoint.find("#checkbox_wcs"),
                    allow=endpoint.find('#wcs_allow');

                allow.hide();

                checkbox.change(function () {
                    if ($(this).is(":checked")) {
                        allow.show();
                        endpoint
                            .find('#wcs_link')
                            .text(wcs_link);
                        endpoint
                            .find('.link_container')
                            .find('a')
                            .attr("href",wcs_link+"&SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCapabilities");
                    } else {
                        allow.hide();
                    }
                });
            }
        }
    },
    wfs:{
        endpoint_id:"wfs_text",
        text:{
            de:{
                title:"WFS Dienst",
                use:"Dieser WFS-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.",
                terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
                url:"Die zu verwendende URL für den WFS-Dienst lautet:",
                instruction:"Kurzanleitung für die Einbindung von WCS Diensten:"

            },
            en:{
                title:"WFS Service",
                use:"This WFS service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.",
                terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
                url:"The URL for the WMS service to use is:",
                instruction:"Brief instructions for the integration of WFS services:"
            }
        },
        open:function() {
            if (typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
                let lan = language_manager.getLanguage(),
                    html = he.encode(`
                          <div class ="jq_dialog ogc_dialog" id="${this.endpoint_id}">
                                <img src="frontend/assets/icon/worldwide.png"/>
                                <h4>${this.text[lan].use}</h4>
                                <div class="ogc_accecpt_container">
                                    <input title="Aktzeptieren" type="checkbox" name="allow" id="checkbox_wfs" />
                                    <span>${this.text[lan].terms}</span>
                                </div>
                                <div class="ogc_allow" id="wfs_allow">
                                    <h4>${this.text[lan].url}</h4>
                                    <div class="link_container">
                                        <h3 id="wfs_link"></h3>
                                        <a target="_blank">
                                            <div class="btn btn-primary ogc_info"></div>
                                        </a>
                                    </div>
                                    <!--
                                    Todo
                                    <hr class="hr">
                                    <div class="ogc_anleitung">Kurzanleitung für die Einbindung von WFS Diensten:</div>
                                    <a target="_blank" href="frontend/data/anleitung_import_arcgis.pdf">
                                        <button>ArcGIS</button>
                                    </a>
                                    <a target="_blank" href="frontend/data/anleitung_import_qgis.pdf">
                                        <button>QGIS</button>
                                    </a>
                                    -->
                                </div>
                            </div>
                    `);
                //settings for the manager
                dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
                dialog_manager.instructions.html= html;
                dialog_manager.instructions.title=this.text[lan].title;
                dialog_manager.instructions.width=500;
                dialog_manager.instructions.height=300;
                dialog_manager.create();
                this.controller.set();
            }else{
                alert_manager.alertNoIndicatorChosen();
            }
        },
        controller:{
            set:function(){
                const object = ogc_export.wfs;
                let indikator = indikatorauswahl.getSelectedIndikator(),
                    endpoint = $(`#${object.endpoint_id}`),
                    wfs_link = 'http://monitor.ioer.de/cgi-bin/wfs?MAP=' + indikator,
                    checkbox = endpoint.find("#checkbox_wfs"),
                    allow=endpoint.find('#wfs_allow');

                allow.hide();

                checkbox.change(function () {
                    if ($(this).is(":checked")) {
                        allow.show();
                        endpoint
                            .find('#wfs_link')
                            .text(wfs_link);
                        endpoint
                            .find('.link_container')
                            .find('a')
                            .attr("href",wfs_link+"&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities");
                    } else {
                        allow.hide();
                    }
                });
            }
        }
    }
};