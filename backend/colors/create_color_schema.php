<?php
header('Access-Control-Allow-Origin: *');
include("farben.php");
include("berechnung.php");

$Anz_Klassen = $_GET["anz_klassen"];
$colmax = $_GET["colmax_rgb"];
$colmin = $_GET["colmin_rgb"];
$id = $_GET["id"];
$width = 100/$Anz_Klassen;

$array_farben = array();

// Farben in RGB konvertieren
$colmin_rgb=HexToRGB($colmin);
$colmax_rgb=HexToRGB($colmax);

$r = Berechnung($Anz_Klassen, $colmax_rgb["r"], $colmin_rgb ["r"]);
$g = Berechnung($Anz_Klassen, $colmax_rgb["g"], $colmin_rgb["g"]);
$b = Berechnung($Anz_Klassen, $colmax_rgb["b"], $colmin_rgb["b"]);

$li = '';

for($i = 0; $i<count($r);++$i){
   $li .= '<i class="color_i" style="background:rgb('.$r[$i]. ',' .$g[$i].','.$b[$i].');width:'.$width.'%;"></i>';
}

echo '<div id="'.$id.'" class="color-line">'.$li.'</div>';

?>