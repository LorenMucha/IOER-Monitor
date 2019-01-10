const map_reset={
    reset:function(){
        let url = window.location.href.replace(window.location.search,'');
        window.open(url,"_self");
    }
};