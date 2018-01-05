<?php

namespace Flagrow\Discodian\Artisan\Listeners;

use Discodian\Extend\Concerns\AnswersMessages;
use Discodian\Extend\Messages\Message;
use Discodian\Extend\Responses\Response;
use Discodian\Extend\Responses\TextResponse;
use Illuminate\Support\Str;
use React\Promise\Deferred;
use React\Promise\Promise;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class CallCommand implements AnswersMessages
{
    /**
     * @var string
     */
    protected $executable;

    public function __construct()
    {
        $this->executable = env('FLAGROW_ARTISAN_PATH');
        $this->admins = explode(',', env('DISCORD_ADMINS', ''));
    }

    /**
     * @param Message $message
     * @param array $options
     * @return null|Response|Response[]|Promise
     */
    public function respond(Message $message, array $options = [])
    {
        $command = Str::replaceFirst('$artisan ', '', $message->content);

        if (empty($this->admins)) {
            throw new \InvalidArgumentException("Admins must be defined.");
        }

        if (!in_array($message->author->id, $this->admins)) {
            return null;
        }

        $defer = new Deferred();

        $response = new TextResponse();

        logs("Artisan command $command");

        if (file_exists($this->executable)) {
            $process = new Process("php {$this->executable} $command");
            $process->enableOutput();

            try {
                $process->mustRun();
            } catch (ProcessFailedException $e) {
                $response->content = $e->getMessage();
            }

            $response->content = $process->getOutput();
        } else {
            throw new \InvalidArgumentException("Incorrect artisan path");
        }

        $defer->resolve([$response, $process]);

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
        return '$artisan';
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
        return null;
    }
}
