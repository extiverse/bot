<?php

namespace Flagrow\Discodian\Search\Api;

use GuzzleHttp\Client as Guzzle;

class Client
{
    /**
     * @var Guzzle
     */
    private $http;

    public function __construct(Guzzle $http)
    {
        $this->http = $http;
    }

    public function search(string $for): ?array
    {
        $response = $this->http->get('packages', [
            'query' => [
                'filter' => ['q' => $for],
                'page' => [
                    'size' => 5
                ],
                'sort' => '-downloads'
            ]
        ]);

        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            return json_decode($response->getBody()->getContents(), true);
        }

        logs("Failed call to flagrow.io", [$response->getStatusCode()]);

        return null;
    }
}
