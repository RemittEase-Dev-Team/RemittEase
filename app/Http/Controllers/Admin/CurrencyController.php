<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Currency;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(): Response
    {
        $currencies = Currency::all();
        return Inertia::render(
            'Admin/Currency/Index',
            ['currencies' => $currencies]
        );
    }

    public function store(Request $request){
        $currency = new Currency();
        $currency->name = $request->name;
        $currency->code = $request->code;
        $currency->symbol = $request->symbol;
        $currency->save();
        return redirect()->route('admin.currencies.index');
    }

    public function destroy($id){
        Currency::findOrFail($id)->delete();
        return redirect()->route('admin.currencies.index');
    }
}
