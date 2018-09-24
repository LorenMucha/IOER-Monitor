<?php
header('Content-type: text/html; charset=utf-8');
include("../database/db_manager.php");

$Verbindung = getMySQLConnection();

$ags = $_POST["ags"];
$name = $_POST["name"];
$wert = $_POST["wert"];
$einheit = $_POST["einheit"];
$ID_INDIKATOR = $_POST["indikator"];
$Jahr_Auswahl = $_POST["jahr"];
$raumgliederung = $_POST["raumgliederung"];
$ags_array = array();
$raumgliederung_name = $_POST["raumgliederung_name"];
$raeumliche_ausdehnung = $_POST["raeumliche_ausdehnung"];
//create the array
$ags_data = $_POST["map_array"];

foreach($ags_data as $item){
    array_push($ags_array,array("ags"=>$item["ags"]));
}
//Raumgliederung
$SQL_Raumgliederung_Stellenanzahl = "SELECT * FROM v_raumgliederung WHERE DB_Kennung = '".$raumgliederung."'";
$Ergebnis_Raumgliederung_Stellenanzahl = mysqli_query($Verbindung,$SQL_Raumgliederung_Stellenanzahl);
$Raumgliederung_Stellenanzahl = @mysqli_result($Ergebnis_Raumgliederung_Stellenanzahl,0,'DB_AGS_Stellenanzahl');
if (!$Ergebnis_Raumgliederung_Stellenanzahl) {
    die('Konnte Abfrage Raumgliederung nicht ausführen:' . mysqli_error($Verbindung));
}

//Indikator Info
$SQL_Indikator_Info = "SELECT * FROM m_indikatoren WHERE ID_INDIKATOR='".$ID_INDIKATOR."'";
$Ergebnis_Indikator_Info = mysqli_query($Verbindung,$SQL_Indikator_Info);
$Rundung = @mysqli_result($Ergebnis_Indikator_Info,0,'RUNDUNG_NACHKOMMASTELLEN');
$Ind_Beschreibung = @mysqli_result($Ergebnis_Indikator_Info,0,'INDIKATOR_NAME');

// Abfrage für Min, Max
$SQL_Indikatorenwerte = "SELECT MAX(INDIKATORWERT) as Maximum,MIN(INDIKATORwert) as Minimum FROM m_indikatorwerte_".$Jahr_Auswahl." WHERE (FEHLERCODE < '1' OR FEHLERCODE IS NULL) AND ID_INDIKATOR = '".$ID_INDIKATOR
    ."' "." AND CHAR_LENGTH(ags) = '".$Raumgliederung_Stellenanzahl."' AND VGL_AB = '0';";

$Ergebnis_Indikatorenwerte = mysqli_query($Verbindung,$SQL_Indikatorenwerte);
if (!$Ergebnis_Indikatorenwerte) {
    die('Konnte Abfrage Indikatorwerte nicht ausführen:' . mysqli_error($Verbindung));
}

$W_Min = round(@mysqli_result($Ergebnis_Indikatorenwerte,0,'Minimum'),$Rundung);
$W_Max = round(@mysqli_result($Ergebnis_Indikatorenwerte,0,'Maximum'),$Rundung);

$wertebereich = $W_Max - $W_Min;
$prozentwert = $wertebereich/100;

// Statistische Kenngrößen ermitteln:
// ----------------------------------
//Create Temp Table
$Ergebnis_drop_table = mysqli_query($Verbindung,"DROP TABLE `t_temp_indikatoren_stat`");
$SQL_temp_table = "CREATE TEMPORARY TABLE `t_temp_indikatoren_stat` (
  `ID` int NOT NULL,
  `AGS` varchar(10) NOT NULL,
  `WERT` double default NULL,
   PRIMARY KEY  (`ID`)
  ) ENGINE=HEAP DEFAULT CHARSET=utf8;";

$Ergebnis_temp_table = mysqli_query($Verbindung,$SQL_temp_table);

$id = 0;
foreach($ags_array as $item){
    $Query_IND = "Select Indikatorwert as wert, AGS as id from m_indikatorwerte_".$Jahr_Auswahl." where AGS='".$item['ags']."' AND ID_INDIKATOR ='".$ID_INDIKATOR."'";
    $Ergebnis_Query = mysqli_query($Verbindung,$Query_IND);
    $Wert = @mysqli_result($Ergebnis_Query,0,'wert');
    $AGS = @mysqli_result($Ergebnis_Query,0,'id');

    $id +=1;

    // Tabelle füllen
    $SQL_DS_UPD = "INSERT INTO `t_temp_indikatoren_stat` (ID,WERT,AGS) VALUES ('".$id."','".$Wert."','".$AGS."')";

    $Ergebnis_DS_UPD = mysqli_query($Verbindung,$SQL_DS_UPD);

}

