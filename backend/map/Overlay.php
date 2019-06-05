<?php

include_once "../database/DBFactory.php";
include_once "../models/Helper.php";

class Overlay{
    public function __construct($layer_id) {
        $this->layer_id = $layer_id;
    }
    public function getJSON(){
        $sql = "select gid, st_asgeojson(transform(" . pg_escape_string("the_geom") . ",4326)) AS geojson from ".$this->layer_id;
        $output = '';
        $rowOutput='';
        try {
            $rs = DBFactory::getPostgreSQLManager()->query($sql);
            foreach ($rs as $row) {
                $rowOutput = (strlen($rowOutput) > 0 ? ',' : '').'{"type": "Feature", "geometry": ' . $row->geojson . ', "properties": {';
                $props = '';
                $id = '';
                foreach ($row as $key => $val) {
                    if ($key != "geojson") {
                        $props .= (strlen($props) > 0 ? ',' : '') . '"' . $key . '":"' . Helper::get_instance()->escapeJsonString($val) . '"';
                    }
                    if ($key == "id") {
                        $id .= ',"id":"' . Helper::get_instance()->escapeJsonString($val) . '"';
                    }
                }

                $rowOutput .= $props . '}';
                $rowOutput .= $id;
                $rowOutput .= '}';
                $output .= $rowOutput;
            }
            $result =trim('{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}');
            $result = Helper::get_instance()->escapeJsonString($result);
            return json_decode($result,true);
        }catch(Error $e){
           return false;
        }
    }
}