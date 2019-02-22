<?php

class Helper
{
    protected static $instance = NULL;

    public static function get_instance()
    {
        if (NULL === self::$instance)
            self::$instance = new self;

        return self::$instance;
    }

    public function remove_duplicateKeys($key, $data)
    {

        $_data = array();

        foreach ($data as $v) {
            if (isset($_data[$v[$key]])) {
                // found duplicate
                continue;
            }
            // remember unique item
            $_data[$v[$key]] = $v;
        }
        // if you need a zero-based array, otheriwse work with $_data
        $data = array_values($_data);
        return $data;
    }

    public function in_array_r($needle, $haystack, $strict = false)
    {
        foreach ($haystack as $item) {
            if (($strict ? $item === $needle : $item == $needle) || (is_array($item) && in_array_r($needle, $item, $strict))) {
                return true;
            }
        }

        return false;
    }

    public function escapeJsonString($value)
    {
        $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c", "\r", "\n", "\t", "\u00b2", "\u00c4", "\u00e4", "u00d6", "u00f6", "u00dc", "u00fc", "\u00df", ",,", "Ã¤", "Ã„", "Ã¶", "Ã–", "Ã¼", "Ãœ", "ÃŸ");
        $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b", "", "", "", "2", "Ä", "ä", "Ö", "ö", "Ü", "ü", "ß", ",", "ä", "Ä", "ö", "Ö", "ü", "Ü", "ß");
        $result = str_replace($escapers, $replacements, $value);
        return stripcslashes($result);
    }

    public function extractBoolen($string)
    {
        if ($string === "true") {
            return true;
        } else {
            return false;
        }
    }
}