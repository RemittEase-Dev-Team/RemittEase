<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Settings;
use App\Models\Transaction;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $totalTransactions = Transaction::where('user_id', $user->id)->count();
        $settings = Settings::first();
        $moonpayEnabled = $settings->moonpay_enabled ?? true;

        return Inertia::render('Dashboard',
            [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'kyc_status' => $user->kyc_status,
                    'can_skip_kyc' => $totalTransactions < 100, // Allow skipping if transactions < $100
                    'wallet_balance' => optional($user->wallet)->balance ?? 0,
                ],
                'moonpayEnabled' => $moonpayEnabled,
            ]);
    }
}
