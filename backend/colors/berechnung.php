<?php 

	function Berechnung($anz, $start, $ende){
	
		$klasse = array();

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

?>
