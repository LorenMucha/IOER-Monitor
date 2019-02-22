const base_raumgliederung={
    getBaseRaumgliederungId:function(){
        if(raumgliederung.getSelectionId()){
            return raumgliederung.getSelectionId();
        }else{
            return raeumliche_analyseebene.getSelectionId();
        }
    },
    getBaseRaumgliederungText:function(single){
        let text = raeumliche_analyseebene.getSelectionText();
        if(raumgliederung.getSelectionId() && raumgliederung.getSelectionText()){
            text= raumgliederung.getSelectionText();
        }
        if(single){
            let sub = text,
                string_end = sub.slice(-2);

            sub = sub
                .substring(0,text.length-2)
                .replace("ä","a");

            string_end = string_end
                .replace("e","")
                .replace("n","")
                .replace("r","");
            text=sub+string_end;
        }
        return text;
    }
};