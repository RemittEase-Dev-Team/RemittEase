<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Wallet;

class UserController extends Controller
{
    public function fetchUserData()
    {
        $user = Auth::user();
        return response()->json([
            'kyc_status' => $user->kyc_status,
            'wallet_balance' => optional($user->wallet)->balance ?? 0,
        ]);
    }

}
