<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Application as Artisan;

class CommandServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register commands here if needed
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Load all commands from the Commands directory
        if ($this->app->runningInConsole()) {
            $commandsPath = app_path('Console/Commands');

            // Get all PHP files in the Commands directory
            $commandFiles = glob("{$commandsPath}/*.php");

            foreach ($commandFiles as $file) {
                $className = pathinfo($file, PATHINFO_FILENAME);
                $fullClassName = "App\\Console\\Commands\\{$className}";

                // Register the command if the class exists
                if (class_exists($fullClassName)) {
                    Artisan::starting(function ($artisan) use ($fullClassName) {
                        $artisan->resolve($fullClassName);
                    });
                }
            }
        }
    }
}
