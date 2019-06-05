<?php

class ChartHelper{
    private $value_array = array();
    public function __construct($array)
    {
        $this->array=$array;
    }
    private function getFirst(){
        //sort array
        return $this->value_array[0];
    }

    private function getLast(){
        return $this->value_array[(count($this->value_array)-1)];
    }

    // Function for
    // calculating median
    private function findMedian()
    {
        $a = $this->value_array;
        // First we sort the array
        sort($a);
        $n = sizeof($a);
        // check for even case
        if ($n % 2 != 0)
            return (double)$a[$n / 2];

        return (double)($a[($n - 1) / 2] +
                $a[$n / 2]) / 2.0;
    }
    private function test($val){
        $median = round($this->findMedian());
        $val_check = round($val);
        $first = $this->getFirst();
        $last = $this->getLast();
        //positiv trend
        if($first<$last){
            return $val_check<=$median;
        }else{
            return $val_check>=$median;
        }
    }
    public function smoothArray(){
        $array = $this->array;
        $array_gl = array();
        $last_key = (count($array))-1;
        $this->value_array = array_column($array, 'real_value');

        foreach($array as $key=>$value) {

            $key_before = $key-1;
            //prevent key setting from negativ
            if($key==0){$key_before=0;};

            //values for comapring
            $chart_val_before = $array[$key_before]['value'];
            $date_before = $array[$key_before]['year'];
            $chart_val_real = $array[$key]['value'];
            $date_real = $array[$key]['year'];
            $real_val_test =  $array[$key]['real_value'];

            //prevent same values and do not include stop and beginning point
            if($key==0
                or $key==$last_key
                or $chart_val_real!= $chart_val_before
                //do not touch the trend values
                and intval($date_real) != intval($date_before)
                and $this->test($real_val_test)
            ){
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
                    "median"=>$this->findMedian()
                ));
            }
        }
        return $array_gl;
    }

}