const webTour={
    tour: '',
    getStartButtonID:function(){
      return '#webtour';
    },
    init:function(){
        const object = this;
        $(document).on("click",object.getStartButtonID(),function(){
                $('.navbar-collapse').hide();
                object.create();
                right_view.close();
                object.tour.restart();
            });
    },
    create:function(){
        //Quelle und API: http://bootstraptour.com/api/
        //The script
        toolbar.close();
        this.tour = new Tour({
            //Callbacks
            onEnd:function(){
                let url = window.location.href.replace(window.location.search,'');
                window.open(url,"_self");
            },
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
                    content: "Suchen Sie nach passenden Indikatoren, Kategorien, Daten,Orten und vielen Schlagwörtern mehr.",
                    onShow:function(){
                        toolbar.open();
                        helper.highlightElementByID("search");
                    },
                    onNext: function(){
                        helper.resetHighlightElementByID("search");
                        helper.slideDownElementByID('drop_kat');
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
                    }
                },
                {
                    element:"#zeit_slider",
                    title:"Zeitslider",
                    content:"Verändern Sie den Zeitschnitt des Indikators",
                    onShow:function(){
                        helper.highlightElementByID(this.element.replace("#",""));

                    },
                    onNext:function(){
                        helper.resetHighlightElementByID(this.element.replace("#",""));
                        helper.slideUpElementByID('drop_kat');
                        helper.slideDownElementByID('dropdown_raumgl');
                    }
                },
                {
                    element: ".spatial_choice",
                    title:"Darstellungsmodus",
                    content: "Wählen Sie den gewünschten Darstellungsmodus der Indikatoren aus.",
                    onShow:function(){
                        helper.highlightElementByID(this.element.replace(".",""));

                    },
                    onNext:function(){
                        helper.resetHighlightElementByID(this.element.replace(".",""));
                    }
                },
                {
                    element: '#menu_raumgl',
                    title: "Räumliche Analyseebene",
                    content: "Gliederung Deutschlands in einzelne Raumeinheiten. (Deren Verfügbarkeit ist vom Indikator abhängig.)",
                    onShow:function(){
                        helper.highlightElementByID(this.element.replace("#",""));
                        raeumliche_analyseebene.setSectionId('bld');
                        indikator_json.init('bld');
                    },
                    onNext: function(){
                        helper.resetHighlightElementByID(this.element.replace("#",""))
                    }
                },
                {
                    element: "#dropdown_grenzen_container",
                    title: "Gebietsauswahl",
                    content: "Suchen und Wählen Sie bestimmte Gebiete, auch eine Mehrfachauswahl ist möglich.",
                    onShow:function(){
                        helper.highlightElementByID(this.element.replace("#",""));
                        $('#dropdown_grenzen_container').dropdown('set selected','12');
                    },
                    onNext: function(){
                        helper.resetHighlightElementByID(this.element.replace("#",""))
                    }
                },
                {
                    element: "#user_choice",
                    title: "Raumgliederung",
                    content:"Weitere räumliche Unterteilung der getroffenen Gebietsauswahl.",
                    onShow: function(){
                        helper.highlightElementByID('menu_raumgl_fein');
                        indikator_json.init('krs');
                        setTimeout(function(){raumgliederung.setSelectionId('krs')},2000);
                    },
                    onNext: function () {
                        helper.resetHighlightElementByID(this.element.replace("#",""))
                        helper.slideUpElementByID('dropdown_raumgl');
                    }
                },
                {
                    element: "#kartengestaltung",
                    title: "Kartengestaltung",
                    content: "Passen Sie die Karte nach Ihren Vorstellungen an.",
                    onShow: function () {
                        helper.slideDownElementByID('dropdown_layer');
                    },
                    onNext: function () {
                        helper.slideUpElementByID('dropdown_layer');
                    }
                },
                //Tools
                {
                    element: "#hh_sf_dropdown_werkzeug",
                    title: "Werkzeuge",
                    content: "Tools zum Interagieren mit der Kartenansicht",
                    onShow: function () {
                        helper.slideDownElementByID('dropdown_werkzeug');
                    },
                    onNext: function () {
                        helper.slideUpElementByID('dropdown_werkzeug');
                    }
                },
                //analyse
                {
                    element:"#hh_sf_analyse",
                    title:"Analayse",
                    content:"Visualisierungen um Indikatoranalysen zu unterstützen",
                    onShow: function () {
                        helper.slideDownElementByID('dropdown_analyse');
                    },
                    onNext: function () {
                        helper.slideUpElementByID('dropdown_analyse');
                    }
                },
                {
                    element: "#hh_sf_dropdown_ogc",
                    title: "Einbinden und Speichern",
                    content: "Binden Sie die Indikatorkarten als INSPIRE-konforme Dienste in Ihr GIS-System ein oder teilen bzw. speichern Sie die aktuell erstellte Karte.",
                    onShow: function () {
                        helper.slideDownElementByID('dropdown_ogc');
                    },
                    onNext:function(){
                        helper.slideUpElementByID('dropdown_ogc');
                    }
                },
                {
                    element: "#zeit_slider",
                    title: "Time-Slider",
                    content: "Stellen Sie den gewünschten Zeitschnitt anhand des Sliders ein.",
                    placement: "auto",
                    onShow: function () {

                    },
                    onNext:function(){

                    }
                },
                {
                    element: "#panRight",
                    title: "Tabellenansicht",
                    placement: "left",
                    content: "Klicken des seitlichen Buttons bewirkt Ein- oder Ausfahren der Tabelle.",
                    onNext:function(){
                        right_view.open();
                    }
                },
                {
                    element: "#btn_table",
                    title: "Tabellenoptionen",
                    placement: "left",
                    content: "Erweitern Sie die Tabelle individuell um zusätzliche Daten- und Vergleichsspalten.",
                    onNext:function(){
                        expand_panel.fill();
                        $('#tabelle_erweitern').show("slow");
                    }
                },
                {
                    element: "#btn_table_load_expand",
                    title:"Tabelle erweitern",
                    content: "Bestätigen Sie Ihre Auswahl durch Aktualisieren der Tabelle, oder setzen Sie die Auswahl zurück",
                    placement: "left",
                    onNext:function(){
                        expand_panel.close();
                    }
                },
                //checkboxes inside Table
                {
                    element:"#checkbox_12060",
                    title:"Markierung",
                    ppacement:"left",
                    content:"Markieren Sie Gebiete in der Tabelle",
                    onShown: function(){
                        helper.highlightElementByID(this.element.replace("#",""));
                    },
                    onNext: function () {
                        helper.highlightElementByID(this.element.replace("#",""));
                    }
                },
                {
                    element:"#indikatoren_gebietsprofil12060",
                    title: "Area_info",

                    content: "Werteübersicht dieser Gebietseinheit für alle Indikatoren (mit Vergleich zu übergeordneten Raumeinheiten und mittleren Grundaktualitäten)",
                    placement: "left",
                    onShown: function(){
                        helper.highlightElementByID(this.element.replace("#",""));
                    },
                    onNext: function () {
                        helper.highlightElementByID(this.element.replace("#",""));
                    }
                },
                {
                    element: "#diagramm_ags12060",
                    title: "Erweiterte Statistik",
                    placement: "left",
                    content: "Lassen Sie sich zusätzliche statistische Kenngrößen zu der jeweiligen Gebietseinheit anzeigen.",
                    onShown: function(){
                        helper.highlightElementByID(this.element.replace("#",""));
                    },
                    onNext: function () {
                        helper.resetHighlightElementByID(this.element.replace("#",""))
                    }
                },
                {
                    element: "#indikatoren_diagramm_ags12060",
                    title: "Entwicklungsdiagramm",
                    placement: "left",
                    content: "Visualisierung der Indikatorwertentwicklung anhand eines Graphen über die Zeit",
                    onShown: function(){
                        helper.highlightElementByID(this.element.replace("#",""));
                    },
                    onNext: function () {
                        helper.resetHighlightElementByID(this.element.replace("#",""))
                    }
                },
                {
                    element: "#close_checker",
                    placement: "left",
                    title: "Tabellenansicht verbergen",
                    content: "Schließen Sie die Tabelle um die Karte großflächig zu nutzen und Ladezeiten zu verkürzen.",
                    onShow: function () {
                        helper.highlightElementByID("close_checker");
                        //extent the layer c ontrol with an id to show this element with the tour
                        $('.leaflet-control-layers').attr('id','leaflet-control-layers');
                    },
                    onNext: function () {
                        helper.highlightElementByID("close_checker");
                        right_view.close();
                        legende.open();
                        legende.resize();
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
                        $('#dropdown_datenalter').show();
                        $('#histogramm_pic').css("margin-left", "10px");
                        //scroll down to view full viewport
                        legende.getDOMObject().animate({ scrollTop: $('#legende').prop("scrollHeight")}, 100);
                    },
                    onNext: function () {
                        $('#legende').css("width", "250px");
                        $('#dropdown_datenalter').hide();
                        $('#histogramm_pic').css("margin-left", "0px");
                        $('#help').click();
                    }
                },
                {
                    element: "#feedback_a",
                    title: "Feedback",
                    placement: "left",
                    content: "Das war die kleine Tour durch die vielseitigen Möglichkeiten des IÖR-Monitors. Wir freuen über Ihr Feedback zu der Anwendung."
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
