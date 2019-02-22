const farbschema = {
    paramter: 'farbschema',
    getDOMObject: function () {
        $elem = $('#farbwahl');
        return $elem;
    },
    getFarbwahlButtonDomObject: function () {
        $elem = $("#farbwahl_btn");
        return $elem;
    },
    getParamter: function () {
        return urlparamter.getUrlParameter(this.paramter);
    },
    setParamter: function (_value) {
        urlparamter.setUrlParameter(this.paramter, _value)
    },
    updateParamter: function (_value) {
        urlparamter.updateURLParameter(this.paramter, _value);
    },
    removeParamter: function () {
        urlparamter.removeUrlParameter(this.paramter);
    },
    init: function () {
        if(!this.getParamter()) {
            this.controller.set();
        }
    },
    reset:function(){
        this.removeParamter();
        this.getFarbwahlButtonDomObject()
            .empty()
            .append('Bitte Wählen..<span class="caret"></span>');
    },
    setColorChoice: function () {
        if (raeumliche_visualisierung.getRaeumlicheGliederung()==="gebiete") {
            if (typeof raumgliederung.getSelectionId() === 'undefined') {
                indikator_json.init();
            } else {
                indikator_json.init(raumgliederung.getSelectionId());
            }
        }
        else {
            indikator_raster.init();
        }
    },
    getColorHexActive: function () {
        return "#8CB91B";
    },
    getColorHexMain: function () {
        return '#4E60AA';
    },
    getHexMin: function () {
        let paramter = this.getParamter(),
            return_value = '';
        if (typeof paramter !== 'undefined') {
            let value = paramter.split(',');
            return_value = value[0];
        }
        return return_value;
    },
    getHexMax: function () {
        let paramter = this.getParamter(),
            return_value = '';
        if (typeof paramter !== 'undefined') {
            let value = paramter.split(',');
            return_value = value[1];
        }
        return return_value;
    },
    controller: {
        set:function() {
            const object = this;
            let colors = indikatorauswahl.getIndikatorInfo(indikatorauswahl.getSelectedIndikator(),"colors"),
                min_color=colors.min,
                max_color=colors.max,
                trigger_min = $("#triggerSet_min"),
                trigger_max = $("#triggerSet_max"),
                picker_min = $("#color_min_user"),
                picker_max = $("#color_max_user"),
                btn_create = $("#create_color_schema"),
                btn_remove=$("#clear_farbwahl");

            //documentation: https://bgrins.github.io/spectrum/
            picker_min.spectrum({
                color:min_color,
                showInput: true,
                preferredFormat: "hex",
                change: function(color) {
                    trigger_min.val(color);
                }
            });
            picker_max.spectrum({
                color:max_color,
                showInput: true,
                preferredFormat: "hex",
                change: function(color) {
                    console.log("on change");
                    trigger_max.val(color);
                }
            });
            //add the trigger
            trigger_min.on("input",function(){
                try {
                    picker_min.spectrum("set", $(this).val());
                }catch(err){}
            });
            trigger_max.on("input",function(){
                try {
                    picker_max.spectrum("set", $(this).val());
                }catch(err){}
            });

            btn_create
                .unbind()
                .on("click",function(){
                let min_c = picker_min.spectrum("get").toString(),
                    max_c = picker_max.spectrum("get").toString(),
                    paramter_set = `${min_c.replace("#","")},${max_c.replace("#","")}`,
                    paramter = farbschema.getParamter();
                if (typeof paramter !== 'undefined'|| paramter) {
                    farbschema.updateParamter(paramter_set);
                } else {
                    farbschema.setParamter(paramter_set);
                }
                farbschema.setColorChoice();
            });

            btn_remove
                .unbind()
                .on("click",function(){
                farbschema.removeParamter();
                if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
                    indikator_raster.init();
                }
                else {
                    if (typeof raumgliederung.getSelectionId() === 'undefined') {
                        console.log("undefined");
                        indikator_json.init();
                    } else {
                        console.log("defined");
                        indikator_json.init(raumgliederung.getSelectionId());
                    }
                }
                picker_min.spectrum("set",min_color);
                picker_max.spectrum("set",max_color);
                trigger_min.val("#");
                trigger_max.val("#");
            });
        }
    }
};