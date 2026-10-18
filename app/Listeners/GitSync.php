<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use RuntimeException;
use Statamic\Contracts\Git\ProvidesCommitMessage;
use Statamic\Events\Concerns\ListensForContentEvents;
use Statamic\Events\Subscriber;

/**
 * Commits content saved in the control panel and pushes it to origin/live,
 * so a deploy never overwrites edits made on the server.
 * Commits carry [skip ci] so Coolify does not redeploy for them.
 */
class GitSync extends Subscriber
{
    use ListensForContentEvents;

    protected const PATHS = [
        'content',
        'public/assets',
        'resources/blueprints',
        'resources/fieldsets',
        'resources/forms',
        'resources/users',
        'resources/sites.yaml',
        'resources/preferences.yaml',
    ];

    protected static array $messages = [];

    protected function getListeners()
    {
        return collect($this->events)
            ->mapWithKeys(fn ($event) => [$event => static::class.'@queue'])
            ->all();
    }

    public function queue($event): void
    {
        if (! config('services.git_sync.token') || ! is_dir(base_path('.git'))) {
            return;
        }

        $message = $event instanceof ProvidesCommitMessage ? $event->commitMessage() : 'Content saved';

        if (static::$messages === []) {
            dispatch(fn () => static::sync())->afterResponse();
        }

        static::$messages[] = $message;
    }

    public static function sync(): void
    {
        $message = collect(static::$messages)->unique()->implode('; ');
        static::$messages = [];

        Cache::lock('git-sync', 120)->block(60, function () use ($message) {
            $paths = array_values(array_filter(self::PATHS, fn ($path) => file_exists(base_path($path))));

            static::git(['add', '-A', '--', ...$paths]);

            if (static::git(['diff', '--cached', '--quiet'], throw: false)->failed()) {
                static::git(['commit', '-m', "{$message} [skip ci]"]);
            }

            if (static::git(['pull', '--rebase', 'origin', 'live'], throw: false)->failed()) {
                static::git(['rebase', '--abort'], throw: false);
                Log::error('Git sync: could not rebase onto origin/live. Commit kept on the server only, resolve by hand.');

                return;
            }

            static::git(['push', 'origin', 'HEAD:live']);
        });
    }

    protected static function git(array $args, bool $throw = true)
    {
        $result = Process::path(base_path())
            ->env([
                'GIT_ASKPASS' => base_path('scripts/git-askpass.sh'),
                'GIT_SYNC_TOKEN' => config('services.git_sync.token'),
                'GIT_TERMINAL_PROMPT' => '0',
                'GIT_CONFIG_GLOBAL' => '/dev/null',
                'GIT_CONFIG_NOSYSTEM' => '1',
                'HOME' => storage_path('app'),
            ])
            ->run(['git', '-c', 'safe.directory='.base_path(), '-c', 'core.hooksPath=/dev/null', ...$args]);

        if ($throw && $result->failed()) {
            Log::error('Git sync: git '.$args[0].' failed', ['output' => $result->errorOutput()]);

            throw new RuntimeException('Git sync failed on git '.$args[0]);
        }

        return $result;
    }
}
