<?php

namespace Flagrow\Discodian\Statistics\Scheduled;

use Discodian\Extend\Responses\TextResponse;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

class ExtensionCount extends ServiceProvider
{
    public function register()
    {
        /** @var Schedule $schedule */
        $schedule = $this->app->make(Schedule::class);

        $schedule
            ->call(function () {
                return $this->createResponse();
            })
            ->withoutOverlapping()
            ->dailyAt(env('FLAGROW_STATISTICS_POST_AT'));
    }

    public function createResponse()
    {
        $response = new TextResponse();
        $response->channel_id = env('FLAGROW_STATISTICS_CHANNEL');
    }
}
