<?php
include_once "../models/Colors.php";

class Classify
{
    protected static $instance = NULL;
    private $ags_values;
    private $rundung=0;
    public function __construct($json,$classes,$colors, $indicator_id,$klassifizierung) {
        $this->json = $json;
        $this->classes = $classes;
        //if no color is set, get the predefined colors
        if(!(array)$colors or $indicator_id==="Z00AG") {
            $this->colors = DBFactory::getMySQLTask()->getIndicatorColors($indicator_id);
        }else{
            //cast because it needs to be an object
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
        $max_color = $this->colors->max;
        $min_color = $this->colors->min;
        if(!$max_color){
            $max_color = "66CC99";
        }
        if(!$min_color){
            $min_color="FFCC99";
        }
        return Colors::get_instance()->buildColorPalette($classes,$max_color,$min_color);
    }
    public function classify(){
        if($this->klassifizierung==="gleich"){
            return $this->classify_gleich();
        }else{
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
                "min" => round($i,$this->rundung),
                "max" => round($i + $counter, $this->rundung),
                "color" => $c
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
                "min" => round($this->ags_values[$i],$this->rundung),
                "max" => round($this->ags_values[($i+$counter)],$this->rundung),
                "color" => $c
            ));
            $i += $counter;
        }
        //check max value is correct
       $max_value = round(max($this->ags_values),$this->rundung);
        $test = $classify[(count($classify)-1)]["max"];
        if($test==0 || $test!==$max_value){
            $classify[(count($classify)-1)]["max"] = $max_value;
        }
        return $classify;
    }
    public function toString(){
        return "values:".json_encode($this->ags_values)."\n".
                "klassifizierung:".$this->klassifizierung."\n".
                "classes:".$this->classes;
    }
}