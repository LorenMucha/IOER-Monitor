<?php
require_once ('POSTGRESQL_MANAGER.php');

class POSTGRESQL_TASKRESPOSITORY extends POSTGRESQL_MANAGER
{
    protected static $instance = NULL;
    private $berechtigung = 3;
    public static function get_instance()
    {
        if ( NULL === self::$instance )
            self::$instance = new self;

        return self::$instance;
    }
    function getGeometry($year,$spatial_extend,$ags_array){
        $digit = '';
        $sql = '';
        $geom = "the_geom ";
        //set the gemetry column
        if ($year == 2000) {
            $geom = "geom";
        }
        if (count($ags_array) == 0) {
            // Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
            $sql = "select gid, ags, des, replace(gen, '''','') as gen, st_asgeojson(transform(" . pg_escape_string($geom) . ",4326)) AS geojson from  vg250_" . $spatial_extend . "_" . $year . "_grob where ags is not null";
        } else {
            $sql = "select gid, ags, des, replace(gen, '''','') as gen, st_asgeojson(transform(" . pg_escape_string($geom) . ",4326)) AS geojson from  vg250_" . $spatial_extend . "_" . $year . "_grob where CAST(ags AS TEXT) Like'" . $ags_array[0] . "";

            foreach ($ags_array as $value) {
                if (strlen($value) <= 5) {
                    $digit = "%'";
                    $sql .= "%' or CAST(ags AS TEXT) Like'" . $value . "";
                } else {
                    $digit = "'";
                    $sql .= "' or CAST(ags AS TEXT) Like'" . $value . "";
                }
            }
        }
        return $this->query($sql . $digit);
    }
    function getDescription($des,$ags,$spatial_extend){
        $value_return = $des;
        if($spatial_extend==='bld'){
            //specal issue for berlin, because ther is a wrong record insde the vg 250
            if($ags==11){
                $value_return = "Stadtstaat";
            }
            else if(strpos(strtolower($des),'stadt')!==false){
                $value_return = "Stadtstaat";
            }else{
                $value_return = "Flächenstaat";
            }
        }else if($spatial_extend ==='krs'){
            if(strtolower($des)==="kreisfreie stadt"){
                $value_return = "Kreisfreie Stadt";
            }else{
                $value_return = "Landkreis";
            }
        }
        return $value_return;
    }
    function getAGSName($raumgliederung,$ags,$year){
        if(intval($year)==2017){
            $year= 2016;
        }
        $sql ="select gen from vg250_".$raumgliederung."_".$year."_grob where ags ='".$ags."'";

        $rs = $this->query($sql);
        return $rs[0]->gen;
    }
}