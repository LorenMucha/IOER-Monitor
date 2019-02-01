<?php
include("access.php");
// Funktion nicht mehrfach in einem Script starten
if(!function_exists('mysqli_result'))
{
    function mysqli_result($res, $row, $field=0)
    {
        if($res)
        {
            $res->data_seek($row);
            $datarow = $res->fetch_array();
            return $datarow[$field];
        }
        else
        {
            return $t='';
        }
    }
}
function getMySQLConnection(){
    $acces_data = getAccessMySQL();
    $host = $acces_data[0]["host"];
    $user = $acces_data[0]["user"];
    $password= $acces_data[0]["password"];
    $database = $acces_data[0]["database"];
    $Verbindung = mysqli_connect($host,$user,$password,$database);
    return $Verbindung;
}

function getPostGreConnection()
{
    $acces_data = getAccessPostgre();
    $host = $acces_data[0]["host"];
    $user = $acces_data[0]["user"];
    $password= $acces_data[0]["password"];
    $database = $acces_data[0]["database"];
    $port = $acces_data[0]["port"];
    $verbindung_postGre = pg_connect("host=".$host." port=".$port." dbname=".$database." user=".$user." password=".$password." options='--client_encoding=UTF8'") or die('Could not connect: ' . pg_last_error());
    return $verbindung_postGre;
}
function queryMySQL($sql_string){
    $result = mysqli_query(getMySQLConnection(),$sql_string);
    /*if(!$result){
        echo "MQSQL ERROR: ".getMySQLConnection()->error;
        echo "SQL: ".$sql_string;
    }*/
    return $result;
}
function queryPostGre($sql_string){
    $conn=getPostGreConnection();
    $result = pg_query($conn, $sql_string);
    /*if (!$result) {
        echo "PostgreSQL ERROR: ".pg_last_error(getPostGreConnection());
        echo "PoSQL:".$sql_string;
    }*/
    pg_close(getPostGreConnection());
    return $result;
}
/*****************************************************************************************
//indicator queries
 * ***************************************************************************************/
