const klassengrenzen = {
    klassen: {},
    setKlassen: function(_klassen){this.klassen=_klassen;},
    getKlassen: function(){return this.klassen},
    getMax:function(){
        return Math.max.apply(Math, this.klassen.map(function (o) {
            return o.max;
        }));
    },
    getMin:function(){
        return Math.min.apply(Math, this.klassen.map(function (o) {
            return o.min;}));
    },
    getMinColor:function(){
        return this.klassen[0].color;
    },
    getMaxColor:function(){
        return this.klassen[(this.klassen.length-1)].color;
    },
    getColor:function(layer_value){
        let klassenJson = this.getKlassen(),
            obergrenze_max = this.getMax(),
            untergrenze_min = this.getMin();

        for (let i = 0; i < klassenJson.length; i++) {
            let obj = klassenJson[i],
                max = klassenJson.length-1,
                obergrenze = obj.max,
                untergrenze = obj.min,
                value_ind = (Math.round(layer_value * 100) / 100).toFixed(2);

            if (value_ind <= obergrenze && value_ind >= untergrenze) {
                return obj.color;
            }
            else if (value_ind < untergrenze_min > 0) {
                return obj.color;
            }
            else if (value_ind === 0) {
                return obj.color;
            }
            else if (value_ind > obergrenze_max) {
                return klassenJson[max].color;
            }
            else if (value_ind === obergrenze_max) {
                return obj.color;
            }
        }
    },
    toString:function(){
        return JSON.stringify(this.klassen);
    }
};