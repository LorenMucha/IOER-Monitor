const language_manager={
    language:"de",
    language_data : null,
    paramter:"language",
    language_json: null,
    setLanguage:function(_language){
        this.language = _language;
    },
    getLanguage:function(){
      return this.language;
    },
    setElements(){
        console.log("set Language for",this.language);
        const manager = this;
        $.when($.ajax({
            url:"frontend/data/language.json",
            dataType:"json",
            cache:false,
            success:function(_data){
                manager.language_json=data;
                manager.language_data = _data;
                $.each(_data,function(key,value){
                    let id = key;
                    $.each(value,function(key_s,value_s){
                        let selector = `${value_s.type}${key_s}`;
                        //set specific selector
                        if(value_s.selector){
                            selector=`${value_s.type}${key_s} ${value_s.selector}`;
                        }
                        //set the callback if set
                        if(value_s.callback){
                            $.each(value_s.callback,function(key,val){
                                var tmpFunc = new Function(val);
                                tmpFunc();
                            });
                        }
                        if(value_s.attr){
                            $(`#${id}`).find(selector).first().attr(value_s.attr,value_s[manager.language])
                        }else{
                            //not for classes
                            if(value_s.type==="."){
                                $(`#${id}`).find(selector).text(value_s[manager.language]);
                            }else{
                                $(`#${id}`).find(selector).first().text(value_s[manager.language]);
                            }
                        }
                    });
                });
            }
        }))
    },
    getLanguageJson:function(){
        return this.language_json;
    }
};