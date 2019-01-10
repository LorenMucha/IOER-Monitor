const toolbar = {
    getDOMObject:function(){
        $elem = $('#toolbar');
        return $elem;
    },
    state:false,
    open:function(){
        this.state=true;
        if(main_view.getMobileState()){
            this.getDOMObject().removeClass('toolbar_close');
        }else{
            this.getDOMObject().removeClass('toolbar_close',500);
            map_infos.resize();
        }
    },
    close:function(){
        this.state=false;
        if(main_view.getMobileState()){
            this.getDOMObject().addClass('toolbar_close');
        }else{
            this.getDOMObject().addClass('toolbar_close',500);
            map_infos.resize();
        }
    },
    init:function(){
        // the mapnavbar
        this.state=true;
        this.controller.set();
    },
    getHeight:function(){
        return this.getDOMObject().height();
    },
    isOpen:function(){
        return this.state;
    },
    controller:{
        set:function(){
            toolbar.getDOMObject()
                .find('.menu_m')
                .unbind()
                .click(function() {
                    if(toolbar.state){
                        toolbar.close();
                    }else{
                        toolbar.open();
                    }
                });
            setTimeout(function(){
                map_infos.resize();
            },1000);

            //open and close the dropdown's
            toolbar.getDOMObject()
                .find(".hh_sf")
                .unbind()
                .click(function(event) {
                    let ddm = $(this).find('i').data('ddm'),
                        ddm_container = $('#'+ddm);

                    if(ddm_container.hasClass('pinned')===false && !ddm_container.is(':visible')){
                        ddm_container.slideDown();
                        if($(this).attr("id")==="indikator_auswahl"){
                            indikatorauswahl.openMenu();
                        }
                    }else if(ddm_container.is(':visible')===true &&ddm_container.hasClass('pinned')===false){
                        ddm_container.slideUp();
                    }
                    $('.dropdown_menu').each(function(){
                        if($(this).is('#'+ddm)===false && $(this).hasClass('pinned')===false){
                            $(this).slideUp();
                        }
                    });
                    //set the height og the overflow content inside the menu bar
                    if(main_view.getHeight() <= 1000 && view_state.getViewState() ==='mw') {
                        let height = toolbar.getHeight() - $('#no_overflow').height() - 60;
                        $('#overflow_content').css("height",height+50);
                    }
                });

            //pin the element in the menu and unpin
            toolbar.getDOMObject()
                .find('.pin')
                .unbind()
                .click(function(event){
                    let drop_menu = $(this).find('i').data('ddm'),
                        icon =  $(this).find('i');
                    if(icon.hasClass('arrow_pinned')){
                        icon.removeClass('arrow_pinned');
                        $('#'+drop_menu).removeClass('pinned');
                    }else {
                        icon.addClass('arrow_pinned');
                        $('#' + drop_menu).addClass('pinned');
                    }
                });
        }
    }
};