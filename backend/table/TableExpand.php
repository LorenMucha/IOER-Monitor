<?php

include_once "../database/DBFactory.php";

class TableExpand{
    public function __construct($indicator_id,$time,$raumgliederung) {
        $this->id = $indicator_id;
        $this->time=$time;
        $this->raumgliederung = $raumgliederung;
    }
    public function getExpandValues($expand_values, $ags_array_user){
        /*
         * expand_values:
         * {"id": indicatorid,"text":name of the indicator,"time":required time,"einheit": unit->if false it would be generated}
         */
        $time_set = $expand_values['time'];
        $id_org = $expand_values["id"];
        //explode the id
        $id_splitted = explode("|",$id_org);
        $ind_set  = $id_splitted[0];
        //temp array
        $ags_array = array();
        try {
            //store the passed ags JSON in an array
            foreach ($ags_array_user as $item) {
                array_push($ags_array, $item['ags']);
            }

            $length_ags = strlen($ags_array[0]);

             //get all the bld values in an array
            $bldArray = DBFactory::getPostgreSQLManager()->query("SELECT gen, ags FROM vg250_bld_2016_grob");

            //set the ABS IND
            if($ind_set==='ABS'){
                $ind_set = substr($this->id,0,3).'AG';
            }

            //set the brd values
            if($ind_set==='brd'){
                $ind_set = $this->id;
                $ags_array = array();
                array_push($ags_array,'99');
                $length_ags =2;
            }
            //set the bld values
            if($ind_set==='bld'){
                $ind_set = $this->id;
                $ags_bld = array();
                foreach($ags_array as $value){array_push($ags_bld,substr($value,0,2));}
                $ags_array = $ags_bld;
                $length_ags =2;
            }

            //get the object
            $sql = "SELECT i.INDIKATORWERT AS value, i.ID_INDIKATOR as ind, z.EINHEIT as einheit,i.FEHLERCODE as fc, i.HINWEISCODE as hc, i.AGS as ags, z.RUNDUNG_NACHKOMMASTELLEN as rundung,
                              COALESCE((SELECT x.INDIKATORWERT FROM m_indikatorwerte_".$time_set." x WHERE x.ID_INDIKATOR = 'Z00AG' AND x.ags=i.AGS AND x.INDIKATORWERT <=".$time_set."),0) as grundakt_year,
                                COALESCE((SELECT y.INDIKATORWERT FROM m_indikatorwerte_".$time_set." y WHERE y.ID_INDIKATOR = 'Z01AG' and y.AGS =i.AGS AND y.INDIKATORWERT <= ".$time_set."),0) as grundakt_month
                                        FROM m_indikatorwerte_" . $time_set . " i, m_indikatoren z
                                        Where i.ID_INDIKATOR =  '" . $ind_set . "'
                                        And z.ID_INDIKATOR = i.ID_INDIKATOR
                                        And LENGTH(i.AGS) = " . $length_ags . "
                                        Group by i.AGS";

            $indicator_array = DBFactory::getMySQLManager()->query($sql);
            $indikator_grundaktualitaet = DBFactory::getMySQLTask()->getGrundaktState($this->id);
            $einheit =$indicator_array[0]->einheit;

            # get the FC Codes
            $fc_array = Errors::get_instance()->getCodes();
            //the result JSON
            $JSON = '{"id":"' . $id_org . '","time":"' . $time_set . '","einheit":"' . $einheit . '","count":"'. $expand_values['count'].'","values":{';
            foreach ($ags_array as $row_ags) {
                foreach ($indicator_array as $row_mysql) {
                    if ($row_ags === $row_mysql->ags) {
                        $valueInd = $row_mysql->value;
                        $rundung = $row_mysql->rundung;
                        $value_comma = number_format(round($valueInd, $rundung), $rundung, ',', '');
                        $fc_id = $row_mysql->fc;
                        $note_id  = $row_mysql->hc;
                        $ags = $row_mysql->ags;

                        //get the grundakt
                        if ($indikator_grundaktualitaet == 1) {
                            $grundakt = 0;
                        } else {
                            $grundakt = $row_mysql->grundakt_year."/".$row_mysql->grundakt_month;
                        }

                        //get the hc text
                        if (!empty($note_id)) {
                            $text_hc = NOTES::get_instance()->getNoteText($note_id) . "||" . $note_id;
                        } else {
                            $text_hc = "0";
                        }

                        $fc = Errors::get_instance()->getCodeValues(intval($fc_id));
                        if ($fc != 0) {
                            $fc = $fc_id . "||" . $fc[0]["color"] . "||" . $fc[0]["name"] . "||" . $fc[0]["description"];
                        }
                        //pass the names of the 'bundeslaender
                        $bld = '';
                        if($this->raumgliederung !== "bld"){
                            $ags_bld = substr($ags,0,2);
                            $bld = '';
                            foreach($bldArray as $value){if($ags_bld===$value->ags){$bld=$value->gen;}}
                            $bld = '"bld":"'.$bld.'",';
                        }

                        $JSON .= '"' . $ags . '":{'.$bld.'"value":"' . $valueInd . '","value_round":"' . $value_comma . '","fc":"' . $fc . '","hc":"' . $text_hc . '","grundakt":"'.$grundakt.'"},';
                    }
                }
            }
            $JSON = substr($JSON, 0, -1);
            $JSON .= "}}";
            return json_decode($JSON,true);
        }catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
    }
}