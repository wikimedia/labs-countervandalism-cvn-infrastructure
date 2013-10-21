<?php
/**
 * cvn-api-proxy
 *
 * Made to work around absence of an SSL certificate for cvn.wmflabs.org,
 * and offer tools.wmflabs.org to proxy the cnv-api for the time being.
 *
 * @author Krinkle, 2013
 *
 * Released in the public domain.
 */

/**
 * Configuration
 */
$conf = json_decode( @file_get_contents( __DIR__ . '/config.json' ) );
if ( !$conf ) {
	header( 'content-type: application/json; charset=utf-8' );
	print '{"error":"internal"}';
	die;
}
$userAgent = 'cvn-api-proxy/1.0 (Countervandalism Network) – https://github.com/countervandalism';

/**
 * Input
 */

$url = $conf->baseUrl;
if ( isset( $_SERVER['QUERY_STRING'] ) ) {
	$url .= '?' . $_SERVER['QUERY_STRING'];
}

/**
 * Request
 */

$ch = curl_init( $url );
curl_setopt_array( $ch, array(
	CURLOPT_USERAGENT => $userAgent,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_HEADER => true,
) );
$response = curl_exec( $ch );
curl_close( $ch );

list( $headers, $body ) = preg_split( '/([\r\n][\r\n])\\1/', $response, 2 );

// Turn headers into an array
$headers = preg_split( '/[\r\n]+/', $headers );

/**
 * Response
 */

// Clean start (no default handling like cookies and "x-powered-by")
header_remove();

foreach ( $headers as $header ) {
	if ( preg_match( '/^(content-type):/i', $header ) ) {
		header( $header, /* replace = */ true );
	}
}

print $body;
