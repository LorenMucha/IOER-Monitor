<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
include 'database/PostgreTasks.php';

$q =  $_POST["values"];
$json_obj = json_decode($q, true);
$query = strtolower($json_obj['query']);

try{
    if($query==='clearcache'){
       PostgreManager::get_instance()->query("TRUNCATE geojson_cache");
        echo json_encode("done");
    }

}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
