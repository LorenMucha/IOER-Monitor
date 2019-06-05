<?php
include_once '../database/DBFactory.php';

class Errors
{
    private $errors;
    protected static $instance = NULL;
    public static function get_instance()
    {
        if ( NULL === self::$instance )
            self::$instance = new self;

        return self::$instance;
    }
   function getCodes()
   {
       if (count($this->errors) == 0) {
           $fc_array = array();
           $sql = "SELECT FEHLERCODE,FEHLER_NAME,FEHLER_FARBCODE,FEHLER_BESCHREIBUNG FROM m_fehlercodes";
           $rs_fc = DBFactory::getMySQLManager()->query($sql);
           foreach ($rs_fc as $row) {
               array_push($fc_array, array(
                   'FC' => $row->FEHLERCODE,
                   'NAME' => $row->FEHLER_NAME,
                   'FARBE' => $row->FEHLER_FARBCODE,
                   'BESCHREIBUNG' => $row->FEHLER_BESCHREIBUNG
               ));
           }
           $this->errors = $fc_array;
           return $this->errors;
       }else{
           return $this->errors;
       }
   }
   function getCodeValues($code_id){
       if ($code_id >= 1) {
           //get the error code
           $codes = $this->getCodes();
           $result_array = array();
           foreach ($codes as $key => $val) {
               if ($val['FC'] == $code_id) {
                   array_push($result_array,array(
                       "color"=>$codes[$key]['FARBE'],
                       "text"=>$codes[$key]['NAME'],
                       "description"=>$codes[$key]['BESCHREIBUNG'],
                       "name"=>$codes[$key]['NAME']
               ));
               }
           }
            return $result_array;
       } else {
          return 0;
       }
   }
}