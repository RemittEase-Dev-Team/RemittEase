import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-gray-300">Enter your email to receive reset instructions</p>
            </div>

            <div className="mb-6 text-sm text-gray-300 bg-blue-900/20 p-4 rounded-lg">
                Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-green-400 bg-green-900/20 p-4 rounded-lg">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full bg-blue-900/30 border-cyan-500/20 text-white"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                    disabled={processing}
                >
                    {processing ? 'Sending...' : 'Send Reset Link'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
