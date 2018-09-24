<?php
session_start();
header('Content-type: application/json; charset=utf-8');
include("database/db_manager.php");
require("HELPER.php");
$searchTerm = $_GET["q"];
$option = $_GET["option"];
$data = array();
$indikatoren_kat = 'Indikatoren';
$orts_kat = 'Orte';

try{
    if($option === 'indikator'){
        echo HELPER::get_instance()->escapeJsonString('{"results":['.substr(queryInd($searchTerm),0,-1)."]}");
    }
    else if ($option === 'orte'){
        echo HELPER::get_instance()->escapeJsonString('{"results":['.substr(queryOrtePosteGreSQL($searchTerm),0,-1)."]}");
    }
    else {
        $result = substr(queryInd($searchTerm) . queryOrtePosteGreSQL($searchTerm),0,-1);
        echo HELPER::get_instance()->escapeJsonString('{"results":['.$result . "]}");
    }
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
function queryInd($searchTerm){

    $JSON = '';

    $query_indName = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.INDIKATOR_NAME LIKE  '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

    $erg_query_indName = queryMySQL($query_indName);

    while ($row = mysqli_fetch_assoc($erg_query_indName)) {
        $name = str_replace('"','',$row['INDIKATOR_NAME']);
        $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
        if (strpos($JSON, $string) !== true) {
            $JSON .= $string;
        }
    }

    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_indMethodik = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.METHODIK LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_indMethodik = queryMySQL($query_indMethodik);

        while ($row = mysqli_fetch_assoc($erg_query_indMethodik)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_Bedeutung = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND BEDEUTUNG_INTERPRETATION LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_Bedeutung = queryMySQL($query_Bedeutung);

        while ($row = mysqli_fetch_assoc($erg_query_Bedeutung)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_Datengrundlage1 = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.DATENGRUNDLAGE_ZEILE_1 LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_Datengrundlage1 = queryMySQL($query_Datengrundlage1);

        while ($row = mysqli_fetch_assoc($erg_query_Datengrundlage1)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_Datengrundlage2 = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.DATENGRUNDLAGE_ZEILE_2 LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_Datengrundlage2 = queryMySQL($query_Datengrundlage2);

        while ($row = mysqli_fetch_assoc($erg_query_Datengrundlage2)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_Info1 = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.INFO_VIEWER_ZEILE_1 LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_Info1 = queryMySQL($query_Info1);

        while ($row = mysqli_fetch_assoc($erg_query_Info1)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_Info2 = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.INFO_VIEWER_ZEILE_2 LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_Info2 = queryMySQL($query_Info2);

        while ($row = mysqli_fetch_assoc($erg_query_Info2)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    if (mysqli_num_rows($erg_query_indName) == 0) {
        $query_Info3 = "SELECT i.INDIKATOR_NAME, i.ID_INDIKATOR, i.ZEITSCHNITTE, i.EINHEIT, i.ID_THEMA_KAT
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            AND i.INFO_VIEWER_ZEILE_2 LIKE '%" . $searchTerm . "%'
            GROUP BY i.INDIKATOR_NAME";

        $erg_query_Info3 = queryMySQL($query_Info3);

        while ($row = mysqli_fetch_assoc($erg_query_Info3)) {
            $name = str_replace('"','',$row['INDIKATOR_NAME']);
            $string = '{"titel": "'.$name.'","value":"'.$row['ID_INDIKATOR'].'","category":"Indikatoren","description":"'.$row['EINHEIT'].'"},';
            if (strpos($JSON, $string) !== true) {
                $JSON .= $string;
            }
        }
    }
    return $JSON;
}
function queryOrtePosteGreSQL($searchTerm)
{

    $JSON = '';

    $year_pg = 2016;

    $geom = "the_geom ";

    $query_bld = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS center from  vg250_bld_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
    $erg_bld = queryPostGre($query_bld);

    while ($row = pg_fetch_assoc($erg_bld)) {
        $coordinates = str_replace(array('POINT(',')'),array('',''),$row['center']);
        $array = explode(" ",$coordinates);
        $JSON .= '{"titel": "' . $row['gen'] . '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Bundesland"},';
    }

    $query_ror = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_ror_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
    $erg_ror = queryPostGre($query_ror);
    if (pg_num_rows($erg_bld) == 0) {
        while ($row = pg_fetch_assoc($erg_ror)) {
            $coordinates = str_replace(array('POINT(',')'),array('',''),$row['center']);
            $array = explode(" ",$coordinates);
            $JSON .= '{"titel": "' . $row['gen'] . '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Raumordnungsregion"},';
        }
    }

    $query_krs = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_krs_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
    $erg_krs = queryPostGre($query_krs);
    if (pg_num_rows($erg_bld) == 0) {
        while ($row = pg_fetch_assoc($erg_krs)) {
            $coordinates = str_replace(array('POINT(',')'),array('',''),$row['center']);
            $array = explode(" ",$coordinates);
            $JSON .= '{"titel": "' . $row['gen'] . '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Kreis"},';
        }
    }
    $query_g50 = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_g50_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
    $erg_g50 = queryPostGre($query_g50);

    if (pg_num_rows($erg_bld) == 0) {
        while ($row = pg_fetch_assoc($erg_g50)) {
            $coordinates = str_replace(array('POINT(',')'),array('',''),$row['center']);
            $array = explode(" ",$coordinates);
            $JSON .= '{"titel": "' . $row['gen'] . '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Stadt"},';
        }
    }
    $query_stt = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_stt_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
    $erg_stt = queryPostGre($query_stt);

    if (pg_num_rows($erg_bld) == 0) {
        while ($row = pg_fetch_assoc($erg_stt)) {
            $coordinates = str_replace(array('POINT(',')'),array('',''),$row['center']);
            $array = explode(" ",$coordinates);
            $JSON .= '{"titel": "' . $row['gen'] . '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Stadtteil"},';
        }
    }

    $query_gem = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_gem_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
    $erg_gem = queryPostGre($query_gem);
    if (pg_num_rows($erg_bld) == 0) {
        while ($row = pg_fetch_assoc($erg_gem)) {
            $coordinates = str_replace(array('POINT(',')'),array('',''),$row['center']);
            $array = explode(" ",$coordinates);
            $JSON .= '{"titel": "' . $row['gen'] . '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"Gemeinde"},';
        }
    }
    return $JSON;
}
mysqli_close(getMySQLConnection());
pg_close(getPostGreConnection());
?>