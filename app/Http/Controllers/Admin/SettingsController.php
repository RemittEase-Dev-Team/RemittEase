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
        $request->validate([
            'app_name' => 'required|string|max:255',
            'app_version' => 'required|string',
            'currency' => 'required|string',
            'default_currency' => 'required|string',
            'transaction_fee' => 'required|numeric|min:0',
            'max_transaction_limit' => 'required|numeric|min:1',
            'min_transaction_limit' => 'required|numeric|min:1',
            'supported_currencies' => 'required|array',
            'stellar_network' => 'required|string',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
            'maintenance_mode' => 'required|boolean',
            'contact_email' => 'required|email',
            'support_phone' => 'required|string',
            'terms_of_service_url' => 'required|url',
            'privacy_policy_url' => 'required|url',
            'site_url' => 'required|url',
            'exchange_rate_api' => 'required|url',
            'support_email' => 'required|email',
            'kyc_verification_provider' => 'required|string',
            'moonpay_enabled' => 'required|boolean',
        ]);

        $settings = Settings::first();
        $settings->update($request->validated());

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
