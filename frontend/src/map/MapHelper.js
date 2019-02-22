class MapHelper{
  static mapReset(){
      let url = window.location.href.replace(window.location.search,'');
      window.open(url,"_self");
  }
}