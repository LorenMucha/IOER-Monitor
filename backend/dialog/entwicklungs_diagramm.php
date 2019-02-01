<?php
/*
 * TODO umschreiben auf den neuen DB-Manager
 */
session_start();
header('Content-type: application/json; charset=utf-8');
include("../database/db_manager.php");

$ags = $_GET["ags"];
$ind = $_GET["indikator"];
$state_stueztpnt = $_GET['state_stueztpnt'];
//ind development or compare
$state_ind = $_GET["state_ind_vergleich"];
$prognose = $_GET["prognose"];
$data = array();
//create the value array for the diagramm

$timeArray = getIndTimeArray($ind,'gebiete');
if($prognose==='false'){$timeArray = getIndTimeArray($ind,'gebiete',[2025,2030]);}
//get the min time to set the 0 value
$min_time = min(array_column($timeArray, 'time'));
$value_time_min = round(getIndValue($ind,$ags,$min_time),getIndRundung($ind));

foreach ($timeArray as $t) {
    if(getGrundaktStat($ind) ==0) {
        if (getIndGrundakt($ags, $t["time"]) !== "nicht verfügbar") {
            array_push($data, array(
                "value" => setValue($ind, $ags, $t["time"], $value_time_min, $min_time, $state_ind),
                "real_value" => round(getIndValue($ind, $ags, $t["time"]), getIndRundung($ind)),
                "date" => getIndGrundakt($ags, $t["time"]),
                "year" => getIndGrundakt_YEAR($ags, $t["time"]),
                "month" => getIndGrundakt_MONTH($ags, $t["time"]),
                "id" => $ind,
                "name" => getIndNameKurz($ind),
                "color" => "#" . getIndColor_MAX($ind),
                "einheit" => getIndEinheit($ind),
                "time_real"=> $t["time"]
            ));
        }
    }else{
        array_push($data, array(
            "value" => setValue($ind, $ags, $t["time"], $value_time_min, $min_time, $state_ind),
            "real_value" => round(getIndValue($ind, $ags, $t["time"]), getIndRundung($ind)),
            "date" => "1/".$t["time"],
            "year" => $t["time"],
            "month" => "1",
            "id" => $ind,
            "name" => getIndNameKurz($ind),
            "color" => "#" . getIndColor_MAX($ind),
            "einheit" => getIndEinheit($ind),
        ));
    }
}

usort($data_future, function ($item1, $item2) {
    return $item1['year'] <=> $item2['year'];
});
//smooth line
if($state_stueztpnt === 'true') {
    $data = glaetteArray($data,$ags);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
else{
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

//build the real value for each point
function setValue($indikator,$ags,$time,$value_time_min,$min_time,$ind_state){
   if($ind_state === "true"){
       if($time == $min_time){
           return 0;
       }else if($time > $min_time){
           return round(getIndValue($indikator,$ags,$time),getIndRundung($indikator))-$value_time_min;
       }
   }else {
       return round(getIndValue($indikator,$ags,$time),getIndRundung($indikator));
   }
}

//smooth the points
function glaetteArray($array,$ags){
    //echo "start glaetten";
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

        $year_von = $array[$key_before]['year'];
        $year_bis = $array[$key]['year'];

        if(getGrundaktStat($array[$key]['id']) == 0){
            $year_bis = getIndGrundakt_YEAR($ags, $array[$key_before]['time_real']);
            $year_von = getIndGrundakt_YEAR($ags, $array[$key]['time_real']);
        }

        $array_values = array_column($array,'value');
        $med = (array_sum($array_values))/count($array_values);

        if ($key == 0) {
            $set_int = $key;
        }else if ($key == $last_key) {
            $set_int = $key;
        }else if ($year_von == $year_bis and $key !=0 and $key != $last_key) {
          if(checkSchwellenwert($array,'value',$value_real)){
                $set_int = $key;
            }
        } else if ($value_real != $array[$last_key]['value'] and $value_real != $array[0]['value']) {
            if ($value_real != $value_before) {
                if(checkSchwellenwert($array,'value',$value_real)){
                    $set_int = $key;
                }
            } else if ($value_real == $max or $value_real == $min) {
                $set_int = $key;
            }
        }

        array_push($array_gl, array(
            "value" => $array[$set_int]['value'],
            "real_value" => $array[$set_int]['real_value'],
            "date" => $array[$set_int]['date'],
            "year" => $array[$set_int]['year'],
            "month" => $array[$set_int]['month'],
            "id" => $array[$set_int]['id'],
            "name" => $array[$set_int]['name'],
            "color" => $array[$set_int]['color'],
            "einheit" => $array[$set_int]['einheit'],
            "min" => $min,
            "max" => $max,
            "med" => $med,
            "trend" => $array[0]['value']+$array[$last_key]['value'],
            "last_key" => $array[$last_key]['value'],
            "value_real" => $value_real,
            "value_before" => $value_before
        ));
    }
    return $array_gl;
}
function checkSchwellenwert($array,$key,$value){
    $array_values = array_column($array,$key);
    $med = (array_sum($array_values))/count($array_values);
    //first check for dublices
    //check if trend positiv or negativ
    $last_key = (count($array))-1;
    $trend = $array[0][$value]+$array[$last_key][$value];
    //negative trend
    if($trend<$array[0][$value]){
        if ($value <= $med) {
            return true;
        } else {
            return false;
        }
    }else{
        if ($value >= $med) {
            return true;
        } else {
            return false;
        }
    }
}
mysqli_close(getMySQLConnection());
?>