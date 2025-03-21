<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use Onfido\Client;

class KYCController extends Controller
{
    protected Client $onfido;

    public function __construct()
    {
        $this->onfido = new Client(config('services.onfido.api_token'));
    }

    public function index()
    {
        $users = User::with('kyc')->paginate(10);
        
        return Inertia::render('Admin/KYC/Index', [
            'users' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::with('kyc')->findOrFail($id);
        $kycCheck = null;

        if ($user->kyc && $user->kyc->check_id) {
            try {
                $kycCheck = $this->onfido->check->find($user->kyc->check_id);
            } catch (\Exception $e) {
                // Handle error
            }
        }

        return Inertia::render('Admin/KYC/Show', [
            'user' => $user,
            'kycCheck' => $kycCheck
        ]);
    }

    public function initiateKYC(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'user_id' => 'required|exists:users,id'
        ]);

        try {
            // Create an applicant
            $applicant = $this->onfido->applicant->create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
            ]);

            // Create an SDK token for the applicant
            $sdkToken = $this->onfido->sdkToken->generate([
                'applicant_id' => $applicant['id'],
                'referrer' => config('app.url')
            ]);

            // Store the applicant information
            $user = User::find($request->user_id);
            $user->kyc()->create([
                'applicant_id' => $applicant['id'],
                'status' => 'pending'
            ]);

            return response()->json([
                'sdk_token' => $sdkToken['token'],
                'applicant_id' => $applicant['id']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to initiate KYC process'
            ], 500);
        }
    }

    public function webhook(Request $request)
    {
        // Verify webhook signature
        if (!$this->verifyWebhookSignature($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        
        if ($payload['resource_type'] === 'check' && $payload['action'] === 'check.completed') {
            $check = $this->onfido->check->find($payload['object']['id']);
            
            // Update KYC status based on check result
            $kyc = KYC::where('check_id', $check['id'])->first();
            if ($kyc) {
                $kyc->update([
                    'status' => $check['result'] === 'clear' ? 'verified' : 'failed'
                ]);
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
}