function getAGSIndValueArray($time,$ags,$ind){

    $value_array = array();

    $SQL_AGS = "SELECT m.INDIKATORWERT as value, m.FEHLERCODE, f.FEHLER_BESCHREIBUNG,f.FEHLER_FARBCODE, m.HINWEISCODE as HC FROM m_indikatorwerte_" . $time . " m
            INNER JOIN m_fehlercodes f ON IFNULL(m.FEHLERCODE,0) = f.FEHLERCODE
            WHERE m.ags = '" . $ags . "' AND m.ID_INDIKATOR = '" . $ind . "' Group by m.Indikatorwert";

    $rs_ags = queryMySQL($SQL_AGS);

    while ($row = mysqli_fetch_assoc($rs_ags)) {

        array_push($value_array, array(
            'value' => number_format(round($row["value"], getIndRundung($ind)), getIndRundung($ind), ',', ''),
            'FEHLER_BESCHREIBUNG' => $row["FEHLER_BESCHREIBUNG"],
            'HC' => $row["HC"],
            'FEHLER_FARBCODE' => $row["FEHLER_FARBCODE"],
            'FEHLERCODE' => $row['FEHLERCODE']
        ));
    }
    return $value_array;
}
function getIndEinheit($ind){
    $SQL_Indikator_Info = "SELECT * FROM m_indikatoren WHERE ID_INDIKATOR='" . $ind . "'";
    $Ergebnis_Indikator_Info = queryMySQL($SQL_Indikator_Info);
    $value = @mysqli_result($Ergebnis_Indikator_Info, 0, 'EINHEIT');
    return (string)$value;
}
function getIndRundung($ind){
    $SQL_Indikator_Info = "SELECT * FROM m_indikatoren WHERE ID_INDIKATOR='" . $ind . "'";
    $Ergebnis_Indikator_Info = queryMySQL($SQL_Indikator_Info);
    $value = @mysqli_result($Ergebnis_Indikator_Info, 0, 'RUNDUNG_NACHKOMMASTELLEN');
    return $value;
}
function getIndValue($ind,$ags, $time){
    $SQL_ABS = "SELECT m.INDIKATORWERT as value FROM m_indikatorwerte_" . $time . " m
            INNER JOIN m_fehlercodes f ON IFNULL(m.FEHLERCODE,0) = f.FEHLERCODE
            WHERE m.ags = '" . $ags . "' AND m.ID_INDIKATOR = '" . $ind . "' Group by m.Indikatorwert";
    $Ergebnis_ABS = queryMySQL($SQL_ABS);
    $wert = @mysqli_result($Ergebnis_ABS, 0, 'value');
    return $wert;
}
function getIndNameKurz($ind){
    $SQL = "SELECT INDIKATOR_NAME_KURZ as value FROM m_indikatoren WHERE ID_INDIKATOR = '".$ind."'";
    $ergebis = queryMySQL($SQL);
    return @mysqli_result($ergebis, 0, 'value');
}
function getIndTimeArray($ind,$modus,$exclude_year,$format){
    $times = array();
    $query = '';
    if($modus === 'gebiete') {
        $ex_q = '';
        foreach ($exclude_year as $value) {
            $ex_q .= " And NOT JAHR =".$value;
        }
        $query = "SELECT JAHR FROM m_indikator_freigabe
		  WHERE STATUS_INDIKATOR_FREIGABE >= '3'
          AND ID_INDIKATOR = '" . $ind . "'" .$ex_q. "
          Order by JAHR DESC";
    }else{
        if($exclude_year){
            $query = "SELECT JAHR FROM d_raster
            WHERE d_raster.freigabe_aussen >= '3'
            AND INDIKATOR = '".$ind."' AND NOT JAHR=" . $exclude_year . "
            group by JAHR
            Order by JAHR DESC";
        }else{
            $query = "SELECT JAHR FROM d_raster
            WHERE d_raster.freigabe_aussen >= '3'
            AND INDIKATOR = '".$ind."'
            group by JAHR
            Order by JAHR DESC";
        }
    }
    $erg_query = queryMySQL($query);

    while ($row = mysqli_fetch_assoc($erg_query)) {

        array_push($times, array("time" => $row["JAHR"]));

    }
    //needs to be sorted to make sure every column takes the correct place
    usort($times, function ($item1, $item2) {
        return $item1['time'] <=> $item2['time'];
    });
    return $times;
}
//get the Indicator Errorcodes
function getIndFC($ind,$ags,$time){
    $sqlquery = "SELECT i.FEHLERCODE
                FROM m_indikatorwerte_" . $time . " i, m_indikator_freigabe f, m_indikatoren z
                WHERE i.AGS =  '" . $ags . "'
                AND f.ID_INDIKATOR = i.ID_INDIKATOR
                AND f.ID_INDIKATOR =  '" . $ind . "'
                AND f.STATUS_INDIKATOR_FREIGABE = 3
                And z.ID_INDIKATOR = f.ID_INDIKATOR
                Group by i.INDIKATORWERT";

    $erg_query = queryMySQL($sqlquery);
    $value = @mysqli_result($erg_query, 0, 'FEHLERCODE');
    return $value;
}
//check if a indicator exists
function checkIndicator_avability($indikator,$modus)
{
    if($modus === 'gebiete') {
        $query = "SELECT ID_INDIKATOR, Jahr FROM m_indikator_freigabe WHERE ID_INDIKATOR = '" . $indikator . "' AND STATUS_INDIKATOR_FREIGABE =3 Group by Jahr";

        $rs = queryMySQL($query);
        if ($rs->num_rows > 0) {
            return true;
        } else {
            return false;
        }
    }else{
        $query = "SELECT Indikator,Jahr FROM d_raster WHERE INDIKATOR = '".$indikator."' AND FREIGABE_AUSSEN =3 Group by JAHR";
        $rs = queryMySQL($query);
        if ($rs->num_rows > 0) {
            return true;
        } else {
            return false;
        }
    }
}
function getIndTypFuellung($ind){
    $SQL_ZV = "SELECT * FROM m_zeichenvorschrift WHERE ID_INDIKATOR='".$ind."'";
    $Ergebnis_ZV = queryMySQL($SQL_ZV);
    $wert = @mysqli_result($Ergebnis_ZV,0,'TYP_FUELLUNG');
    if(mysqli_num_rows($Ergebnis_ZV)==0){
        return 'Klassifizierte Farbreihe';
    }else{
        return $wert;
    }
}
function getIndColor_MAX($ind){
    $SQL_ZV = "SELECT * FROM m_zeichenvorschrift WHERE ID_INDIKATOR='".$ind."'";
    $Ergebnis_ZV = queryMySQL($SQL_ZV);
    $farbwert = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_MAX');
    if(mysqli_num_rows($Ergebnis_ZV)==0){
        $farbwert = '66CC99';
    }
    return $farbwert;}
