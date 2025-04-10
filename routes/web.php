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
use App\Http\Controllers\DepositController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MoonPayController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipientController;
use App\Http\Controllers\RemittanceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/how-it-works', [HomeController::class, 'howItWorks'])->name('how-it-works');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::post('/contact', [HomeController::class, 'sendContact'])->name('contact.send');
Route::get('/onboarding', [HomeController::class, 'onboarding'])->name('onboarding');

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

    Route::get('/deposit/{id}', [DashboardController::class, 'deposit'])->name('deposit.deposit');
    Route::get('/kyc', [App\Http\Controllers\KYCController::class, 'show'])->name('kyc.view');

    // Route::get('/deposit', [DashboardController::class, 'deposit'])->name('deposit.deposit');
    // Route::get('/kyc', [App\Http\Controllers\KYCController::class, 'show'])->name('kyc.show');

    Route::post('/kyc/start', [App\Http\Controllers\KYCController::class, 'initiateKYC'])->name('kyc.start');
    Route::post('/kyc/webhook', [App\Http\Controllers\KYCController::class, 'handleOnfidoWebhook'])->name('kyc.webhook');
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

    // Add this new route for fetching recipients for transfer
    Route::get('/api/recipients/transfer', [RecipientController::class, 'getRecipientsForTransfer'])->name('recipients.transfer');

    // Add these remittance routes
    Route::get('/remittance/banks', [RemittanceController::class, 'getBanks'])->name('remittance.banks');
    Route::post('/remittance/verify-account', [RemittanceController::class, 'verifyAccount'])->name('remittance.verify-account');
    Route::post('/remittance/transfer', [RemittanceController::class, 'initiateTransfer'])->name('remittance.transfer');
    Route::post('/remittance/test-transfer', [RemittanceController::class, 'testXLMTransfer'])->name('remittance.test-transfer');
    Route::post('/remittance/demo-transaction', [RemittanceController::class, 'createDemoTransaction'])->name('remittance.demo-transaction');
    Route::get('/remittance/transaction/{transactionId}/status', [RemittanceController::class, 'checkTransactionStatus'])->name('remittance.transaction.status');

    Route::get('/transactions', [App\Http\Controllers\TransactionController::class, 'index'])->name('transactions');

