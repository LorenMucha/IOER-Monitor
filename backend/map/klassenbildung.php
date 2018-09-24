<?php
session_start();
header('Content-type: application/json; charset=utf-8');
include("../database/db_manager.php");

$klassifizierung = $_GET['KLASSIFIZIERUNG'];
$klassenanzahl= $_GET['KLASSENANZAHL'];
$hex_min = $_GET["hex_min"];
$hex_max = $_GET["hex_max"];
$indikator = $_GET["indikator"];
$raumgliederung = $_GET["raumgl"];
$time = $_GET["time"];

$einheit = getIndEinheit($indikator);

//echo $indikator." || ".$time." || ".$raumgliederung." || ".$klassifizierung." || ".$klassenanzahl;

$temp_klassen = array();
$verteilung_werte = array();
$fuellung_werte = array();

try {
    //Raumgliederung
    $Raumgliederung_Stellenanzahl = getRaumgliederung_Stellenanzahl($raumgliederung);

    $fuellung_werte['Rundung'] = getIndRundung($indikator);

    // Abfrage für Min, Max der Indikatorwerte
    $SQL_Indikatorenwerte = "SELECT MAX(INDIKATORWERT) as Maximum,MIN(INDIKATORWERT) as Minimum FROM m_indikatorwerte_".$time
        ." WHERE (FEHLERCODE < '1' OR FEHLERCODE IS NULL) AND ID_INDIKATOR = '".$indikator
        ."' "." AND CHAR_LENGTH(AGS) = '".$Raumgliederung_Stellenanzahl."' AND VGL_AB = '0';";

    $Ergebnis_Indikatorenwerte = queryMySQL($SQL_Indikatorenwerte);

    // Füllen der Session-Variablen
    $fuellung_werte['Indikator_Wert_min'] = round(@mysqli_result($Ergebnis_Indikatorenwerte,0,'Minimum'),$fuellung_werte['Rundung'])+1000000000;
    $fuellung_werte['Indikator_Wert_max'] = round(@mysqli_result($Ergebnis_Indikatorenwerte,0,'Maximum'),$fuellung_werte['Rundung'])+1000000000;

    $Wertebereich = $fuellung_werte['Indikator_Wert_max'] - $fuellung_werte['Indikator_Wert_min'];
    $fuellung_werte['Wertebereich_ein_Prozent'] = $Wertebereich/100;

    // Werte-Min-Max
    $i_min = $fuellung_werte['Indikator_Wert_min'];
    $i_max = $fuellung_werte['Indikator_Wert_max'];

    //echo $i_min." || ".$i_max;

    // Werte für Verteilungsberechnung
    $i_Wertebereich = $i_max - $i_min; // muss an der Stelle auch immer positiv sein (durch +1000000000 sichergestellt), da Werte aus DB kommen und >0 sein sollten
    $i_1Prozent_Wertebereich = $i_Wertebereich/100;
    if(!$i_1Prozent_Wertebereich)  $i_1Prozent_Wertebereich=1;

    $AWerte_SQL_PG=''; // Variable leeren
    $AW_Zaehler = 0;

    $AWerte_SQL_PG = $AWerte_SQL_PG.")"; // SQL-Klammer schließen
    //vg_250_2017 liegt nicht vor deshalb 2016
    $SQL_PostGIS = "SELECT ags FROM vg250_".$raumgliederung."_".getPostGreYear($time)."_grob WHERE gid >= '0'";
    $ERGEBNIS_PGSQL_AGS =  @pg_query(getPostGreConnection(),$SQL_PostGIS);

    // -----------------------------------------------------------------------------------------------------------------------------------------------
    // gefundene AGS aus vorhandenen Geometrien speichern (für gezielte MySQL-Abfragen)

    while($PG_Zeile = @pg_fetch_assoc($ERGEBNIS_PGSQL_AGS))
    {
        $AWerte_AGS[$AW_Zaehler] = $PG_Zeile['ags'];
        $AW_Zaehler++;
    }

    for($i_AGS = 0 ; $i_AGS < $AW_Zaehler ; $i_AGS++)
    {
        $SQL_Eingrenzung_DS = " AND AGS = '".$AWerte_AGS[$i_AGS]."' ";

        // Abfrage für Min, Max sowie Einzelwerte
        $SQL_Indikatorenwerte = "SELECT AGS,INDIKATORWERT,FEHLERCODE FROM m_indikatorwerte_".$time." WHERE ID_INDIKATOR = '".$indikator
            ."' ".$SQL_Eingrenzung_DS." AND CHAR_LENGTH(AGS) = '".$Raumgliederung_Stellenanzahl."' AND VGL_AB = '0'";
        $Ergebnis_Indikatorenwerte = mysqli_query(getMySQLConnection(),$SQL_Indikatorenwerte);

        // Einzelwerte nach AGS in $AGS_mit_Werten eintragen
        $AGS_mit_Werten[$AWerte_AGS[$i_AGS]] = round(@mysqli_result($Ergebnis_Indikatorenwerte,$i_i,'INDIKATORWERT'),$fuellung_werte['Rundung'])+1000000000;


        $i_Prozentwert = floor((round($AGS_mit_Werten[$AWerte_AGS[$i_AGS]],$fuellung_werte['Rundung']) - $i_min) / $i_1Prozent_Wertebereich);

        $verteilung_werte[$i_Prozentwert]++;

    }

    // Max-der Verteilung ermitteln
    for($i=0 ; $i<=100 ; $i++)
    {
        if($verteilung_werte[$i] > $i_Verteilung_max)
        {
            $i_Verteilung_max = $verteilung_werte[$i];
            $verteilung_werte['Max_Prozentzahl'] = $i;
        }
    }
    $verteilung_werte['Max'] = $i_Verteilung_max; // Max-Anzahl der Verteilung in Session verfügbar halten


    // Teiler für Darstellung ermitteln
    $verteilung_werte['NormTeiler'] = $i_Verteilung_max/30; // 30 Stufen als Default-Teiler

    //echo json_encode($verteilung_werte);
    //echo $i_1Prozent_Wertebereich;

    // Standard-ZV mit ID=1 verwenden
    $SQL_ZV = "SELECT * FROM m_zeichenvorschrift WHERE ID_INDIKATOR='".$indikator."'";
    $Ergebnis_ZV = mysqli_query(getMySQLConnection(),$SQL_ZV);

    $TYP_FUELLUNG = @mysqli_result($Ergebnis_ZV,0,'TYP_FUELLUNG');
    $farbwerte_min = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_MIN');
    $farbwerte_max = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_MAX');
    $LeerFarbe = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_LEER');
    $Strichfarbe = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_KONTUR');
    $Strichfarbe_MouseOver = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_MOUSEOVER');
    $Textfarbe_Labels = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_TEXT');


    $Strichfarbe_BAB_Signatur = '1';

    // ZusatzebenenfÃ¤rbung
    $Strichfarbe_BAB = "EEEE00";
    $Strichfarbe_GEW = "000099";

    if(is_null($farbwerte_min)){
        $farbwerte_min = "FFCC99";
    }
    if(is_null($farbwerte_max)){
        $farbwerte_max = "66CC99";
    }

    // Für Differenzkarten über Tabellentool wichtig
    $Farbwert_Diff_min = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_DIFF_MIN');
    $Farbwert_Diff_max = @mysqli_result($Ergebnis_ZV,0,'FARBWERT_DIFF_MAX');

    //set by color scale
    if(empty($hex_max)) {

    // Min und Max erfassen (sicher sinnvoll jeweils über gesamt Deutschland => bessere Vergleichbarkeit unterschiedlicher Karten)
        $R_min_dezimal = hexdec(substr($farbwerte_min, 0, 2));
        $G_min_dezimal = hexdec(substr($farbwerte_min, 2, 2));
        $B_min_dezimal = hexdec(substr($farbwerte_min, 4, 2));

    // ---------------> prüfen < oder > und bei Bedarf umkehren!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        $R_max_dezimal = hexdec(substr($farbwerte_max, 0, 2));
        $G_max_dezimal = hexdec(substr($farbwerte_max, 2, 2));
        $B_max_dezimal = hexdec(substr($farbwerte_max, 4, 2));
    }else{
        // Min und Max erfassen (sicher sinnvoll jeweils über gesamt Deutschland => bessere Vergleichbarkeit unterschiedlicher Karten)
        $R_min_dezimal = hexdec(substr($hex_min, 0, 2));
        $G_min_dezimal = hexdec(substr($hex_min, 2, 2));
        $B_min_dezimal = hexdec(substr($hex_min, 4, 2));

    // ---------------> prüfen < oder > und bei Bedarf umkehren!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        $R_max_dezimal = hexdec(substr($hex_max, 0, 2));
        $G_max_dezimal = hexdec(substr($hex_max, 2, 2));
        $B_max_dezimal = hexdec(substr($hex_max, 4, 2));
    }
    // Prüfen ob Farbwert auf- oder absteigend ist
    if($R_max_dezimal == $R_min_dezimal)
    {
        $R_Verhaeltniss = "gleich";
    }
    else
    {
        if($R_max_dezimal > $R_min_dezimal)
        {
            $R_Differenz = abs($R_max_dezimal - $R_min_dezimal);
            $R_Verhaeltniss = "aufsteigend";
        }
        else
        {
            $R_Differenz = abs($R_min_dezimal - $R_max_dezimal);
            $R_Verhaeltniss = "absteigend";
        }
    }

    if($G_max_dezimal == $G_min_dezimal)
    {
        $G_Verhaeltniss = "gleich";
    }
    else
    {
        if($G_max_dezimal > $G_min_dezimal)
        {
            $G_Differenz = abs($G_max_dezimal - $G_min_dezimal);
            $G_Verhaeltniss = "aufsteigend";
        }
        else
        {
            $G_Differenz = abs($G_min_dezimal - $G_max_dezimal);
            $G_Verhaeltniss = "absteigend";
        }
    }


    if($B_max_dezimal == $B_min_dezimal)
    {
        $B_Verhaeltniss = "gleich";
    }
    else
    {
        if($B_max_dezimal > $B_min_dezimal)
        {
            $B_Differenz = abs($B_max_dezimal - $B_min_dezimal);
            $B_Verhaeltniss = "aufsteigend";
        }
        else
        {
            $B_Differenz = abs($B_min_dezimal - $B_max_dezimal);
            $B_Verhaeltniss = "absteigend";
        }
    }



    switch ($R_Verhaeltniss) {
        case "gleich":
            $R = 0;
            break;
        case "aufsteigend":

            $R = $R_Differenz/100;

            break;
        case "absteigend":
            $R = ($R_Differenz/100)*(-1);
            break;
    }

    switch ($G_Verhaeltniss) {
        case "gleich":
            $G = 0;
            break;
        case "aufsteigend":
            $G = $G_Differenz/100;
            break;
        case "absteigend":
            $G = ($G_Differenz/100)*(-1);

            break;
    }

    switch ($B_Verhaeltniss) {
        case "gleich":
            $B = 0;
            break;
        case "aufsteigend":
            $B = $B_Differenz/100;
            break;
        case "absteigend":
            $B = ($B_Differenz/100)*(-1);
            break;
    }

    // Eckdaten sammeln und aufbereiten
    // ------------------------------------------

    // Rundungs-10er-Potenz verarbeitbar erfassen
    $Rundung = 1;
    while($fuellung_werte['Rundung'] > 0 and $Rdg=($Rundungszaehler+1) <= $fuellung_werte['Rundung'])
    {
        $Rundungszaehler++;
        if($Rundungszaehler == 1)
        {
            $Rundung=10;
        }
        else
        {
            $Rundung = $Rundung*10;
        }

    }

    // Min Max korrekt gerundet
    // evtl. doch besser normal gerundet:
    $fuellung_werte['Indikator_Wert_min_Dok_rounded'] = $fuellung_werte['Indikator_Wert_min'];
    $fuellung_werte['Indikator_Wert_max_Dok_rounded'] = $fuellung_werte['Indikator_Wert_max'];

    // Test auf gleiche Ober- bzw. Untergrenzenwerte => entspricht nur einem einzigen ausgewählten Objekt
    if($fuellung_werte['Indikator_Wert_min'] != $fuellung_werte['Indikator_Wert_max'])
    {

        // Häufigkeitsverteilte Klassen und Histogramm definieren
        // --------------------------------------------------------------------------------

        if($klassifizierung == "haeufigkeit")
        {

            $HistTeileGefuellt = 0;
            for($i=0 ; $i <= 100 ; $i++)
            {
                // Gesamtanz. der Raumeinheiten für Klassengenerierung nach Anzahl (Auflösung)
                $Einheiten_Anz = $Einheiten_Anz + $verteilung_werte[$i];
                // Gesamtzahl gefüllter Histogramm-Teile (nicht die GeoObjekte an sich) ermitteln
                if($verteilung_werte[$i]) $HistTeileGefuellt++;
            }

            // max. Klassen-Auflösung beschränken
            if($HistTeileGefuellt < $klassenanzahl)
            {
                $KlassAufloesg_korrigiert = $HistTeileGefuellt;
            }
            else
            {
                $KlassAufloesg_korrigiert = $klassenanzahl;
            }

            // Auflösung wird übergeben und ist ein Ziel-Richtwert für die Klassenanzahl (wird nicht überschritten aber evtl. leicht unterschritten .... gut?)
            $Klassengroesse = @(1 * ($Einheiten_Anz / $KlassAufloesg_korrigiert)); // weniger als 1 => mehr Klassen!

            // ------ Korrektur der Klassengröße bei Extremverteilungen (sehr viele Objekte in einer einzigen Verteilungs-Prozent-Klasse) ----
            // Finden des Verteilungs-Maximums
            for($i=0 ; $i <= 100 ; $i++)
            {
                if($Vi_max < $verteilung_werte[$i])
                {
                    // neues Max setzen
                    $Vi_max = $verteilung_werte[$i];
                    // Gesamt-Objektzahl bestimmen
                    $Vi_gesamt = $Vi_gesamt + $verteilung_werte[$i];
                }
            }
            // Korrektur durch Vergleich der Extremballung mit der restlichen Verteilungsmenge
            if($Vi_gesamt - $Vi_max <= $Vi_max)
            {
                $Klassengroesse = @(1 * (($Einheiten_Anz - $Vi_max) / $KlassAufloesg_korrigiert)); // weniger als 1 => mehr Klassen!
            }
            // ------ ------


            // Ersetzung für feste Klassenzahl
            $BasisKlasse = $Klassengroesse;

            $i_Klassen = 0;  // Laufvariable für Klassen setzen
            for($i=0 ; $i <= 100 ; $i++)
            {
                // alte Berechnung: $BasisKlasse = $verteilung_werte['Max']/$klassenanzahl; // <--------------- Durch bestimmten Wert teilen, um Klassenzahl zu erhöhen

                // Klassenfüllung
                $Klassen_Volumen = $Klassen_Volumen + $verteilung_werte[$i];

                // neue Klasse setzen wenn Max-Wert erreicht oder $i bei 100=Ende
                if($Klassen_Volumen >= $BasisKlasse or $i==100)
                {

                    // Ober- / Untergrenzen erfassen
                    if($i_Klassen > 0)
                    {
                        // in Prozent
                        $temp_klassen[$i_Klassen]['Untergrenze'] =  $i_untergr;
                        $temp_klassen[$i_Klassen]['Obergrenze'] =  $i;

                        // Klassengrenzen als Werte setzen
                        $temp_klassen[$i_Klassen]['Wert_Untergrenze'] = (ceil(($fuellung_werte['Indikator_Wert_min'] +
                                    ($temp_klassen[$i_Klassen]['Untergrenze'] * $fuellung_werte['Wertebereich_ein_Prozent']))*$Rundung)/$Rundung);
                        $temp_klassen[$i_Klassen]['Wert_Obergrenze'] = (ceil(($fuellung_werte['Indikator_Wert_min'] +
                                    ($temp_klassen[$i_Klassen]['Obergrenze'] * $fuellung_werte['Wertebereich_ein_Prozent']))*$Rundung)/$Rundung);


                    }
                    else
                    {
                        // in Prozent
                        $temp_klassen[$i_Klassen]['Untergrenze'] =  '0';
                        $temp_klassen[$i_Klassen]['Obergrenze'] =  $i;

                        // Klassengrenzen als Werte setzen
                        $temp_klassen[0]['Wert_Untergrenze'] = $fuellung_werte['Indikator_Wert_min_Dok_rounded'];
                        $temp_klassen[0]['Wert_Obergrenze'] = (ceil(($fuellung_werte['Indikator_Wert_min'] +
                                    ($temp_klassen[$i_Klassen]['Obergrenze'] * $fuellung_werte['Wertebereich_ein_Prozent']))*$Rundung)/$Rundung);
                    }


                    // Korrektur für oberste Klasse ... sonst evtl Rundungsfehler bei Rechenoperation
                    if($i==100)
                    {
                        $temp_klassen[$i_Klassen]['Wert_Obergrenze'] = $fuellung_werte['Indikator_Wert_max_Dok_rounded'];
                        $temp_klassen[$i_Klassen]['Obergrenze'] = 100;
                    }

                    // Nummer der nächsten Klasse
                    $i_Klassen++;
                    // Zurücksetzen der Größen-Ermittlungsvariable
                    $Klassen_Volumen = 0;
                    // behalten der Schwelle
                    $i_untergr = $i;
                    //}
                }
            }
        }

        // Gleichabständige Klassen (hier dennoch auf die 100er-Teilung bezogen, da dies der Rundung, die oft nicht mehr als 2 Stellig ist, entgegen kommt
        // -----------------------------------------------------------------------------------------------------------------------------------------------

        if($klassifizierung == "gleich")
        {
            // Max. Gefüllte Prozenteinheiten ermitteln und max Klassenauflösung festsetzen
            for($i=0 ; $i <= 100 ; $i++)
            {
                // Gesamtanz. der Raumeinheiten für Klassengenerierung nach Anzahl (Auflösung)
                $Einheiten_Anz = $Einheiten_Anz + $verteilung_werte[$i];
                // Gesamtzahl gefüllter Histogramm-Teile ermitteln
                if($verteilung_werte[$i]) $HistTeileGefuellt++;
            }
            // max. Klassen-Auflösung beschränken
            // max. Klassen-Auflösung beschränken
            if($HistTeileGefuellt < $klassenanzahl)
            {
                $KlassAufloesg_korrigiert = $HistTeileGefuellt;
            }
            else
            {
                $KlassAufloesg_korrigiert = $klassenanzahl;
            }


            $Klassengroesse_in_einProzenteinheiten = 100/$KlassAufloesg_korrigiert;

            $i_Klassen = 0;  // Laufvariable für Klassen setzen
            while($i_Klassen < $KlassAufloesg_korrigiert)
            {
                $Klassengr_floor = floor($Klassengroesse_in_einProzenteinheiten*$Rundung)/$Rundung;
                $Rest = $Rest + $Klassengroesse_in_einProzenteinheiten - $Klassengr_floor;
                if($Rest >= 1)
                {
                    $Klassengr_floor++;
                    $Rest = 0;
                }

                // Ober- / Untergrenzen erfassen
                if($i_Klassen > 0)
                {
                    $temp_klassen[$i_Klassen]['Untergrenze'] = $temp_klassen[$ivorher=($i_Klassen-1)]['Obergrenze'];
                }
                else
                {
                    $temp_klassen[$i_Klassen]['Untergrenze'] = '0';
                }
                $temp_klassen[$i_Klassen]['Obergrenze'] = $temp_klassen[$i_Klassen]['Untergrenze'] + $Klassengr_floor;



                $temp_klassen[$i_Klassen]['Wert_Untergrenze'] = (ceil(($fuellung_werte['Indikator_Wert_min'] +
                            ($temp_klassen[$i_Klassen]['Untergrenze'] * $fuellung_werte['Wertebereich_ein_Prozent']))*$Rundung)/$Rundung);
                $temp_klassen[$i_Klassen]['Wert_Obergrenze'] = (ceil(($fuellung_werte['Indikator_Wert_min'] +
                            ($temp_klassen[$i_Klassen]['Obergrenze'] * $fuellung_werte['Wertebereich_ein_Prozent']))*$Rundung)/$Rundung);


                // Korrektur für Untergrenze der Klasse "0" ... sonst evtl Rundungsfehler bei Rechenoperation
                if($i_Klassen == 0) $temp_klassen[0]['Wert_Untergrenze'] = $fuellung_werte['Indikator_Wert_min_Dok_rounded'];
                // Korrektur für oberste Klasse ... sonst evtl Rundungsfehler bei Rechenoperation
                if($i_Klassen == ($KlassAufloesg_korrigiert-1))
                {
                    $temp_klassen[$i_Klassen]['Wert_Obergrenze'] = $fuellung_werte['Indikator_Wert_max_Dok_rounded'];
                    $temp_klassen[$i_Klassen]['Obergrenze'] = 100;
                }

                $i_Klassen++; // Nummer der Klasse
            }

        }

        // Vermerk über wirkliche Anzahl berechneter Klassen
        $_SESSION['Temp']['KlassenAnz'] = $i_Klassen;

        // Farbgebung einfließen lassen
        // -------------------------------------------------------------------------------------------------------

        // Letzte Hochstufung rückgängig machen (Klassennummer nicht existent, da Schleife beendet)
        $i_Klassen--;
        if(!$i_Klassen) $i_Klassen = 1; // Fehler bei Auswahl von nur einem Polygon verhindern (dumm, aber schöner)
        $Spaltwert = 100/($i_Klassen);
        if(strlen($R_hex = dechex(round(abs($Ri=$R_max_dezimal),0))) < 2) $R_hex = '0'.$R_hex; // jeweils 0 Vor Einstellige Ergebnisse setzen
        if(strlen($G_hex = dechex(round(abs($Gi=$G_max_dezimal),0))) < 2) $G_hex = '0'.$G_hex;
        if(strlen($B_hex = dechex(round(abs($Bi=$B_max_dezimal),0))) < 2) $B_hex = '0'.$B_hex;
        $temp_klassen[0]['Farbwert'] = $R_hex.$G_hex.$B_hex;

        for($Klasse = 0 ; $Klasse <= $i_Klassen ; $Klasse++)
        {
            // Farbgebung für Klasse
            if(strlen($R_hex = dechex(round(abs($Ri=$R_max_dezimal-($Spaltwert*$Klasse*$R)),0))) < 2) $R_hex = '0'.$R_hex; // jeweils 0 Vor Einstellige Ergebnisse setzen
            if(strlen($G_hex = dechex(round(abs($Gi=$G_max_dezimal-($Spaltwert*$Klasse*$G)),0))) < 2) $G_hex = '0'.$G_hex;
            if(strlen($B_hex = dechex(round(abs($Bi=$B_max_dezimal-($Spaltwert*$Klasse*$B)),0))) < 2) $B_hex = '0'.$B_hex;
            $temp_klassen[$KL = $i_Klassen-$Klasse]['Farbwert'] = $R_hex.$G_hex.$B_hex;
            // -> Umkehrung der Farbwerte durch $KL = $i_Klassen-$Klasse ( sonst falsche Richtung)
        }

        // Hinweis auf nur ein Objekt in der Karte leeren
        $_SESSION['Temp']['Nur_ein_Wert_vorhanden'] = '0';

    }
    else
    {
        // Nur eine Klasse generieren, falls nur ein einziges Objekt gewählt wurde
        $temp_klassen['0']['Wert_Untergrenze'] = $fuellung_werte['Indikator_Wert_min_Dok_rounded'];
        $temp_klassen['0']['Wert_Obergrenze'] = $fuellung_werte['Indikator_Wert_max_Dok_rounded'];
        $temp_klassen['0']['Untergrenze'] = '0';
        $temp_klassen['0']['Obergrenze'] = '100';
        $temp_klassen['0']['Farbwert'] = $fuellung_werte['Farbwert_max'];
        // Hinweis auf nur ein Objekt in der Karte
        $_SESSION['Temp']['Nur_ein_Wert_vorhanden'] = '1';

    }
    //save distibution array
    if($indikator !== 'Z00AG'){
        $_SESSION['Temp']['Klasse'] = $temp_klassen;
        $_SESSION['Temp_Kl']['i_Verteilung'] = $verteilung_werte;
    }
    echo json_encode($temp_klassen);
}catch(Error $e){
    $trace = $e->getTrace();
    echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}
pg_close(getPostGreConnection());
mysqli_close(getMySQLConnection());
?>