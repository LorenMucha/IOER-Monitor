const farbschema = {
    farben: {
        grey: ['f0f0f0', '636363'],
        YlOrRd: ['ffeda0', 'f03b20'],
        YlGnBu: ['edf8b1', '2c7fb8'],
        PuRd: ['e7e1ef', 'dd1c77']
    },
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
    fill: function () {
        const object = this;
        let color_container =  object.getDOMObject().find('#color_schema'),
            keys_array = [],
            def = $.Deferred();
        function defCalls() {
            let requests = [];
            $.each(object.farben, function (key, value) {
                keys_array.push(key);
                requests.push(request_manager.getColorSchema(value));
            });
            $.when.apply($, requests).done(function () {
                def.resolve(arguments);
            });
            return def.promise();
        }

        defCalls().done(function (arr) {
            color_container.empty();
            let html = "";
            $.each(arr,function(key,value){
                let key_color = keys_array[key];
                let li = '';
                let width = 100/klassenanzahl.getSelection();
                $.each(value[0],function(k,v){
                    li +='<i class="color_i" style="background:'+v+';width:'+width+'%;"></i>'
                });
                html +='<div id="'+key_color+'" class="color-line">'+li+"</div>";
            });
            color_container.append(html);
        });
    },
    init: function () {
        const object = this;
        this.fill();
        this.controller.set();
    },
    reset:function(){
        this.removeParamter();
        this.getFarbwahlButtonDomObject()
            .empty()
            .append('Bitte Wählen..<span class="caret"></span>');
    },
    setColorChoice: function () {
        if (raeumliche_visualisierung.getRaeumlicheGliederung()==="gebiete") {
            if (typeof raumgliederung.getSelectedId() === 'undefined') {
                indikator_json.init();
            } else {
                indikator_json.init(raumgliederung.getSelectedId());
            }
        }
        else {
            indikator_raster.init();
        }
    },
    getColorActive: function () {
        return "#8CB91B";
    },
    getColorMain: function () {
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
        set:function(){
            let click_farb = 0;
            $(document).on('click','.color-line',function(){
                let content = $(this).html(),
                    id = $(this).attr("id"),
                    paramter = farbschema.getParamter();
                farbschema.getFarbwahlButtonDomObject()
                    .empty()
                    .append('<span id="color_remove" class="glyphicon glyphicon-remove"></span><div class="color-line">' + content + '</div>');
                //craete the new colored map
                if (typeof paramter !== 'undefined') {
                    farbschema.updateParamter(farbschema.farben[id].toString());
                } else {
                    farbschema.setParamter(farbschema.farben[id].toString());
                }
                farbschema.setColorChoice();
            });
            $(document).on('click','#color_remove',function(){
                farbschema.removeParamter();
                farbschema.getFarbwahlButtonDomObject()
                    .empty()
                    .append('Bitte Wählen..<span class="caret"></span>');
                farbschema.getDOMObject().find('#color_schema').show();
                if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'raster') {
                    indikator_raster.init();
                }
                else {
                    if (typeof raumgliederung.getSelectedId() === 'undefined') {
                        indikator_json.init();
                    } else {
                        indikator_json.init(raumgliederung.getSelectedId());
                    }
                }
            });
            //the color schema
            farbschema.getFarbwahlButtonDomObject()
                .unbind()
                .click(function () {
                    if(click_farb==0) {
                        farbschema.getDOMObject().find('#color_schema').show();
                        click_farb++;
                    }else{
                        farbschema.getDOMObject().find('#color_schema').hide();
                        click_farb = 0;
                    }

                });
        }
    }
};