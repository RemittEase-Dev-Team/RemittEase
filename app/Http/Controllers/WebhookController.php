<?php

namespace App\Http\Controllers;

use App\Services\FlutterwaveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $flutterwaveService;

    public function __construct(FlutterwaveService $flutterwaveService)
    {
        $this->flutterwaveService = $flutterwaveService;
    }

    public function handleFlutterwave(Request $request)
    {
        Log::info('Received Flutterwave webhook', [
            'payload' => $request->all(),
            'signature' => $request->header('verif-hash')
        ]);

        $success = $this->flutterwaveService->handleWebhook(
            $request->all(),
            $request->header('verif-hash')
        );

        if (!$success) {
            return response()->json(['message' => 'Webhook processing failed'], 400);
        }

        return response()->json(['message' => 'Webhook processed successfully']);
    }
}
