<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define Permissions
        $permissions = [
            'verify kyc',
            'manage blogs',
            'update settings',
            'delete users',
            'view users',
        ];

        // Create Permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and Assign Permissions
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(['verify kyc', 'manage blogs', 'update settings', 'delete users', 'view users']);

        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staff->syncPermissions(['verify kyc', 'manage blogs', 'view users']);

        $user = Role::firstOrCreate(['name' => 'user']); // Normal users have no special permissions
   
    }
}
