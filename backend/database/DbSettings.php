<?php
class DbSettings
{
    var $settings;
    function getSettings_mysql()
    {
        $settings['dbhost'] = '127.0.0.1';
        $settings['dbname'] = 'monitor_svg';
        $settings['dbusername'] = 'monitor_svg';
        $settings['dbpassword'] = 'monitor_svguser';

        return $settings;
    }
    function getSettings_postgre(){
        $settings['dbhost'] = 'localhost';
        $settings['dbname'] = 'monitor_geodat';
        $settings['dbusername'] = 'monitor_svg_admin';
        $settings['dbpassword'] = 'monitorsvgadmin';
        $settings['port'] = '5432';

        return $settings;
    }
}
