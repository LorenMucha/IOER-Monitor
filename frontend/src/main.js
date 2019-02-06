function main(){
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
            .then(farbliche_darstellungsart.init());
        //set the Views
        $.when(main_view.restoreView())
            .then(left_view.setMapView())
            .then(function () {
                if (urlparamter.getUrlParameter('rid')) {
                    map_link.controller.loadRID(urlparamter.getUrlParameter('rid'));
                    return false;
                }
                else if (indikatorauswahl.getSelectedIndikator()) {
                    indikatorauswahl.setIndicator(indikatorauswahl.getSelectedIndikator());
                    layer_control.init();
                }
                else {
                    main_view.initializeFirstView();
                }
            });
    }else{
        $.when($('body')
            .append('<div id="qunit"></div>')
            .find("#Modal")
            .css("display", "none"))
            .then($('head').append('<script src="frontend/lib/qunit/qunit-2.6.2.js"></script><link rel="stylesheet" href="frontend/lib/qunit/qunit-2.6.2.css">'))
            .then(
                QUnit.test("init map", function (assert) {
                    assert.equal(raeumliche_visualisierung.init());
                    assert.equal(farbschema.init());
                    assert.equal(webTour.init());
                    assert.equal(opacity_slider.init());
                    assert.equal(main_view.restoreView());
                    assert.equal(left_view.setMapView());
                }));
    }
}