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

function load_kalenteri(){
    wp_register_script('fullcalendar', plugin_dir_url( __FILE__ ) . "js/fullcalendar/dist/index.global.js", array( 'jquery' ), null, true);
    wp_enqueue_script('fullcalendar');

    wp_enqueue_style('wsp-styles', plugin_dir_url(__FILE__) . 'css/kalenteri.css');

    wp_enqueue_script( 'ajax-script', plugin_dir_url(__FILE__) . 'js/kalenteri.js', array('jquery') );
    wp_localize_script( 'ajax-script', 'my_ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
}

add_action('wp_enqueue_scripts', 'load_kalenteri');
?>