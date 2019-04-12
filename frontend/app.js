class App{
    static main(){
        var check_links = function(){
            if (urlparamter.getUrlParameter('rid')) {
                map_link.controller.loadRID(urlparamter.getUrlParameter('rid'));
                return false;
            }
            else if (indikatorauswahl.getSelectedIndikator()) {
                indikatorauswahl.setIndicator(indikatorauswahl.getSelectedIndikator());
                additiveLayer.init();
            }
            else {
                main_view.initializeFirstView();
            }
        };
        if(!view_state.getUnitTestState()) {
            //load the config data
            $.when($.ajax({
                async:true,
                url:"frontend/data/config.json",
                dataType:"json",
                cache:false,
                success:function(data){
                    config.setData(data);
                    config.checkVersion();
                }
            }))
            //set the menu data
                .then(panner.init())
                .then(toolbar.init())
                .then(table.init())
                .then(map_controller.set())
                .then(navbar.init())
                .then(search.init())
                .then(raeumliche_visualisierung.init())
                .then(webTour.init())
                .then(opacity_slider.init())
                .then(klassifzierung.init())
                .then(klassenanzahl.init())
                .then(farbliche_darstellungsart.init())
                .then(main_view.restoreView())
                .then(left_view.setMapView())
                .then(check_links())
                .then($("#loading_circle").remove());
        }else{
            //qunit test -> set Parameter ..&test=true to start
            document.getElementById("Modal").style.display="none";
            var test_container = document.createElement("div");
            test_container.id = "qunit";
            test_container.style.zIndex="3000";
            document.body.appendChild(test_container);
            document.getElementById("loading_circle").remove();
            $.getScript("frontend/lib/qunit/qunit-2.6.2.js")
                .done(function(script,textStatus){
                    var setView = function(){

                    };
                    QUnit.test("init map", function (assert) {
                        assert.equal(panner.init());
                        assert.equal(toolbar.init());
                        assert.equal(table.init());
                        assert.equal(map_controller.set());
                        assert.equal(navbar.init());
                        assert.equal(search.init());
                        assert.equal(raeumliche_visualisierung.init());
                        assert.equal(webTour.init());
                        assert.equal(opacity_slider.init());
                        assert.equal(klassifzierung.init());
                        assert.equal(klassenanzahl.init());
                        assert.equal(farbliche_darstellungsart.init());
                        assert.equal(main_view.restoreView());
                        assert.equal(left_view.setMapView());
                        assert.equal(check_links());
                    });
                });
        }
    }
}