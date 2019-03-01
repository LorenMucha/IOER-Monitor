const filter_panel = {
    getContainer:function(){
        $elem = $('#filter_div');
        return $elem;
    },
    getFilterCheckBoxObject:function(){
        $elem = $('.filter_checkbox');
        return $elem;
    },
    getOpenButtonObject:function(){
        $elem = $('#filter_table');
        return $elem;
    },
    getCloseIconObject:function(){
        $elem = $('#panel_close_filter');
        return $elem;
    },
    init:function(){
        this.create();
        this.fill();
        this.controller.set();

    },
    create:function(){
       $('#filter_div').html(`
        <div id="panel_close_filter" class="close_table">
            <span title="Tabelle schließen" class="glyphicon glyphicon-remove checker float-right"></span>
            </div>
            <div class="title_filter_table">Tabelle filtern</div>
            <hr class="hr"/>
        <div class="ui form" id="filter_form"></div>
        `);
    },
    fill:function(){
        let not_showing=["ror","lks","kfs","g50","stt"],
            raumgl = gebietsauswahl.getSelectionAsString();

        if(raumgliederung.getSelectionId()){
            raumgl = raumgliederung.getSelectionId();
        }
        if($.inArray(raumgl,not_showing)!==-1){
            helper.disableElement('#filter_table',"Keine möglichen Filteroptionen");
        }else{
            helper.enableElement('#filter_table',"Tabelle filtern");
        }
        //fill the filter div
        let form = $('#filter_form');
        let options = [];
        table.getTableBodyObject().find('.td_name').each(function(){
            let des = $(this).data('des');
            if($.inArray(des,options)===-1 && des !==''){
                options.push(des);
            }
        });
        form.empty();
        $.each(options,function(key,value){
            $('#filter_form').append('<div class="field">' +
                '                            <div class="ui checkbox checkbox filter_checkbox">' +
                '                                <input type="checkbox" data-value="' + value + '">' +
                '                                <label>' + value + '</label>' +
                '                            </div>' +
                '                        </div>');
            if($.inArray(value,table.excludedAreas)===-1) {
                $('#filter_form').find('input').prop("checked",true);
            }
        });

    },
    removeDes:function(_des){
        table.getTableBodyObject().find('.td_name').each(function() {
            let des = $(this).data('des');
            if(_des===des){
                $(this).closest('tr').css("display","none");
            }
        });
    },
    showDes:function(_des){
        table.getTableBodyObject().find('.td_name').each(function() {
            let des = $(this).data('des');
            if(_des===des){
                $(this).closest('tr').css("display","");
            }
        });
    },
    show:function(){
        this.getContainer().show("slow",function() {});
    },
    close:function(){
        this.getContainer().hide("slow",function() {});
    },
    controller:{
        set:function(){
            filter_panel.getFilterCheckBoxObject().checkbox({
                onChecked:function(){
                    filter_panel.showDes($(this).data('value'));
                    setTimeout(function(){TableHelper.setRang();},500);
                    filter_panel.close();
                },
                onUnchecked: function() {
                    filter_panel.removeDes($(this).data('value'));
                    setTimeout(function(){TableHelper.setRang();},500);
                    filter_panel.close();
                }
            });
            //bin the on click events
            filter_panel.getOpenButtonObject().unbind().click(function(){
                filter_panel.show();
            });
            filter_panel.getCloseIconObject().unbind().click(function(){
                filter_panel.close();
            });
        }
    }
};