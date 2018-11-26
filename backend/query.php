<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
require("database/MY_SQL_TASKREPOSITORY.php");
require("HELPER.php");
require('INDICATOR_JSON.php');
require('CLASSIFY.php');
require_once('CACHE_MANAGER.php');
$q =  $_GET["values"];
$json_obj = json_decode($q, true);
$modus = $json_obj['format']['id'];
$indicator = $json_obj['ind']['id'];
$year =$json_obj['ind']['time'];
$raumgliederung =$json_obj['ind']['raumgliederung'];
$klassifizierung = $json_obj['ind']['klassifizierung'];
$klassenanzahl = $json_obj['ind']['klassenzahl'];
$colors =$json_obj['ind']['colors'];
$query = $json_obj['query'];

try{
    //get the JSON
    if($query==='getJSON'){
        $ags_user = trim($json_obj['ind']['ags_array']);
        $ags_array = array();
        if(strlen($ags_user)>0){
            $ags_array = explode(",",$ags_user);
        }
        //check if the json exist in the database
        $cache_manager = new CACHE_MANAGER($indicator,$year,$raumgliederung,$ags_array,$klassifizierung);
        try{
            if (!$cache_manager->check_cached() or $colors) {
                $indicator_json = new INDICATOR_JSON($indicator,$year,$raumgliederung,$ags_array);
                $geometry_values = $indicator_json->createJSON();
                $class_json = new CLASSIFY($geometry_values,$klassenanzahl,$colors,$indicator,$klassifizierung);
                $json = json_encode(array_merge($geometry_values,array("classes"=>$class_json->classify())));
                //save the cache but not avaliable user colors
                if(!$colors) {
                    $cache_manager->insert($json);
                }
                echo $json;
            }else{
                echo $cache_manager->get_cached();
            }
        }catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
    }
    //get all possible Indicators
    else if($query==='getAllIndicators'){
        $json = '{';
        $kategories = MY_SQL_TASKREPOSITORY::get_instance()->getAllIndicatorsGebiete();
        if($modus=='raster') {
            $kategories = MY_SQL_TASKREPOSITORY::get_instance()->getAllIndicatorsRaster();
        }

        foreach($kategories as $row){

            $erg_indikator = MY_SQL_TASKREPOSITORY::get_instance()->getAllIndicatorsByCategoryGebiete($row->ID_THEMA_KAT,$modus);

            //only if indicators are avaliabke
            if (count($erg_indikator) != 0) {

                $json .= '"' . $row->ID_THEMA_KAT . '":{"cat_name":"' . $row->THEMA_KAT_NAME . '","cat_name_en":"'.$row->THEMA_KAT_NAME_EN.'","indicators":{';

                foreach($erg_indikator as $row_ind){
                    $grundakt_state = "verfügbar";
                    if (MY_SQL_TASKREPOSITORY::get_instance()->getGrundaktState($row_ind->ID_INDIKATOR) == 1) {
                        $grundakt_state = "nicht verfügbar";
                    }
                    $significant = 'false';
                    if (intval($row_ind->MARKIERUNG) == 1) {
                        $significant = 'true';
                    }

                    //get all possible times
                    $time_string = '';
                    $times = MY_SQL_TASKREPOSITORY::get_instance()->getIndicatorPossibleTimeArray($row_ind->ID_INDIKATOR,$modus,false);
                    foreach($times as $value){$time_string .= $value["time"].",";};
                    $time_string = substr($time_string,0,-1);
                    //extend the json
                    $json .= '"' . $row_ind->ID_INDIKATOR . '":{"ind_name":"' . str_replace('"', "'", $row_ind->INDIKATOR_NAME) .
                        '","ind_name_en":"' . str_replace('"', "'", $row_ind->INDIKATOR_NAME_EN) .
                        '","ind_name_short":"' . str_replace('"', "'", $row_ind->INDIKATOR_NAME_KURZ) .
                        '","basic_actuality_state":"' . $grundakt_state .
                        '","significant":"' . $significant .
                        '","unit":"' . $row_ind->EINHEIT .
                        '","interpretation":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->BEDEUTUNG_INTERPRETATION))) .
                        '","interpretation_en":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->BEDEUTUNG_INTERPRETATION_EN))) .
                        '","methodik":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->METHODIK))) .
                        '","methodology":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->METHODIK_EN))) .
                        '","datengrundlage":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_1))) .
                        " ".
                        trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_2))).
                        '","data_foundation":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_1_EN))) .
                        " ".
                        trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_2_EN))).
                        '","times":"' . $time_string . '"},';
                }
                $json = substr($json, 0, -1);
                $json .= '}},';
            }
        }
        $json = substr($json, 0, -1);
        $json .="}";
        header('Content-type: application/json; charset=utf-8');
        echo HELPER::get_instance()->escapeJsonString($json);
    }
    //get all possible years
    else if($query=='years'){
        $jahre = array();
        $years = MY_SQL_TASKREPOSITORY::get_instance()->getIndicatorPossibleTimeArray($indicator,$modus);
        foreach ($years as $x){
                array_push($jahre,intval($x["time"]));
        }
        echo json_encode($jahre);
    }
    //check avability
    else if($query=="avability"){
        $array = array();
            array_push($array, array(
                "ind" => $indicator,
                "avability" => MY_SQL_TASKREPOSITORY::get_instance()->checkIndicatorAvability($indicator,$modus))
            );
        echo json_encode($array);
    }
    //get additional indicator info
    else if($query =="additional_info") {
        $sql = "SELECT INFO_VIEWER_ZEILE_1,INFO_VIEWER_ZEILE_2,INFO_VIEWER_ZEILE_3,INFO_VIEWER_ZEILE_4,INFO_VIEWER_ZEILE_5,INFO_VIEWER_ZEILE_6,DATENGRUNDLAGE_ZEILE_1,DATENGRUNDLAGE_ZEILE_2, DATENGRUNDLAGE_ATKIS FROM m_indikatoren WHERE ID_INDIKATOR='" . $indicator . "'";
        $ergObject = MYSQL_MANAGER::get_instance()->query($sql);
        $array = array();
        $info = "";
        $datengrundlage = "";
        $atkis = "";
        foreach ($ergObject[0] as $key => $row) {
            if (strpos($key, "INFO_VIEWER") !== false) {
                $info .= $row . " ";
            }
            if (strpos($key, "DATENGRUNDLAGE_ZEILE") !== false) {
                $datengrundlage .= $row . " ";
            }
            if ($key == "DATENGRUNDLAGE_ATKIS") {
                if (intval($row) == 1) {
                    $atkis = "© GeoBasis-DE / BKG (" . $year . ")";
                }
            }
        }
        array_push($array, array(
            "info" => $info,
            "datengrundlage" => $datengrundlage,
            "atkis" => $atkis
        ));
        echo json_encode($array);
    }

}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
