const map_link={
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            $(document).on("click","#kartenlink",function(){

                let setting={"id":"set","val":urlparamter.getAllUrlParameter()};

                $.when(RequestManager.handleLink(setting)).done(function (data) {
                    if(data.state==="inserted") {
                        let rid=data.res[0]["id"],
                            link_a = urlparamter.getURLMonitor() + "?rid=" + rid,
                            mail_link = `mailto:?
                                     subject=Karte des Monitor der Siedlungs und Freiraumentwicklung (www.ioer-monitor.de)
                                     &body=Sehr geehrte Damen und Herren,%0AIhnen wird in dieser Email ein Link zu einer interaktiven Karte des Monitors der Siedlungs- und Freiraumentwicklung des Leibniz-Instituts für ökologische Raumentwicklung (http://www.ioer.de) gesendet. %0A%0ABitte nutzen Sie auf folgenden Weblink, um die Karte aufzurufen: ${urlparamter.getURLMonitor()}?rid=${rid} %0A%0AMit freundlichen Grüßen %0A%0A`;
                        swal({
                            title:`<img src="frontend/assets/icon/worldwide.png" style="display: block; margin-left: auto;margin-right: auto"/>`,
                            text: `<span class="text-black">Ihre Karte wurde gespeichert.
                                   Sie können diese im Viewer jeder Zeit unter Angabe der Kartennummer
                                   <b style="color:red;">${rid}</b>
                                   aufrufen oder über den folgenden Link direkt anderen zur Verfügung stellen:</span>
                                    <br/>
                                    <a href="${link_a}" target="_blank" style="margin-top:1vh;">${link_a}</a>
                                    <br/>
                                    <p style="margin-top: 1vh">Kartenlink versenden:
                                        <a id="rid_mail_to" href="${mail_link}"
                                        style="background-color:#BDDDFD; padding-left:12px; padding-right:12px; color:#333; text-decoration:none;"
                                        class="button_standard_abschicken_a">E-Mail</a>
                                    </p>`,
                            html:true,
                            showCancelButton:false
                        });
                    }else{
                        alert_manager.alertError();
                    }
                });
            });

            $('#rid').keypress(function(e) {
                if(e.which === 13) {
                    e.preventDefault();
                    var link = $(this).val();
                    map_link.controller.loadRID(link);
                }
            });
        },
        loadRID(_rid){
            let setting = {"id":"get","val":_rid};
            $.when(RequestManager.handleLink(setting)).done(function (data) {
                console.log(data);
                if(data.state==="get") {
                    window.location.href = `${window.location.href.split('?')[0]}?${data.res[0]["array_value"]}`;
                }else{
                    alert_manager.alertError();
                }
            });
        }
    }
};