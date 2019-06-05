<?php
include '../database/DBFactory.php';

class NOTES{
    private $notes;
    protected static $instance = NULL;
    public static function get_instance()
    {
        if ( NULL === self::$instance )
            self::$instance = new self;

        return self::$instance;
    }
    function getNotes(){
        if(count($this->notes)==0) {
            $notes = array();
            $sql = "SELECT  HC, HC_INFO FROM  m_hinweiscodes";
            $rs = DBFactory::getMySQLManager()->query($sql);
            foreach ($rs as $row) {
                array_push($notes, array(
                    'HC' => $row->HC,
                    'HC_KURZ' => $row->HC_INFO
                ));
            }
            $this->notes = $notes;
            return $this->notes;
        }else{
            return $this->notes;
        }
    }
    function getNoteText($note_code){
        foreach ($this->getNotes() as $row) {
            if($row['HC'] == $note_code){
                return $row["HC_KURZ"];
            }
        }
    }
}