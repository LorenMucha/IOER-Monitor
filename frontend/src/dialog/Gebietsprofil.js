//klein da keine Klasse
const gebietsprofil={
    parameters:{
        endpoint_id: "statistics_content",
        ags:"",
        name:"",
        data:[]
    },


    open:function(){
        this.parameters.data=this.getData(this.parameters.ags);
        console.log("Data: "+this.parameters.data);
    },

    getData:function(ags){
        let downloadedData=[];
        $.when(RequestManager.getSpatialOverview(indikatorauswahl.getSelectedIndikator(),ags).done(function(data){

            downloadedData=data;
        }));

    }

};

