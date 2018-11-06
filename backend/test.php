<?php
header('Content-type: application/json; charset=utf-8');
require("database/MYSQL_QUERIES.php");
require("HELPER.php");
require('INDICATOR_JSON.php');
require('CLASSIFY.php');

$q =  $_GET["values"];
$json_obj = json_decode($q, true);
$modus = $json_obj['format']['id'];
$indicator = $json_obj['ind']['id'];
$year =$json_obj['ind']['time'];
$raumgliederung =$json_obj['ind']['raumgliederung'];
$klassenanzahl = $json_obj['ind']['klassenzahl'];
$klassifizierung = $json_obj['ind']['klassifizierung'];
$query = $json_obj['query'];

try{
    //get the JSON
    if($query==='getJSON'){
        $ags_array = $json_obj['ind']['ags_array'];
        $ags_array = explode(",",$ags_array);
        //echo json_encode($ags_array);
        $indicator_json = new INDICATOR_JSON($indicator,$year,$raumgliederung,$ags_array,$klassifizierung);
        $class_json = new CLASSIFY($indicator_json->getJSON(),$klassenanzahl,false,$indicator);
        //echo json_encode(array_merge($indicator_json->getJSON(),array("classes"=>$class_json->classify_gleich())));
        echo json_encode($class_json->classify_haeufig());
        //$class_json->classify_haeufig();
    }
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}