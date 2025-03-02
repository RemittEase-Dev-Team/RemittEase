<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\KYC;
use App\Models\Wallet;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index()
    {
        $users = User::with(['wallet', 'kyc'])->select('id', 'name', 'email', 'created_at')->get();

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show details of a specific user.
     */
    public function show($id)
    {
        $user = User::with(['wallet', 'kyc', 'transactions'])->findOrFail($id);

        // Since wallet is a hasMany relationship, we need to handle it as a collection
        $user->wallet_balance = $user->wallet->sum('balance') ?? 0;

        return Inertia::render('Admin/User/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing a user.
     */
    public function edit($id)
    {
        $user = User::with(['wallet', 'kyc'])->findOrFail($id);

        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'required|string|in:user,admin',
            'kyc_status' => 'required|string|in:pending,verified,rejected',
            'wallet_balance' => 'required|numeric|min:0',
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ]);

        // Update KYC status
        if ($user->kyc) {
            $user->kyc->update(['status' => $request->kyc_status]);
        }

        // Update Wallet Balance
        if ($user->wallet) {
            $user->wallet->update(['balance' => $request->wallet_balance]);
        }

        return redirect()->route('admin.users')->with('success', 'User updated successfully.');
    }
}
