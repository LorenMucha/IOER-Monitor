<?php
include "../database/DBFactory.php";
include "ChartHelper.php";
include "Chart.php";

class IndikatorChart extends Chart {
    private $min_value = null;
    private $max_value = null;
    private $forecast_values = [2000,2025,2030];
    private $grundakt_state = false;
    public function __construct($ags,$indicator_id,$_all_points,$_compare,$_forecast){
        $this->ags = $ags;
        $this->indicator_id=$indicator_id;
        $this->all_points=$_all_points;
        $this->compare=$_compare;
        $this->forecast=$_forecast;
        if($_forecast) {
            $this->time_array =DBFactory::getMySQLTask()->getIndicatorPossibleTimeArray($this->indicator_id, 'gebiete',[2000]);
        }else{
            $this->time_array =DBFactory::getMySQLTask()->getIndicatorPossibleTimeArray($this->indicator_id, 'gebiete',$this->forecast_values);
        }
        $this->rundung=2;
    }
    public function getValues(){
        $values = $this->createValueArray();
        $helper = new ChartHelper($values);
        //smooth array if all_points is false
        if(!$this->all_points and count($values)>=2) {
           return $helper->smoothArray();
        }else{
            return $values;
        }
    }
    private function createValueArray(){

        $result_array = [];
        $res= false;
        //create the value array
        foreach($this->time_array as $key=>$t) {
            $ind_values = DBFactory::getMySQLTask()->getIndicatorValuesByAGS($t["time"], $this->indicator_id, $this->ags);

            $val = $ind_values[0];
            $this->rundung = $val->rundung;
            $color= "66CC99";
            if($key==0) {
                $this->min_value = round($ind_values[0]->value, $this->rundung);
            }else if($key==count($this->time_array)-1) {
                $this->max_value = round($ind_values[(count($ind_values) - 1)]->value, $this->rundung);
            }

            if(!is_null($val->color_max)){
               $color = $val->color_max;
            }

            if ($val->name) {
                //extract the values
                if ($val->grundakt_state == 0 and (int)$t["time"] <= date("Y")) {
                    $this->grundakt_state = true;
                    array_push($result_array, array(
                        "value" => $this->setValue(round($val->value, $this->rundung), $t["time"]),
                        "real_value" => round($val->value, $this->rundung),
                        "date" => $val->grundakt_month . '/' . $val->grundakt_year,
                        "year" => $val->grundakt_year,
                        "month" => $val->grundakt_month,
                        "id" => $this->indicator_id,
                        "name" => $val->name,
                        "color" => "#" . $color,
                        "einheit" => $val->einheit,
                        "time_real" => $t["time"]
                    ));
                } else {
                    array_push($result_array, array(
                        "value" => $this->setValue(round($val->value, $this->rundung), $t["time"]),
                        "real_value" => round($val->value, $this->rundung),
                        "date" => "1/" . $t["time"],
                        "year" => $t["time"],
                        "month" => "1",
                        "id" => $this->indicator_id,
                        "name" => $val->name,
                        "color" => "#" . $color,
                        "einheit" => $val->einheit
                    ));
                }
                $res= $result_array;
            }
        }
        return $res;
    }
    //build the compare values or get only the value
    private function setValue($value,$time){
        $min_time = $this->time_array[0]["time"];
        $res = $value;
        if($this->compare){
            if($time == $min_time){
                $res= 0;
            }else if($time > $min_time){
                $res= $value-$this->min_value;
            }
        }
        return $res;
    }
}