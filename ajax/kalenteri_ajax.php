<?php 

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

function auto_get_all() {
    global $wpdb;
    $wp_table_name = get_table_name();

    // dont fetch reservations that are more than 2 months old, fetching the whole table is not good for longetivity.
    $time = strtotime("-2 month", time());
    $year_ago = date("Y-m-d", $time);

    $result = $wpdb->get_results( "SELECT * FROM " . $wp_table_name . " WHERE start > '" . $year_ago . "'");

    if ($result !== false) {
        wp_send_json_success($result, 200);
    } else {
        wp_send_json_error(null, 500);
    }
}
add_action('wp_ajax_auto_get_all', 'auto_get_all');
add_action( 'wp_ajax_nopriv_auto_get_all', 'auto_get_all');

function auto_post_db() {
    global $wpdb;
    $wp_table_name = get_table_name();
  
    $result = $wpdb->insert($wp_table_name, array(
      "title" => $_POST['title'],
      "start" =>  $_POST['start'],
      "end" =>  $_POST['end'],
      "varaaja" => $_POST['varaaja']
    ));

    switch (true) {
        case $result === false:
            wp_send_json_error($result, 500);
            break;
        
        case $result === 0:
            wp_send_json_error($result, 400);
            break;

        case $result >= 1:
            wp_send_json_success(array("id" => $wpdb->insert_id), 200);
    }
}
add_action('wp_ajax_auto_post_db', 'auto_post_db');
add_action( 'wp_ajax_nopriv_auto_post_db', 'auto_post_db');
  
function auto_delete_db() {
    global $wpdb;
    $wp_table_name = get_table_name();

    $result = $wpdb->delete($wp_table_name, array('ID' => $_POST['id']));
  
    switch (true) {
        case $result === false:
            wp_send_json_error($result, 500);
            break;
        
        case $result === 0:
            wp_send_json_error($result, 400);
            break;

        case $result >= 1:
            wp_send_json_success(array("message" => "wpdb delete completed successfully"), 200);
    }
}
add_action('wp_ajax_auto_delete_db', 'auto_delete_db');
add_action( 'wp_ajax_nopriv_auto_delete_db', 'auto_delete_db');
  
function auto_update_db() {
    global $wpdb;
    $wp_table_name = get_table_name();

    $result = $wpdb->update($wp_table_name,
      array("start" => $_POST['start'], "end" =>  $_POST['end']),
      array('ID' => $_POST['id'])
    );

    switch (true) {
        case $result === false:
            wp_send_json_error($result, 500);
            break;
        
        case $result === 0:
            wp_send_json_error($result, 400);
            break;

        case $result >= 1:
            wp_send_json_success(array("message" => "wpdb update completed successfully"), 200);
    }
}
add_action('wp_ajax_auto_update_db', 'auto_update_db');
add_action( 'wp_ajax_nopriv_auto_update_db', 'auto_update_db');

function auto_post_db_multi(): void {
    global $wpdb;
    $wp_table_name = get_table_name();

    $values = [];

    foreach ($_POST['dates'] as $key => $event) {
        $values[] = $wpdb->prepare(
            '(%s,%s,%s,%s)',
            $_POST['title'],
            $event['start'],
            $event['end'],
            $_POST['varaaja']
        );
    }

    $query = "INSERT INTO {$wp_table_name} (title, start, end, varaaja) VALUES ";
    $query .= implode(",\n", $values);

    $result = $wpdb->query($query);

    switch (true) {
        case $result === false:
            wp_send_json_error($result, 500);
            break;
        
        case $result === 0:
            wp_send_json_error($result, 400);
            break;

        case $result >= 1:
            wp_send_json_success(array("message" => "wpdb events added successfully"), 200);
    }
}
add_action('wp_ajax_auto_post_db_multi', 'auto_post_db_multi');
add_action( 'wp_ajax_nopriv_auto_post_db_multi', 'auto_post_db_multi');