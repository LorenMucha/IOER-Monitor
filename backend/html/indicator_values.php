<?php
session_start();
header('Content-type: application/json; charset=utf-8');
include("../database/db_manager.php");

$ags_map_string=$_POST["ags_array_string"];
$time = $_SESSION["jahr"];
$ind_map = $_SESSION["indikator"];

$einheit = getIndEinheit($ind);
//the input JSON z.B. {id:addedValue,time:getTime()}
$expand_values = $_POST["values"];

$time_set = $expand_values['time'];
$id_org = $expand_values["id"];

//explode the id
$id_splitted = explode("|",$id_org);
$ind_set  = $id_splitted[0];

$grundakt_set = $_POST["grundakt_state"];

//temp array
$ags_array = array();
try {
    //store the passed ags JSON in an array
    foreach (json_decode($ags_map_string, true) as $item) {
        array_push($ags_array, $item['ags']);
    }

    $length_ags = strlen($ags_array[0]);

    //get all the bld values in an array
    $sql_bld = "SELECT gen, ags FROM vg250_bld_2016_grob";
    $rs_bld = queryPostGre($sql_bld);
    $bldArray = pg_fetch_all($rs_bld);

    //set the ABS IND
    if($ind_set==='ABS'){
        $ind_set = substr($ind_map,0,3).'AG';
    }

    //set the brd values
    if($ind_set==='brd'){
        $ind_set = $ind_map;
        $ags_array = array();
        array_push($ags_array,'99');
        $length_ags = 2;
    }
    //set the bld values
    if($ind_set==='bld'){
        $ind_set = $ind_map;
        $ags_bld = array();
        foreach($ags_array as $value){array_push($ags_bld,substr($value,0,2));}
        $ags_array = $ags_bld;
        $length_ags = 2;
    }


    $sql_string_mysql = "SELECT i.INDIKATORWERT AS value, i.ID_INDIKATOR as ind, z.EINHEIT as einheit,i.FEHLERCODE as fc, i.HINWEISCODE as hc, i.AGS as ags, z.RUNDUNG_NACHKOMMASTELLEN as rundung
                                        FROM m_indikatorwerte_" . $time_set . " i, m_indikatoren z
                                        Where i.ID_INDIKATOR =  '" . $ind_set . "'
                                        And z.ID_INDIKATOR = i.ID_INDIKATOR
                                        And LENGTH(i.AGS) = " . $length_ags . "
                                        Group by i.AGS";

    $rs_mysql = queryMySQL($sql_string_mysql);
    //get the mysql querry as array
    $mysqlArray = mysqli_fetch_all($rs_mysql);
    $einheit =$mysqlArray[0][2];
    if($ind_set==='B00AG'){
        $einheit= '(*) Werte 2015';
    }

    # get the FC Codes
    $fc_array = getFCArray();
    //the result JSON
    $JSON = '{"id":"' . $id_org . '","time":"' . $time_set . '","einheit":"' . $einheit . '","count":"'. $expand_values['count'].'","values":{';
    foreach ($ags_array as $row_ags) {
        foreach ($mysqlArray as $row_mysql) {
            if ($row_ags === $row_mysql[5]) {
                $valueInd = $row_mysql[0];
                $rundung = $row_mysql[6];
                $value_comma = number_format(round($valueInd, $rundung), $rundung, ',', '');
                $valueID = $row_mysql[1];
                $value_fc = $row_mysql[3];
                $value_hc = $row_mysql[4];

                $ags = $row_mysql[5];

                $grundakt = getIndGrundakt($ags, $time_set);

                //get the grundakt
                if (getGrundaktStat($indikator) == 1) {
                    $grundakt = 0;
                }

                //get the hc text
                if (!empty($value_hc)) {
                    $text_hc = getHCText($value_hc) . "||" . $value_hc;
                } else {
                    $text_hc = "0";
                }

                //check for error code
                if ($value_fc >= 1) {
                    //get the error code
                    $key_fc = getFC($value_fc, $fc_array);
                    $fc_farbe = $fc_array[$key_fc]['FARBE'];
                    $fc_text = $fc_array[$key_fc]['NAME'];
                    $fc_beschreibung = $fc_array[$key_fc]['BESCHREIBUNG'];
                    $fc = $value_fc . "||" . $fc_farbe . "||" . $fc_text . "||" . $fc_beschreibung;
                } else {
                    $fc = 0;
                }
                //pass the names of the 'bundeslaender
                $bld = '';
                if($_SESSION["raumgliederung"] !== "bld"){
                    $ags_bld = substr($ags,0,2);
                    $bld = '';
                    foreach($bldArray as $value){if($ags_bld===$value['ags']){$bld=$value['gen'];}}
                    $bld = '"bld":"'.$bld.'",';
                }

                $JSON .= '"' . $ags . '":{'.$bld.'"value":"' . $valueInd . '","value_round":"' . $value_comma . '","fc":"' . $value_fc . '","hc":"' . $value_hc . '","grundakt":"'.$grundakt.'"},';
            }
        }
    }
    $JSON = substr($JSON, 0, -1);
    $JSON .= "}}";
    echo json_encode($JSON);
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
function getFC($value, $array)
{
    foreach ($array as $key => $val) {
        if ($val['FC'] === $value) {
            return $key;
        }
    }
    return null;
}
mysqli_close(getMySQLConnection());
?>