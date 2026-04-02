import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Zap, Loader2, AlertCircle, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../services/api'; // Import API

const RequestAccessPage = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        
        try {
            // Call the real API
            await api.submitAccessRequest({ name, email, company });
            setSuccess('Your request has been submitted successfully. Our team will review it and contact you shortly.');
            // Clear form
            setName('');
            setEmail('');
            setCompany('');
        } catch (err) {
            console.error(err);
            setError("Failed to submit request. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

            <div className="w-full max-w-md relative z-10 px-6">
                {/* Logo Section */}
                <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl shadow-2xl shadow-indigo-500/30 mb-6 relative">
                        <Hexagon className="w-8 h-8 text-white" strokeWidth={1.5} />
                        <Zap className="w-4 h-4 text-yellow-300 absolute" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Request Access
                    </h1>
                    <p className="text-gray-400">
                        Submit your details to request an account.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-start text-emerald-400 text-sm">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
                                <input
                                    type="text"
                                    required
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)} 
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="Acme Inc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center transition-all focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Submit Request
                                        <Send className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Back to Login */}
                <p className="text-center mt-8">
                    <Link
                        to="/login"
                        className="text-gray-400 hover:text-indigo-300 font-medium transition-colors inline-flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RequestAccessPage;