const view_state = {
    state: "mw",
    test_system:false,
    unit:false,
    getUnitTestState:function(){
        if(urlparamter.getUrlParameter('test')){
            this.unit=true;
        }
        return this.unit;
    },
    setUnitTestState:function(_value){
        this.unit=_value;
    },
    setProductionState:function(_state){
        this.test_system = _state;
    },
    getProductionState:function(){
        let path = window.location.pathname;
        if(path.indexOf("monitor_test") !== -1){
            this.test_system = true;
        }
        return this.test_system;
    },
    setViewState:function(_state){
        this.state = _state;
    },
    getViewState:function(){
        return this.state;
    }
};