//     // Stellar wallet routes
//     Route::get('/stellar/address', [App\Http\Controllers\StellarController::class, 'generateAddress'])->name('stellar.address');
//     Route::post('/stellar/withdraw', [App\Http\Controllers\StellarController::class, 'withdraw'])->name('stellar.withdraw');
//     Route::post('/stellar/send', [App\Http\Controllers\StellarController::class, 'send'])->name('stellar.send');

    // Deposit routes
    Route::get('/deposit/status/{id}', [DepositController::class, 'checkStatus'])->name('deposit.check-status');
    Route::get('/deposit/history', [DepositController::class, 'getTransactionHistory'])->name('deposit.history');
    Route::post('/deposit/initiate-fiat-deposit', [DepositController::class, 'initiateFiatDeposit'])->name('deposit.initiate-fiat-deposit');
});


Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/sections', [SectionController::class, 'index'])->name('admin.sections');
    Route::get('/section/edit_home', [SectionController::class, 'home'])->name('admin.section.home');
    Route::get('/section/edit_features', [SectionController::class, 'features'])->name('admin.section.features');
    Route::get('/section/edit_about', [SectionController::class, 'about'])->name('admin.section.about');
    Route::get('/section/edit_quest', [SectionController::class, 'quest'])->name('admin.section.quest');

    // Section bulk update routes
    Route::put('/heroes/update', [SectionController::class, 'updateHeroes'])->name('admin.sections.heroes.update');
    Route::put('/features/update', [SectionController::class, 'updateFeatures'])->name('admin.sections.features.update');
    Route::put('/abouts/update', [SectionController::class, 'updateAbouts'])->name('admin.sections.abouts.update');
    Route::put('/quest-rewards/update', [SectionController::class, 'updateQuestRewards'])->name('admin.sections.quest-rewards.update');
    Route::put('/teams/update', [SectionController::class, 'updateTeams'])->name('admin.sections.teams.update');

    // Route::get('/kyc', [KYCController::class, 'index'])->name('admin.kyc');
    // Route::get('/kyc/{id}/approve', [KYCController::class, 'approve'])->name('admin.kyc.approve');
    // Route::get('/kyc/{id}/reject', [KYCController::class, 'reject'])->name('admin.kyc.reject');
    Route::get('/kyc', [KYCController::class, 'index'])->name('admin.kyc.index');
    Route::get('/kyc/{id}', [KYCController::class, 'show'])->name('admin.kyc.show');
    Route::post('/kyc/initiate', [KYCController::class, 'initiateKYC'])->name('admin.kyc.initiate');

    Route::get('/transactions', [ManageTransactionController::class, 'index'])->name('admin.transactions');
    Route::get('/transactions/pending', [ManageTransactionController::class, 'pending'])->name('admin.transactions.pending');
    Route::get('/transactions/completed', [ManageTransactionController::class, 'completed'])->name('admin.transactions.completed');
    Route::get('/transactions/{id}/approve', [ManageTransactionController::class, 'approve'])->name('admin.transactions.approve');
    Route::get('/transactions/{id}/reject', [ManageTransactionController::class, 'reject'])->name('admin.transactions.reject');
    Route::post('/transactions/bulk-approve', [ManageTransactionController::class, 'bulkApprove'])->name('admin.transactions.bulk-approve');
    Route::post('/transactions/bulk-reject', [ManageTransactionController::class, 'bulkReject'])->name('admin.transactions.bulk-reject');
    Route::post('/transactions/schedule', [ManageTransactionController::class, 'scheduleTransactions'])->name('admin.transactions.schedule');
    Route::get('/transactions/{id}', [ManageTransactionController::class, 'show'])->name('admin.transactions.show');

    // Bulk remittance routes
    Route::get('/bulk-remittance', [ManageTransactionController::class, 'bulkRemittanceForm'])->name('admin.bulk-remittance');
    Route::post('/bulk-remittance/process', [ManageTransactionController::class, 'processBulkRemittance'])->name('admin.bulk-remittance.process');
    Route::post('/bulk-remittance/upload', [ManageTransactionController::class, 'uploadBulkRemittanceFile'])->name('admin.bulk-remittance.upload');

    Route::get('/blogs', [BlogController::class, 'index'])->name('admin.blogs');
    Route::get('/blogs/create', [BlogController::class, 'create'])->name('admin.blogs.create');
    Route::post('/blogs', [BlogController::class, 'store'])->name('admin.blogs.store');
    Route::get('/blogs/{id}/edit', [BlogController::class, 'edit'])->name('admin.blogs.edit');
    Route::put('/blogs/{id}', [BlogController::class, 'update'])->name('admin.blogs.update');
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy'])->name('admin.blogs.destroy');
    Route::post('/blogs/{id}/approve', [BlogController::class, 'approve'])->name('admin.blogs.approve');
    Route::post('/blogs/{id}/reject', [BlogController::class, 'reject'])->name('admin.blogs.reject');

    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings');
    Route::post('/settings/{id}/update', [SettingsController::class, 'update'])->name('admin.settings.update');
    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('admin.users.show');
    Route::get('/users/{id}/approve', [UserController::class, 'approve'])->name('admin.users.approve');
    Route::get('/users/{id}/reject', [UserController::class, 'reject'])->name('admin.users.reject');
    Route::get('/currencies', [CurrencyController::class, 'index'])->name('admin.currencies');

    Route::get('hero', [HeroController::class, 'index'])->name('admin.hero.index');
    Route::get('hero/create', [HeroController::class, 'create'])->name('admin.hero.create');
    Route::post('hero', [HeroController::class, 'store'])->name('admin.hero.store');
    Route::get('hero/{hero}', [HeroController::class, 'show'])->name('admin.hero.show');
    Route::get('hero/{hero}/edit', [HeroController::class, 'edit'])->name('admin.hero.edit');
    Route::put('hero/{hero}', [HeroController::class, 'update'])->name('admin.hero.update');
    Route::delete('hero/{hero}', [HeroController::class, 'destroy'])->name('admin.hero.destroy');

    Route::get('features', [FeaturesController::class, 'index'])->name('admin.features.index');
    Route::get('features/create', [FeaturesController::class, 'create'])->name('admin.features.create');
    Route::post('features', [FeaturesController::class, 'store'])->name('admin.features.store');
    Route::get('features/{feature}', [FeaturesController::class, 'show'])->name('admin.features.show');
    Route::get('features/{feature}/edit', [FeaturesController::class, 'edit'])->name('admin.features.edit');
    Route::put('features/{feature}', [FeaturesController::class, 'update'])->name('admin.features.update');
    Route::delete('features/{feature}', [FeaturesController::class, 'destroy'])->name('admin.features.destroy');

    Route::get('roadmaps', [RoadmapController::class, 'index'])->name('admin.roadmap.index');
    Route::get('roadmaps/create', [RoadmapController::class, 'create'])->name('admin.roadmap.create');
    Route::post('roadmaps', [RoadmapController::class, 'store'])->name('admin.roadmap.store');
    Route::get('roadmap/{roadmap}', [RoadmapController::class, 'show'])->name('admin.roadmap.show');
    Route::get('roadmap/{roadmap}/edit', [RoadmapController::class, 'edit'])->name('admin.roadmap.edit');
    Route::put('roadmaps/{roadmap}', [RoadmapController::class, 'update'])->name('admin.roadmap.update');
    Route::delete('roadmap/{roadmap}', [RoadmapController::class, 'destroy'])->name('admin.roadmap.destroy');

    Route::get('about', [AboutController::class, 'index'])->name('admin.about.index');
    Route::get('about/create', [AboutController::class, 'create'])->name('admin.about.create');
    Route::post('about', [AboutController::class, 'store'])->name('admin.about.store');
    Route::get('about/{about}', [AboutController::class, 'show'])->name('admin.about.show');
    Route::get('about/{about}/edit', [AboutController::class, 'edit'])->name('admin.about.edit');
    Route::put('about/{about}', [AboutController::class, 'update'])->name('admin.about.update');
    Route::delete('about/{about}', [AboutController::class, 'destroy'])->name('admin.about.destroy');

    Route::get('blog', [BlogController::class, 'index'])->name('admin.blog.index');
    Route::get('blog/create', [BlogController::class, 'create'])->name('admin.blog.create');
    Route::post('blog', [BlogController::class, 'store'])->name('admin.blog.store');
    Route::get('blog/{blog}', [BlogController::class, 'show'])->name('admin.blog.show');
    Route::get('blog/{blog}/edit', [BlogController::class, 'edit'])->name('admin.blog.edit');
    Route::put('blog/{blog}', [BlogController::class, 'update'])->name('admin.blog.update');
    Route::delete('blog/{blog}', [BlogController::class, 'destroy'])->name('admin.blog.destroy');

    Route::get('quest-rewards', [QuestRewardController::class, 'index'])->name('admin.quest-rewards.index');
    Route::get('quest-rewards/create', [QuestRewardController::class, 'create'])->name('admin.quest-rewards.create');
    Route::post('quest-rewards', [QuestRewardController::class, 'store'])->name('admin.quest-rewards.store');
    Route::get('quest-rewards/{quest_reward}', [QuestRewardController::class, 'show'])->name('admin.quest-rewards.show');
    Route::get('quest-rewards/{quest_reward}/edit', [QuestRewardController::class, 'edit'])->name('admin.quest-rewards.edit');
    Route::put('quest-rewards/{quest_reward}', [QuestRewardController::class, 'update'])->name('admin.quest-rewards.update');
    Route::delete('quest-rewards/{quest_reward}', [QuestRewardController::class, 'destroy'])->name('admin.quest-rewards.destroy');

    Route::get('/teams', [TeamController::class, 'index'])->name('admin.teams.index');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('admin.teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('admin.teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('admin.teams.show');
    Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('admin.teams.edit');
    Route::post('/teams/{team}/update', [TeamController::class, 'update'])->name('admin.teams.update');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('admin.teams.destroy');
});



