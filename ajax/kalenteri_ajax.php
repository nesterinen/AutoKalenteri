<?php 

function get_all() {
    global $wpdb;
    $result = $wpdb->get_results( "SELECT * FROM kalenteri" );

    if ($result !== false) {
        wp_send_json_success($result, 200);
    } else {
        wp_send_json_error(null, 500);
    }
}
add_action('wp_ajax_get_all', 'get_all');
add_action( 'wp_ajax_nopriv_get_all', 'get_all');

function post_db() {
    global $wpdb;
  
    $result = $wpdb->insert("kalenteri", array(
      "title" => $_POST['title'],
      "start" =>  $_POST['start'],
      "end" =>  $_POST['end'],
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
add_action('wp_ajax_post_db', 'post_db');
add_action( 'wp_ajax_nopriv_post_db', 'post_db');
  
function delete_db() {
    global $wpdb;
  
    $result = $wpdb->delete('kalenteri', array('ID' => $_POST['id']));
  
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
add_action('wp_ajax_delete_db', 'delete_db');
add_action( 'wp_ajax_nopriv_delete_db', 'delete_db');
  
function update_db() {
    global $wpdb;
    $result = $wpdb->update('kalenteri',
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
add_action('wp_ajax_update_db', 'update_db');
add_action( 'wp_ajax_nopriv_update_db', 'update_db');

?>