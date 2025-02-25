<?php
/**
 * Plugin Name: AutoKalenteri
 * Description: Kalenteri autojen varaamista varten.
 * Version: 1.0
 * Author: Aleksei Nesterinen
 */

if (!defined('ABSPATH')) {
    exit;
}

// global vars
global $table_name;
$table_name = 'auto_kalenteri';

function get_table_name(){
    global $wpdb;
    global $table_name;
    
    return $wpdb->prefix . $table_name;
}

// logging function for debugging, wp debug has to be enabled in config, delete later
include(plugin_dir_path(__FILE__) . 'dev/logger.php');

// create wp_db_table if it doesnt exists yet on plugin activation
function kalenteri_plugin_activation() {
    global $wpdb;
    $wp_table_name = get_table_name();
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $wp_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        start datetime NOT NULL,
        end datetime NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'kalenteri_plugin_activation');

// ajax, rest/crud api modifying db stuff for kalenteri
include(plugin_dir_path(__FILE__) . 'ajax/kalenteri_ajax.php');

// load fullcalender, styles, kalenteri and ajax variable for kalenteri.
function load_kalenteri(){
    wp_register_script('fullcalendar', plugin_dir_url( __FILE__ ) . "js/fullcalendar/dist/index.global.js", array( 'jquery' ), null, true);
    wp_enqueue_script('fullcalendar');

    wp_enqueue_style('wsp-styles', plugin_dir_url(__FILE__) . 'css/kalenteri.css');

    wp_enqueue_script( 'ajax-script', plugin_dir_url(__FILE__) . 'js/kalenteri.js', array('jquery') );
    wp_localize_script( 'ajax-script', 'my_ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' )) );
}
add_action('wp_enqueue_scripts', 'load_kalenteri');
?>