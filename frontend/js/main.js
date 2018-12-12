//init all essential functions
$(document).ready(function() {
    //set the Unit test
    if(!viewState.getUnitTestState()) {
        //load the config data
        $.when($.ajax({
            url:"frontend/data/config.json",
            dataType:"json",
            cache:false,
            success:function(data){
                config.setData(data);
                config.checkVersion();
            }
        }))
            //set the menu data
        .then(search.init())
        .then(raeumliche_visualisierung.init())
        .then(farbschema.init())
        .then(webTour.init())
        .then(toolbar.init())
        .then(opacity_slider.init())
        .then(klassifzierung.init())
        .then(klassenanzahl.init())
        .then(farbliche_darstellungsart.init());
        //set the Views
        $.when(mainView.restoreView())
            .then(leftView.setMapView())
            .then(function () {
                if (urlparamter.getUrlParameter('rid')) {
                    loadRID(urlparamter.getUrlParameter('rid'));
                    return false;
                }
                else if (indikatorauswahl.getSelectedIndikator()) {
                    indikatorauswahl.setIndicator(indikatorauswahl.getSelectedIndikator());
                    layer_control.init();
                }
                else {
                    mainView.initializeFirstView();
                }
            });

    }else {
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
                    assert.equal(mainView.restoreView());
                    assert.equal(leftView.setMapView());
                }));
    }
});