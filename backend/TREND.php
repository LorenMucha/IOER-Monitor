<?php
require_once("database/MYSQL_TASKREPOSITORY.php");

class TREND{
    private $min_value = null;
    private $forecast_values = [2025,2030];
    private $grundakt_state = false;
    public function __construct($ags,$indicator_id,$_all_points,$_compare,$_forecast){
        $this->ags = $ags;
        $this->indicator_id=$indicator_id;
        $this->all_points=$_all_points;
        $this->compare=$_compare;
        $this->forecast=$_forecast;
        if($_forecast) {
            $this->time_array = MYSQL_TASKREPOSITORY::get_instance()->getIndicatorPossibleTimeArray($this->indicator_id, 'gebiete');
        }else{
            $this->time_array = MYSQL_TASKREPOSITORY::get_instance()->getIndicatorPossibleTimeArray($this->indicator_id, 'gebiete',$this->forecast_values);
        }
    }
    public function getTrendValues(){
        $values = $this->createValueArray();
        //smooth array if all_points is false
        if($this->all_points) {
           return $this->smoothArray($values);
        }else{
            return $values;
        }
    }
    private function createValueArray(){

        $result = [];
        //create the value array
        foreach($this->time_array as $key=>$t){
            $ind_values = MYSQL_TASKREPOSITORY::get_instance()->getIndicatorValuesByAGS($t["time"],$this->indicator_id,$this->ags);
            $val =$ind_values[0];
            if($key==0){
                $this->min_value= $val->value;
            }
            //extract the values
            if ($val->grundakt_state==0 and (int)$t["time"]<=date("Y")){
                $this->grundakt_state=true;
                array_push($result, array(
                    "value" => round($this->setValue($val->value,$t["time"]),$val->rundung),
                    "real_value" => (string)round($val->value,$val->rundung),
                    "date" => $val->grundakt_month.'/'.$val->grundakt_year,
                    "year" => $val->grundakt_year,
                    "month" => $val->grundakt_month,
                    "id" => $this->indicator_id,
                    "name" => $val->name,
                    "color" => "#" . $val->color_max,
                    "einheit" => $val->einheit,
                    "time_real"=> $t["time"]
                ));
            }
            else{
                array_push($result, array(
                    "value" => round($this->setValue($val->value,$t["time"]),$val->rundung),
                    "real_value" => (string)round($val->value,$val->rundung),
                    "date" => "1/".$t["time"],
                    "year" => $t["time"],
                    "month" => "1",
                    "id" => $this->indicator_id,
                    "name" => $val->name,
                    "color" => "#" . $val->color_max,
                    "einheit" => $val->einheit
                ));
            }
        }
        return $result;
    }
    //build the compare values or get only the value
    private function setValue($value,$time){
        $min_time = $this->time_array[0]["time"];
        if($this->compare){
            if($time == $min_time){
                return 0;
            }else if($time > $min_time){
                return $value-$this->min_value;
            }
        }else {
            return $value;
        }
    }
    //smooth the points
    private function smoothArray($array){
        $array_gl = array();
        $last_key = (count($array))-1;

        foreach($array as $key=>$value) {

            $key_before = $key - 1;
            if($key ==0){$key_before=0;};
            $value_before = $array[$key_before]['value'];
            $value_real = $array[$key]['value'];
            $key_after = $key + 1;
            if($key == $last_key){$key_after=$key;}
            $value_after = $array[$key_after]['value'];

            $stat = array($value_before, $value_real, $value_after);
            $max = max($stat);
            $min = min($stat);

            $array_values = array_column($array,'value');
            $med = (array_sum($array_values))/count($array_values);

            //do not exclude start and end value
            if($key==0 or $key==$last_key){
                array_push($array_gl, array(
                    "value" => $array[$key]['value'],
                    "real_value" => $array[$key]['real_value'],
                    "date" => $array[$key]['date'],
                    "year" => $array[$key]['year'],
                    "month" => $array[$key]['month'],
                    "id" => $array[$key]['id'],
                    "name" => $array[$key]['name'],
                    "color" => $array[$key]['color'],
                    "einheit" => $array[$key]['einheit'],
                    "min" => $min,
                    "max" => $max,
                    "med" => $med,
                    "trend" => $array[0]['value']+$array[$last_key]['value']
                ));
            //prevent same values
            }
        }
        return $array_gl;
    }
    //export the class
    public function toJSON(){
        $array = [];
        array_push($array,array(
            "ags"=>$this->ags,
            "indicator_id"=>$this->indicator_id,
            "all_points"=>$this->all_points,
            "compare"=>$this->compare,
            "forecast"=>$this->forecast
        ));
        return json_encode($array);
    }
}