<?php

namespace Flagrow\Discodian\Search\Providers;

use Discodian\Core\Foundation\Application;
use Flagrow\Discodian\Search\Api\Client as Api;
use Flagrow\Discodian\Search\Listeners\DiscussionSearch;
use Flagrow\Flarum\Api\Flarum;
use GuzzleHttp\Client;
use Illuminate\Support\ServiceProvider;

class ApiProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->when(Api::class)
            ->needs(Client::class)
            ->give(function (Application $app) {
                return new Client([
                    'base_uri' => env("FLAGROW_HOST"),
                    'headers' => [
                        'User-Agent' => $app->userAgent(),
                        'Authorization' => 'Bearer ' . env('FLAGROW_TOKEN')
                    ]
                ]);
            });

        $this->app->when(DiscussionSearch::class)
            ->needs(Flarum::class)
            ->give(function (Application $app) {
                return new Flarum('https://discuss.flarum.org');
            });
    }
}
