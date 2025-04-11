<?php
/**
 * Plugin Name: AutoKalenteri
 * Description: Kalenteri autojen varaamista varten.
 * Version: 1.1.1
 * Author: Aleksei Nesterinen
 * Author URI: https://github.com/nesterinen
 * Plugin URI: https://codeload.github.com/nesterinen/AutoKalenteri/zip/refs/heads/main
 */

if (!defined('ABSPATH')) {
    exit;
}
 
// global vars
global $autovaraus_page_name;
$autovaraus_page_name = 'Autovaraukset';

global $autovaraus_table_name;
$autovaraus_table_name = 'auto_kalenteri';

global $autovaraus_element_name;
$autovaraus_element_name = 'kalenteriElement';

global $available_cars;
$available_cars = [
    'Henkilöauto'=>'#648FFF',
    'Pakettiauto'=>'#785EF0',
    'Pikkubussi'=>'#FE6100',
    'Peräkärri' => '#DC267F',
    'Kuomukärri' => '#FFB000'
];

function get_table_name(){
    global $wpdb;
    global $autovaraus_table_name;
    
    return $wpdb->prefix . $autovaraus_table_name;
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
        varaaja varchar(255),
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'kalenteri_plugin_activation');

// create page for kalenteri
function auto_kalenteri_plugin_activation_page() {
    global $autovaraus_page_name;
    global $autovaraus_element_name;

    // get_page_by_title() is Deprecated so use wp_query.
    // if page for calendar does not exist then create page.
    $query = new WP_Query(
        array(
            'post_type'              => 'page',
            'title'                  => $autovaraus_page_name,
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

    $page_content = '<div id=' . $autovaraus_element_name . '></div>';
    
    $kalenteri_page = array(
        'post_title' => wp_strip_all_tags($autovaraus_page_name),
        'post_content' => $page_content,
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'page'
    );
    
    wp_insert_post($kalenteri_page);
}
register_activation_hook(__FILE__, 'auto_kalenteri_plugin_activation_page');


// create page for list of events
function auto_kalenteri_lista_plugin_activation_page() {
    global $autovaraus_page_name;
    global $autovaraus_element_name;

    $list_page_name = "{$autovaraus_page_name}_lista";
    $list_element_name = "{$autovaraus_element_name}_lista";

    // get_page_by_title() is Deprecated so use wp_query.
    // if page for calendar does not exist then create page.
    $query = new WP_Query(
        array(
            'post_type'              => 'page',
            'title'                  => $list_page_name ,
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

    $page_content = "<div id='{$list_element_name}'></div>";
    
    $list_page = [
        'post_title' => wp_strip_all_tags($list_page_name ),
        'post_content' => $page_content,
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'page'
    ];
    
    wp_insert_post($list_page);
}
register_activation_hook(__FILE__, 'auto_kalenteri_lista_plugin_activation_page');

// ajax, rest/crud api modifying db stuff for kalenteri
include(plugin_dir_path(__FILE__) . 'ajax/kalenteri_ajax.php');

// load fullcalender, styles, kalenteri and ajax variable for kalenteri.
function load_auto_kalenteri(){
    global $autovaraus_page_name;
    global $autovaraus_element_name;
    global $available_cars;

    $version = '1.1.1';

    if(is_page($autovaraus_page_name)){
        $list_page_name = "{$autovaraus_page_name}_lista";
        $link_to_list = get_bloginfo('url') . '/'. $list_page_name;

        wp_register_script('fullcalendar', plugin_dir_url( __FILE__ ) . "js/fullcalendar/dist/index.global.js", array( 'jquery' ), null, true);
        
        wp_enqueue_style('wsp-styles', plugin_dir_url(__FILE__) . 'css/kalenteri.css', [], $version);        

        wp_register_script('popups-script', plugin_dir_url(__FILE__) . 'js/popups.js', [], null);
       
        wp_enqueue_script( 
            'ajax-script', 
            plugin_dir_url(__FILE__) . 'js/kalenteri.js', 
            ['jquery', 'popups-script', 'fullcalendar'],
            $version
        );
        wp_localize_script( 
            'ajax-script', 
            'my_ajax_object', 
            array( 
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'element_name' => $autovaraus_element_name,
            'available_cars' => $available_cars,
            'link_to_list' => $link_to_list
            )
        );
    }
}
add_action('wp_enqueue_scripts', 'load_auto_kalenteri');

function load_auto_lista(){
    global $autovaraus_page_name;
    global $autovaraus_element_name;
    global $available_cars;

    $list_page_name = "{$autovaraus_page_name}_lista";
    $list_element_name = "{$autovaraus_element_name}_lista";

    $version = '1.1.1';

    if(!is_page($list_page_name)){
        return;
    }

    $link_to_main = get_bloginfo('url') . '/'. $autovaraus_page_name;


    wp_enqueue_style(
        'varakset-style', 
        plugin_dir_url(__FILE__) . 'css/varaukset.css', 
        [], 
        $version
    );

    wp_enqueue_script( 
        'varaukset-script',
        plugin_dir_url(__FILE__) . 'js/varaukset.js',
        ['jquery'],
        $version
    );

    wp_localize_script( 
        'varaukset-script',
        'php_args', 
        [
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'element_name' => $list_element_name,
        'available_cars' => $available_cars,
        'link_to_main' => $link_to_main
        ]
    );
}
add_action('wp_enqueue_scripts', 'load_auto_lista');