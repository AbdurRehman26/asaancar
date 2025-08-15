<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class HorizonManager extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'horizon:manage {action : The action to perform (start|stop|restart|status|clear)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage Laravel Horizon operations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'start':
                $this->info('Starting Horizon...');
                $this->call('horizon');
                break;
                
            case 'stop':
                $this->info('Stopping Horizon...');
                $this->call('horizon:terminate');
                break;
                
            case 'restart':
                $this->info('Restarting Horizon...');
                $this->call('horizon:terminate');
                sleep(2);
                $this->call('horizon');
                break;
                
            case 'status':
                $this->call('horizon:status');
                break;
                
            case 'clear':
                $this->info('Clearing Horizon data...');
                $this->call('horizon:clear');
                break;
                
            default:
                $this->error("Unknown action: {$action}");
                $this->info('Available actions: start, stop, restart, status, clear');
                return 1;
        }

        return 0;
    }
} 