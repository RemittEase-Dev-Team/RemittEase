<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use App\Models\KYC;
use App\Models\Remittance;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'users' => User::select('id', 'name', 'email', 'created_at')->get(),
            'transactions' => Transaction::select('id', 'amount', 'currency', 'status', 'created_at')->get(),
            'kycRequests' => KYC::where('status', 'pending')->select('id', 'user_id', 'status', 'created_at')->get(),
            'remittances' => Remittance::select('id', 'user_id', 'amount', 'currency', 'status', 'created_at')->get(),
            'blogs' => Blog::select('id', 'title', 'created_at')->get(),
        ]);
    }
}
