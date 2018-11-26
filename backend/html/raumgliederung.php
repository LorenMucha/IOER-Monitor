<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include("../database/db_manager.php");

$gliederung = array();

$berechtigung = 3;
$indikator = $_GET["indikator"];
$year = $_GET["jahr"];
$modus = $_GET["modus"];
$array = array();
try{
if($modus === 'gebiete') {

    $query_bld = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_BLD FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_bld = mysqli_query(getMySQLConnection(), $query_bld);
    $rs_bld = mysqli_fetch_row($mysql_query_bld);

    if ($rs_bld[1] == 0) {
        array_push($array,array("id"=>"bld","name"=>"Bundesländer","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"bld","name"=>"Bundesländer","state"=>"enabled"));
    }

    $query_ror = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_ROR FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_ror = mysqli_query(getMySQLConnection(), $query_ror);
    $rs_ror = mysqli_fetch_row($mysql_query_ror);

    if ($rs_ror[1] == 0) {
        array_push($array,array("id"=>"ror","name"=>"Raumordnungsregionen","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"ror","name"=>"Raumordnungsregionen","state"=>"enabled"));
    }

    $query_krs = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_KRS FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_krs = mysqli_query(getMySQLConnection(), $query_krs);
    $rs_krs = mysqli_fetch_row($mysql_query_krs);

    if ($rs_krs[1] == 0) {
        array_push($array,array("id"=>"krs","name"=>"Kreise","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"krs","name"=>"Kreise","state"=>"enabled"));
    }

    $query_lks = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_LKS FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_lks = mysqli_query(getMySQLConnection(), $query_lks);
    $rs_lks = mysqli_fetch_row($mysql_query_lks);

    if ($rs_lks[1] == 0) {
        array_push($array,array("id"=>"lks","name"=>"Landkreise","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"lks","name"=>"Landkreise","state"=>"enabled"));
    }

    $query_kfs = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_KFS FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_kfs = mysqli_query(getMySQLConnection(), $query_kfs);
    $rs_kfs = mysqli_fetch_row($mysql_query_kfs);

    if ($rs_kfs[1] == 0) {
        array_push($array,array("id"=>"kfs","name"=>"kreisfreie Städte","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"kfs","name"=>"kreisfreie Städte","state"=>"enabled"));
    }

    $query_gmd = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_VWG FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_gmd = mysqli_query(getMySQLConnection(), $query_gmd);
    $rs_gmd = mysqli_fetch_row($mysql_query_gmd);

    if ($rs_gmd[1] == 0) {
        array_push($array,array("id"=>"vwg","name"=>"Gemeindeverbände","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"vwg","name"=>"Gemeindeverbände","state"=>"enabled"));
    }

    $query_gem = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_GEM FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_gem = mysqli_query(getMySQLConnection(), $query_gem);
    $rs_gem = mysqli_fetch_row($mysql_query_gem);

    if ($rs_gem[1] == 0) {
        array_push($array,array("id"=>"gem","name"=>"Gemeinden","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"gem","name"=>"Gemeinden","state"=>"enabled"));
    }

    $query_g50 = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_G50 FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_g50 = mysqli_query(getMySQLConnection(), $query_g50);
    $rs_g50 = mysqli_fetch_row($mysql_query_g50);

    if ($rs_g50[1] == 0) {
        array_push($array,array("id"=>"g50","name"=>"Städte(>50000 Ew.)","state"=>"disabled"));
    } else {
        array_push($array,array("id"=>"g50","name"=>"Städte(>50000 Ew.)","state"=>"enabled"));
    }

    $query_sst = "SELECT i.ID_INDIKATOR, i.RAUMEBENE_STT FROM m_indikatoren i, m_indikator_freigabe f 
              WHERE f.JAHR =  " . $year . " 
              AND i.ID_INDIKATOR= '" . $indikator . "'
              AND f.STATUS_INDIKATOR_FREIGABE = " . $berechtigung . " Group BY i.ID_INDIKATOR";

    $mysql_query_sst = mysqli_query(getMySQLConnection(), $query_sst);
    $rs_sst = mysqli_fetch_row($mysql_query_sst);

    if ($rs_sst[1] == 0) {
        array_push($array,array("id"=>"stt","name"=>"Stadtteile","state"=>"disabled"));
    } else {
        if ($year <= 2014) {
            array_push($array,array("id"=>"stt","name"=>"Stadtteile","state"=>"disabled"));
        } else {
            array_push($array,array("id"=>"stt","name"=>"Stadtteile","state"=>"enabled"));
        }
    }
}else{

    $sql_raumgliederung = "SELECT d_raumgliederung.RAUMGLIEDERUNG FROM d_raster,d_raumgliederung
                            WHERE d_raumgliederung.RAUMGLIEDERUNG = d_raster.RAUMGLIEDERUNG
                            AND d_raster.INDIKATOR = '".$indikator."' 
                            group by d_raster.raumgliederung ORDER BY d_raumgliederung.SORTIERUNG ASC";

    $erg_raumgliederung = queryMySQL($sql_raumgliederung);

    while($row = mysqli_fetch_assoc($erg_raumgliederung))
    {
        array_push($array,$row["RAUMGLIEDERUNG"]);
    }
}
echo json_encode($array,JSON_UNESCAPED_UNICODE );
mysqli_close(getMySQLConnection());
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}

?>