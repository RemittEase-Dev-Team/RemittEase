<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Soneso\StellarSDK\Crypto\KeyPair;

class GenerateStellarKeypair extends Command
{
    protected $signature = 'stellar:generate-keypair';
    protected $description = 'Generate a new Stellar keypair';

    public function handle()
    {
        $keypair = KeyPair::random();
        $this->info('Public Key: ' . $keypair->getAccountId());
        $this->info('Secret Key: ' . $keypair->getSecretSeed());

        // Optional: automatically update .env file
        if ($this->confirm('Would you like to update your .env file with this secret key?')) {
            $envFile = base_path('.env');
            $contents = file_get_contents($envFile);
            $contents = preg_replace(
                '/STELLAR_ADMIN_SECRET=.*/',
                'STELLAR_ADMIN_SECRET=' . $keypair->getSecretSeed(),
                $contents
            );
            file_put_contents($envFile, $contents);
            $this->info('.env file updated successfully!');
        }
    }
}