// Staff Routes - Only Staff & Admin Can Access
Route::middleware(['auth', 'role:admin|staff'])->prefix('staff')->group(function () {
    Route::get('/kyc-verifications', [UserController::class, 'index'])->name('staff.kyc');
});

// KYC Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/kyc', [App\Http\Controllers\KYCController::class, 'show'])->name('kyc.show');
    Route::post('/kyc/start', [App\Http\Controllers\KYCController::class, 'initiateKYC'])->name('kyc.start');
    Route::post('/kyc/webhook', [App\Http\Controllers\KYCController::class, 'handleOnfidoWebhook'])->name('kyc.webhook');
    Route::post('/kyc/skip', [App\Http\Controllers\KYCController::class, 'skipKYC'])->name('kyc.skip');
    Route::post('/kyc/initiate', [KYCController::class, 'initiateKYC'])->name('kyc.initiate');
    Route::post('/kyc/complete', [KYCController::class, 'completeKYC'])->name('kyc.complete');
    Route::post('/kyc/webhook', [KYCController::class, 'handleWebhook'])->name('kyc.webhook');
});

Route::get('/stellar-test', [RemittanceController::class, 'stellarTest'])->name('stellar.test');

// Demo route to show mockup transactions
Route::get('/demo/transactions', function() {
    $transactions = \App\Models\Transaction::where('reference', 'like', 'MOCKUP_%')
        ->orWhere('type', 'test')
        ->latest()
        ->take(5)
        ->get();

    return view('demo-transactions', [
        'transactions' => $transactions
    ]);
})->name('demo.transactions');

require __DIR__.'/auth.php';

