<?php

include "../database/DBFactory.php";

class UserLink
{
    private $table_name = "v_user_link_speicher";
    public function __construct($setting){
        $this->setting = $setting;
    }
    public function getResult(){
        if($this->setting["id"]==="set"){
            return $this->setLink();
        }else{
            return $this->getLink();
        }
    }
    private function setLink(){
        date_default_timezone_set('Europe/Berlin');
        $date = date('Y-m-d H:i:s');
        try {
            $data_array=array("array_value"=>$this->setting["val"],"ZEITSTEMPEL"=>$date);
            $filed_array=array("%s","%s");
            DBFactory::getMySQLManager()->insert($this->table_name,$data_array,$filed_array);
            $sql_get = "select id from ".$this->table_name." where ZEITSTEMPEL = '".$date."' and array_value = '".$this->setting["val"]."'";
            return array("state"=>"inserted","res"=>DBFactory::getMySQLTask()->query($sql_get));
        }catch (Exception $e){
            return array("state"=>"error");
        }
    }
    private function getLink(){
        try {
            $sql_get = "SELECT id, array_value FROM " . $this->table_name . " where id='" . $this->setting["val"] . "'";
            return array("state"=>"get","res"=>DBFactory::getMySQLManager()->query($sql_get));
        }catch(Exception $e){
            return array("state"=>"error");
        }
    }
}