<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
include_once "database/MysqlTasks.php";
include_once "database/PostgreManager.php";
include_once "database/PostgreTasks.php";
include_once "models/Helper.php";
include "models/Errors.php";
include 'models/NOTES.php';
include 'models/Colors.php';
include "models/UserLink.php";
include 'chart/Chart.php';
include "map/Json.php";
include 'map/CacheManager.php';
include "map/Overlay.php";
include "table/TableExpand.php";
include "map/Classify.php";
include 'models/Search.php';

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
        $cache_manager = new CacheManager($indicator,$year,$raumgliederung,$klassifizierung,$klassenanzahl);
        try{
            if (!$cache_manager->check_cached($ags_array,$colors)) {
                $indicator_json = new Json($indicator,$year,$raumgliederung,$ags_array);
                $geometry_values = $indicator_json->createJSON();
                $class_manager = new Classify($geometry_values,$klassenanzahl,$colors,$indicator,$klassifizierung);
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
        $dictionary = MysqlTasks::get_instance()->getSpatialExtendDictionary();
        $possibilities = MysqlTasks::get_instance()->getSpatialExtend($modus,$year,$indicator);
        $result = array();
        if($modus==="gebiete"){
            foreach($dictionary as $value){
                $id = "RAUMEBENE_".strtoupper($value->id);
                $avaliable = str_replace(array("1","0"),array("enabled","disabled"),(string)$possibilities[0]->{$id});
                $name = $value->name;
                array_push($result,array("id"=>$value->id,"name"=>$name,"name_en"=>$value->name_en,"state"=>$avaliable));
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
        $language = $json_obj['format']['language'];
        $json = '{';
        if($modus=='raster') {
            $kategories = MysqlTasks::get_instance()->getAllCategoriesRaster();
        }else{
            $kategories = MysqlTasks::get_instance()->getAllCategoriesGebiete();
        }

        foreach($kategories as $row){

            $erg_indikator = MysqlTasks::get_instance()->getAllIndicatorsByCategoryGebiete($row->ID_THEMA_KAT,$modus);

            //only if indicators are avaliabke
            if (count($erg_indikator) != 0) {

                $json .= '"' . $row->ID_THEMA_KAT . '":{"cat_name":"' . $row->THEMA_KAT_NAME . '","cat_name_en":"'.$row->THEMA_KAT_NAME_EN.'","indicators":{';

                foreach($erg_indikator as $row_ind){
                    $grundakt_state = "verfügbar";
                    if ($row_ind-> MITTLERE_AKTUALITAET_IGNORE== 1) {
                        $grundakt_state = "nicht verfügbar";
                    }
                    $significant = 'false';
                    if (intval($row_ind->MARKIERUNG) == 1) {
                        $significant = 'true';
                    }
                    //get all possible times
                    $time_string = '';
                    $times = MysqlTasks::get_instance()->getIndicatorPossibleTimeArray($row_ind->ID_INDIKATOR,$modus,false);
                    foreach($times as $value){$time_string .= $value["time"].",";};
                    $time_string = substr($time_string,0,-1);
                    //extend the json
                    $json .= '"' . $row_ind->ID_INDIKATOR . '":{"ind_name":"' . str_replace('"', "'", $row_ind->INDIKATOR_NAME) .
                        '","ind_name_en":"' . str_replace('"', "'", $row_ind->INDIKATOR_NAME_EN) .
                        '","ind_name_short":"' . str_replace('"', "'", $row_ind->INDIKATOR_NAME_KURZ) .
                        '","basic_actuality_state":"' . $grundakt_state .
                        '","significant":"' . $significant .
                        '","atkis":"' . $row_ind->DATENGRUNDLAGE_ATKIS.
                        '","rundung":"'.$row_ind->RUNDUNG_NACHKOMMASTELLEN.
                        '","ogc":{' .
                            '"wfs":"' . $row_ind->WFS.
                            '","wcs":"' . $row_ind->WCS.
                            '","wms":"' . $row_ind->WMS.
                        '"},"unit":"' . $row_ind->EINHEIT .
                        '","spatial_extends":{'.
                            '"bld":"' . $row_ind->RAUMEBENE_BLD.
                            '","krs":"' . $row_ind->RAUMEBENE_KRS.
                            '","gem":"' . $row_ind->RAUMEBENE_GEM .
                            '","vwg":"' . $row_ind->RAUMEBENE_VWG .
                            '","g50":"' . $row_ind->RAUMEBENE_G50 .
                            '","stt":"' . $row_ind->RAUMEBENE_STT .
                            '","ror":"' . $row_ind->RAUMEBENE_ROR .
                        '"},"literatur":"' . preg_replace('/\s+/', ' ',str_replace('"',"'",htmlentities($row_ind->LITERATUR))) .
                        '","colors":{' .
                            '"min":"'.$row_ind->FARBWERT_MIN.
                            '","max":"'.$row_ind->FARBWERT_MAX.
                        '"},"verweise":"' . preg_replace('/\s+/', ' ',str_replace('"',"'",htmlentities($row_ind->VERWEISE))) .
                        '","verweise_en":"' . preg_replace('/\s+/', ' ',str_replace('"',"'",htmlentities($row_ind->VERWEISE_EN))) .
                        '","interpretation":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->BEDEUTUNG_INTERPRETATION))) .
                        '","interpretation_en":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->BEDEUTUNG_INTERPRETATION_EN))) .
                        '","methodik":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->METHODIK))) .
                        '","bemerkungen":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->BEMERKUNGEN))) .
                        '","bemerkungen_en":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->BEMERKUNGEN_EN))) .
                        '","methodik_en":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->METHODIK_EN))) .
                        '","info":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->INFO_VIEWER_ZEILE_1." ".$row_ind->INFO_VIEWER_ZEILE_2." ".$row_ind->INFO_VIEWER_ZEILE_3." ".$row_ind->INFO_VIEWER_ZEILE_4." ".$row_ind->INFO_VIEWER_ZEILE_5." ".$row_ind->INFO_VIEWER_ZEILE_6))) .
                        '","info_en":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->INFO_VIEWER_ZEILE_1_EN." ".$row_ind->INFO_VIEWER_ZEILE_2_EN." ".$row_ind->INFO_VIEWER_ZEILE_3_EN." ".$row_ind->INFO_VIEWER_ZEILE_4_EN." ".$row_ind->INFO_VIEWER_ZEILE_5_EN." ".$row_ind->INFO_VIEWER_ZEILE_6_EN))) .
                        '","datengrundlage":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_1))) .
                        " ".
                        trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_2))).
                        '","datengrundlage_en":"' . trim(preg_replace('/\s+/', ' ', str_replace('"', "'", $row_ind->DATENGRUNDLAGE_ZEILE_1_EN))) .
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
    //get all possible years for a given indicator
    else if($query=='getyears'){
        $jahre = array();
        $years = MysqlTasks::get_instance()->getIndicatorPossibleTimeArray($indicator,$modus);
        foreach ($years as $x){
                array_push($jahre,intval($x["time"]));
        }
        echo json_encode($jahre);
    }
    //check avability for given indicator parameters
    else if($query=="getavability"){
        $array = array();
            array_push($array, array(
                "ind" => $indicator,
                "avability" => MysqlTasks::get_instance()->checkIndicatorAvability($indicator,$modus))
            );
        echo json_encode($array);
    }
    //count the amount of geometries, which will be generated
    else if($query=="countgeometries"){
        $count = PostgreTasks::get_instance()->countGeometries($year,$raumgliederung,$ags_array);
        echo json_encode($count);
    }
    //get the map overlay
    else if($query=="getzusatzlayer"){
        $zusatzlayer = $json_obj['ind']['zusatzlayer'];
        $cache_manager = new CacheManager(substr($zusatzlayer,0,2),2019,$zusatzlayer,"false",0);
        if (!$cache_manager->check_cached([],[])) {
            $overlay = new Overlay($zusatzlayer);
            $json = json_encode(array_merge($overlay->getJSON(),array("state"=>"generated")));
            $cache_manager->insert($json);
            echo $json;
        }else{
            echo json_encode(array_merge($cache_manager->get_cached(),array("state"=>"cached")));
        }
    }
    //get the values to Expand the Table by the given values
    else if($query=="gettableexpandvalues"){
        $zusatz_values = $json_obj['expand_values'];
        $ags_array =  $json_obj['ags_array'];
        $expand = new TableExpand($indicator,$year,$raumgliederung);
        $rs = $expand->getExpandValues($zusatz_values,$ags_array);
        echo json_encode($rs);
    }
    //search for a indicator or place
    else if($query=="search"){
        $search_string = $json_obj['q'];
        $option = $json_obj['option'];
        $search = new Search($search_string,$option);
        echo json_encode($search->query());
    }
    //get the values to create the chart
    else if($query=="gettrend"){
        try {
            //example setting: set":{"all_points":"true","forecast":"true","compare":"true"}
            $settings = (object)$json_obj['set'];
            $forecast = Helper::get_instance()->extractBoolen($settings->forecast);
            $compare = Helper::get_instance()->extractBoolen($settings->compare);
            $all_points = Helper::get_instance()->extractBoolen($settings->all_points);
            $trend = new Chart($ags_array[0], $indicator, $all_points, $compare, $forecast);
            echo json_encode($trend->getTrendValues(), JSON_UNESCAPED_UNICODE);
        }catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
    }
    /*get all indicator values for a gives ags with differences to BRD and KRS if set*/
    else if($query=="getvaluesags"){
        //takes exactly one ags value
        $ags =$json_obj['ind']['ags'];
        $values=MysqlTasks::get_instance()->getAllIndicatorValuesInAGS($year,$ags,true,true);
        $keys = array();
        $result = array();
        foreach(MysqlTasks::get_instance()->getAllCategoriesGebiete() as $k){array_push($keys,array("cat_id"=>$k->ID_THEMA_KAT,"cat_name"=>$k->THEMA_KAT_NAME,"cat_name_en"=>$k->THEMA_KAT_NAME_EN));}
        //create the cat keys
        foreach($keys as $key=>$val){
            $res = array();
            foreach($values as $v){
                if($val["cat_id"]==$v->category){
                    unset($v->category);
                   array_push($res,$v);
                }
            }
            array_push($result,array(
                $val["cat_id"]=>array(
                    "cat_name"=>$val["cat_name"],
                    "car_name_en"=>$val["cat_name_en"],
                    "values"=>$res
                )
            ));
        }
        echo json_encode($result);
    }
    else if($query=="maplink"){
        $setting = $json_obj["setting"];
        $link = new UserLink($setting);
        echo json_encode($link->getResult());
    }
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
