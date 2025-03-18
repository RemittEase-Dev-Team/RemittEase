<?php

namespace App\Http\Controllers;

use App\Models\Recipient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecipientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $recipients = Recipient::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($recipient) {
                return [
                    'id' => $recipient->id,
                    'name' => $recipient->name,
                    'email' => $recipient->email,
                    'phone' => $recipient->phone,
                    'country' => $recipient->country,
                    'bank_name' => $recipient->bank_name,
                    'account_number' => $recipient->account_number,
                    'routing_number' => $recipient->routing_number,
                    'swift_code' => $recipient->swift_code,
                    'is_verified' => $recipient->is_verified,
                    'created_at' => $recipient->created_at->format('Y-m-d H:i:s'),
                    'address' => $recipient->address,
                    'city' => $recipient->city,
                    'state' => $recipient->state,
                    'postal_code' => $recipient->postal_code,
                ];
            });

        return Inertia::render('User/Recipients/Index', [
            'recipients' => $recipients
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('User/Recipients/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth()->user()->id;
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:recipients',
            'bank_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'account_number' => 'required|string|max:255',
            'routing_number' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'country' => 'required|string',
        ]);

        $recipient = Recipient::create(array_merge($validatedData, ['user_id' => $user]));

        return redirect()->route('recipients.index')->with('status', 'Recipient created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        // Fetch the recipient using the ID from the route
        $recipient = Recipient::where('user_id', auth()->id())
            ->findOrFail($id);

        $recipientData = [
            'id' => $recipient->id,
            'name' => $recipient->name,
            'email' => $recipient->email,
            'phone' => $recipient->phone,
            'country' => $recipient->country,
            'bank_name' => $recipient->bank_name,
            'account_number' => $recipient->account_number,
            'routing_number' => $recipient->routing_number ?? '',
            'swift_code' => $recipient->swift_code ?? '',
            'address' => $recipient->address ?? '',
            'city' => $recipient->city ?? '',
            'state' => $recipient->state ?? '',
            'postal_code' => $recipient->postal_code ?? '',
            'is_verified' => $recipient->is_verified,
            'created_at' => $recipient->created_at ? $recipient->created_at->format('Y-m-d H:i:s') : null,
        ];

        return Inertia::render('User/Recipients/Show', [
            'recipient' => $recipientData
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, $id)
    {

        // Fetch the recipient using the ID from the route
        $recipient = Recipient::where('user_id', auth()->id())
            ->findOrFail($id);

        $recipientData = [
            'id' => $recipient->id,
            'name' => $recipient->name,
            'email' => $recipient->email,
            'phone' => $recipient->phone,
            'country' => $recipient->country,
            'bank_name' => $recipient->bank_name,
            'account_number' => $recipient->account_number,
            'routing_number' => $recipient->routing_number ?? '',
            'swift_code' => $recipient->swift_code ?? '',
            'address' => $recipient->address ?? '',
            'city' => $recipient->city ?? '',
            'state' => $recipient->state ?? '',
            'postal_code' => $recipient->postal_code ?? '',
        ];

        return Inertia::render('User/Recipients/Edit', [
            'recipient' => $recipientData
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Fetch the recipient using the ID from the route
        $recipient = Recipient::where('user_id', auth()->id())
            ->findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:recipients,email,' . $id,
            'bank_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'account_number' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'country' => 'nullable|string',
        ]);

        // Only update fields that are set in the request
        $updateData = array_filter($validatedData, function($value) {
            return $value !== null;
        });

        if (!empty($updateData)) {
            $recipient->update($updateData);
        }

        return redirect()->route('recipients.index')->with('status', 'Recipient updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        // Fetch the recipient using the ID from the route
        $recipient = Recipient::where('user_id', auth()->id())
            ->findOrFail($id);

        $recipient->delete();
        return redirect()->route('recipients.index')->with('status', 'Recipient deleted successfully.');
    }
}
