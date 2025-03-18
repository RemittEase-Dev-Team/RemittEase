import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

const quotes = [
    {
        text: "The world is your oyster. Send money anywhere, anytime.",
        author: "RemittEase"
    },
    {
        text: "Bridging distances, connecting hearts.",
        author: "RemittEase"
    },
    {
        text: "Your trusted partner in global money transfers.",
        author: "RemittEase"
    },
    {
        text: "Making international transfers simple and secure.",
        author: "RemittEase"
    }
];

const images = [
    "/images/auth/world-finance.jpg",
    "/images/auth/global-travel.jpg",
    "/images/auth/business-meeting.jpg",
    "/images/auth/digital-payment.jpg",
    "/images/auth/global-connection.jpg",
    "/images/auth/financial-growth.jpg"
];

export default function Guest({ children }: PropsWithChildren) {
    const [currentImage, setCurrentImage] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex bg-dark-navy">
            {/* Left side - Image and Quote */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{
                        backgroundImage: `url(${images[currentImage]})`,
                        opacity: 0.8
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-cyan-900/80"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
                    <div className="text-center max-w-xl">
                        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                            {quotes[currentQuote].text}
                        </h1>
                        <p className="text-xl text-gray-300">
                            {quotes[currentQuote].author}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <Link href="/">
                            <img
                                src="/svg/logo-w.svg"
                                alt="RemittEase Logo"
                                className="h-16 w-auto mx-auto"
                            />
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-8 rounded-xl border border-cyan-500/20 shadow-lg backdrop-blur-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
