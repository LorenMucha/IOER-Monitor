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
            .then(function(){
                const navbar = new NavBar();
                Object.freeze(navbar);
            })
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
    }
}