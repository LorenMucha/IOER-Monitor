//no indicator chosen
function alertOldBrowser(){
    $('#Modal').hide();
    swal(
        "Alte Version des Internet Explorers",
        "Sie verwenden eine veraltete Version des Internet Explorers, diese wird nicht unterstützt.",
        "error"
    );

}
function alertNoIndicatorChosen(){
    setTimeout(function(){
        swal(
            "Kein Indikator gewählt",
            "Bitte wählen Sie erst einen Indikator aus",
            "info"
        )
    },500);
}
//error messages
function alertError(){
    setTimeout(function(){
        swal(
            "Es ist ein Problem aufgetreten",
            "Bitte versuchen Sie es später nochmal oder kontaktieren Sie uns über das Feedback Formular.",
            "error"
        );
        progressbar.remove();
    },500);
}
//info messages
function alertOneTimeShift(){
    $.when(
    setTimeout(function(){
        swal({
            title: "Der Indikator steht nur für den Zeitschnitt " + zeit_slider.getTimeSet() + " zur Verfügung.",
            text: "Aus diesem Grund entfällt der Zeitslider.",
            type: "info"
        });
    },500));
}
function alertRelief(){
    setTimeout(function(){
        swal(
            "Der Indikator ist unabhängig der Zeitschnitte.",
            "Aus diesem Grund entfällt der Zeitslider.",
            "info"
        );
    },500);
}
function alertNotInTimeShift(){
    setTimeout(function () {
        swal(
            'Der Indikator ist im gewählten Zeitschnitt nicht vorhanden',
            'Für den Indikator ' + $('#Indikator option:selected').text() + ' wurde das Jahr auf ' + Math.max.apply(Math, indikatorauswahl.getFilteredPossibleYears()) + ' angepasst',
            'success'
        );
    }, 500);
}
function alertNotinSpatialRange(raumglTXT,selection){
    $.when(raumgliederung.removeParameter())
        .then(progressbar.remove())
        .then(setTimeout(function () {
                swal({
                    title: 'Der Indikator ist in der gewählten Raumgliederung nicht vorhanden.',
                    text: 'Es wäre möglich den Indikator auf die Raumgliederung ' + raumglTXT + ' anzupassen',
                    type: 'info',
                    cancelButtonText: "Abbrechen",
                    showCancelButton: true,
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            $.when(gebietsauswahl.removeParamter())
                                .then(raeumliche_analyseebene.updateParamter(selection))
                                .then(gebietsauswahl.clear())
                                .then(raumgliederung.hide())
                                .then(indikatorJSON.init(selection));
                        }else{
                            //TODO
                            //indikatorauswahl.setIndicator(indikatorauswahl.getPreviousIndikator());
                        }
                    }
                );
            }, 500));
}
function alertNotAsRaster(){
    $.when(setTimeout(function(){
                swal({
                    title: "Der Indikator ist nicht in der Räumlichen Gliederung verfügbar",
                    text: "Möchten Sie sich den Indikator trotzdem visualisieren ? ",
                    type: "warning",
                    cancelButtonText: "Abbrechen",
                    showCancelButton: true,
                },
                function(isConfirm){
                    if (isConfirm) {
                        if(raeumliche_visualisierung.getRaeumlicheGliederung()==='raster'){
                            $('#spatial_choice_checkbox_container').checkbox('uncheck');
                        }else{
                            $('#spatial_choice_checkbox_container').checkbox('check');
                        }
                    }
                }
                );
            },500));
}
function alertServerlast(choice){
    setTimeout(function(){
        swal({
            title: "Erhöhte Belastung",
            text: "Bei der jetzigen Auswahl wird eine erhöhte Rechenlast an den Browser und unserem Server gestellt, deshalb kann es zu Verzögerungen bei den Interaktionen kommen. " +
            "Sie können durch eine Verfeinerung ihrer Auswahl, wie beispielsweise die Wahl eines Bundeslandes den Prozess beschleunigen.",
            type: "warning",
            cancelButtonText: "Abbrechen",
            showCancelButton: true,
        },
            function (isConfirm) {
                if (isConfirm) {
                    $.when(raeumliche_analyseebene.updateParamter(choice))
                        .then($('#dropdown_datenalter').hide())
                        .then(indikatorJSON.init())
                        .then(rightView.close());
                }else{
                    $('#'+raeumliche_analyseebene.getSelectionId()+"_raumgl").prop("selected",true);
                }
            }

        )
    },500);
}