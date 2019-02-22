<?php
class Colors
{
    protected static $instance = NULL;
    public static function get_instance()
    {
        if ( NULL === self::$instance )
            self::$instance = new self;

        return self::$instance;
    }
    function Berechnung($anz, $start, $ende){
        if($start<$ende){

            $breite = round(($ende-$start)/($anz-1));

            $Klasse[0] = $start;

            for($i = 1;$i<$anz;$i++){
                $Klasse[$i] = $start+($breite*$i);
            }

            $Klasse[$anz-1] = $ende;
            return($Klasse);
        }

        else if($start>$ende){

            $breite = round(($start-$ende)/($anz-1));

            $Klasse[0] = $start;

            for($i = 1;$i<$anz;$i++){
                $Klasse[$i] = $start-($breite*$i);
            }

            $Klasse[$anz-1] = $ende;
            return $Klasse;
        }

        else if($start == $ende){

            $Klasse[0] = $start;

            for($i = 1;$i<$anz;$i++){
                $Klasse[$i] = $start;
            }

            $Klasse[$anz-1] = $start;

            return $Klasse;
        }

    }
    function HexToRGB($hex)
    {
        $hex = str_replace('#', '', $hex);
        $color = array();

        if (strlen($hex) == 3) {
            $color['r'] = hexdec(substr($hex, 0, 1) );
            $color['g'] = hexdec(substr($hex, 1, 1) );
            $color['b'] = hexdec(substr($hex, 2, 1) );
        } else if (strlen($hex) == 6) {
            $color['r'] = hexdec(substr($hex, 0, 2));
            $color['g'] = hexdec(substr($hex, 2, 2));
            $color['b'] = hexdec(substr($hex, 4, 2));
        }

        return $color;
    }
    function RGBToHex($r, $g, $b)
    {
        //String padding bug found and the solution put forth by Pete Williams (http://snipplr.com/users/PeteW)
        $hex = "#";
        $hex .= str_pad(dechex($r), 2, "0", STR_PAD_LEFT);
        $hex .= str_pad(dechex($g), 2, "0", STR_PAD_LEFT);
        $hex .= str_pad(dechex($b), 2, "0", STR_PAD_LEFT);

        return $hex;
    }
    function buildColorPalette($count_classes,$color_min,$color_max){
        $colors = array();
        // Farben in RGB konvertieren
        $colmin_rgb=$this->HexToRGB($color_min);
        $colmax_rgb=$this->HexToRGB($color_max);

        $r = $this->Berechnung($count_classes, $colmax_rgb["r"], $colmin_rgb ["r"]);
        $g = $this->Berechnung($count_classes, $colmax_rgb["g"], $colmin_rgb["g"]);
        $b = $this->Berechnung($count_classes, $colmax_rgb["b"], $colmin_rgb["b"]);

        for($i = 0; $i<count($r);++$i){
            array_push($colors,$this->RGBToHex($r[$i],$g[$i],$b[$i]));
        }
        return $colors;
    }
}