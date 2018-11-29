<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
require("database/MYSQL_TASKREPOSITORY.php");
require("HELPER.php");
require('JSON.php');
require("OVERLAY.php");
require('CLASSIFY.php');
require('EXPAND.php');
require('SEARCH.php');
require_once('CACHE_MANAGER.php');

$q =  $_POST["values"];
$json_obj = json_decode($q, true);
$modus = $json_obj['format']['id'];
$indicator = $json_obj['ind']['id'];
$year =$json_obj['ind']['time'];
$raumgliederung =$json_obj['ind']['raumgliederung'];
$klassifizierung = $json_obj['ind']['klassifizierung'];
$klassenanzahl = $json_obj['ind']['klassenzahl'];
$ags_user = trim($json_obj['ind']['ags_array']);
$colors =(object)$json_obj['ind']['colors'];
$query = strtolower($json_obj['query']);

try{
    //set the ags_array
    $ags_array = array();
    if(strlen($ags_user)>0){
        $ags_array = explode(",",$ags_user);
    }
    //----------------------------------Queries--------------------------------------//
    //get the JSON
    if($query==='getjson'){
        //check if the json exist in the database
        $cache_manager = new CACHE_MANAGER($indicator,$year,$raumgliederung,$klassifizierung,$klassenanzahl);
        try{
            if (!$cache_manager->check_cached($ags_array,$colors)) {
                $indicator_json = new JSON($indicator,$year,$raumgliederung,$ags_array);
                $geometry_values = $indicator_json->createJSON();
                $class_manager = new CLASSIFY($geometry_values,$klassenanzahl,$colors,$indicator,$klassifizierung);
                $classes = $class_manager->classify();
                //save the cache but not avaliable user colors
                if(count((array)$colors)==0 and count($ags_array)==0){
                    $cache_manager->insert(json_encode(array_merge($geometry_values,array("classes"=>$classes))));
                }
                echo json_encode(array_merge($geometry_values,array("classes"=>$classes),array("state"=>"generated")));
            }else{
                echo json_encode(array_merge($cache_manager->get_cached(),array("state"=>"cached")));
            }
        }catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
    }
    //get all possible Extends for a indictaor
    else if($query==="getspatialextend"){
        $dictionary = MYSQL_TASKREPOSITORY::get_instance()->getSpatialExtendDictionary();
        $possibilities = MYSQL_TASKREPOSITORY::get_instance()->getSpatialExtend($modus,$year,$indicator);
        $result = array();
        if($modus==="gebiete"){
            foreach($dictionary as $value){
                $id = "RAUMEBENE_".strtoupper($value->id);
                $avaliable = str_replace(array("1","0"),array("enabled","disabled"),(string)$possibilities[0]->{$id});
                $name = $value->name;
                array_push($result,array("id"=>$value->id,"name"=>$name,"state"=>$avaliable));
            }
        }else{
            foreach($possibilities as $value){
                array_push($result,$value->RAUMGLIEDERUNG);
            }
        }
        echo json_encode($result);
    }
    //get all possible Indicators
    else if($query==='getallindicators'){
        $json = '{';
        $kategories = MYSQL_TASKREPOSITORY::get_instance()->getAllCategoriesGebiete();
        if($modus=='raster') {
            $kategories = MYSQL_TASKREPOSITORY::get_instance()->getAllCategoriesRaster();
        }

        foreach($kategories as $row){

            $erg_indikator = MYSQL_TASKREPOSITORY::get_instance()->getAllIndicatorsByCategoryGebiete($row->ID_THEMA_KAT,$modus);

            //only if indicators are avaliabke
            if (count($erg_indikator) != 0) {

                $json .= '"' . $row->ID_THEMA_KAT . '":{"cat_name":"' . $row->THEMA_KAT_NAME . '","cat_name_en":"'.$row->THEMA_KAT_NAME_EN.'","indicators":{';

                foreach($erg_indikator as $row_ind){
                    $grundakt_state = "verfügbar";
                    if (MYSQL_TASKREPOSITORY::get_instance()->getGrundaktState($row_ind->ID_INDIKATOR) == 1) {
                        $grundakt_state = "nicht verfügbar";
                    }
                    $significant = 'false';
                    if (intval($row_ind->MARKIERUNG) == 1) {
                        $significant = 'true';
                    }

                    //get all possible times
                    $time_string = '';
                    $times = MYSQL_TASKREPOSITORY::get_instance()->getIndicatorPossibleTimeArray($row_ind->ID_INDIKATOR,$modus,false);
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
    else if($query=='getyears'){
        $jahre = array();
        $years = MYSQL_TASKREPOSITORY::get_instance()->getIndicatorPossibleTimeArray($indicator,$modus);
        foreach ($years as $x){
                array_push($jahre,intval($x["time"]));
        }
        echo json_encode($jahre);
    }
    //check avability
    else if($query=="getavability"){
        $array = array();
            array_push($array, array(
                "ind" => $indicator,
                "avability" => MYSQL_TASKREPOSITORY::get_instance()->checkIndicatorAvability($indicator,$modus))
            );
        echo json_encode($array);
    }
    //get additional indicator info
    else if($query =="getadditionalinfo") {
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
    //get the color Range for a given count
    else if ($query=="getcolorschema"){
        $min = $colors->min;
        $max = $colors->max;
        $color_range = COLORS::get_instance()->buildColorPalette($klassenanzahl,$min,$max);
        echo json_encode($color_range);
    }
    //counte the amount of geometries, which will be generated
    else if($query=="countgeometries"){
        $count = POSTGRESQL_TASKRESPOSITORY::get_instance()->countGeometries($year,$raumgliederung,$ags_array);
        echo json_encode($count);
    }
    else if($query=="getzusatzlayer"){
        $zusatzlayer = $json_obj['ind']['zusatzlayer'];
        $overlay = new OVERLAY($zusatzlayer);
        echo json_encode($overlay->getJSON());
    }
    //get the values to Expand the Table by the given values
    else if($query=="gettableexpandvalues"){
        $zusatz_values = $json_obj['expand_values'];
        $ags_array =  $json_obj['ags_array'];
        $expand = new EXPAND($indicator,$year,$raumgliederung);
        $rs = $expand->getExpandValues($zusatz_values,$ags_array);
        echo json_encode($rs);
    }
    //search for a indicator or place
    else if($query=="search"){
        $search_string = $json_obj['q'];
        $option = $json_obj['option'];
        $search = new SEARCH($search_string,$option);
        echo json_encode($search->query());
    }


}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
