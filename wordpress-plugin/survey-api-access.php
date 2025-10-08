<?php
/**
 * Plugin Name: Survey API Access
 * Description: Enables anonymous survey submissions via REST API with dedicated table
 * Version: 2.0
 */

add_action('rest_api_init', function () {
    register_rest_route('wp/v2', 'survey/v1/submit', array(
        'methods' => 'POST',
        'callback' => 'handle_survey_submission',
        'permission_callback' => '__return_true', // Allow anonymous access
    ));
    
    register_rest_route('wp/v2', 'survey/v1/stats', array(
        'methods' => 'GET',
        'callback' => 'get_survey_stats',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('wp/v2', 'survey/v1/responses', array(
        'methods' => 'GET',
        'callback' => 'get_survey_responses',
        'permission_callback' => '__return_true',
    ));
});

// Enable CORS for all requests
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
});

function handle_survey_submission($request) {
    global $wpdb;
    
    $params = $request->get_json_params();
    
    // Build demographics string from various fields
    $demographics_parts = [];
    if (!empty($params['gender'])) $demographics_parts[] = 'Gender: ' . $params['gender'];
    if (!empty($params['location'])) $demographics_parts[] = 'Location: ' . $params['location'];
    if (!empty($params['education'])) $demographics_parts[] = 'Education: ' . $params['education'];
    if (!empty($params['employment'])) $demographics_parts[] = 'Employment: ' . $params['employment'];
    $demographics = implode(', ', $demographics_parts);
    
    // Insert into existing survey table structure
    $result = $wpdb->insert(
        $wpdb->prefix . 'survey_responses',
        array(
            'email' => sanitize_email($params['email'] ?? ''),
            'age' => sanitize_text_field($params['age'] ?? ''),
            'demographics' => sanitize_text_field($demographics),
            'pets' => json_encode($params['pets'] ?? []),
            'motivation' => sanitize_textarea_field($params['motivation'] ?? ''),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'gender' => sanitize_text_field($params['gender'] ?? '')
        ),
        array(
            '%s', // email
            '%s', // age
            '%s', // demographics
            '%s', // pets (JSON)
            '%s', // motivation
            '%s', // ip_address
            '%s', // user_agent
            '%s'  // gender
        )
    );
    
    if ($result !== false) {
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Survey submitted successfully',
            'id' => $wpdb->insert_id
        ), 200);
    } else {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Failed to save survey: ' . $wpdb->last_error
        ), 500);
    }
}

function get_survey_stats($request) {
    global $wpdb;
    
    $results = $wpdb->get_results(
        "SELECT * FROM {$wpdb->prefix}survey_responses ORDER BY created_at DESC"
    );
    
    $total_responses = count($results);
    
    // Calculate distributions
    $age_distribution = array();
    $gender_distribution = array();
    $demographics_distribution = array();
    $motivation_distribution = array();
    $pets_distribution = array();
    
    foreach ($results as $response) {
        // Age distribution
        if (!empty($response->age)) {
            $age_distribution[$response->age] = ($age_distribution[$response->age] ?? 0) + 1;
        }
        
        // Gender distribution
        if (!empty($response->gender)) {
            $gender_distribution[$response->gender] = ($gender_distribution[$response->gender] ?? 0) + 1;
        }
        
        // Demographics distribution
        if (!empty($response->demographics)) {
            $demographics_distribution[$response->demographics] = ($demographics_distribution[$response->demographics] ?? 0) + 1;
        }
        
        // Motivation distribution (split by comma)
        if (!empty($response->motivation)) {
            $motivations = array_map('trim', explode(',', $response->motivation));
            foreach ($motivations as $motivation) {
                if (!empty($motivation)) {
                    $motivation_distribution[$motivation] = ($motivation_distribution[$motivation] ?? 0) + 1;
                }
            }
        }
        
        // Pets distribution
        if (!empty($response->pets) && $response->pets !== '""') {
            $pets_data = json_decode($response->pets, true);
            if (is_string($pets_data)) {
                $pets_distribution[$pets_data] = ($pets_distribution[$pets_data] ?? 0) + 1;
            }
        }
    }
    
    return new WP_REST_Response(array(
        'totalResponses' => $total_responses,
        'ageDistribution' => $age_distribution,
        'genderDistribution' => $gender_distribution,
        'demographicsDistribution' => $demographics_distribution,
        'motivationDistribution' => $motivation_distribution,
        'petsDistribution' => $pets_distribution,
        'responses' => $results
    ), 200);
}

function get_survey_responses($request) {
    global $wpdb;
    
    $page = intval($request->get_param('page') ?? 1);
    $per_page = intval($request->get_param('per_page') ?? 10);
    $offset = ($page - 1) * $per_page;
    
    // Get total count
    $total_count = $wpdb->get_var(
        "SELECT COUNT(*) FROM {$wpdb->prefix}survey_responses"
    );
    
    // Get paginated results
    $results = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}survey_responses ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $per_page,
            $offset
        )
    );
    
    $total_pages = ceil($total_count / $per_page);
    
    return new WP_REST_Response(array(
        'responses' => $results,
        'totalPages' => $total_pages,
        'totalItems' => $total_count,
        'currentPage' => $page,
        'perPage' => $per_page
    ), 200);
}