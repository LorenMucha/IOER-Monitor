const navbar={
    getDomObject:function(){
        $elem = $('#navbar');
        return $elem;
    },
    init:function(){
      let html = `<div class="navbar-default navbar">
          <div class="navbar-primary">
              <nav class="navbar navbar-static-top" role="navigation">
                  <div class="navbar-header w-100">
                      <a class="navbar-brand" href="https://www.ioer.de" target="_blank"/>
                      <a class="float-left navbar-header-text mobile_hidden" href="http://www.ioer-monitor.de"><p>Monitor der Siedlungs- und Freiraumentwicklung (IÖR-Monitor)</p></a>
                       <div id="nav_click" class="h-100">
                           <div class="navbar-text float-right help" id="help">
                                <p>Hilfe</p>
                                <div id="help-content" class="help-content">
                                    <div>
                                        <div class="cursor"><i class="road icon"></i><a id="webtour" title="unternehmen Sie eine Tour durch die Funktionalitäten des IÖR-Monitors">Monitor Tour</a></div>
                                        <div class="cursor"><i class="envelope icon"></i><a id="feedback_a" onclick="feedback.open();">Feedback</a></div>
                                    </div>
                                </div>
                            </div>
                           <!--<div class="navbar-text float-right language" id="language"><i class="gb uk flag"></i></div>-->
                      </div>
                  </div>
              </nav>
          </div>
      </div>`;
     this.getDomObject().append(html);
      //bind the language Click
      this.controller.set();
    },
    controller:{
      set:function(){
          const help_content = $("#help-content");
          $('#language')
              .unbind()
              .click(function(){
              language_manager.setLanguage($(this).data("value"));
              language_manager.setElements();
                if($(this).data("value")==="en"){
                    $(this)
                        .data('value',"de")
                        .find('i')
                        .removeClass("gb uk")
                        .addClass("de");
                    navbar.getDomObject().find('.navbar-text').text('Monitor of Settlement and Open Space Development');
                }else{
                    $(this)
                        .data('value',"en")
                        .find("i")
                        .removeClass("de")
                        .addClass("gb uk");
                    navbar.getDomObject().find('.navbar-text').text('Monitor der Siedlungs- und Freiraumentwicklung (IÖR-Monitor)');
                }
          });
          $("#nav_click")
              //for mobile devices, without hover
              .click(function(){
                 if(help_content.is(":visible")){
                     help_content.hide();
                 }else{
                     help_content.show();
                 }
              });
      }
    }
};
