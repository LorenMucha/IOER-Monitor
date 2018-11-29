<?php
require_once("HELPER.php");
require_once ("database/MYSQL_MANAGER.php");
require_once ("database/POSTGRESQL_MANAGER.php");

class SEARCH{
    public function __construct($search_string,$option) {
        $this->search_string = strtolower($search_string);
        $this->option=$option;
    }
    public function query(){
        if($this->option==="indicator"){
            return json_decode(HELPER::get_instance()->escapeJsonString('{"results":['.substr($this->queryIndicator(),0,-1)."]}"),true);
        }else if($this->option==="orte"){
            return json_decode(HELPER::get_instance()->escapeJsonString('{"results":['.substr($this->queryArea(),0,-1)."]}"),true);
        }else{
            $result = substr($this->queryIndicator() . $this->queryArea(),0,-1);
           return json_decode(HELPER::get_instance()->escapeJsonString('{"results":['.$result . "]}"),true);
        }
    }
    private function queryIndicator(){
        $JSON = '';
        $sql="SELECT i.INDIKATOR_NAME as name, i.ID_INDIKATOR as id, i.EINHEIT as unit, i.ID_THEMA_KAT as id_cat, k.THEMA_KAT_NAME as cat_name,
              i.METHODIK as methodik, i.BEDEUTUNG_INTERPRETATION as bedeutung, i.DATENGRUNDLAGE_ZEILE_1 as daten1,i.DATENGRUNDLAGE_ZEILE_2 as daten2,
              i.INFO_VIEWER_ZEILE_1 as info1,i.INFO_VIEWER_ZEILE_2 as info2
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            GROUP BY i.ID_INDIKATOR";
        $indObject = MYSQL_MANAGER::get_instance()->query($sql);
        $q = $this->search_string;
        //seach for the suitable results inside the object
        foreach($indObject as $key=>$row){
            //search inside indicators
              if(strpos(strtolower($row->name),$q)!==false
                  //or strpos(strtolower($row->cat_name),$q)!==false
                  or strpos(strtolower($row->methodik),$q)!==false
                  or strpos(strtolower($row->bedeutung),$q)!==false
                  or strpos(strtolower($row->daten1),$q)!==false
                  or strpos(strtolower($row->daten2),$q)!==false
                  or strpos(strtolower($row->info1),$q)!==false
                  or strpos(strtolower($row->info2),$q)!==false
                  or strpos(strtolower($row->info2),$q)!==false){
                $name = str_replace('"','',$row->name);
                $string = '{"titel": "'.$name.'","value":"'.$row->id.'","category":"Indikatoren","description":"'.$row->unit.'"},';
                if (strpos($JSON, $string) !== true) {
                    $JSON .= $string;
                }
            }
        }
        return $JSON;
    }
    private function queryArea(){
        $JSON = '';
        $searchTerm = $this->search_string;
        $year_pg = 2016;

        $geom = "the_geom ";

        $query_bld = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS center from  vg250_bld_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_bld = POSTGRESQL_MANAGER::get_instance()->query($query_bld);
        foreach($erg_bld as $row){
            $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
            $array = explode(" ",$coordinates);
            $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Bundesland"},';
        }

        $query_ror = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_ror_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_ror = POSTGRESQL_MANAGER::get_instance()->query($query_ror);
        if (empty((array)$erg_bld)) {
            foreach($erg_ror as $row){
                $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
                $array = explode(" ",$coordinates);
                $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Raumordnungsregion"},';
            }
        }

        $query_krs = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_krs_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_krs = POSTGRESQL_MANAGER::get_instance()->query($query_krs);
        if (empty((array)$erg_bld)) {
            foreach($erg_krs as $row){
                $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
                $array = explode(" ",$coordinates);
                $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Kreis"},';
            }
        }
        $query_g50 = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_g50_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_g50 = POSTGRESQL_MANAGER::get_instance()->query($query_g50);
        if (empty((array)$erg_krs)) {
            foreach($erg_g50 as $row){
                $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
                $array = explode(" ",$coordinates);
                $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Stadt"},';
            }
        }
        $query_stt = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_stt_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_stt = POSTGRESQL_MANAGER::get_instance()->query($query_stt);

        if (empty((array)$erg_bld)) {
            foreach($erg_stt as $row){
                $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
                $array = explode(" ",$coordinates);
                $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Stadtteil"},';
            }
        }

        $query_gem = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_gem_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_gem = POSTGRESQL_MANAGER::get_instance()->query($query_gem);
        if (empty((array)$erg_krs)) {
            foreach($erg_gem as $row){
                $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
                $array = explode(" ",$coordinates);
                $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Gemeinde"},';
            }
        }
        return $JSON;
    }
}
