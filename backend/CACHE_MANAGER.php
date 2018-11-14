<?php
require_once('database/POSTGRESQL_TASKRESPOSITORY.php');

class CACHE_MANAGER{

    protected static $instance = NULL;

    public function __construct($indicator_id, $year, $spatial_extend, $ags_array_user,$klassifizierung) {

        $this->indicator_id = $indicator_id;
        $this->year = $year;
        $this->spatial_extend = $spatial_extend;
        $this->ags_string = implode(",", $ags_array_user);
        $this->klassifizierung = $klassifizierung;
    }
    function check_cached(){
        $sql = "SELECT * FROM geojson_cache_test where INDIKATOR_ID = '".$this->indicator_id."' and TIME = ".$this->year." and RAUMGLIEDERUNG ='".$this->spatial_extend."' and AGS_ARRAY ='".$this->ags_string."' and klassifizierung='".$this->klassifizierung."'";
        $rs = POSTGRESQL_MANAGER::get_instance()->query($sql);
        if(empty($rs)){
            return false;
        }else{
            return true;
        }
    }
    function insert($json){
            date_default_timezone_set('Europe/Berlin');
            $date = date('Y-m-d H:i:s');
            $filed_array=array("%s","%s","%s","%s","%s","%s");
            $data_array=array("indikator_id"=>$this->indicator_id,"time"=>$this->year,"raumgliederung"=>$this->spatial_extend,"ags_array"=>$this->ags_string,"geo_json"=>$json,"timestamp"=>$date,"klassifizierung"=>$this->klassifizierung);
            POSTGRESQL_MANAGER::get_instance()->insert("geojson_cache_test",$data_array,$filed_array);
    }
    function get_cached(){
        $query = "SELECT geo_json FROM geojson_cache_test where INDIKATOR_ID = '".$this->indicator_id."' and TIME = ".$this->year." and RAUMGLIEDERUNG ='".$this->spatial_extend."' and AGS_ARRAY ='".$this->ags_string."' and klassifizierung='".$this->klassifizierung."'";
        $rs = POSTGRESQL_MANAGER::get_instance()->query($query);
        return $rs[0]->geo_json;
    }
}