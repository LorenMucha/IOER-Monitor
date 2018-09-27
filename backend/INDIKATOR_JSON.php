<?php
require_once ('database/POSTGRESQL_QUERIES.php');
require_once ('database/MYSQL_QUERIES.php');
require_once('INDIKATOR_ERRORS.php');
require_once ('INDIKATOR_NOTES.php');
require_once('HELPER.php');
require_once ('INDIKATOR_CACHE_MANAGER.php');
require_once ('COLORS.php');

class INDIKATOR_JSON
{
    protected static $instance = NULL;
    private $json;

    public function __construct($indicator_id,$year,$spatial_extend,$ags_array_user) {

        $this->indicator_id = $indicator_id;
        $this->year = $year;
        $this->year_pg =MYSQL_QUERIES::get_instance()->getPostGreYear($year);
        $this->spatial_extend = $spatial_extend;
        $this->ags_array_user = $ags_array_user;
        $this->colors = MYSQL_QUERIES::get_instance()->getIndicatorColors($indicator_id);
    }
    function getJSON(){
        $cache_manager = new INDIKATOR_CACHE_MANAGER($this->indicator_id,$this->year,$this->spatial_extend,$this->ags_array_user);
        try{
            if (!$cache_manager->check_cached()) {
                $json = $this->createJSON();
                //save the cache
                $cache_manager->insert($json);
                return $json;
            }else{
                return $cache_manager->get_cached();
            }
        }catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
    }
    function createJSON(){
            # Build GeoJSON
            $output = '';
            $rowOutput = '';
            //get the PostgreObject
            $geometry_object = POSTGRESQL_QUERIES::get_instance()->getGeometry($this->year_pg, $this->spatial_extend, $this->ags_array_user);
            //get the Indicator Object
            $indicator_object = MYSQL_QUERIES::get_instance()->getIndicatorInSpatialExtend($this->year, $this->indicator_id, $geometry_object[0]->ags);
            //get the Grundaktualität
            $indikator_grundaktualitaet = MYSQL_QUERIES::get_instance()->getGrundaktState($this->indicator_id);
            //get the ags array's to calculate the differences
            $indicator_rundung = '';
            $ags_mysql = array();
            //the global array
            $ags_value_array = array();
            foreach ($indicator_object as $value) {
                if($value->ags != 99) {
                    array_push($ags_mysql, $value->ags);
                }
            }

            foreach ($geometry_object as $value) {
                array_push($ags_postgre, $value->ags);
            }

            foreach ($geometry_object as $row_postgre) {
                $indicator_value = '';
                $indicator_value_round = '';
                $indicator_id = '';
                $einheit = '';
                $grundakt = '';
                foreach ($indicator_object as $row_mysql) {
                    if ($row_postgre->ags === $row_mysql->ags) {
                        if ($this->indicator_id !== 'Z00AG') {

                            $indicator_value = $row_mysql->value;
                            $indicator_rundung = $row_mysql->rundung;
                            $indicator_value_round = number_format(round($indicator_value, $indicator_rundung), $indicator_rundung, ',', '');
                            $indicator_id = $row_mysql->ind;
                            $einheit = $row_mysql->einheit;
                            $fc_id = $row_mysql->fc;
                            $note_id = $row_mysql->hc;
                            $ags = $row_postgre->ags;
                            $des = POSTGRESQL_QUERIES::get_instance()->getDescription($row_postgre->des, $ags, $this->spatial_extend);

                            //get the grundakt
                            if ($indikator_grundaktualitaet == 1) {
                                $grundakt = 0;
                            } else {
                                $grundakt = MYSQL_QUERIES::get_instance()->getIndicatorGrundaktualitaet($ags, $this->year);
                            }

                            //get the hc text
                            if (!empty($note_id)) {
                                $text_hc = INDIKATOR_NOTES::get_instance()->getNoteText($note_id) . "||" . $note_id;
                            } else {
                                $text_hc = "0";
                            }

                            $fc = INDIKATOR_ERRORS::get_instance()->getCodeValues(intval($fc_id));
                            if ($fc != 0) {
                                $fc = $fc_id . "||" . $fc[0]["color"] . "||" . $fc[0]["name"] . "||" . $fc[0]["description"];
                            }
                        } else {
                            $indicator_value = MYSQL_QUERIES::get_instance()->getIndicatorValueByAGS('Z00AG', $row_postgre->ags, $this->year);
                        }
                    }
                }
                if (!in_array($row_postgre->ags, $ags_mysql)) {
                    $fc = "1||red||keine Daten, nicht berechenbar||";
                }

                //save the array for classify
                if ($this->indicator_id !== 'Z00AG') {
                    $this->ags_value_array = $ags_value_array;
                }

                $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row_postgre->geojson . ', "properties": {"spatial_class":"' . $des . '","rundung":"'.$indicator_rundung.'","value_comma":"' . $indicator_value_round . '","hc":"' . $text_hc . '", "grundakt":"' . $grundakt . '","fc":"' . $fc . '"' . "," . '"value":"' . $indicator_value . '"' . "," .
                    '"einheit":"' . $einheit . '"' . "," .
                    '"idIndikator":"' . $indicator_id . '"' . ",";

                $props = '';
                $id = '';
                foreach ($row_postgre as $key => $val) {
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
            if (count($this->ags_array_user) > 0) {
                $stat_string_ags = '';
                foreach ($this->ags_array_user as $value) {
                    $ags_set = substr($value, 0, 2);
                    $stat_string_ags .= '"' . $ags_set . '":{"gen":"' . POSTGRESQL_QUERIES::get_instance()->getAGSName('bld', $ags_set, $this->year) . '","value_ags":"' . number_format(round(MYSQL_QUERIES::get_instance()->getIndicatorValueByAGS($this->indicator_id, $value, $this->year), $indicator_rundung), $indicator_rundung, ',', '') . '","ags_grundakt":"' . MYSQL_QUERIES::get_instance()->getIndicatorGrundaktualitaet($value, $this->year) . '"},';
                }
            }
            trim($JSON = '{ "type": "FeatureCollection", "stat":{' . $stat_string_ags . '"wert_brd":"' . number_format(round(MYSQL_QUERIES::get_instance()->getIndicatorValueForBRD($this->indicator_id, $this->year), $indicator_rundung), $indicator_rundung, ',', '') . '","grundakt_brd":"' . MYSQL_QUERIES::get_instance()->getIndicatorGrundaktualitaet('99', $this->year) . '"},"features": [ ' . $output . ' ]}');
            $this->json = json_decode($JSON,true);

            return json_encode(array_merge(json_decode($JSON,true),array("classes"=>$this->classifyJSON())));
        }
        function classifyJSON(){
            //TODO Klassenanzahl automatisieren
            $values = array();
            $json = $this->json;
            $classify =array();
            $class_number = 7;
            $rundung=2;
            foreach($json["features"] as $key=>$row){
                $rundung = $row["properties"]["rundung"];
                array_push($values,floatval(str_replace(",",".",$row["properties"]["value_comma"])));
            }
            //print_r($this->json);
            $max_value = max($values);
            $min_value = min($values);
            $max_color = $this->colors[0]->max;
            $min_color = $this->colors[0]->min;

            $colors= COLORS::get_instance()->buildColorPalette($class_number,$max_color,$min_color);
            $counter = ($max_value-$min_value)/$class_number;
            $i = $min_value;
            foreach($colors as $c){
                array_push($classify,array(
                    "Wert_Untergrenze"=>$i,
                    "Wert_Obergrenze"=>round($i+$counter,$rundung),
                    "Farbwert"=>$c
                ));
                $i +=$counter;
            }
            return $classify;
        }
}