function getIndColor_MIN($ind){
    $SQL_ZV = "SELECT * FROM m_zeichenvorschrift WHERE ID_INDIKATOR='".$ind."'";
    $Ergebnis_ZV = queryMySQL($SQL_ZV);
    $farbwert = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_MIN');
    if(mysqli_num_rows($Ergebnis_ZV)==0){
        $farbwert = 'FFCC99';
    }
    return $farbwert;

}
function getIndValueBRD($ind,$time){
    $SQL = "Select * FROM m_indikatorwerte_" . $time . " where ID_INDIKATOR ='".$ind."' AND AGS = '99'" ;
    $rs = queryMySQL($SQL);
    $Rundung = getIndRundung($ind);
    $wert = @mysqli_result($rs, 0, 'INDIKATORWERT');
    if(empty($Rundung)){
        return $wert;
    }else{
        return $wert;
    }
}
/*--------------------------------------------------------
 * Error Codes and notes
 ---------------------------------------------------------*/
function getHCArray(){

    $hc_array = array();

    $SQL_HC = "SELECT  HC, HC_INFO FROM  m_hinweiscodes";
    $rs_hc = queryMySQL($SQL_HC);
    while ($row = mysqli_fetch_assoc($rs_hc)) {
        array_push($hc_array, array(
            'HC' => $row["HC"],
            'HC_KURZ' => $row["HC_INFO"]
        ));
    }
    return $hc_array;
}
function getHCText($hc){
    foreach (getHCArray() as $row) {
        if($row['HC'] == $hc){
            return $row["HC_KURZ"];
        }
    }
}
function getIndHC($ind,$ags,$time){
    $sqlquery = "SELECT i.HINWEISCODE
                FROM m_indikatorwerte_" . $time . " i, m_indikator_freigabe f, m_indikatoren z
                WHERE i.AGS =  '" . $ags . "'
                AND f.ID_INDIKATOR = i.ID_INDIKATOR
                AND f.ID_INDIKATOR =  '" . $ind . "'
                AND f.STATUS_INDIKATOR_FREIGABE = 3
                And z.ID_INDIKATOR = f.ID_INDIKATOR
                Group by i.INDIKATORWERT";

    $erg_query = queryMySQL($sqlquery);
    $value = @mysqli_result($erg_query, 0, 'HINWEISCODE');
    return $value;
}
//error codes
function getFCArray(){
    $fc_array = array();

    # get the FC Codes
    $SQL_FC = "SELECT FEHLERCODE,FEHLER_NAME,FEHLER_FARBCODE,FEHLER_BESCHREIBUNG FROM m_fehlercodes";
    $rs_fc = queryMySQL($SQL_FC);
    while ($row = mysqli_fetch_assoc($rs_fc)) {
        array_push($fc_array, array(
            'FC' => $row["FEHLERCODE"],
            'NAME' => $row["FEHLER_NAME"],
            'FARBE' => $row["FEHLER_FARBCODE"],
            'BESCHREIBUNG' => $row['FEHLER_BESCHREIBUNG']
        ));
    }
    return $fc_array;
}
//get the FC description
function getFCBeschreibung($fc){
    $sql = "SELECT FEHLER_BESCHREIBUNG FROM m_fehlercodes where FEHLERCODE =".$fc;
    $erg_query = queryMySQL($sql);
    $value = @mysqli_result($erg_query, 0, 'FEHLER_BESCHREIBUNG');
    return $value;
}
function getFCName($fc){
    $sql = "SELECT FEHLER_NAME FROM m_fehlercodes where FEHLERCODE =".$fc;
    $erg_query = queryMySQL($sql);
    $value = @mysqli_result($erg_query, 0, 'FEHLER_NAME');
    return $value;
}
function getFCFarbCode($fc){
    $sql = "SELECT FEHLER_FARBCODE FROM m_fehlercodes where FEHLERCODE =".$fc;
    $erg_query = queryMySQL($sql);
    $value = @mysqli_result($erg_query, 0, 'FEHLER_FARBCODE');
    return $value;
}

