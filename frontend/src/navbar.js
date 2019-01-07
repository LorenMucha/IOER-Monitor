const navbar={
    getDomObject:function(){
        $elem = $('#navbar');
        return $elem;
    },
    init:function(){
      let html = `<div class="navbar-default navbar">
          <div class="navbar-primary">
              <nav class="navbar navbar-static-top" role="navigation">
                  <div class="navbar-header">
                      <button type="button" class="navbar-toggle" data-toggle="collapse"
                              data-target="#navbar-collapse-8">
                          <span class="icon-bar"/>
                      </button>
                      <a class="navbar-brand" href="https://www.ioer.de" target="_blank"/>
                  </div>
                  <div>
                      <a href="http://www.ioer-monitor.de"><p class="navbar-text">Monitor der Siedlungs- und Freiraumentwicklung (IÖR-Monitor)</p></a>
                  </div>
                  <div class="collapse navbar-collapse" id="navbar-collapse-8">
                      <ul class="nav navbar-nav">
                          <!--<li><a id="webtour"
                                 title="unternehmen Sie eine Tour durch die Funktionalitäten des IÖR-Monitors">IÖR-Monitor
                              Tour</a></li>-->
                          <li><a id="feedback_a" onclick="feedback.open();">Feedback</a></li>
                          <!--<li><a id="language" data-value="en"><i class="gb uk flag"></i></a></li>-->
                      </ul>
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
          const nav = navbar;
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
      }
    }
};
