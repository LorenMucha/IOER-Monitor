<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
require("../database/DBFactory.php");
require("../models/Helper.php");

$q =  $_GET["values"];
$json_obj = json_decode($q, true);
$modus = $json_obj['format']['id'];
$indicator = $json_obj['ind']['id'];
$year =$json_obj['ind']['time'];
$raumgliederung =$json_obj['ind']['raumgliederung'];
$klassifizierung = $json_obj['ind']['klassifizierung'];
$klassenanzahl = $json_obj['ind']['klassenzahl'];
$ags_user = trim($json_obj['ind']['ags_array']);
$colors =(object)$json_obj['ind']['Colors'];
$query = strtolower($json_obj['query']);

try{
    //get all possible Extends for a indictaor
    if($query==="getspatialextend"){
        $possibilities = DBFactory::getMySQLTask()->getSpatialExtend($modus,$year,$indicator);
        $result = array();
        foreach($possibilities as $value){
            array_push($result,str_replace(array("Raster"," ","m"),array("","",""),$value->RAUMGLIEDERUNG));
        }
        echo json_encode($result);
    }
    //get all possible Indicators
    else if($query==='getallindicators'){
        $json = '{';
        $kategories = DBFactory::getMySQLTask()->getAllCategoriesGebiete();
        if($modus=='raster') {
            $kategories = DBFactory::getMySQLTask()->getAllCategoriesRaster();
        }

        foreach($kategories as $row){

            $erg_indikator = DBFactory::getMySQLTask()->getAllIndicatorsByCategoryGebiete($row->ID_THEMA_KAT,$modus);

            //only if indicators are avaliabke
            if (count($erg_indikator) != 0) {

                $json .= '"' . $row->ID_THEMA_KAT . '":{"cat_name":"' . $row->THEMA_KAT_NAME . '","cat_name_en":"'.$row->THEMA_KAT_NAME_EN.'","indicators":{';

                foreach($erg_indikator as $row_ind){
                    $grundakt_state = "verfügbar";
                    if ($row_ind-> MITTLERE_AKTUALITAET_IGNORE == 1) {
                        $grundakt_state = "nicht verfügbar";
                    }
                    $significant = 'false';
                    if (intval($row_ind->MARKIERUNG) == 1) {
                        $significant = 'true';
                    }

                    //get all possible times
                    $time_string = '';
                    $times = DBFactory::getMySQLTask()->getIndicatorPossibleTimeArray($row_ind->ID_INDIKATOR,$modus,false);
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
        echo Helper::get_instance()->escapeJsonString($json);
    }
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
