<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://sandbox.api.yellowcard.io/business/channels', [
  'headers' => [
    'accept' => 'application/json',
  ],
]);

echo $response->getBody();