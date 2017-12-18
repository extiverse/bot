<?php

namespace Flagrow\Discodian\Search\Listeners;

use Discodian\Extend\Concerns\AnswersMessages;
use Discodian\Extend\Messages\Message;
use Discodian\Extend\Responses\Response;
use Discodian\Extend\Responses\TextResponse;
use Discodian\Parts\Guild\Embed;
use Flagrow\Discodian\Search\Api\Client;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use React\Promise\Deferred;
use React\Promise\Promise;

class PackageSearch implements AnswersMessages
{

    /**
     * @var Client
     */
    private $http;

    public function __construct(Client $http)
    {
        $this->http = $http;
    }

    /**
     * @param Message $message
     * @param array $options
     * @return null|Response|Response[]|Promise
     */
    public function respond(Message $message, array $options = [])
    {
        $search = Arr::get($options, 'matches.search.0');

        $defer = new Deferred();

        $payload = $this->http->search($search);

        $total = Arr::get($payload, 'meta.items_total');
        $packages = Arr::get($payload, 'data', []);

        $response = new TextResponse();
        $embed = new Embed([
            'title' => "Your extensions search for term: '$search'",
            'url' => 'https://flagrow.io/packages?sort=-downloads&filter[q]=' . $search,
        ]);

        $fields = [];

        foreach ($packages as $package) {
            $fields[] = [
                'name' => $package['attributes']['name'],
                'value' => Str::limit($package['attributes']['description'], 1020, '..')
            ];
        }

        $embed->fields = $fields;
        $embed->color = 0x5f4bb6;
        if ($total > 5) {
            $embed->footer = ['text' => sprintf("Showing 5 out of $total extensions.")];
        }

        $response->embed = $embed;

        $defer->resolve([$response, $packages]);

        return $defer->promise();
    }

    /**
     * In case you want to listen to specific commands.
     *
     * @eg with $ext as prefix: "$ext search foo"
     *
     * @return null|string
     */
    public function forPrefix(): ?string
    {
        return '$ext search ';
    }

    /**
     * Listen to messages only when messaged.
     *
     * @return bool
     */
    public function whenMentioned(): bool
    {
        return false;
    }

    /**
     * Listen to messages only when addressed. So the bot
     * has to be mentioned first.
     *
     * @return bool
     */
    public function whenAddressed(): bool
    {
        return false;
    }

    /**
     * Specify the channels to listen to.
     *
     * @return array|null
     */
    public function onChannels(): ?array
    {
        return null;
    }

    /**
     * Specify a regular expression match to check for in a message
     * text to listen to.
     *
     * @return null|string
     */
    public function whenMessageMatches(): ?string
    {
        return 'ext search (?<search>[a-zA-Z0-9]+)';
    }
}
