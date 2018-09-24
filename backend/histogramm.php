<?php
session_start();
header('Content-type: text/html; charset=utf-8');
include("database/db_manager.php");

// Standard-ZV mit ID=1 verwenden
$SQL_ZV = "SELECT * FROM m_zeichenvorschrift WHERE ID_INDIKATOR='".$_SESSION["indikator"]."'";
$Ergebnis_ZV = mysqli_query(getMySQLConnection(),$SQL_ZV);

$TYP_FUELLUNG = mysqli_result($Ergebnis_ZV,0,'TYP_FUELLUNG');
$farbwerte_min = mysqli_result($Ergebnis_ZV,0,'FARBWERT_MIN');
$farbwerte_max = mysqli_result($Ergebnis_ZV,0,'FARBWERT_MAX');

if(is_null($farbwerte_min)){
    $farbwerte_min = "FFCC99";
}
if(is_null($farbwerte_max)){
    $farbwerte_max = "66CC99";
}
if(is_null($TYP_FUELLUNG)){
    $TYP_FUELLUNG = 'Klassifizierte Farbreihe';
}
echo '<svg id="svgId"><g><defs><linearGradient id="IndikatorenFarbbereich_horizontal" x1="100%" x2="0%" y1="0" y2="0">
			<stop offset="0%" stop-color="#'.$farbwerte_max.'" />
			<stop offset="100%" stop-color="#'.$farbwerte_min.'" />
		</linearGradient>';
echo '</defs>';

// Variablendeklaration und Gestaltungselemente
$Hist_Box_Hoehe = 60;
$Hist_Box_Schrittweite = 2.5;			 
echo  '<text x="'.$xl=($XD).'" style="font-size:9px; font-family:Arial;">'.utf8_encode($Histogramm).'</text>';

switch ($TYP_FUELLUNG) {
			case 'Farbbereich':
			
				// Box rechts ein Pix. breiter für bessere Darestellung
				echo  '<rect x="'.$xl=($XD).'" width="'.$HBBreite = ($Hist_Box_Schrittweite*51).'" 
													height="'.$HBH = ($Hist_Box_Hoehe + 4).'px" 
													style="fill: url(#IndikatorenFarbbereich_horizontal)" 
													stroke="none" />'; 
																		
			break;
			case 'Klassifizierte Farbreihe':
			
				// Einzelne Rechtecke zeichnen	
				for($i=0 ; $i <= 100 ; $i++)
				{
					echo  '<rect x="'.$xl=($XD+($i*$Hist_Box_Schrittweite)).'" width="'.$HBSw = ($Hist_Box_Schrittweite + 1.5).'px" height="'.$HBH = ($Hist_Box_Hoehe + 2).'" style="fill:#';
					// Korrekten Farbwert (Klasse) ermitteln																									
					if(is_array($_SESSION['Temp']['Klasse']))
					{
						foreach($_SESSION['Temp']['Klasse'] as $Klassensets)
						{
							if(($Klassensets['Untergrenze']==0 and $i==0) or ($Klassensets['Untergrenze'] < $i and $Klassensets['Obergrenze'] >= $i))
							{
								echo  $Klassensets['Farbwert'];
							}
						}
					}
					echo  '" stroke="none" />'; 
				}

			break;
			case 'manuell Klassifizierte Farbreihe':
			
				// Einzelne Rechtecke zeichnen	
				for($i=0 ; $i <= 100 ; $i++)
				{
					echo  '<rect x="'.$xl=($XD+($i*$Hist_Box_Schrittweite)).'" width="'.$HBSw = ($Hist_Box_Schrittweite + 1.5).'px" height="'.$HBH = ($Hist_Box_Hoehe + 2).'" style="fill:#';
					// Korrekten Farbwert (Klasse) ermitteln																									
					if(is_array($_SESSION['Temp']['manuelle_Klasse']))
					{
						foreach($_SESSION['Temp']['manuelle_Klasse'] as $Klassensets)
						{
							if(($Klassensets['Untergrenze']==0 and $i==0) or ($Klassensets['Untergrenze'] < $i and $Klassensets['Obergrenze'] >= $i))
							{
								echo  $Klassensets['Farbwert'];
							}
						}
					}
					echo  '" stroke="none" />'; 
				}
			
			break;
				}

// Säulen einzeichnen	
for($i=0 ; $i <= 100 ; $i++)
{
	$Saeulen_Hoehe = @($Hist_Box_Hoehe*($_SESSION['Temp_Kl']['i_Verteilung'][$i]/$_SESSION['Temp_Kl']['i_Verteilung']['Max'])); // normalisieren der Werte auf x/30
	$SäulenAnfang_oben = $Hist_Box_Hoehe - $Saeulen_Hoehe;					
	echo  '<rect x="'.$xl=($XD + ($i * $Hist_Box_Schrittweite)).'" y="'.$PosUHist =($YD_gesamt + $SäulenAnfang_oben).'" width="1px" height="'.$Saeulen_Hoehe.'"style="fill:#000000" stroke="none" />';
}

echo  '</g></svg>';	

mysqli_close(getMySQLConnection());
?>