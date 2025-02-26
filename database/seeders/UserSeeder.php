<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::firstOrCreate([
            'email' => 'admin@remittease.com'
        ], [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('admin');

        // Create Staff User
        $staff = User::firstOrCreate([
            'email' => 'staff@remittease.com'
        ], [
            'name' => 'Staff User',
            'password' => Hash::make('password'),
        ]);
        $staff->assignRole('staff');

        // Create Normal User
        $user = User::firstOrCreate([
            'email' => 'emekaorjiani@icreationsent.com'
        ], [
            'name' => 'Application Developer',
            'password' => Hash::make('password'),
        ]);
        $user->assignRole('user');
    }
}
