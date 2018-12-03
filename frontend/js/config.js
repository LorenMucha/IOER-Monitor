const config ={
  data:false,
  setData:function(data){
      this.data=data;
  },
  checkVersion:function(){
      let cache = parseFloat(localStorage.getItem("v")),
          version = parseFloat(this.data.version);
      console.log("Version-Cache: "+cache);
      console.log("Version-Config: "+this.data.version);
      if(cache){
          if(cache < version){
            alertUpdate(version);
          }
      }else{
            localStorage.setItem("v",version);
      }
  }
};