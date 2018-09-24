<?php
header('Content-type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
include("database/db_manager.php");
require("HELPER.php");

$layer = $_GET["LAYER"];
$sql = "select gid, st_asgeojson(transform(" . pg_escape_string("the_geom") . ",4326)) AS geojson from ".$layer;

//echo $sql;
# Try query or error
$rs = pg_query(getPostGreConnection(), $sql);
if (!$rs) {
    echo pg_last_error(getPostGreConnection());
    exit;
}

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row['geojson'] . ', "properties": {';
    $props = '';
    $id    = '';
    foreach ($row as $key => $val) {
        if ($key != "geojson") {
            $props .= (strlen($props) > 0 ? ',' : '') . '"' . $key . '":"' . HELPER::get_instance()->escapeJsonString($val) . '"';
        }
        if ($key == "id") {
            $id .= ',"id":"' . HELPER::get_instance()->escapeJsonString($val) . '"';
        }
    }

    $rowOutput .= $props . '}';
    $rowOutput .= $id;
    $rowOutput .= '}';
    $output .= $rowOutput;
}
$output = '{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}';
echo json_encode($output);
pg_close(getPostGreConnection());
?>