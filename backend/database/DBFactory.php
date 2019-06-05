<?php

include_once "MysqlManager.php";
include_once "MysqlTasks.php";
include_once "PostgreManager.php";
include_once "PostgreTasks.php";

class DBFactory{
    private static $mySQL = "mysql";
    private static $mySQLTasks = "mysqlTasks";
    private static $postgre = "postgre";
    private static $postgreTasks = "postgreTasks";

   private function __construct(){}

   public static function getMySQLManager(){
        return self::getManager(self::$mySQL);
   }
   public static function getMySQLTask(){
        return self::getManager(self::$mySQLTasks);
    }
   public static function getPostgreSQLManager(){
        return self::getManager(self::$postgre);
   }
   public static function getPostgreSQLTasks(){
        return self::getManager(self::$postgreTasks);
   }

   private static function getManager($_manager){
        switch ($_manager){
            case self::$mySQL:
                $manager = new MysqlManager();
                return $manager;
            case self::$mySQLTasks:
                $tasks = new MysqlTasks();
                return $tasks;
            case self::$postgre:
                $manager = new PostgreManager();
                return $manager;
            case self::$postgreTasks:
                $tasks = new PostgreTasks();
                return $tasks;
        }
   }
}