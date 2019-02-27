$(function(){
    $(window).on('resize', function() {
        if(!csv_export.state) {
            map._onResize();
            page_init = true;
            main_view.restoreView();
        }
    });
    $.fn.bootstrapBtn = $.fn.button.noConflict();
});
const config ={
  data:false,
  setData:function(data){
      this.data=data;
  },
  checkVersion:function(){
      let cache = parseFloat(localStorage.getItem("v")),
          version = parseFloat(this.data.version);
      if(cache){
          if(cache < version){
            alert_manager.alertUpdate(version);
          }
      }else{
            localStorage.setItem("v",version);
      }
  }
};