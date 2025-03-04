<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'kyc_status',
        'stellar_public_key',
        'stellar_secret_seed',
        'onfido_sdk_token',
        'onfido_check_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function wallet()
    {
        return $this->hasMany(Wallet::class);
    }

    public function kyc()
    {
        return $this->hasOne(KYC::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isUser()
    {
        return $this->hasRole('user');
    }

    public function isKYCVerified()
    {
        return $this->kyc_status === 'verified';
    }

    public function isKYCPending()
    {
        return $this->kyc_status === 'pending';
    }

    public function isKYCRejected()
    {
        return $this->kyc_status === 'rejected';
    }

    public function isUnverified()
    {
        return $this->kyc_status === 'unverified';
    }


}
