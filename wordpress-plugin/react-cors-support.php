<?php
/**
 * Plugin Name: React App CORS Support
 * Description: Enables CORS for React App integration
 * Version: 1.0
 * Author: MindGuard AI Team
 */

if (!defined('ABSPATH')) {
    exit;
}

class ReactAppCORSSupport {
    
    public function __construct() {
        add_action('init', array($this, 'handle_preflight'));
        add_action('rest_api_init', array($this, 'add_cors_headers'));
        add_filter('rest_pre_serve_request', array($this, 'add_cors_headers_to_response'), 10, 4);
    }
    
    public function handle_preflight() {
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            $this->add_cors_headers();
            exit();
        }
    }
    
    public function add_cors_headers() {
        // Erlaubte Origins (anpassen für Production)
        $allowed_origins = array(
            'http://localhost:3000',
            'http://localhost:3001', 
            'http://localhost:3002',
            'https://ihre-react-app-domain.com' // Für Production
        );
        
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
    
    public function add_cors_headers_to_response($served, $result, $request, $server) {
        $this->add_cors_headers();
        return $served;
    }
}

new ReactAppCORSSupport();

// WordPress REST API Erweiterungen für bessere React Integration
add_action('rest_api_init', function () {
    
    // Featured Image URLs zu Posts hinzufügen
    register_rest_field('post', 'featured_image_url', array(
        'get_callback' => function($post) {
            $image_id = get_post_thumbnail_id($post['id']);
            if ($image_id) {
                return wp_get_attachment_image_url($image_id, 'full');
            }
            return null;
        }
    ));
    
    // Author Name zu Posts hinzufügen
    register_rest_field('post', 'author_name', array(
        'get_callback' => function($post) {
            return get_the_author_meta('display_name', $post['author']);
        }
    ));
    
    // Reading time estimation
    register_rest_field('post', 'reading_time', array(
        'get_callback' => function($post) {
            $content = $post['content']['rendered'];
            $word_count = str_word_count(strip_tags($content));
            $reading_time = ceil($word_count / 200); // 200 words per minute
            return $reading_time;
        }
    ));
    
});

// Custom endpoint für React App Konfiguration
add_action('rest_api_init', function () {
    register_rest_route('mindguard/v1', '/config', array(
        'methods' => 'GET',
        'callback' => function() {
            return array(
                'site_name' => get_bloginfo('name'),
                'site_description' => get_bloginfo('description'),
                'site_url' => get_site_url(),
                'posts_per_page' => get_option('posts_per_page'),
                'date_format' => get_option('date_format'),
                'time_format' => get_option('time_format'),
            );
        },
        'permission_callback' => '__return_true'
    ));
});
?>