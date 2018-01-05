<?php

/*
 * This file is part of the Discodian bot toolkit.
 *
 * (c) Daniël Klabbers <daniel@klabbers.email>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @see http://discodian.com
 * @see https://github.com/discodian
 */

namespace Flagrow\Discodian;

use Discodian\Extend\Responses\Registry;
use Illuminate\Contracts\Foundation\Application;

return function (Registry $registry, Application $app) {
    $app->register(Search\Providers\ApiProvider::class);
    $registry->add(Search\Listeners\PackageSearch::class);
    $registry->add(Search\Listeners\DiscussionSearch::class);
    $registry->add(Artisan\Listeners\CallCommand::class);
};
