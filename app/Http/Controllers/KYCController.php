<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Onfido\Api\DefaultApi;
use Onfido\Model\Applicant;
use Onfido\Model\CheckCreationRequest;
use App\Models\User;
use App\Models\Transaction;

class KYCController extends Controller
{
    protected $onfido;

    public function __construct(DefaultApi $onfido)
    {
        $this->onfido = $onfido;
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
        ]);
    }

    /**
     * Start KYC Verification
     */
    public function initiateKYC(Request $request)
    {
        $user = Auth::user();

        // Create Onfido applicant
        $applicant = new Applicant([
            'first_name' => $user->name,
            'last_name' => $user->last_name ?? 'Unknown',
            'email' => $user->email,
        ]);

        try {
            $createdApplicant = $this->onfido->createApplicant($applicant);
            $user->onfido_applicant_id = $createdApplicant->getId();
            $user->kyc_status = 'pending';
            $user->save();

            // Create KYC check
            $checkRequest = new CheckCreationRequest([
                'applicant_id' => $createdApplicant->getId(),
                'report_names' => ['document', 'facial_similarity_photo'],
            ]);
            $check = $this->onfido->createCheck($checkRequest);
            $user->onfido_check_id = $check->getId();
            $user->save();

            return redirect()->route('dashboard')->with('success', 'KYC verification initiated.');
        } catch (\Exception $e) {
            Log::error('Onfido API error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('error', 'KYC verification failed. Try again later.');
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

        $event = $request->input('payload.object');
        $checkId = $event['id'];
        $status = $event['status'];

        $user = User::where('onfido_check_id', $checkId)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Update KYC Status
        if ($status === 'completed') {
            $user->kyc_status = 'verified';
        } elseif ($status === 'rejected') {
            $user->kyc_status = 'rejected';
        }
        $user->save();

        return response()->json(['message' => 'KYC status updated']);
    }
}
