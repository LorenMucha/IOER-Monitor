<?php
header('Content-type: application/json; charset=utf-8');
require("database/MYSQL_QUERIES.php");
require("HELPER.php");
require('INDIKATOR_JSON.php');
$q =  $_GET["values"];
$json_obj = json_decode($q, true);
$modus = $json_obj['format']['id'];
$indicator = $json_obj['ind']['id'];
$year =$json_obj['ind']['time'];
$raumgliederung =$json_obj['ind']['raumgliederung'];
$query = $json_obj['query'];

try{
    //get the JSON
    if($query==='getJSON'){
        $ags_array = $json_obj['ind']['ags_array'];
        $ags_array = explode(",",$ags_array);
        //echo json_encode($ags_array);
        $test = new INDIKATOR_JSON($indicator,$year,$raumgliederung,$ags_array);
        echo $test->createJSON();
    }
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}