/***************************************************************************************************************
//Grundaktualität
 **************************************************************************************************************/
function getIndGrundakt($ags, $time){
    $SQL_AKT_YEAR = "SELECT INDIKATORWERT FROM m_indikatorwerte_" . $time . " WHERE ID_INDIKATOR = 'Z00AG' and AGS ='" . $ags . "' AND INDIKATORWERT <= " . $time . " ";
    $SQL_AKT_MON = "SELECT INDIKATORWERT FROM m_indikatorwerte_" . $time . " WHERE ID_INDIKATOR = 'Z01AG' and AGS ='" . $ags . "' AND INDIKATORWERT <= " . $time . " ";

    $rs_akt_year = queryMySQL($SQL_AKT_YEAR);
    $rs_akt_mon = queryMySQL($SQL_AKT_MON);
    if($time >= date("Y")){
        return "1/".$time;
    }
    else if(mysqli_num_rows($rs_akt_year)==0){
        return "nicht verfügbar";
    }else {
        return mysqli_result($rs_akt_mon, 0) . '/' . mysqli_result($rs_akt_year, 0);
    }
}
function getIndGrundakt_YEAR($ags, $time){
    $SQL_AKT_YEAR = "SELECT INDIKATORWERT FROM m_indikatorwerte_" . $time . " WHERE ID_INDIKATOR = 'Z00AG' and AGS ='" . $ags . "' AND INDIKATORWERT <= " . $time . " ";
    $rs_akt_year = queryMySQL($SQL_AKT_YEAR);
    if($time >= date("Y")){
        return $time;
    }
    else if(mysqli_num_rows($rs_akt_year)==0){
        return "nicht verfügbar";
    }else {
        return mysqli_result($rs_akt_year, 0);
    }
}
function getIndGrundakt_MONTH($ags, $time){
    $SQL_AKT_MON = "SELECT INDIKATORWERT FROM m_indikatorwerte_" . $time . " WHERE ID_INDIKATOR = 'Z01AG' and AGS ='" . $ags . "' AND INDIKATORWERT <= " . $time . " ";
    $rs = queryMySQL($SQL_AKT_MON);
    if($time >= date("Y")){
        return "1";
    }
    else if(mysqli_num_rows($rs)==0){
        return "nicht verfügbar";
    }else {
        return mysqli_result($rs, 0);
    }
}
function getGrundaktStat($ind){
    $SQL = "SELECT MITTLERE_AKTUALITAET_IGNORE FROM m_indikatoren where ID_INDIKATOR = '".$ind."'";
    $rs = queryMySQL($SQL);
    return intval(@mysqli_result($rs, 0, 'MITTLERE_AKTUALITAET_IGNORE'));
}
/*********************************************************************************************************************
//EXPORT
 ******************************************************************************************************************/
function getRasterLink($kartenlink){
    $sql_raster_alt = "SELECT * FROM d_kartenlink where ID='".$kartenlink."'";
    $rs = queryMySQL($sql_raster_alt);

    $rasterweite = array("Raster 100 m","Raster 200 m","Raster 500 m","Raster 1000 m","Raster 5000 m","Raster 10000 m");

    $jahr = @mysqli_result($rs, 0, 'JAHR');
    $indikator = @mysqli_result($rs, 0, 'INDIKATOR');
    $_SESSION["ID_IND"]=@mysqli_result($rs, 0, 'INDIKATOR');
    $raumgliederung = @mysqli_result($rs, 0, 'RAUMGLIEDERUNG');

    if(strpos($raumgliederung,'Raster') !== false){
        $raumgliederung = array_search($raumgliederung,$rasterweite);
    }

    $hintergrund = @mysqli_result($rs, 0, 'KARTENHINTERGRUND');
    $transparenz = @mysqli_result($rs, 0, 'TRANSPARENZ')/100;

    $anz_klassen = @mysqli_result($rs, 0, 'KLASSENANZAHL');
    $klassMethode = @mysqli_result($rs, 0, 'KLASSIFIKATIONSMETHODE');

    $zoom = @mysqli_result($rs, 0, 'ZOOM');
    if($zoom == 0){
        $zoom = 8;
    }
    $center = @mysqli_result($rs, 0, 'CENTER');
    $lat = "50.9307";
    $lng = "9.7558";
    if(strpos($center,'||') !== false){
        $koordinates = explode("||",$center);
        $lng = $koordinates[1];
        $lat = $koordinates[0];
    }
    if(strpos(strtolower ($hintergrund),'webatlas') !== false){
        $hintergrund = 'webatlas';
    }
    $darstellung = @mysqli_result($rs, 0, 'darstellung');

    if(empty($indikator) or is_null($indikator)){
        return false;
    }else {

        return "time=" . $jahr . "&ind=" . $indikator . "&rasterweite=" . $raumgliederung . "&baselayer=" . $hintergrund . "&opacity="
            . $transparenz . "&klassenanzahl=" . $anz_klassen . "&klassifizierung_raster=" . $klassMethode . "&zoom=" . $zoom . "&lat=" . $lat . "&lng=" . $lng . "&baselayer=" . $hintergrund . "&darstellung=" . $darstellung;
    }
}
//get the user LINK
function getSVGLink($link){
    $sql = "SELECT * FROM v_user_link_speicher where id='".$link."'";
    $rs = queryMySQL($sql);

    $result = @mysqli_result($rs,0,'array_value');

    if($result[0] . $result[1]==='a:' or empty($result) or is_null($result)){
        return false;
    }else {
        return $result;
    }
}
/*----------------------------------------------------------------------------
 * SPATIAL Queries
 -----------------------------------------------------------------------------*/
