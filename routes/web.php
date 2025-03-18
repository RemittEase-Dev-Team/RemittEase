<?php


use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\FeaturesController;
use App\Http\Controllers\Admin\HeroController;
use App\Http\Controllers\Admin\KYCController;
use App\Http\Controllers\Admin\ManageTransactionController;
use App\Http\Controllers\Admin\QuestRewardController;
use App\Http\Controllers\Admin\RoadmapController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MoonPayController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipientController;
use App\Http\Controllers\RemittanceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware([
    'auth',
    // 'verified',
    // 'kyc.verified'
    ])->group(function () {
    Route::get('/moonpay', function () {
        return Inertia::render('MoonPay');
    });


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
    Route::get('/kyc', [App\Http\Controllers\KYCController::class, 'show'])->name('kyc.view');
    Route::post('/kyc/start', [App\Http\Controllers\KYCController::class, 'initiateKYC'])->name('kyc.start');
    Route::post('/kyc/skip', [App\Http\Controllers\KYCController::class, 'skipKYC'])->name('kyc.skip');
    Route::post('/deposit', [RemittanceController::class, 'loadCash'])->name('deposit');
    Route::post('/withdraw', [RemittanceController::class, 'withdrawFunds'])->name('withdraw');
    Route::get('/recipients', [RecipientController::class, 'index'])->name('recipients.index');
    Route::post('/recipients', [RecipientController::class, 'store'])->name('recipients.store');
    Route::get('/recipients/create', [RecipientController::class, 'create'])->name('recipients.create');
    Route::get('/recipients/{id}/edit', [RecipientController::class, 'edit'])->name('recipients.edit');
    Route::patch('/recipients/{id}', [RecipientController::class, 'update'])->name('recipients.update');
    Route::get('/recipients/{id}', [RecipientController::class, 'show'])->name('recipients.show');
    Route::delete('/recipients/{id}', [RecipientController::class, 'destroy'])->name('recipients.destroy');
    // MoonPay routes
    Route::post('/moonpay/create', [App\Http\Controllers\MoonPayController::class, 'createTransaction'])->name('moonpay.create');
    Route::post('/moonpay/webhook', [App\Http\Controllers\MoonPayController::class, 'webhook'])->name('moonpay.webhook');

    // Stellar wallet routes
    Route::get('/stellar/address', [App\Http\Controllers\StellarController::class, 'generateAddress'])->name('stellar.address');
    Route::post('/stellar/withdraw', [App\Http\Controllers\StellarController::class, 'withdraw'])->name('stellar.withdraw');
    Route::post('/stellar/send', [App\Http\Controllers\StellarController::class, 'send'])->name('stellar.send');
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
    Route::get('/users/{id}', [UserController::class, 'show'])->name('admin.users.show');
    Route::get('/users/{id}/approve', [UserController::class, 'approve'])->name('admin.users.approve');
    Route::get('/users/{id}/reject', [UserController::class, 'reject'])->name('admin.users.reject');
    Route::get('/currencies', [CurrencyController::class, 'index'])->name('admin.currencies');
    Route::resource('heroes', HeroController::class);
    Route::resource('features', FeaturesController::class);
    Route::resource('roadmaps', RoadmapController::class);
    Route::resource('abouts', AboutController::class);
    Route::resource('blogs', BlogController::class);
    Route::resource('quest-rewards', QuestRewardController::class);
    Route::get('/teams', [TeamController::class, 'index'])->name('admin.teams.index');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('admin.teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('admin.teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('admin.teams.show');
    Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('admin.teams.edit');
    Route::patch('/teams/{team}', [TeamController::class, 'update'])->name('admin.teams.update');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('admin.teams.destroy');
    Route::resource('transactions', ManageTransactionController::class);



});


// Staff Routes - Only Staff & Admin Can Access
Route::middleware(['auth', 'role:admin|staff'])->prefix('staff')->group(function () {
    Route::get('/kyc-verifications', [UserController::class, 'index'])->name('staff.kyc');
});

require __DIR__.'/auth.php';
