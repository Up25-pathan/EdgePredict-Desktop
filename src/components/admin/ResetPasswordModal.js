import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const ResetPasswordModal = ({ isOpen, onClose, onPasswordReset, user }) => {
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Reset form when modal opens
        setNewPassword('');
        setError('');
        setSuccess('');
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await api.adminResetUserPassword(user.id, newPassword);
            setSuccess('Password reset successfully! Remember to share it with the user.');
            setTimeout(() => {
                onPasswordReset(); // Close modal
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password for: ${user?.email}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded text-emerald-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" /> {success}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">New Temporary Password</label>
                    <input
                        type="text"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter new temporary password..."
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Set New Password
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ResetPasswordModal;