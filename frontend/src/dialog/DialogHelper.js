//id of the input field
const id_input_ags = "search_ags";
class Dialoghelper{
    static getAGS_Input(){
        return $(`#${id_input_ags}`).data("id");
    }
    static getAGS_InputName(){
        return $(`#${id_input_ags}`).val();
    };
    static setSwal(callback){
        let chart_array = [],
            set_autocomplete = function () {
            let germany = {"id":"99","name":"Deutschland"};
                chart_array = indikator_json_group.getAGSArray();
                chart_array.push(germany);
                auto_complete.autocomplete(document.getElementById(id_input_ags), chart_array);
            },
            lan = language_manager.getLanguage();

            swal({
                title: `${dev_chart.text[lan].set_choice()}`,
                text: `<div class="form-group" style="display: unset !important;">
                            <input type="text" id="${id_input_ags}" class="form-control" tabindex="3" placeholder="Gebiet...">
                       </div>`,
                showCancelButton: true,
                cancelButtonText: `${dev_chart.text[lan].cancel}`,
                html: true
            }, function (isConfirm) {
                if (isConfirm) {
                    callback();
                }
            });
            //on enter also open the chart
            $(`#${id_input_ags}`)
                .unbind()
                .keypress(function(e){
                    var keycode = (e.keyCode ? e.keyCode : e.which);
                    if (keycode === '13') {
                        callback();
                    }
                });
            set_autocomplete()
    }
}