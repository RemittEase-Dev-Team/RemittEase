<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RemittEase - Demo Transactions</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-10 text-center">
            <h1 class="text-3xl font-bold text-blue-800">RemittEase</h1>
            <p class="text-gray-600">Stellar Blockchain Transaction Demo</p>
        </header>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">Mock Transactions for Demo</h2>

            @if($transactions->isEmpty())
                <p class="text-gray-500">No demo transactions found. Please run the command: <code class="bg-gray-200 px-2 py-1 rounded">php artisan stellar:test-tx 3 --save</code></p>
            @else
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-blue-800 text-white text-left">
                                <th class="py-3 px-4 font-semibold">ID</th>
                                <th class="py-3 px-4 font-semibold">Type</th>
                                <th class="py-3 px-4 font-semibold">Amount</th>
                                <th class="py-3 px-4 font-semibold">Status</th>
                                <th class="py-3 px-4 font-semibold">Reference</th>
                                <th class="py-3 px-4 font-semibold">Transaction Hash</th>
                                <th class="py-3 px-4 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($transactions as $transaction)
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="py-3 px-4">{{ $transaction->id }}</td>
                                    <td class="py-3 px-4 capitalize">{{ $transaction->type }}</td>
                                    <td class="py-3 px-4">{{ $transaction->amount }} {{ $transaction->asset_code }}</td>
                                    <td class="py-3 px-4">
                                        <span class="px-2 py-1 rounded-full text-xs font-semibold
                                            @if($transaction->status == 'completed') bg-green-100 text-green-800
                                            @elseif($transaction->status == 'pending') bg-yellow-100 text-yellow-800
                                            @else bg-red-100 text-red-800 @endif">
                                            {{ $transaction->status }}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-sm font-mono">{{ $transaction->reference }}</td>
                                    <td class="py-3 px-4">
                                        @if($transaction->transaction_hash)
                                            <a href="https://stellar.expert/explorer/testnet/tx/{{ $transaction->transaction_hash }}"
                                               target="_blank"
                                               class="text-blue-600 hover:underline font-mono text-xs break-all">
                                                {{ \Illuminate\Support\Str::limit($transaction->transaction_hash, 20) }}
                                            </a>
                                        @else
                                            <span class="text-gray-400">-</span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4 text-sm">{{ $transaction->created_at->format('M d, Y H:i') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                <div class="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 class="font-semibold text-blue-800 mb-2">Transaction Details</h3>
                    <p class="text-sm text-blue-800 mb-4">Below are the details of the latest transaction that can be shown to the demo audience.</p>

                    @php $latest = $transactions->first(); @endphp
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm"><strong>Transaction ID:</strong> {{ $latest->id }}</p>
                            <p class="text-sm"><strong>Reference:</strong> {{ $latest->reference }}</p>
                            <p class="text-sm"><strong>Amount:</strong> {{ $latest->amount }} {{ $latest->asset_code }}</p>
                            <p class="text-sm"><strong>Status:</strong> {{ $latest->status }}</p>
                        </div>
                        <div>
                            <p class="text-sm"><strong>User ID:</strong> {{ $latest->user_id }}</p>
                            <p class="text-sm"><strong>Recipient:</strong> {{ \Illuminate\Support\Str::limit($latest->recipient_address, 20) }}</p>
                            <p class="text-sm"><strong>Created:</strong> {{ $latest->created_at->format('M d, Y H:i:s') }}</p>
                            <p class="text-sm"><strong>Updated:</strong> {{ $latest->updated_at->format('M d, Y H:i:s') }}</p>
                        </div>
                    </div>

                    @if($latest->transaction_hash)
                    <div class="mt-4">
                        <p class="text-sm"><strong>Transaction Hash:</strong></p>
                        <p class="text-xs font-mono break-all bg-gray-100 p-2 rounded">{{ $latest->transaction_hash }}</p>
                        <p class="mt-2">
                            <a href="https://stellar.expert/explorer/testnet/tx/{{ $latest->transaction_hash }}"
                               target="_blank" class="text-blue-600 hover:underline text-sm">
                                View on Stellar Explorer →
                            </a>
                        </p>
                    </div>
                    @endif
                </div>
            @endif
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">How to Create More Demo Transactions</h2>
            <div class="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <p>php artisan stellar:test-tx 3 --save</p>
            </div>
            <p class="mt-4 text-gray-600">This will create a mockup transaction with the user ID 3 and save it to the database.</p>
        </div>
    </div>
</body>
</html>
