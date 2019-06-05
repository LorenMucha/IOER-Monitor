<?php
include_once '../database/DBFactory.php';

class Json
{
    protected static $instance = NULL;
    private $json;
    public function __construct($indicator_id,$year,$spatial_extend,$ags_array_user) {

        $this->indicator_id = $indicator_id;
        $this->year = $year;
        $this->year_pg =DBFactory::getMySQLTask()->getPostGreYear($year);
        $this->spatial_extend = $spatial_extend;
        $this->ags_array_user = $ags_array_user;
    }
    function createJSON(){
            # Build GeoJSON
            $output = '';
            $rowOutput = '';
            //get the PostgreObject
            $geometry_object = DBFactory::getPostgreSQLTasks()->getGeometry($this->year_pg, $this->spatial_extend, $this->ags_array_user);
            //get the Indicator Object
            $indicator_object = DBFactory::getMySQLTask()->getIndicatorValuesInSpatialExtend($this->year, $this->indicator_id, $geometry_object[0]->ags,$this->ags_array_user);
            //get the Grundaktualität
            $indikator_grundaktualitaet = DBFactory::getMySQLTask()->getGrundaktState($this->indicator_id);
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
                            $des = DBFactory::getPostgreSQLTasks()->getDescription($row_postgre->des, $ags, $this->spatial_extend);

                            //get the grundakt
                            if ($indikator_grundaktualitaet == 1) {
                                $grundakt = 0;
                            } else {
                                $grundakt = $row_mysql->grundakt_year."/".$row_mysql->grundakt_month;
                            }

                            //get the hc text
                            if ($note_id!=0) {
                                $text_hc = NOTES::get_instance()->getNoteText($note_id) . "||" . $note_id;
                            } else {
                                $text_hc = "0";
                            }

                            $fc = Errors::get_instance()->getCodeValues(intval($fc_id));
                            if ($fc != 0) {
                                $fc = $fc_id . "||" . $fc[0]["color"] . "||" . $fc[0]["name"] . "||" . $fc[0]["description"];
                            }
                        } else {
                            $indicator_value = $row_mysql->value;
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
            //for ags stat if user uses the 'gebietsauswahl' Option
            if (count($this->ags_array_user) > 0) {
                $stat_string_ags = '';
                foreach ($this->ags_array_user as $value) {
                    $ags_set = substr($value, 0, 2);
                    $stat_string_ags .= '"' . $ags_set . '":{"gen":"' . DBFactory::getPostgreSQLTasks()->getAGSName('bld', $ags_set, $this->year_pg) . '","value_ags":"' . number_format(round(DBFactory::getMySQLTask()->getIndicatorValueByAGS($this->indicator_id, $value, $this->year), $indicator_rundung), $indicator_rundung, ',', '') . '","ags_grundakt":"' .DBFactory::getMySQLTask()->getIndicatorGrundaktualitaet($value, $this->year) . '"},';
                }
            }
            trim($JSON = '{ "type": "FeatureCollection","year_pg":"'.$this->year_pg.'" ,"stat":{' . $stat_string_ags . '"wert_brd":"' . number_format(round(DBFactory::getMySQLTask()->getIndicatorValueForBRD($this->indicator_id, $this->year), $indicator_rundung), $indicator_rundung, ',', '') . '","grundakt_brd":"' .DBFactory::getMySQLTask()->getIndicatorGrundaktualitaet('99', $this->year) . '"},"features": [ ' . $output . ' ]}');
            $this->json = json_decode($JSON,true);
            return json_decode($JSON,true);
        }
}