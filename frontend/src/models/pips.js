const pips = {
    set:function(slider,labels){
        // Then you can give it pips and labels!
        slider.slider('pips', {
            first: 'label',
            last: 'label',
            rest: 'pip',
            labels: labels,
            prefix: "",
            suffix: ""
        });

        // And finally can add floaty numbers (if desired)
        slider.slider('float', {
            handle: true,
            pips: true,
            labels: labels,
            prefix: "",
            suffix: ""
        });
    }
};