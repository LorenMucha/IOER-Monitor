<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
include("database/db_manager.php");

$kartenlink = $_GET["kartenlink"];
$param_url = $_GET["param_url"];
if($kartenlink) {
    $raster_link = false;

    $raster_url = getRasterLink($kartenlink);
    $svg_url = getSVGLink($kartenlink);
    $result_json = '[';
//RASTER Old----------------------------------------------
    if ($raster_url) {
        $result_json .= '{"raster_old":"' . $raster_url . '"},';
    } else {
        $result_json .= '{"raster_old":"false"},';
    }
//SVG-------------------------------------------------
    if ($svg_url) {
        $result_json .= '{"svg_old":"false"},';
        $result_json .= '{"rid":"' . $svg_url . '"},';
    } else {
        $result_json .= '{"svg_old":"' . $kartenlink . '"},';
        $result_json .= '{"rid":"false"},';
    }
    $result = substr($result_json, 0, -1) . "]";
    echo json_encode($result);
}else if($param_url){
    //time
    date_default_timezone_set('Europe/Berlin');
    $date = date('Y-m-d H:i:s');

// Kartenlink speichern
    $sql_insert = "insert into v_user_link_speicher (array_value,ZEITSTEMPEL)  values ('".$param_url."','".$date."')";

    $erfolg = mysqli_query(getMySQLConnection(),$sql_insert);
// ID der letzten Eingabe ermitteln (anhand Zeitstempel)
    $id = 'select id from v_user_link_speicher where ZEITSTEMPEL = "'.$date.'"';
    $id = mysqli_query(getMySQLConnection(),$id);
    $id = mysqli_fetch_row($id);
    $id = $id[0];
    echo $id;
}
mysqli_close(getMySQLConnection());
?>