<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $user = Auth()->user()->id;
        $transactions = Transaction::where('user_id', $user)->get();
        return Inertia::render(
            'User/Rec',
            ['transactions' => $transactions]
        );
    }
}
