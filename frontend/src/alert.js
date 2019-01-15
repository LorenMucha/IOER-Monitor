//leave function
function alertLeafveFunction(){
    swal({
        title: "Verlassen Sie die Funktion mit ESC",
        timer: 1000,
        showConfirmButton: false
    });
}
//no indicator chosen
function alertUpdate(version){
    swal({
        title: "Die Anwendung wurde aktualisiert",
        text: '',
        type: "info",
        html: true
    },
        function(isConfirm){
            if (isConfirm) {
                localStorage.setItem("v",version);
                location.reload(true);
            }
        }
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
                                .then(indikator_json.init(selection));
                        }
                    }
                );
            }, 500));
}
function alertNotAsRaster(){
    $.when(setTimeout(function(){
                swal({
                    title: "Der Indikator ist nicht in der Räumlichen Gliederung verfügbar",
                    type: "warning",
                    cancelButtonText: "Abbrechen",
                    showCancelButton: false,
                },
                function(){
                    raeumliche_visualisierung.getDOMObject().checkbox('uncheck');
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
                        .then(indikator_json.init())
                        .then(right_view.close());
                }else{
                    $('#'+raeumliche_analyseebene.getSelectionId()+"_raumgl").prop("selected",true);
                }
            }

        )
    },500);
}