<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\KYC;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class KYCController extends Controller
{
    public function index()
    {
        $kycs = KYC::all();
        return Inertia::render('Admin/KYC/Index', [
            'kycs' => $kycs,
        ]);
    }

    public function show($id)
    {
        $kyc = KYC::findOrFail($id);
        return Inertia::render('Admin/KYC/Show', [
            'kyc' => $kyc,
        ]);
    }
}
