<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\KYCController;
use App\Http\Controllers\Admin\TransactionController;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Middleware\RoleMiddleware;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

});


Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/sections', [SectionController::class, 'index'])->name('admin.sections');
    Route::post('/sections/{id}/update', [SectionController::class, 'update']);
    Route::get('/kyc', [KYCController::class, 'index'])->name('admin.kyc');
    Route::get('/kyc/{id}/approve', [KYCController::class, 'approve'])->name('admin.kyc.approve');
    Route::get('/kyc/{id}/reject', [KYCController::class, 'reject'])->name('admin.kyc.reject');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('admin.transactions');
    Route::get('/transactions/{id}/approve', [TransactionController::class, 'approve'])->name('admin.transactions.approve');
    Route::get('/transactions/{id}/reject', [TransactionController::class, 'reject'])->name('admin.transactions.reject');
    Route::get('/blogs', [BlogController::class, 'index'])->name('admin.blogs');
    Route::get('/blogs/create', [BlogController::class, 'create'])->name('admin.blogs.create');
    Route::post('/blogs', [BlogController::class, 'store'])->name('admin.blogs.store');
    Route::get('/blogs/{id}/edit', [BlogController::class, 'edit'])->name('admin.blogs.edit');
    Route::put('/blogs/{id}', [BlogController::class, 'update'])->name('admin.blogs.update');
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy'])->name('admin.blogs.destroy');
    Route::get('/blogs/{id}/approve', [BlogController::class, 'approve'])->name('admin.blogs.approve');
    Route::get('/blogs/{id}/reject', [BlogController::class, 'reject'])->name('admin.blogs.reject');
    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings');
    Route::post('/settings/{id}/update', [SettingsController::class, 'update']);
    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::get('/users/{id}/approve', [UserController::class, 'approve'])->name('admin.users.approve');
    Route::get('/users/{id}/reject', [UserController::class, 'reject'])->name('admin.users.reject');

});


// Staff Routes - Only Staff & Admin Can Access
Route::middleware(['auth', 'role:admin|staff'])->prefix('staff')->group(function () {
    Route::get('/kyc-verifications', [UserController::class, 'index'])->name('staff.kyc');
});

require __DIR__.'/auth.php';
