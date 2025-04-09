<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Settings;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => Settings::first(),
        ]);
    }

    public function update(Request $request)
    {
        // Get the section being updated
        $section = $request->input('section', 'general');

        // Define validation rules for each section
        $validationRules = [
            'general' => [
                'app_name' => 'sometimes|string|max:255',
                'app_version' => 'sometimes|string',
                'currency' => 'sometimes|string',
                'default_currency' => 'sometimes|string',
                'transaction_fee' => 'sometimes|numeric|min:0',
                'max_transaction_limit' => 'sometimes|numeric|min:1',
                'min_transaction_limit' => 'sometimes|numeric|min:1',
                'supported_currencies' => 'sometimes|array',
                'stellar_network' => 'sometimes|string',
                'maintenance_mode' => 'sometimes|boolean',
            ],
            'contact' => [
                'contact_email' => 'sometimes|email',
                'support_phone' => 'sometimes|string',
                'support_email' => 'sometimes|email',
                'terms_of_service_url' => 'sometimes|url',
                'privacy_policy_url' => 'sometimes|url',
                'site_url' => 'sometimes|url',
            ],
            'api' => [
                'api_key' => 'sometimes|string',
                'api_secret' => 'sometimes|string',
                'exchange_rate_api' => 'sometimes|url',
                'kyc_verification_provider' => 'sometimes|string',
            ],
            'payment_gateways' => [
                'moonpay_enabled' => 'sometimes|boolean',
                'linkio_enabled' => 'sometimes|boolean',
                'yellowcard_enabled' => 'sometimes|boolean',
            ],
        ];

        // Validate based on the section
        $validated = $request->validate($validationRules[$section] ?? []);

        // Get the settings record
        $settings = Settings::first();

        // Update only the fields that were provided
        if (!empty($validated)) {
            $settings->update($validated);
        }

        return redirect()->back()->with('success', ucfirst($section) . ' settings updated successfully.');
    }
}
