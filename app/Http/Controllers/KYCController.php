<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Onfido\Api\DefaultApi;
use Onfido\Configuration;
use App\Models\User;
use App\Models\Transaction;
use GuzzleHttp\Client;

class KYCController extends Controller
{
    protected DefaultApi $onfido;

    public function __construct()
    {
        $token = 'Token token=' . config('services.onfido.api_token');
        $httpClient = new Client([
            'base_uri' => 'https://api.onfido.com/v3',
            'headers' => [
                'Authorization' => $token,
                'User-Agent' => 'RemittEase/1.0'
            ]
        ]);

        $this->onfido = new DefaultApi(
            $httpClient,
            new Configuration()
        );
    }

    /**
     * Show KYC Page with Server-Side Props
     */
    public function show()
    {
        $user = Auth::user();
        $totalTransactions = Transaction::where('user_id', $user->id)->sum('amount');

        return Inertia::render('User/KYC', [
            'kyc_status' => $user->kyc_status,
            'can_skip' => $totalTransactions < 100,
            'wallet_balance' => optional($user->wallet)->balance ?? 0,
            'sdkToken' => $user->onfido_sdk_token,
            'workflowRunId' => $user->onfido_check_id,
        ]);
    }

    /**
     * Start KYC Verification
     */
    public function initiateKYC(Request $request)
    {
        $user = Auth::user();

        try {
            // Create an applicant
            $applicantData = [
                'first_name' => $user->name,
                'last_name' => $user->last_name ?? 'Unknown',
                'email' => $user->email,
            ];

            $applicant = $this->onfido->createApplicant($applicantData);

            // Store the applicant ID
            $user->onfido_applicant_id = $applicant['id'];
            $user->kyc_status = 'pending';
            $user->save();

            // Generate SDK token
            $sdkTokenData = [
                'applicant_id' => $applicant['id'],
                'referrer' => config('app.url')
            ];

            $sdkToken = $this->onfido->generateSdkToken($sdkTokenData);
            $user->onfido_sdk_token = $sdkToken['token'];
            $user->save();

            // Create a workflow run (check)
            $checkData = [
                'applicant_id' => $applicant['id'],
                'report_names' => ['document', 'facial_similarity_photo'],
                'consider' => [
                    'document_authenticity',
                    'facial_similarity',
                    'visual_authenticity',
                    'police_record',
                    'right_to_work'
                ]
            ];

            $check = $this->onfido->createCheck($checkData);
            $user->onfido_check_id = $check['id'];
            $user->save();

            return back()->with([
                'sdkToken' => $sdkToken['token'],
                'workflowRunId' => $check['id']
            ]);

        } catch (\Exception $e) {
            Log::error('Onfido API error: ' . $e->getMessage());
            return back()->with('error', 'Failed to initiate KYC verification');
        }
    }

    /**
     * Skip KYC for Users Below Transaction Limit ($100)
     */
    public function skipKYC()
    {
        $user = Auth::user();

        if (Transaction::where('user_id', $user->id)->sum('amount') < 100) {
            $user->kyc_status = 'skipped';
            $user->save();
            return redirect()->route('dashboard')->with('success', 'KYC skipped for now.');
        }

        return redirect()->route('dashboard')->with('error', 'KYC is required for further transactions.');
    }

    /**
     * Handle Webhook from Onfido (Automatic KYC Updates)
     */
    public function handleOnfidoWebhook(Request $request)
    {
        Log::info('Onfido Webhook Received', $request->all());

        // Verify webhook signature
        if (!$this->verifyWebhookSignature($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = $request->all();

        if ($payload['resource_type'] === 'check' && $payload['action'] === 'check.completed') {
            $check = $this->onfido->getCheck($payload['object']['id']);

            $user = User::where('onfido_check_id', $check['id'])->first();
            if ($user) {
                $user->kyc_status = $check['result'] === 'clear' ? 'verified' : 'rejected';
                $user->save();
            }
        }

        return response()->json(['message' => 'Webhook processed']);
    }

    private function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Sha2-Signature');
        $payload = $request->getContent();
        $webhookToken = config('services.onfido.webhook_token');

        return hash_hmac('sha256', $payload, $webhookToken) === $signature;
    }

    /**
     * Complete KYC Verification
     */
    public function completeKYC(Request $request)
    {
        $user = Auth::user();

        try {
            // Get the check result
            $check = $this->onfido->getCheck($user->onfido_check_id);

            // Update user's KYC status based on the check result
            if ($check['result'] === 'clear') {
                $user->kyc_status = 'verified';
                $user->kyc_verified_at = now();
                $user->save();

                return back()->with('success', 'KYC verification completed successfully');
            } else {
                $user->kyc_status = 'failed';
                $user->save();

                return back()->with('error', 'KYC verification failed. Please try again.');
            }
        } catch (\Exception $e) {
            Log::error('Onfido check completion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to complete KYC verification');
        }
    }
}
