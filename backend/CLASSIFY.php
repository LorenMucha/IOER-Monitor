<?php
require_once ('COLORS.php');

class CLASSIFY
{
    protected static $instance = NULL;
    private $ags_values;
    private $rundung=0;
    public function __construct($json,$classes,$colors, $indicator_id,$klassifizierung) {
        $this->json = $json;
        $this->classes = $classes;
        if(!$colors) {
            $this->colors = MYSQL_QUERIES::get_instance()->getIndicatorColors($indicator_id);
        }else{
            $this->colors=$colors;
        }
        $this->klassifizierung=$klassifizierung;
    }
    private function minifyJSON(){
        $values = array();
        foreach($this->json["features"] as $key=>$row){
            if($row["properties"]["rundung"]) {
                $this->rundung = $row["properties"]["rundung"];
            }
            array_push($values,floatval($row["properties"]["value"]));
        }
        $this->ags_values=$values;
    }
    private function getColors($classes){
        //craete the color array
        $max_color = $this->colors[0]->max;
        $min_color = $this->colors[0]->min;
        if(!$max_color){
            $max_color = "66CC99";
        }
        if(!$min_color){
            $min_color="FFCC99";
        }
        return COLORS::get_instance()->buildColorPalette($classes,$max_color,$min_color);
    }
    public function classify(){
        if($this->klassifizierung==="gleich"){
            return $this->classify_gleich();
        }else{
            /*$result = null;
            $class_set = $this->classes;
            $i=$this->classes;
            //test if classes are possible
            while($i>0){
                $array = $this->classify_haeufig();
                $test = $array[(count($array)-1)]["Wert_Obergrenze"];
                if($test==0){
                    $this->classes = $this->classes-1;
                    $this->classify_haeufig();
                }else{
                    $result = $array;
                    break;
                }
                $i--;
            }
            //kein ergebnis möglich ->klassen müssen erhöht werden
            if(is_null($result)){
                $this->classes=$class_set;
                $i=$this->classes;
                while($i<100){
                    $array = $this->classify_haeufig();
                    $test = $array[(count($array)-1)]["Wert_Obergrenze"];
                    if($test==0){
                        $this->classes = $this->classes+1;
                        $this->classify_haeufig();
                    }else{
                        $result = $array;
                        break;
                    }
                    $i++;
                }
            }
            return $result;*/
            return $this->classify_haeufig();
        }
    }
    private function classify_gleich(){
        $this->minifyJSON();
        $max_value = max($this->ags_values);
        $min_value = min($this->ags_values);
        $colors = $this->getColors($this->classes);
        $counter = ($max_value - $min_value) / $this->classes;
        $i = $min_value;
        $classify = array();
        foreach ($colors as $c) {
            array_push($classify, array(
                "Wert_Untergrenze" => round($i,$this->rundung),
                "Wert_Obergrenze" => round($i + $counter, $this->rundung),
                "Farbwert" => $c
            ));
            $i += $counter;
        }
        return $classify;
    }
    private function classify_haeufig(){
        $values_cleaned = array();
        $this->minifyJSON();
        //remove zero values
        foreach($this->ags_values as $row){
            if($row!=0) {
                $values_cleaned[] = $row;
            }
        }

        $this->ags_values = $values_cleaned;
        sort($this->ags_values);

        $colors = $this->getColors($this->classes);
        //set the quantile
        $counter = round(count($this->ags_values)/$this->classes);
        $i = 0;
        $classify = array();
        foreach($colors as $c){
            array_push($classify, array(
                "Wert_Untergrenze" => round($this->ags_values[$i],$this->rundung),
                "Wert_Obergrenze" => round($this->ags_values[($i+$counter)],$this->rundung),
                "Farbwert" => $c
            ));
            $i += $counter;
        }
        //check max value is correct
       $max_value = round(max($this->ags_values),$this->rundung);
        $test = $classify[(count($classify)-1)]["Wert_Obergrenze"];
        if($test==0 || $test!==$max_value){
            $classify[(count($classify)-1)]["Wert_Obergrenze"] = $max_value;
        }
        return $classify;
    }
    public function toString(){
        return "values:".json_encode($this->ags_values)."\n".
                "klassifizierung:".$this->klassifizierung."\n".
                "classes:".$this->classes;
    }
}