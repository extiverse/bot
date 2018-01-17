<?php

namespace Flagrow\Discodian\Bookmarks;

use Discodian\Extend\Concerns\AnswersMessages;
use Discodian\Extend\Messages\Message;
use Discodian\Extend\Responses\Response;
use Discodian\Extend\Responses\TextResponse;
use React\Promise\Promise;

class SetCommand implements AnswersMessages
{

    /**
     * @param Message $message
     * @param array $options
     * @return null|Response|Response[]|Promise
     */
    public function respond(Message $message, array $options = [])
    {
        if (!$message->author->isAdmin()) {
            return (new TextResponse())
                ->with('You have no permission to that command.')
                ->privately();
        }


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
        return '$bookmark set ';
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
        return '\$bookmark set (?<name>[^\s]+)\s(?<url>https?:\/\/[^\s]+)';
    }
}