$rows_stat = [];
$SQL_Array = "SELECT * FROM `t_temp_indikatoren_stat`";
$Ergebnis_Array_Stat = mysqli_query($Verbindung,$SQL_Array);
while($row = mysqli_fetch_array($Ergebnis_Array_Stat))
{
    array_push($rows_stat,doubleval($row["WERT"]));
}
//calc the median
$Median_Wert = calculate_median($rows_stat);

$SQL_Stat = "SELECT
						AVG(WERT) AS DURCHSCHNITT,  
						SUM(WERT) AS SUMME, 
						STDDEV_SAMP(WERT) AS STANDARDABWEICHUNG, 
						MAX(WERT) AS MAXIMUM, 
						MIN(WERT) AS MINIMUM, 
						COUNT(AGS) AS COUNT
						FROM `t_temp_indikatoren_stat`";

$Ergebnis_Stat = mysqli_query($Verbindung,$SQL_Stat);

// ---------
$Ar_Mittel = @mysqli_result($Ergebnis_Stat,0,'DURCHSCHNITT');
$Summe = @mysqli_result($Ergebnis_Stat,0,'SUMME');
$Standardabweichung = @mysqli_result($Ergebnis_Stat,0,'STANDARDABWEICHUNG');
$Maximum = @mysqli_result($Ergebnis_Stat,0,'MAXIMUM'); // besser aus Werten ermitteln, wegen 1 oder mehrerer Treffer
$Minimum = @mysqli_result($Ergebnis_Stat,0,'MINIMUM'); // besser aus Werten ermitteln, wegen 1 oder mehrerer Treffer
$Medianstelle = @floor((@mysqli_result($Ergebnis_Stat,0,'COUNT')+1)/2);
$n_Stichproben = @mysqli_result($Ergebnis_Stat,0,'COUNT');
// ---------

// Test für Stichprobenzahl
$SQL_test = "SELECT * FROM `t_temp_indikatoren_stat`";
$Ergebnis_test = mysqli_query($Verbindung,$SQL_test);
$stichprobentestanz=0;
while(@mysqli_result($Ergebnis_test,$stichprobentestanz,'AGS'))
{
    $stichprobentestanz++;
}

$Stabw_u = $Ar_Mittel - $Standardabweichung;
$Stabw_o = $Ar_Mittel + $Standardabweichung;
$Stabw_2u = $Ar_Mittel - (2*$Standardabweichung);
$Stabw_2o = $Ar_Mittel + (2*$Standardabweichung);

function calculate_median($arr) {
    $count = count($arr); //total numbers in array
    $middleval = floor(($count-1)/2); // find the middle value, or the lowest middle value
    if($count % 2) { // odd number, middle is the median
        $median = $arr[$middleval];
    } else { // even number, calculate avg of 2 medians
        $low = $arr[$middleval];
        $high = $arr[$middleval+1];
        $median = (($low+$high)/2);
    }
    return $median;
}

//HTML DOC0
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style type="text/css">

        .td_kopftabelle {
            text-align: left;
            padding-top: 2px;
            padding-right: 15px;
            padding-bottom: 2px;
            padding-left: 15px;
            border: 1px solid #CCC;
            vertical-align: top;
        }


        a:link {
            text-decoration: none;
            color: #444;
        }
        a {
            cursor: default;
        }
        a:visited {
            text-decoration: none;
            color: #444;
        }
        a:hover {
            text-decoration: none;
            color: #444;
        }
        a:active {
            text-decoration: none;
            color: #444;
        }
        @media print {
            .nicht_im_print {display:none;}
        }

    </style>
</head>

<body>

