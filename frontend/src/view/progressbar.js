const progressbar ={
    active: false,
    abort:true,
    getContainer:function(){return $('#progress_div');},
    getTextContainer:function(){return $('#progress_header');},
    init:function(){
        const object = this;
        if(this.active===false) {
            let abort=function(){
              if (object.abort){
                  return `<button type="button" class="btn btn-primary" id="abort_btn">Abbrechen</button>`;
              }
            };
            $('body').append(`<div id="progress_div"><h2 id="progress_header"></h2><div class="progress"></div><hr/>${abort()}</div>`);
            this.getContainer().show();
            modal_layout.init();
            this.active = true;
        }
        $(document).on("click","#abort_btn",function(){
            console.log("click");
            RequestManager.cancel();
            window.stop();
            object.remove();
        });
    },
    remove:function(callback){
        modal_layout.remove();
        this.active = false;
        this.getContainer().remove();
        if(callback)callback();
    },
    setHeaderText:function(html_string){
        this.getTextContainer()
            .empty()
            .text(html_string)
    },
    isVisible:function(){
        return this.getContainer().is(":visible");
    }
};