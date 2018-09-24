const webTour={
    tour: '',
    getStartButtonDOMObject:function(){
      $elem = $('#webtour');
      return $elem;
    },
    init:function(){
        const object = this;
    this.getStartButtonDOMObject()
        .unbind()
        .click(function(e){
            e.preventDefault();
            $('.navbar-collapse').hide();
            object.create();
            rightView.close();
            object.tour.restart();
        });
    },
    create:function(){
        //Quelle und API: http://bootstraptour.com/api/
        //The script
        toolbar.close();
        this.tour = new Tour({
            steps:[
                {
                    element: ".menu_m",
                    title: "Das Hauptmenü",
                    content: "Klicken des seitlichen Buttons bewirkt Ein- oder Ausfahren des Menüs.",
                    onShown: function () {
                        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='raster'){
                            $('#spatial_choice_checkbox_container')
                                .checkbox('uncheck');
                        }
                    }
                },
                {
                    element: "#search_input_field",
                    title: "Die Suchfunktion",
                    content: "Suchen Sie nach passenden Indikatoren und Orten.",
                    onShow:function(){
                        toolbar.open();
                        highlightElementByID('search');
                    },
                    onNext: function(){
                        resetHighlightElementByID('search');
                        slideDownElementByID('drop_kat');
                    }
                },
                {
                    element:"#indicator_ddm",
                    title: "Indikatorauswahl",
                    content: "Wählen Sie den gewünschten Indikator",
                    onShown: function() {
                        $('#indicator_ddm').dropdown('show');
                    },
                    onNext: function(){
                        if(typeof indikatorauswahl.getSelectedIndikator()==='undefined') {
                            indikatorauswahl.setIndicator('S12RG');
                        }
                        slideUpElementByID('drop_kat');
                        slideDownElementByID('dropdown_raumgl');
                    }
                },
                {
                    element: ".spatial_choice",
                    title:"Darstellungsmodus",
                    content: "Wählen Sie den gewünschten Darstellungsmodus der Indikatoren aus.",
                    onShow:function(){
                        highlightElementByID('spatial_choice');

                    },
                    onNext:function(){
                        resetHighlightElementByID('spatial_choice');
                    }
                },
                {
                    element: '#menu_raumgl',
                    title: "Räumliche Analyseebene",
                    content: "Gliederung Deutschlands in einzelne Raumeinheiten. (Deren Verfügbarkeit ist vom Indikator abhängig.)",
                    onShow:function(){
                        highlightElementByID('menu_raumgl');
                        raeumliche_analyseebene.setSectionId('bld');
                        indikatorJSON.init('bld');
                    },
                    onNext: function(){
                        resetHighlightElementByID('menu_raumgl');
                    }
                },
                {
                    element: "#dropdown_grenzen_container",
                    title: "Gebietsauswahl",
                    content: "Suchen und Wählen Sie bestimmte Gebiete, auch eine Mehrfachauswahl ist möglich.",
                    onShow:function(){
                        highlightElementByID('dropdown_grenzen_container');
                        $('#dropdown_grenzen_container').dropdown('set selected','12');
                    },
                    onNext: function(){
                        resetHighlightElementByID('dropdown_grenzen_container');
                    }
                },
                {
                    element: "#user_choice",
                    title: "Raumgliederung",
                    content:"Weitere räumliche Unterteilung der getroffenen Gebietsauswahl.",
                    onShow: function(){
                        highlightElementByID('menu_raumgl_fein');
                        indikatorJSON.init('krs');
                        setTimeout(function(){raumgliederung.setSelectionId('krs')},2000);
                    },
                    onNext: function () {
                        resetHighlightElementByID('menu_raumgl_fein');
                        slideUpElementByID('dropdown_raumgl');
                    }
                },
                {
                    element: "#hh_sf_dropdown_layer",
                    title: "Kartengestaltung",
                    content: "Passen Sie die Karte nach Ihren Vorstellungen an.",
                    onShow: function () {
                        slideDownElementByID('dropdown_layer');
                    },
                    onNext: function () {
                        slideUpElementByID('dropdown_layer');
                    }
                },
                {
                    element: "#hh_sf_dropdown_werkzeug",
                    title: "Werkzeuge",
                    content: "Tools zum Interagieren mit der Kartenansicht",
                    onShow: function () {
                        slideDownElementByID('dropdown_werkzeug');
                    },
                    onNext: function () {
                        slideUpElementByID('dropdown_werkzeug');
                    }
                },
                {
                    element: "#hh_sf_dropdown_ogc",
                    title: "Einbinden und Speichern",
                    content: "Binden Sie die Indikatorkarten als INSPIRE-konforme Dienste in Ihr GIS-System ein oder teilen bzw. speichern Sie die aktuell erstellte Karte.",
                    onShow: function () {
                        slideDownElementByID('dropdown_ogc');
                    },
                    onNext:function(){
                        slideUpElementByID('dropdown_ogc');
                    }
                },
                {
                    element: "#panRight",
                    title: "Tabellenansicht",
                    placement: "left",
                    content: "Klicken des seitlichen Buttons bewirkt Ein- oder Ausfahren der Tabelle.",
                    onNext:function(){
                        rightView.open();
                    }
                },
                {
                    element: "#btn_table",
                    title: "Tabellenoptionen",
                    placement: "left",
                    content: "Erweitern Sie die Tabelle individuell um zusätzliche Daten- und Vergleichsspalten.",
                    onNext:function(){
                        table_expand_panel.fill();
                        $('#tabelle_erweitern').show("slow");
                    }
                },
                {
                    element: "#btn_table_load_expand",
                    title:"Tabelle erweitern",
                    content: "Bestätigen Sie Ihre Auswahl durch Aktualisieren der Tabelle, oder setzen Sie die Auswahl zurück",
                    placement: "left",
                    onNext:function(){
                        table_expand_panel.close();
                    }
                },
                {
                    element:"#indikatoren_gebietsprofil12070",
                    title: "Gebietsprofil",
                    content: "Werteübersicht dieser Gebietseinheit für alle Indikatoren (mit Vergleich zu übergeordneten Raumeinheiten und mittleren Grundaktualitäten)",
                    placement: "left",
                    onShown: function(){
                        highlightElementByID("indikatoren_gebietsprofil12070");
                    },
                    onNext: function () {
                        resetHighlightElementByID("indikatoren_gebietsprofil12070")
                    }
                },
                {
                    element: "#diagramm_ags12070",
                    title: "Erweiterte Statistik",
                    placement: "left",
                    content: "Lassen Sie sich zusätzliche statistische Kenngrößen zu der jeweiligen Gebietseinheit anzeigen.",
                    onShown: function(){
                        highlightElementByID("diagramm_ags12070");
                    },
                    onNext: function () {
                        resetHighlightElementByID("diagramm_ags12070")
                    }
                },
                {
                    element: "#indikatoren_diagramm_ags12070",
                    title: "Entwicklungsdiagramm",
                    placement: "left",
                    content: "Visualisierung der Indikatorwertentwicklung anhand eines Graphen über die Zeit",
                    onShown: function(){
                        highlightElementByID("indikatoren_diagramm_ags12070");
                    },
                    onNext: function () {
                        resetHighlightElementByID("indikatoren_diagramm_ags12070")
                    }
                },
                {
                    element: "#close_checker",
                    placement: "left",
                    title: "Tabellenansicht verbergen",
                    content: "Schließen Sie die Tabelle um die Karte großflächig zu nutzen und Ladezeiten zu verkürzen.",
                    onShow: function () {
                        highlightElementByID("close_checker");
                        //extent the layer c ontrol with an id to show this element with the tour
                        $('.leaflet-control-layers').attr('id','leaflet-control-layers');
                    },
                    onNext: function () {
                        resetHighlightElementByID("close_checker");
                        rightView.close();
                        legende.resize();
                    }
                },
                {
                    element: "#leaflet-control-layers",
                    title: "Kartenebenen",
                    content: "Ändern Sie die Hintergrundkarte oder fügen Sie zusätzliche topographische Kartenelemente hinzu.",
                    placement: "left",
                    onShow: function(){
                        $('.leaflet-control-layers').addClass('leaflet-control-layers-expanded');
                    },
                    onNext: function(){
                        $.when($('.leaflet-control-layers').removeClass('leaflet-control-layers-expanded'))
                            .then(legende.open());
                    }
                },
                {
                    element: "#legende .kennblatt",
                    placement: "left",
                    title: "Kennblatt",
                    content: "Zeigt Quellen, Methodik und weiterführende Informationen zu dem jeweiligen Indikator an."
                },
                {
                    element: "#datenalter",
                    title: "Datenalter",
                    placement: "left",
                    content: "Nebenkarte mit Datenalter der einzelnen Gebietseinheiten gegenüber dem gewählten Zeitschnitts (nur für Indikatoren mit mittlerer Grundaktualität.)",
                    onShow: function () {
                        legende.getDOMObject().css("width", "300px");
                        legende.getShowButtonObject().css("right", "300px");
                        $('#dropdown_datenalter').show();
                        $('#histogramm_pic').css("margin-left", "10px");
                        //scroll down to view full viewport
                        legende.getDOMObject().animate({ scrollTop: $('#legende').prop("scrollHeight")}, 100);
                    },
                    onNext: function () {
                        $('#legende').css("width", "250px");
                        $('#legende_button').css("right", "250px");
                        $('#dropdown_datenalter').hide();
                        $('#histogramm_pic').css("margin-left", "0px");
                        $('#spatial_choice_checkbox_container')
                            .checkbox('check');
                        setTimeout(function(){
                            $('#vergleich_btn').click();
                        },1500);
                    }
                },
                {
                    element: '#vergleich_btn',
                    title: "Vergleichsmodus",
                    placement: "left",
                    content: "Im Rastermodus haben Sie die Möglichkeit, zwei Karten miteinander zu vergleichen",
                    onNext:function(){
                        raster_split.dialogObject.openDialog();
                        setTimeout(function() {
                            raster_split.dialogObject.getDropdownDOMObject().dropdown('set selected', 'F01RG');
                        },2000);
                    }
                },
                {
                    element: "#create_vergleichskarte_button",
                    title: "Fügen Sie die Karte hinzu",
                    placement: "left",
                    onNext:function(){
                        setTimeout(function() {
                            indikator_raster.init(null,null,"rechts",raster_split.dialogObject.getSettings());
                            setTimeout(function(){
                                raster_split.dialogObject.openDialog();
                            },2000);
                        },500);
                    }
                },
                {
                    element: "#close_vergleich .destroy",
                    title: "Entfernen Sie den Erweiterungsmodus wieder",
                    placement:"left",
                    onNext:function(){
                        $('#close_vergleich').find('.destroy').click();
                    }

                },
                {
                    element: "#feedback_a",
                    title: "Feedback",
                    placement: "left",
                    content: "Das war die kleine Tour durch die vielseitigen Möglichkeiten des IÖR-Monitors. Wir freuen über Ihr Feedback zu der Anwendung.",
                    onHide:function(){
                        $('#dropdown_grenzen_container').dropdown('clear');
                        let url = window.location.href.replace(window.location.search,'');
                        window.open(url,"_self");
                    }
                }
            ]});
    },
    start: function(){
        this.create();
        this.tour.init();
        toolbar.close();
        this.tour.start();
    }
};