<div style="border: #999999 solid 0px; padding:10px; ">
    <h5 style="white-space: nowrap;">Wert für <?php

        echo $name;
        // Unterscheidung nach Land-/Kreis-/Gemeindeschlüssel
        if(strlen($ags) == 2) echo ' (Landesschl&uuml;ssel: '.$ags.')';
        if(strlen($ags) == 5) echo ' (Kreisschl&uuml;ssel: '.$ags.')';
        if(strlen($ags) == 9) echo ' (ags: '.$ags.')';

        ?>
        in Bezug auf statistische Kenngrößen der räumlichen Auswahl und <br />
        des gewählten Indikators: <?php echo $Ind_Beschreibung; ?> (<?php echo $Jahr_Auswahl; ?>)</h5>
    <table style="width:98%; border:0px; border-collapse:collapse;">
        <tr>
            <td valign="top" class="transp_hintergrund" style="width:200px; padding:0px;">


                <table style="width:98%; border:0px; border-collapse:collapse;">
                    <tr class="grauer_hintergrund">
                        <td colspan="3" valign="top" class="td_kopftabelle"><strong>Statistische Kenngrößen</strong></td>
                    </tr>
                    <tr>
                        <td colspan="2" valign="top" class="td_kopftabelle">Einheit:</td>
                        <td valign="top" class="td_kopftabelle"><?php echo $einheit; ?></td>
                    </tr>
                    <tr>
                        <td colspan="2" valign="top" class="td_kopftabelle">Gebiet:</td>
                        <!--TODO-->
                        <td valign="top" class="td_kopftabelle"><?php echo $name; ?></td>
                    </tr>
                    <tr>
                        <td colspan="2" valign="top" class="td_kopftabelle">Raumgliederung:</td>
                        <td valign="top" class="td_kopftabelle"><?php
                            // Stringverarbeitung für Sondergebiete (Löschen von Zus. Textbausteinen)
                            echo $raumgliederung_name; ?>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" valign="top" class="td_kopftabelle">Anzahl erfasster Gebietseinheiten (n):</td>
                        <td valign="top" class="td_kopftabelle"><?php echo $n_Stichproben; ?>&nbsp;</td>
                    </tr>


                    <tr>
                        <td colspan="3" valign="top" class="td_kopftabelle">&nbsp;</td>
                    </tr>
                    <tr>
                        <td valign="top" class="td_kopftabelle"><div style="background-color:#33AA33;width:10px; height:10px;">&nbsp;</div></td>
                        <td valign="top" class="td_kopftabelle">Arithmetisches Mittel: &micro;</td>
                        <td valign="top" class="td_kopftabelle"><?php echo number_format($Ar_Mittel,$Rundung, ',', '.')." "; ?></td>
                    </tr>
                    <tr>
                        <td valign="top" class="td_kopftabelle"><div style="background-color:#5555DD;width:10px; height:10px;">&nbsp;</div></td>
                        <td valign="top" class="td_kopftabelle">Median:</td>
                        <td valign="top" class="td_kopftabelle"><?php

                                echo number_format($Median_Wert,$Rundung, ',', '.');

                            ?></td>
                    </tr>
                    <tr>
                        <td valign="top" class="td_kopftabelle"><div style="background-color:#77DD77;width:10px; height:10px;">&nbsp;</div></td>
                        <td valign="top" class="td_kopftabelle">Standardabweichung: &#963; (&micro;-&#963; ... &micro;+&#963;)</td>
                        <td valign="top" class="td_kopftabelle">
                            <?php echo number_format($Standardabweichung,$Rundung, ',', '.')." "; ?>
                            (<?php
                            // Unterste wertegrenze bei Ausgabe beachten:
                            if($Stabw_u < $W_Min)
                            {
                                echo number_format($W_Min,$Rundung, ',', '.');
                            }
                            else
                            {
                                echo number_format($Stabw_u,$Rundung, ',', '.');
                            }
                            ?> ... <?php echo number_format($Stabw_o,$Rundung, ',', '.'); ?>)

                        </td>
                    </tr>
                    <tr>
                        <td valign="top" class="td_kopftabelle"><div style="background-color:#99BB99;width:10px; height:10px;">&nbsp;</div></td>
                        <td valign="top" class="td_kopftabelle">Doppelte Standardabw.: 2&#963; (&micro;-2&#963; ... &micro;+2&#963;)</td>
                        <td valign="top" class="td_kopftabelle"><?php
                            echo number_format($Standardabweichung2=(2*$Standardabweichung),$Rundung, ',', '.')." ";
                            ?>
                            (<?php
                            // Unterste wertegrenze bei Ausgabe beachten:
                            if($Stabw_2u < $W_Min)
                            {
                                echo number_format($W_Min,$Rundung, ',', '.');
                            }
                            else
                            {
                                echo number_format($Stabw_2u,$Rundung, ',', '.');
                            }


                            ?> ... <?php echo number_format($Stabw_2o,$Rundung, ',', '.'); ?>) </td>
                    </tr>
                    <tr valign="top">
                        <td valign="top" class="td_kopftabelle">&nbsp;</td>
                        <td colspan="2" valign="top" class="td_kopftabelle">Falls die oben genannten Grenzen der Standardabweichung über den wertebereich hinaus reichen, werden diese durch das Minimum oder das Maximum des wertebereichs ersetzt.</td>
                    <tr valign="top" class="grauer_hintergrund">
                        <td colspan="3" valign="top" class="td_kopftabelle"><strong>Lokalisierung des wertes im Histogramm</strong></td>
                    </tr>
                    <tr>
                        <td width="40" valign="top" style="padding-top:5px;" class="td_kopftabelle"><div style="background-color:#DD5555;width:10px; height:10px;">&nbsp;</div></td>
                        <td width="282" valign="top" class="td_kopftabelle">Wert für  <strong>
                                <?php

                                echo $name;
                                // Unterscheidung nach Land-/Kreis-/Gemeindeschlüssel
                                if(strlen($ags) == 2) echo ' (Landesschl&uuml;ssel: '.$ags.')';
                                if(strlen($ags) == 5) echo ' (Kreisschl&uuml;ssel: '.$ags.')';
                                if(strlen($ags) == 9) echo ' (ags: '.$ags.')';

                                ?>
                            </strong>:</td>
                        <td width="462" valign="top" class="td_kopftabelle">
                            <?php echo $wert?>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>
<?php
mysqli_close($Verbindung);
?>