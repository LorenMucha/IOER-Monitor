const view_state = {
    state: "mw",
    test_system:false,
    unit:false,
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