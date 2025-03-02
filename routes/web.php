<?php


use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RemittanceController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\KYCController;
use App\Http\Controllers\Admin\ManageTransactionController;
use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\HeroController;
use App\Http\Controllers\Admin\FeaturesController;
use App\Http\Controllers\Admin\RoadmapController;
use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\QuestRewardController;
use App\Http\Controllers\Admin\TeamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HomeController;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware([
    'auth',
    'verified',
    // 'kyc.verified'
    ])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
    Route::get('/kyc', [App\Http\Controllers\KYCController::class, 'show'])->name('kyc.view');
    Route::post('/kyc/start', [App\Http\Controllers\KYCController::class, 'initiateKYC'])->name('kyc.start');
    Route::post('/kyc/skip', [App\Http\Controllers\KYCController::class, 'skipKYC'])->name('kyc.skip');
    Route::post('/deposit', [RemittanceController::class, 'loadCash'])->name('deposit');
    Route::post('/withdraw', [RemittanceController::class, 'withdrawFunds'])->name('withdraw');
});


Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/sections', [SectionController::class, 'index'])->name('admin.sections');
    Route::post('/sections/{id}/update', [SectionController::class, 'update']);
    Route::get('/kyc', [KYCController::class, 'index'])->name('admin.kyc');
    Route::get('/kyc/{id}/approve', [KYCController::class, 'approve'])->name('admin.kyc.approve');
    Route::get('/kyc/{id}/reject', [KYCController::class, 'reject'])->name('admin.kyc.reject');
    Route::get('/transactions', [ManageTransactionController::class, 'index'])->name('admin.transactions');
    Route::get('/transactions/{id}/approve', [ManageTransactionController::class, 'approve'])->name('admin.transactions.approve');
    Route::get('/transactions/{id}/reject', [ManageTransactionController::class, 'reject'])->name('admin.transactions.reject');
    Route::get('/blogs', [BlogController::class, 'index'])->name('admin.blogs');
    Route::get('/blogs/create', [BlogController::class, 'create'])->name('admin.blogs.create');
    Route::post('/blogs', [BlogController::class, 'store'])->name('admin.blogs.store');
    Route::get('/blogs/{id}/edit', [BlogController::class, 'edit'])->name('admin.blogs.edit');
    Route::post('/blogs/{id}', [BlogController::class, 'update'])->name('admin.blogs.update');
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy'])->name('admin.blogs.destroy');
    Route::get('/blogs/{id}/approve', [BlogController::class, 'approve'])->name('admin.blogs.approve');
    Route::get('/blogs/{id}/reject', [BlogController::class, 'reject'])->name('admin.blogs.reject');
    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings');
    Route::post('/settings/{id}/update', [SettingsController::class, 'update']);
    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::get('/users/{id}/approve', [UserController::class, 'approve'])->name('admin.users.approve');
    Route::get('/users/{id}/reject', [UserController::class, 'reject'])->name('admin.users.reject');
    Route::get('/currencies', [CurrencyController::class, 'index'])->name('admin.currencies');
    Route::resource('heroes', HeroController::class);
    Route::resource('features', FeaturesController::class);
    Route::resource('roadmaps', RoadmapController::class);
    Route::resource('abouts', AboutController::class);
    Route::resource('blogs', BlogController::class);
    Route::resource('quest-rewards', QuestRewardController::class);
    Route::resource('teams', TeamController::class);
});


// Staff Routes - Only Staff & Admin Can Access
Route::middleware(['auth', 'role:admin|staff'])->prefix('staff')->group(function () {
    Route::get('/kyc-verifications', [UserController::class, 'index'])->name('staff.kyc');
});

require __DIR__.'/auth.php';
