<?php

require_once("database/POSTGRESQL_MANAGER.php");
require_once("HELPER.php");

class OVERLAY{
    public function __construct($layer_id) {
        $this->layer_id = $layer_id;
    }
    public function getJSON(){
        $sql = "select gid, st_asgeojson(transform(" . pg_escape_string("the_geom") . ",4326)) AS geojson from ".$this->layer_id;
        $output = '';
        $rowOutput='';
        try {
            $rs = POSTGRESQL_MANAGER::get_instance()->query($sql);
            foreach ($rs as $row) {
                $rowOutput = (strlen($rowOutput) > 0 ? ',' : '').'{"type": "Feature", "geometry": ' . $row->geojson . ', "properties": {';
                $props = '';
                $id = '';
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
            $result =trim('{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}');
            $result = HELPER::get_instance()->escapeJsonString($result);
            return json_decode($result,true);
        }catch(Error $e){
           return false;
        }
    }
}