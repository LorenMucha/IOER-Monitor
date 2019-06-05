const ogc_export={
    service:"wms",
    endpoint_id:"ogc_dialog",
    getLink:function(service){
       if(this.service==="wfs" || this.service==="wcs") {
           return `https://monitor.ioer.de/cgi-bin/${this.service}?MAP=${indikatorauswahl.getSelectedIndikator()}_${this.service}`;
           //return `https://monitor.ioer.de/monitor_api/user?id=${indikatorauswahl.getSelectedIndikator().toUpperCase()}&service=${service}&<b style="color:red;">key=<i>Ihr API Key</i></b>`;
        }else{
            return `https://monitor.ioer.de/cgi-bin/wms?MAP=${indikatorauswahl.getSelectedIndikator().toUpperCase()}_wms`;
        }
    },
    text:{
        de:{
            title:function(){return `${ogc_export.service.toUpperCase()}-Dienst`},
            use:function(){return `Dieser ${ogc_export.service.toUpperCase()}-Dienst steht Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.`},
            terms:'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
            url:function(){return `Die zu verwendende URL für den ${ogc_export.service.toUpperCase()}-Dienst lautet:`}
        },
        en:{
            title:function (){return`${ogc_export.service.toUpperCase()}-Service`},
            use:function(){return `This ${ogc_export.service.toUpperCase()} service is available to you for using the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.`},
                terms:'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
                url:function(){return `The URL for the ${ogc_export.service.toUpperCase()} service to use is:`}
        },
    },
    open:function(_service){
        const object = this;
        this.service = _service;
        if(typeof indikatorauswahl.getSelectedIndikator() !=='undefined') {
            let lan = language_manager.getLanguage(),
                user_login=function(){
                    if(_service==="wcs" || _service==="wfs") {
                        return `
                            <h4>Wenn Sie noch keinen API-Key besitzen, können Sie diesen durch eine einmalige Anmeldung generieren.</h4>
                            <div style="margin-top: 20px; margin-left: 20%;" class="cursor">
                                <a href="https://monitor.ioer.de/monitor_api" target="_blank">
                                     <i class="huge icons">
                                          <i class="big circle outline icon"></i>
                                          <i class="user icon"></i>
                                    </i>
                                </a>
                            </div>
                            <hr/>
                            <h4>Falls Sie Hilfe benötigen, finden Sie hier eine Anleitung</h4>
                            <div style="margin-top: 20px; margin-left: 20%;" class="cursor">
                                <a>
                                     <i class="huge icons">
                                        <i class="big circle outline icon"></i>
                                        <i class="help icon"></i>
                                    </i>
                                </a>
                            </div>
                        `;
                    }else{return "";}
                },
                html = he.encode(`
                                     <div class="jq_dialog ogc_dialog" id="${object.endpoint_id}">
                                        <h4>${object.text[lan].use()}</h4>
                                        <div class="ogc_accecpt_container">
                                            <input title="Aktzeptieren" type="checkbox" name="allow" id="ogc_allow"/>
                                            <span>${object.text[lan].terms}</span>
                                        </div>
                                        <hr/>
                                        <div class="ogc_allow display-none" id="allow_container">
                                            <h4>${object.text[lan].url()}</h4>
                                            <div class="link_container">
                                                <h3 id="wms_link">${object.getLink(_service)}</h3>
                                            </div>
                                            <hr/>
                                        </div>
                                    </div> 
                                  `);
            //settings for the manager
            let instructions = {
                endpoint:`${this.endpoint_id}`,
                html:html,
                title:this.text[lan].title(),
                modal:false
            };
            dialog_manager.setInstruction(instructions);
            dialog_manager.create();
            $('#ogc_allow')
                .unbind()
                .change(function(){
                    $('#allow_container').show();
                });

        }else{
            alert_manager.alertNoIndicatorChosen();
        }
    }
};