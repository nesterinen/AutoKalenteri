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

function write_log( $data ) {
    if ( true === WP_DEBUG ) {
        if ( is_array( $data ) || is_object( $data ) ) {
            error_log( print_r( $data, true ) );
        } else {
            error_log( $data );
        }
    }
}

?>