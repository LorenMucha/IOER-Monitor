<?php
    function HexToRGB($hex) {
    $hex = str_replace('#', '', $hex);
    $color = array();
     
    if(strlen($hex) == 3) {
    $color['r'] = hexdec(substr($hex, 0, 1));
    $color['g'] = hexdec(substr($hex, 1, 1) );
    $color['b'] = hexdec(substr($hex, 2, 1));
    }
    else if(strlen($hex) == 6) {
    $color['r'] = hexdec(substr($hex, 0, 2));
    $color['g'] = hexdec(substr($hex, 2, 2));
    $color['b'] = hexdec(substr($hex, 4, 2));
    }
     
    return $color;
    }
     
    function RGBToHex($r, $g, $b) {
    //String padding bug found and the solution put forth by Pete Williams (http://snipplr.com/users/PeteW)
    $hex = "#";
    $hex.= str_pad(dechex($r), 2, "0", STR_PAD_LEFT);
    $hex.= str_pad(dechex($g), 2, "0", STR_PAD_LEFT);
    $hex.= str_pad(dechex($b), 2, "0", STR_PAD_LEFT);
     
    return $hex;
	}
?>