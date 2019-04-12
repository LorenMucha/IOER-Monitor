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
    setInstruction:function(_instructions){
      this.instructions=_instructions;
    },
    calculateWidth:function(){
        let width = main_view.getWidth();
        if(width >=1280 && width<2000){
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
            html = he.decode(manager.instructions.html),
            width=function(){
              let width = manager.instructions.width;
              if(width) {return width;}
              else{return manager.calculateWidth();}
            },
            height=function(){
                let height = manager.instructions.height;
                if(height) {return height;}
                else{return manager.calculateHeight();}
            },
            title=function(){
                let title =  manager.instructions.title;
                return title.replace("- ","");
            };
        //close existing dialog
        manager.close();
        //create the dialog
        body.append(html);
        manager.content=body.find(`#${manager.instructions.endpoint}`);
        manager.content.dialog({
            title: title(),
            hide: 'blind',
            show: 'blind',
            width:width(),
            height: height(),
            modal: manager.instructions.modal,
            resizable: false,
            open: function (ev, ui) {
                $(this)
                    .empty()
                    .append(html);
                //run the open callback if set
                if(manager.instructions.open)manager.instructions.open();
            },
            close:function(){
                manager.close();
                if(manager.instructions.close)manager.instructions.close();
            }
        });
    },
    getContent:function(){
      return this.content;
    },
    close:function(){
        $('.jq_dialog').remove();
    }
};