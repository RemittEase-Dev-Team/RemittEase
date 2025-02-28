<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Inertia\Inertia;


class ManageTransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Transaction/Index', [
            'transactions' => Transaction::latest()->get(),
        ]);
    }
}
