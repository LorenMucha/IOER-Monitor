<?php
require_once('DbSettings.php');

class PostgreManager{

    public function __construct() {

        $settings = DbSettings::getSettings_postgre();

        $this->user = $settings['dbusername'];
        $this->password = $settings['dbpassword'];
        $this->database = $settings['dbname'];
        $this->host = $settings['dbhost'];
    }

    protected function connect() {
        return new PDO('pgsql:host='.$this->host.';dbname='.$this->database,$this->user,$this->password);
    }
    public function query($query) {
        $db = $this->connect();
        $result = $db->query($query);
        while ( $row = $result->fetchObject() ) {
            $results[] = $row;
        }
        return $results;
    }
    public function insert($table, $data, $format) {
        // Check for $table or $data not set
        if ( empty( $table ) || empty( $data ) ) {
            return false;
        }

        // Connect to the database
        $db = $this->connect();

        // Cast $data and $format to arrays
        $data = (array) $data;
        $format = (array) $format;

        // Build format string
        $format = implode('', $format);
        $format = str_replace('%', '', $format);

        list( $fields, $values ) = $this->prep_query($data);

        // Prepend $format onto $values
        array_unshift($values, $format);
        // Prepary our query for binding
        $stmt = $db->prepare("INSERT INTO {$table} ({$fields}) VALUES ({$values})");
        $stmt->execute();

        // Check for successful insertion
        if ( $stmt->affected_rows ) {
            return true;
        }

        return false;
    }
    public function update($table, $data, $format, $where, $where_format) {
        // Check for $table or $data not set
        if ( empty( $table ) || empty( $data ) ) {
            return false;
        }

        // Connect to the database
        $db = $this->connect();

        // Cast $data and $format to arrays
        $data = (array) $data;
        $format = (array) $format;

        // Build format array
        $format = implode('', $format);
        $format = str_replace('%', '', $format);
        $where_format = implode('', $where_format);
        $where_format = str_replace('%', '', $where_format);
        $format .= $where_format;

        list( $fields, $placeholders, $values ) = $this->prep_query($data, 'update');

        //Format where clause
        $where_clause = '';
        $where_values = '';
        $count = 0;

        foreach ( $where as $field => $value ) {
            if ( $count > 0 ) {
                $where_clause .= ' AND ';
            }

            $where_clause .= $field . '=?';
            $where_values[] = $value;

            $count++;
        }
        // Prepend $format onto $values
        array_unshift($values, $format);
        $values = array_merge($values, $where_values);
        // Prepary our query for binding
        $stmt = $db->prepare("UPDATE {$table} SET {$placeholders} WHERE {$where_clause}");

        // Dynamically bind values
        call_user_func_array( array( $stmt, 'bind_param'), $this->ref_values($values));

        // Execute the query
        $stmt->execute();

        // Check for successful insertion
        if ( $stmt->affected_rows ) {
            return true;
        }

        return false;
    }
    public function delete($table, $id) {
        // Connect to the database
        $db = $this->connect();

        // Prepary our query for binding
        $stmt = $db->prepare("DELETE FROM {$table} WHERE ID = ?");

        // Dynamically bind values
        $stmt->bindParam('d', $id);

        // Execute the query
        $stmt->execute();

        // Check for successful insertion
        if ( $stmt->affected_rows ) {
            return true;
        }
    }
    private function prep_query($data, $type='insert') {
        // Instantiate $fields and $placeholders for looping
        $fields = '';
        $values = '';

        // Loop through $data and build $fields, $placeholders, and $values
        foreach ( $data as $field => $value ) {
            $fields .= "{$field},";
            $values .= "'$value',";
        }

        // Normalize $fields and $placeholders for inserting
        $fields = substr($fields, 0, -1);
        $values= substr($values, 0, -1);

        return array( $fields,$values );
    }
    private function ref_values($array) {
        $refs = array();
        foreach ($array as $key => $value) {
            $refs[$key] = &$array[$key];
        }
        return $refs;
    }
}