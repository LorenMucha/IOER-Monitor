const right_view = {
    getDOMObject: function(){
        $elem = $('.right_content');
        return $elem;
    },
    getCloseIconObject:function(){
        $elem= $('#table_close');
        return $elem;
    },
    open:function(){
        const view = this;
        let btn_group_map = $('#btn-group-map');
        //show only the table view, if the user set a indicator
        if(typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
            //set the mobile view
            if (view_state.getViewState() === "responsive") {
                if (!this.isVisible()) {
                    view.show();
                    left_view.hide();
                    view.getCloseIconObject().hide();
                    legende.close();
                    panner.setMapBackground();
                    btn_group_map.hide();
                } else {
                    view.hide();
                    left_view.show();
                    legende.getShowButtonObject().show();
                    panner.setTableBackground();
                    panner.show();
                    btn_group_map.show();
                }
            } else {
                $('#mapwrap').addClass('splitter_panel');
                view.show();
                panner.hide();
                view.getCloseIconObject().show();
                main_view.resizeSplitter(table.getWidth());
            }
        }else{
            alert_manager.alertNoIndicatorChosen();
        }

        //disable divider
        view.getCloseIconObject()
            .unbind()
            .click(function(){
                view.close();
            });
    },
    close:function(){
        this.hide();
        $('#mapwrap').removeClass('splitter_panel');
        panner.show();
        legende.resize();
        map.invalidateSize();
    },
    isVisible:function(){
        let state = true;
        if(this.getDOMObject().is(':hidden')){
            state = false;
        }
        return state;
    },
    hide:function(){
        this.getDOMObject().hide();
    },
    show:function(){
        this.getDOMObject().show();
    },
    getWidth:function(){
        return this.getDOMObject().width();
    }
};