function getPostGreYear($year){
    $sql = "select PostGIS_Tabelle_Jahr from v_geometrie_jahr_viewer_postgis where Jahr_im_Viewer =".$year;
    $rs = queryMySQL($sql);
    $row = @mysqli_result($rs, 0, 'PostGIS_Tabelle_Jahr');
    return $row;
}
function getRaumgliederung_Stellenanzahl($raumgliederung){
    $SQL = "SELECT * FROM v_raumgliederung WHERE DB_Kennung = '".$raumgliederung."'";
    $rs = queryMySQL($SQL);
    return @mysqli_result($rs,0,'DB_AGS_Stellenanzahl');
}
function getAGSName($raumgliederung,$ags,$year){
    if(intval($year)==2017){
        $year= 2016;
    }
    $sql_string ="select gen from vg250_".$raumgliederung."_".$year."_grob where ags ='".$ags."'";
    $rs = queryPostGre($sql_string);
    $row = pg_fetch_row($rs);
    return $row[0];
}
/*--------------------------------------------------------------------------
 * CACHING
 ---------------------------------------------------------------------------*/
function checkCacheObject($indikator,$time,$raumgl,$ags){
    $query = "SELECT * FROM geojson_cache where INDIKATOR_ID = '".$indikator."' and TIME = ".$time." and RAUMGLIEDERUNG ='".$raumgl."' and AGS_ARRAY ='".$ags."'";
    $rs = queryPostGre($query);
    if(pg_num_rows($rs)==0){
        return false;
    }else{
        /*$year_now = date("Y");
        $month_now = date("m");
        while ($ro = pg_fetch_object($rs)) {
            $timestamp = $ro->timestamp;
            $year_stemp = substr($timestamp,0,4);
            $month_stemp = substr($timestamp,5,2);
        }
        if($year_now == $year_stemp and $month_now <= $month_stemp+4){
            return true;
        }else{
            clearCache();
            return false;
        }*/
        return true;
    }
}
function insertCacheJSONObject($indikator, $time, $raumgl, $ags, $json){
    date_default_timezone_set('Europe/Berlin');
    $date = date('Y-m-d H:i:s');
    $query = "INSERT INTO geojson_cache VALUES('".$indikator."','".$time."','".$raumgl."','".$ags."','".$json."','".$date."')";
    queryPostGre($query);
}
function getCacheJSONObject($indikator, $time, $raumgl, $ags){
    $query = "SELECT geo_json FROM geojson_cache where INDIKATOR_ID = '".$indikator."' and TIME = ".$time." and RAUMGLIEDERUNG ='".$raumgl."' and AGS_ARRAY ='".$ags."'";
    $rs = queryPostGre($query);
    while ($ro = pg_fetch_object($rs)) {
        return json_encode($ro->geo_json);
    }
}
function clearCache(){
    $query = "TRUNCATE geojson_cache";
    queryPostGre($query);
}
?>