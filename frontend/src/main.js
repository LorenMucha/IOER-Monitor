//init all essential functions
// The code in this function runs when the page is loaded.

function init() {

    //set the Unit test
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
        .then(navbar.init())
        .then(search.init())
        .then(raeumliche_visualisierung.init())
        .then(farbschema.init())
        .then(webTour.init())
        .then(toolbar.init())
        .then(opacity_slider.init())
        .then(klassifzierung.init())
        .then(klassenanzahl.init())
        .then(farbliche_darstellungsart.init())
        .then(layer_control.init());
        //set the Views
        $.when(main_view.restoreView())
            .then(left_view.setMapView())
            .then(function () {
                if (urlparamter.getUrlParameter('rid')) {
                    loadRID(urlparamter.getUrlParameter('rid'));
                    return false;
                }
                else if (indikatorauswahl.getSelectedIndikator()) {
                    indikatorauswahl.setIndicator(indikatorauswahl.getSelectedIndikator());
                }
                else {
                    main_view.initializeFirstView();
                }
            });
}