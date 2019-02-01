const base_raumgliederung={
    getBaseRaumgliederungId:function(){
        if(raumgliederung.getSelectionId()){
            return raumgliederung.getSelectionId();
        }else{
            return raeumliche_analyseebene.getSelectionId();
        }
    },
    getBaseRaumgliederungText:function(){
        if(raumgliederung.getSelectionText()){
            return raumgliederung.getSelectionText();
        }else{
            return raeumliche_analyseebene.getSelectionText();
        }
    }
};