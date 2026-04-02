import React, { useState, useEffect } from 'react';
import {
    HelpCircle, Send, AlertCircle, CheckCircle, Loader2, Mail
} from 'lucide-react';
import { useLicense } from '../../context/LicenseContext';
import { SupportService } from '../../services/SupportService';
import Button from '../ui/Button';

const SettingsSupportTab = () => {
    const { licenseDetails } = useLicense();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'Bug Report',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState('idle'); // idle, sending, success, error
    const [errorMessage, setErrorMessage] = useState('');

    // Auto-fill user details if available
    useEffect(() => {
        if (licenseDetails) {
            setFormData(prev => ({
                ...prev,
                name: licenseDetails.user !== 'Guest' ? licenseDetails.user : prev.name,
                email: licenseDetails.email || prev.email,
            }));
        }
    }, [licenseDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        try {
            await SupportService.submitTicket(formData);
            setStatus('success');
            // Reset form after 3 seconds
            setTimeout(() => {
                setStatus('idle');
                setFormData({
                    name: formData.name, // Keep name/email
                    email: formData.email,
                    category: 'Bug Report',
                    subject: '',
                    message: ''
                });
            }, 3000);
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message || "Failed to send ticket. Please try again.");
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fadeIn bg-studio-panel/30 rounded-xl border border-studio-border/50 p-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-studio-text-main mb-3 font-display">Ticket Sent Successfully!</h3>
                <p className="text-studio-text-muted text-center max-w-md mb-8">
                    Thank you for your feedback. Our support team has received your request regarding "<span className="text-studio-text-main font-medium">{formData.subject}</span>" and will get back to you shortly.
                </p>
                <Button variant="secondary" onClick={() => setStatus('idle')}>
                    Send Another Request
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-studio-primary/10 text-studio-primary mb-2">
                    <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-studio-text-main font-display">Contact Support</h2>
                <p className="text-studio-text-muted max-w-lg mx-auto">
                    Experiencing issues or have a feature request? Fill out the form below and our engineering team will assist you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-studio-panel/50 border border-studio-border/60 rounded-xl p-8 shadow-sm space-y-6">

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-studio-surface border border-studio-border rounded-lg px-4 py-2.5 text-sm text-studio-text-main focus:ring-2 focus:ring-studio-primary/20 focus:border-studio-primary outline-none transition-all placeholder:text-studio-text-dim"
                            placeholder="Your Name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-studio-text-dim" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-studio-surface border border-studio-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-studio-text-main focus:ring-2 focus:ring-studio-primary/20 focus:border-studio-primary outline-none transition-all placeholder:text-studio-text-dim"
                                placeholder="user@example.com"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">Category</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Bug Report', 'Feature Request', 'Billing Issue', 'Technical Question', 'Other'].map((cat) => (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${formData.category === cat
                                        ? 'bg-studio-primary/10 border-studio-primary/50 text-studio-primary ring-1 ring-studio-primary/20'
                                        : 'bg-studio-surface border-studio-border hover:border-studio-text-dim text-studio-text-muted hover:text-studio-text-main'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">Subject</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-studio-surface border border-studio-border rounded-lg px-4 py-2.5 text-sm text-studio-text-main focus:ring-2 focus:ring-studio-primary/20 focus:border-studio-primary outline-none transition-all placeholder:text-studio-text-dim"
                        placeholder="Brief summary of the issue..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full bg-studio-surface border border-studio-border rounded-lg px-4 py-3 text-sm text-studio-text-main focus:ring-2 focus:ring-studio-primary/20 focus:border-studio-primary outline-none transition-all resize-none placeholder:text-studio-text-dim"
                        placeholder="Describe your issue in detail. If reporting a bug, please include steps to reproduce."
                        required
                    />
                    <p className="text-[10px] text-studio-text-dim italic text-right">
                        System information (OS, App Version) will be automatically attached.
                    </p>
                </div>

                {status === 'error' && (
                    <div className="flex items-center gap-3 text-sm text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {errorMessage}
                    </div>
                )}

                <div className="pt-2 flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        icon={status === 'sending' ? Loader2 : Send}
                        disabled={status === 'sending'}
                        className={`w-full md:w-auto px-8 transition-all ${status === 'sending' ? 'opacity-80' : ''}`}
                    >
                        {status === 'sending' ? 'Sending Ticket...' : 'Submit Request'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SettingsSupportTab;
