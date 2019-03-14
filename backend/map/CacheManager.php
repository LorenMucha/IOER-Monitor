<?php
include_once '../database/POSTGRESQL_MANAGER.php';

class CacheManager{
    
    private $table_name = "geojson_cache";

    public function __construct($indicator_id, $year, $spatial_extend, $klassifizierung, $klassenanzahl) {
            $this->indicator_id = $indicator_id;
            $this->year = $year;
            $this->spatial_extend = $spatial_extend;
            $this->klassifizierung = $klassifizierung;
            $this->klassenanzahl = $klassenanzahl;
    }
    public function check_cached($ags_array,$colors){
        $state = false;
        if(count((array)$colors)==0 and count($ags_array)==0) {
            $sql = "SELECT * FROM " . $this->table_name . " where INDIKATOR_ID = '" . $this->indicator_id . "' and TIME = " . $this->year . " and RAUMGLIEDERUNG ='" . $this->spatial_extend . "' and klassifizierung='" . $this->klassifizierung . "' and klassenanzahl=" . $this->klassenanzahl;
            $rs = POSTGRESQL_MANAGER::get_instance()->query($sql);
            if (!empty($rs)) {
                $state = true;
            }
        }
        return $state;
    }
    public function insert($json){
            date_default_timezone_set('Europe/Berlin');
            $date = date('Y-m-d H:i:s');
            $filed_array=array("%s","%s","%s","%s","%s","%s");
            $data_array=array("indikator_id"=>$this->indicator_id,"time"=>$this->year,"raumgliederung"=>$this->spatial_extend,"klassenanzahl"=>$this->klassenanzahl,"geo_json"=>$json,"timestamp"=>$date,"klassifizierung"=>$this->klassifizierung);
            POSTGRESQL_MANAGER::get_instance()->insert($this->table_name,$data_array,$filed_array);
    }
    public function get_cached(){
        $query = "SELECT geo_json FROM  ".$this->table_name." where INDIKATOR_ID = '".$this->indicator_id."' and TIME = ".$this->year." and RAUMGLIEDERUNG ='".$this->spatial_extend."' and klassenanzahl=".$this->klassenanzahl." and klassifizierung='".$this->klassifizierung."'";
        $rs = POSTGRESQL_MANAGER::get_instance()->query($query);
        return json_decode($rs[0]->geo_json, true);
    }
}