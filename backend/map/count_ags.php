<?php
header('Content-type: application/json; charset=utf-8');
include("../database/db_manager.php");
$raumgl = $_GET["raumgl"];
$time = $_GET["time"];
$ags_string = $_GET['ags'];
$AGSArray = array();
//fill the ags array
if(strlen($ags_string)>1) {
    $AGSArray = explode(',', $_GET['ags']);
}
$year_pg = getPostGreYear($time);
if ($year_pg == 2000) {
    $geom = "geom";
} else {
    $geom = "the_geom ";
}
$query= "select COUNT(AGS) from vg250_".$raumgl."_".$year_pg."_grob";
if (count($AGSArray) > 0) {
    $sql_pg = "select COUNT(AGS) from  vg250_" . $raumgl . "_" . $year_pg . "_grob where AGS Like'" . $AGSArray[0] . "";

    foreach ($AGSArray as $key=>$value) {
            if (strlen($value) <= 5) {
                $digit = "%'";
                $sql_pg .= "%' or AGS Like '" . $value . "";
            } else {
                $digit = "'";
                $sql_pg .= "' or AGS Like '" . $value . "";
            }
    }
    $query= $sql_pg.$digit;
}
$rs = queryPostGre($query);
$row = pg_fetch_row($rs);
echo json_encode($row[0]);
?>