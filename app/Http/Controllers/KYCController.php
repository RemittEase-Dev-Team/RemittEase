<?php

namespace App\Http\Controllers;

use App\Services\StellarService;
use Illuminate\Http\Request;
use Onfido\Onfido;
use Onfido\Configuration;
use Onfido\ApiException;
use Onfido\Model\Applicant;
use Onfido\Model\Check;
use Illuminate\Support\Facades\Auth;

class KYCController extends Controller
{
    protected $stellarService;

    public function __construct(StellarService $stellarService)
    {
        $this->stellarService = $stellarService;
    }

    public function verify(Request $request)
    {
        $user = Auth::user();

        // Initialize Onfido client
        $onfido = new Onfido(Configuration::apiKey(env('ONIIDO_API_KEY_SANDBOX')));

        try {
            // Create an applicant
            $applicant = $onfido->applicant()->create(new Applicant(["first_name" => $user->name, "last_name" => "", "email" => $user->email]));

            // Create a check
            $check = $onfido->check()->create($applicant->getId(), new Check(["report_names" => ["identity_enhanced"]]));

            // Poll for check completion
            $checkResult = $onfido->check()->find($check->getId());

            if ($checkResult->getStatus() === 'complete' && $checkResult->getResult() === 'clear') {
                // If KYC is successful
                $user->kyc_status = 'verified';

                // Create Stellar account
                $wallet = $this->stellarService->createAccount();
                $user->stellar_public_key = $wallet['public_key'];
                $user->stellar_secret_seed = encrypt($wallet['secret_seed']); // Encrypt the secret seed for security

                $user->save();

                return redirect()->route('dashboard')->with('status', 'KYC verified and Stellar wallet created.');
            } else {
                return redirect()->back()->with('error', 'KYC verification failed.');
            }
        } catch (ApiException $e) {
            return redirect()->back()->with('error', 'An error occurred during KYC verification.');
        }
    }
}
