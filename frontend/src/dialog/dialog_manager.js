const dialog_manager={
    content:null,
    instructions:{
        endpoint: "",
        html:"",
        title:"",
        open:false,
        close:false,
        modal:false
    },
    calculateWidth:function(){
        let width = main_view.getWidth();
        if($('.right_content').is(':visible') || width >=1280 && width<2000){
            return (width*0.5);
        }
        else if(width>2000){
            return 1200;
        }
        else{
            return (width-50);
        }
    },
    calculateHeight:function(){
        const manager = this;
        let height = main_view.getHeight();
        if($('.right_content').is(':visible') || height >= 800){
            return (height-210);
        }else{
            return (height-100);
        }
    },
    changeHeight:function(_height){
        this.content.dialog("option", "height", _height);
    },
    changeWidth:function(_width){
        this.content.dialog("option", "width", _width);
    },
    restoreDimension(){
        this.changeWidth(this.calculateWidth());
        this.changeHeight(this.calculateHeight());
    },
    create:function() {
        const manager = this;
        let body = $('body'),
            /*
           html needs to encodes or decoded for storing inside the instroduction object,
           use he from lib: https://github.com/mathiasbynens/he
            */
            html = he.decode(manager.instructions.html);
        body.append(html);
        manager.content=body.find(`#${manager.instructions.endpoint}`);
        manager.content.dialog({
            title: manager.instructions.title,
            hide: 'blind',
            show: 'blind',
            width: manager.calculateWidth(),
            height: manager.calculateHeight(),
            modal: manager.instructions.modal,
            open: function (ev, ui) {
                $(this)
                    .empty()
                    .append(html);
                //run the open callback if set
                if(manager.instructions.open)manager.instructions.open();
            },
            close:function(){
                manager.close();
            }
        });
    },
    close:function(){
        $('.jq_dialog').remove();
    }
};