<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    protected $fillable = [
        'app_name',
        'app_version',
        'currency',
        'default_currency',
        'transaction_fee',
        'max_transaction_limit',
        'min_transaction_limit',
        'supported_currencies',
        'stellar_network',
        'api_key',
        'api_secret',
        'maintenance_mode',
        'contact_email',
        'support_phone',
        'terms_of_service_url',
        'privacy_policy_url',
    ];

    protected $casts = [
        'supported_currencies' => 'array',
        'maintenance_mode' => 'boolean',
    ];

    // Additional methods for settings management can be added here
}
