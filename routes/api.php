<?php

use App\Http\Controllers\WalletController;
use App\Http\Controllers\WebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/wallet/currencies', [WalletController::class, 'getCurrencies']);
    Route::get('/wallet/banks', [WalletController::class, 'getBanks']);
    Route::post('/wallet/verify-account', [WalletController::class, 'verifyAccount']);
    Route::post('/wallet/send-transaction', [WalletController::class, 'sendTransaction']);
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
});

Route::post('webhooks/flutterwave', [WebhookController::class, 'handleFlutterwave']);
