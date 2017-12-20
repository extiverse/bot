<?php

namespace Flagrow\Discodian\Search\Listeners;

use Discodian\Extend\Concerns\AnswersMessages;
use Discodian\Extend\Messages\Message;
use Discodian\Extend\Responses\Response;
use Discodian\Extend\Responses\TextResponse;
use Discodian\Parts\Guild\Embed;
use Flagrow\Flarum\Api\Flarum;
use Flagrow\Flarum\Api\Resource\Collection;
use Flagrow\Flarum\Api\Resource\Item;
use Illuminate\Support\Arr;
use React\Promise\Deferred;
use React\Promise\Promise;

class DiscussionSearch implements AnswersMessages
{
    /**
     * @var Client
     */
    private $flarum;

    public function __construct(Flarum $flarum)
    {
        $this->flarum = $flarum;
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

        if ($tag = Arr::get($options, 'matches.tag.0')) {
            $search .= " tag:$tag";
        }

        /** @var Collection $response */
        $request = $this->flarum
            ->discussions()
            ->filter(['q' => $search])
            ->request();

        $discussions = $request->collect();

        $response = new TextResponse();
        $embed = new Embed([
            'title' => "Discussion search for '$search'.",
            'url' => 'https://discuss.flarum.org/?q=' . urlencode($search)
        ]);

        $fields = [];

        $discussions->splice(0, 5)->each(function (Item $item) use (&$fields) {
            $fields[] = [
                'name' => sprintf(
                    '%s',
                    $item->title
                ),
                'value' => sprintf(
                    '[Comments %d, participants %d](%s)',
                    $item->commentsCount,
                    $item->participantsCount,
                    sprintf(
                        'https://discuss.flarum.org/d/%d-%s',
                        $item->id,
                        $item->slug
                    )
                )
            ];
        });

        $embed->fields = $fields;
        $embed->color = 0x5f4bb6;

        if ($discussions->count() > 5) {
            $embed->footer = [
                'text' => sprintf("Showing only 5 discussions.")
            ];
        }

        $response->embed = $embed;

        $defer->resolve([$request, $response, $fields]);

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
        return '$discuss search ';
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
        return '\$discuss search(\st(ag)?:(?<tag>[^\s]+))? (?<search>.*)';
    }
}
