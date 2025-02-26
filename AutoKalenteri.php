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
global $page_name;
$page_name = 'AutoKalenteri';

global $table_name;
$table_name = 'auto_kalenteri';

global $element_name;
$element_name = 'kalenteriElement';

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

// create page for kalenteri
function kalenteri_plugin_activation_page() {
    global $page_name;
    global $element_name;

    // get_page_by_title() is Deprecated so use wp_query.
    // if page for calendar does not exist then create page.
    $query = new WP_Query(
        array(
            'post_type'              => 'page',
            'title'                  => $page_name,
            'post_status'            => 'all',
            'posts_per_page'         => 1,
            'no_found_rows'          => true,
            'ignore_sticky_posts'    => true,
            'update_post_term_cache' => false,
            'update_post_meta_cache' => false,
            'orderby'                => 'post_date ID',
            'order'                  => 'ASC',
        )
    );

    if ( ! empty( $query->post)) { 
        //write_log('page exists already');
        return;
    }

    $page_content = '<div id=' . $element_name . '></div>';
    
    $kalenteri_page = array(
        'post_title' => wp_strip_all_tags($page_name),
        'post_content' => $page_content,
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'page'
    );
    
    wp_insert_post($kalenteri_page);
}
register_activation_hook(__FILE__, 'kalenteri_plugin_activation_page');

// ajax, rest/crud api modifying db stuff for kalenteri
include(plugin_dir_path(__FILE__) . 'ajax/kalenteri_ajax.php');

// load fullcalender, styles, kalenteri and ajax variable for kalenteri.
function load_kalenteri(){
    global $page_name;
    global $element_name;
    if(is_page($page_name)){
        wp_register_script('fullcalendar', plugin_dir_url( __FILE__ ) . "js/fullcalendar/dist/index.global.js", array( 'jquery' ), null, true);
        wp_enqueue_script('fullcalendar');
        
        wp_enqueue_style('wsp-styles', plugin_dir_url(__FILE__) . 'css/kalenteri.css');
        
        wp_enqueue_script( 'ajax-script', plugin_dir_url(__FILE__) . 'js/kalenteri.js', array('jquery') );
        wp_localize_script( 'ajax-script', 'my_ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'element_name' => $element_name));
    }
}
add_action('wp_enqueue_scripts', 'load_kalenteri');
?>