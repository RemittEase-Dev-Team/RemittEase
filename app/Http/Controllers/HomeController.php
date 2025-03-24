<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use App\Models\Features;
use App\Models\Roadmap;
use App\Models\About;
use App\Models\Blog;
use App\Models\QuestReward;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class HomeController extends Controller
{
    public function index()
    {

        // $abouts = About::all();


        // dd($abouts);


        return Inertia::render('Welcome', [
            'heroes' => Hero::all(),
            'features' => Features::all(),
            'roadmaps' => Roadmap::all(),
            'abouts' => About::all(),
            'blogs' => Blog::all(),
            'questRewards' => QuestReward::all(),
            'teams' => Team::all(),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function about()
    {
        return Inertia::render('About', [
            'about' => About::first(),
            'teams' => Team::all(),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function howItWorks()
    {
        return Inertia::render('HowItWorks', [
            'features' => Features::all(),
            'questRewards' => QuestReward::all(),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function contact()
    {
        return Inertia::render('Contact', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function sendContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Here you would typically send an email
        // For now, we'll just return a success message
        return back()->with('success', 'Thank you for your message. We will get back to you soon!');
    }

    public function onboarding(Request $request)
    {
        $email = $request->query('email');

        if (!$email) {
            return redirect()->route('welcome');
        }

        return Inertia::render('Onboarding', [
            'email' => $email,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
